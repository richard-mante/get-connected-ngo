import type { Env } from "../../core/env";
import { error,json } from "../../core/http";
import { EnquiryRepository,type EnquiryStatus } from "./repository";

type Auth=(request:Request,env:Env)=>Promise<{email:string}|null>;
const statuses:EnquiryStatus[]=["new","in_progress","responded","archived"];
const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
const validEmail=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
async function clientHash(request:Request){
  const ip=request.headers.get("CF-Connecting-IP")??"unknown";
  const agent=request.headers.get("user-agent")??"";
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip+"|"+agent));
  return Array.from(new Uint8Array(digest)).map(byte=>byte.toString(16).padStart(2,"0")).join("");
}
async function consumeRateLimit(env:Env,key:string,now:number){
  const windowSeconds=600,maximum=5,cutoff=now-windowSeconds;
  await env.DB.prepare("DELETE FROM enquiry_rate_limits WHERE window_started < ?").bind(now-86400).run();
  const {results}=await env.DB.prepare("INSERT INTO enquiry_rate_limits (key,window_started,count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window_started=CASE WHEN window_started<=? THEN ? ELSE window_started END,count=CASE WHEN window_started<=? THEN 1 ELSE count+1 END WHERE window_started<=? OR count<? RETURNING count").bind(key,now,cutoff,now,cutoff,cutoff,maximum).all<{count:number}>();
  return Boolean(results?.length);
}
async function verifyTurnstile(env:Env,request:Request,token:string){
  if(!env.TURNSTILE_SECRET_KEY)return env.APP_ENV!=="production";
  if(!token)return false;
  const form=new FormData();form.set("secret",env.TURNSTILE_SECRET_KEY);form.set("response",token);
  const ip=request.headers.get("CF-Connecting-IP");if(ip)form.set("remoteip",ip);
  try{const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:form});if(!response.ok)return false;const result=await response.json() as {success?:boolean};return result.success===true;}catch{return false;}
}

export async function handleEnquiryRoute(request:Request,env:Env,cors:Record<string,string>,authenticate:Auth):Promise<Response|null>{
  const path=new URL(request.url).pathname;
  const fail=(message:string,status:number)=>error(message,status,cors);
  const repo=new EnquiryRepository(env);
  if(path==="/api/v1/enquiries"&&request.method==="POST"){
    let raw:unknown;try{raw=await request.json();}catch{return fail("Invalid JSON body",400);}
    if(!raw||typeof raw!=="object")return fail("Invalid enquiry fields",400);
    const body=raw as Record<string,unknown>;
    // Honeypot field: silently accept bots without storing their payload.
    if(clean(body.website,200))return json({ok:true},202,cors);
    const name=clean(body.name,120),email=clean(body.email,254),phone=clean(body.phone,40);
    const subject=clean(body.subject,160),message=clean(body.message,5000);
    if(name.length<2||!validEmail(email)||subject.length<3||message.length<10)return fail("Please check the required fields",400);
    if(body.consent!==true)return fail("Please confirm permission to contact you about this enquiry",400);
    const token=clean(body["cf-turnstile-response"]??body.turnstileToken,2048);
    if(env.APP_ENV==="production"&&!env.TURNSTILE_SECRET_KEY)return fail("Form verification is not configured",503);
    if(env.TURNSTILE_SECRET_KEY&&!await verifyTurnstile(env,request,token))return fail("Please complete the form verification and try again",400);
    const id=crypto.randomUUID(),now=Math.floor(Date.now()/1000),hash=await clientHash(request);
    if(!await consumeRateLimit(env,hash,now))return fail("Too many enquiries from this connection. Please wait and try again.",429);
    await repo.create(id,{name,email,phone,subject,message},now,hash);
    await repo.create(id,{name,email,phone,subject,message},now,null);
    return json({ok:true,id},201,cors);
  }
  if(!path.startsWith("/api/v1/admin/enquiries"))return null;
  const admin=await authenticate(request,env);if(!admin)return fail("Unauthorized",401);
  if(path==="/api/v1/admin/enquiries"&&request.method==="GET"){
    const url=new URL(request.url),status=url.searchParams.get("status");
    if(status&&!statuses.includes(status as EnquiryStatus))return fail("Invalid enquiry status",400);
    const limit=Math.min(100,Math.max(1,Number(url.searchParams.get("limit"))||25));
    const offset=Math.max(0,Number(url.searchParams.get("offset"))||0);
    return json({items:await repo.list(status,limit,offset)},200,cors);
  }
  const match=path.match(/^\/api\/v1\/admin\/enquiries\/([a-f0-9-]+)$/i);
  if(match&&request.method==="PATCH"){
    let raw:unknown;try{raw=await request.json();}catch{return fail("Invalid JSON body",400);}
    if(!raw||typeof raw!=="object")return fail("Invalid update",400);
    const body=raw as Record<string,unknown>,status=body.status as EnquiryStatus;
    if(!statuses.includes(status))return fail("Invalid enquiry status",400);
    const note=clean(body.internalNote,4000)||null;
    const result=await repo.update(match[1],status,note,Math.floor(Date.now()/1000));
    return result.meta.changes?json({ok:true},200,cors):fail("Enquiry not found",404);
  }
  return fail("Method not allowed",405);
}
