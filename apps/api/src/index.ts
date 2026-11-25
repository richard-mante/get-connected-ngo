export interface Env { DB: D1Database; MEDIA: R2Bucket; }
const headers={ "content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type,authorization" };
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
export default {async fetch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(url.pathname==="/api/health")return json({ok:true,service:"get-connected-api"});
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 if(url.pathname==="/api/v1/content"){
  const {results}=await env.DB.prepare("SELECT id,type,title,slug,summary,published_at AS publishedAt FROM content WHERE status = ? ORDER BY published_at DESC LIMIT 100").bind("published").all();
  return json({items:results});
 }
 const match=url.pathname.match(/^\/api\/v1\/content\/([a-z0-9-]+)$/);
 if(match){
  const item=await env.DB.prepare("SELECT id,type,title,slug,summary,body,published_at AS publishedAt FROM content WHERE status = ? AND slug = ? LIMIT 1").bind("published",match[1]).first();
  return item?json({item}):json({error:"Content not found"},404);
 }
 return json({error:"Not found"},404);
}};
