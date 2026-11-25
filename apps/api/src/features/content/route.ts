import type {Env} from "../../core/env";
import {error,json} from "../../core/http";
import {ContentService} from "./service";
type Auth=(request:Request,env:Env)=>Promise<{email:string}|null>;
export async function handleContentRoute(request:Request,env:Env,cors:Record<string,string>,authenticate:Auth):Promise<Response|null>{
 const path=new URL(request.url).pathname;const service=new ContentService(env);const fail=(message:string,status:number)=>error(message,status,cors);
 if(path==="/api/v1/content"&&request.method==="GET"){const type=new URL(request.url).searchParams.get("type")??undefined;if(type&&!["page","story","program","event"].includes(type))return fail("Invalid content type",400);return json({items:await service.listPublished(type)},200,cors);}
 const publicMatch=path.match(/^\/api\/v1\/content\/([a-z0-9-]+)$/);
 if(publicMatch&&request.method==="GET"){const item=await service.getPublished(publicMatch[1]);return item?json({item},200,cors):fail("Content not found",404);}
 if(!path.startsWith("/api/v1/admin/content"))return null;
 const admin=await authenticate(request,env);if(!admin)return fail("Unauthorized",401);
 if(path==="/api/v1/admin/content"&&request.method==="GET")return json({items:await service.listAdmin()},200,cors);
 if(path==="/api/v1/admin/content"&&request.method==="POST"){
  let raw:unknown;try{raw=await request.json();}catch{return fail("Invalid JSON body",400);}
  const parsed=await service.parseInput(raw,request);if("error"in parsed)return fail(parsed.error,400);
  try{return json({item:await service.create(parsed.input,parsed.body)},201,cors);}catch{return fail("A content item with this slug may already exist",409);}
 }
 const edit=path.match(/^\/api\/v1\/admin\/content\/([a-f0-9-]+)$/i);
 if(edit&&request.method==="GET"){const item=await service.getById(edit[1]);return item?json({item},200,cors):fail("Content not found",404);}
 if(edit&&request.method==="PUT"){
  let raw:unknown;try{raw=await request.json();}catch{return fail("Invalid JSON body",400);}
  const parsed=await service.parseInput(raw,request);if("error"in parsed)return fail(parsed.error,400);
  try{const item=await service.update(edit[1],parsed.input,parsed.body);return item?json({item},200,cors):fail("Content not found",404);}catch{return fail("Could not update content; check whether the slug is already in use",409);}
 }
 return fail("Method not allowed",405);
}