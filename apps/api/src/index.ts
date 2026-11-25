import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Env } from "./core/env";
import { json, error } from "./core/http";
import { handleContentRoute } from "./features/content/route";
import { handleMediaRoute } from "./features/media/route";



let jwks:ReturnType<typeof createRemoteJWKSet>|undefined;
function issuerFor(env:Env){return env.ACCESS_TEAM_DOMAIN.replace(/\/$/,"");}
function getJwks(env:Env){if(!jwks)jwks=createRemoteJWKSet(new URL("/cdn-cgi/access/certs",issuerFor(env)));return jwks;}
function allowedOrigins(env:Env){return env.ALLOWED_ORIGINS.split(",").map(s=>s.trim()).filter(Boolean);}
function corsHeaders(request:Request,env:Env){
 const origin=request.headers.get("Origin")??"";
 const headers:Record<string,string>={"vary":"Origin","access-control-allow-methods":"GET,POST,PUT,PATCH,DELETE,OPTIONS","access-control-allow-headers":"content-type,authorization","access-control-max-age":"86400"};
 if(allowedOrigins(env).includes(origin)){headers["access-control-allow-origin"]=origin;headers["access-control-allow-credentials"]="true";}
 return headers;
}
async function requireAdmin(request:Request,env:Env){
 const token=request.headers.get("cf-access-jwt-assertion");
 if(!token||!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD)return null;
 try{
  const {payload}=await jwtVerify(token,getJwks(env),{issuer:issuerFor(env),audience:env.ACCESS_AUD});
  const email=typeof payload.email==="string"?payload.email.toLowerCase():"";
  const allowed=env.ADMIN_EMAILS.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
  if(!email||!allowed.includes(email))return null;
  return {email};
 }catch{return null;}
}
export default {async fetch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);const path=url.pathname;const cors=corsHeaders(request,env);const fail=(message:string,status:number)=>error(message,status,cors);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 try{
  if(path==="/api/health"&&request.method==="GET")return json({ok:true,service:"get-connected-api"},200,cors);
  const contentResponse=await handleContentRoute(request,env,cors,requireAdmin);if(contentResponse)return contentResponse;
  const mediaResponse=await handleMediaRoute(request,env,cors,requireAdmin);if(mediaResponse)return mediaResponse;
  return fail("Not found",404);
 }catch{return fail("Internal server error",500);}
}};
