import { requireAdmin } from "./core/access";
import type { Env } from "./core/env";
import { json, error } from "./core/http";
import { handleContentRoute } from "./features/content/route";
import { handleMediaRoute } from "./features/media/route";
import { handleEnquiryRoute } from "./features/enquiries/route";

function allowedOrigins(env:Env){return env.ALLOWED_ORIGINS.split(",").map(s=>s.trim()).filter(Boolean);}
function corsHeaders(request:Request,env:Env){
 const origin=request.headers.get("Origin")??"";
 const headers:Record<string,string>={"vary":"Origin","access-control-allow-methods":"GET,POST,PUT,PATCH,DELETE,OPTIONS","access-control-allow-headers":"content-type,authorization","access-control-max-age":"86400"};
 if(allowedOrigins(env).includes(origin)){headers["access-control-allow-origin"]=origin;headers["access-control-allow-credentials"]="true";}
 return headers;
}
export default {async fetch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);const path=url.pathname;const cors=corsHeaders(request,env);const fail=(message:string,status:number)=>error(message,status,cors);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 try{
  if(path==="/api/health"&&request.method==="GET")return json({ok:true,service:"get-connected-api"},200,cors);
  const contentResponse=await handleContentRoute(request,env,cors,requireAdmin);if(contentResponse)return contentResponse;
  const enquiryResponse=await handleEnquiryRoute(request,env,cors,requireAdmin);if(enquiryResponse)return enquiryResponse;
  const mediaResponse=await handleMediaRoute(request,env,cors,requireAdmin);if(mediaResponse)return mediaResponse;
  return fail("Not found",404);
 }catch{return fail("Internal server error",500);}
}};
