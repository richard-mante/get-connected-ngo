import { createRemoteJWKSet, jwtVerify } from "jose";
import { contentInputSchema } from "@get-connected/shared/schemas";

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ADMIN_EMAILS: string;
  ALLOWED_ORIGINS: string;
}
const json=(data:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...extra}});
const error=(message:string,status:number,extra:Record<string,string>={})=>json({error:message},status,extra);
let jwks:ReturnType<typeof createRemoteJWKSet>|undefined;
function issuerFor(env:Env){return env.ACCESS_TEAM_DOMAIN.replace(/\/$/,"");}
function getJwks(env:Env){if(!jwks)jwks=createRemoteJWKSet(new URL("/cdn-cgi/access/certs",issuerFor(env)));return jwks;}
function allowedOrigins(env:Env){return env.ALLOWED_ORIGINS.split(",").map(s=>s.trim()).filter(Boolean);}
function corsHeaders(request:Request,env:Env){
 const origin=request.headers.get("Origin")??"";
 const headers:Record<string,string>={"vary":"Origin","access-control-allow-methods":"GET,POST,PUT,OPTIONS","access-control-allow-headers":"content-type,authorization","access-control-max-age":"86400"};
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
const mimeExt:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","video/mp4":"mp4","video/webm":"webm","application/pdf":"pdf"};
const maxUpload=20*1024*1024;
function safeFilename(name:string){return name.replace(/[^a-zA-Z0-9._ -]/g,"_").slice(0,180)||"upload";}
async function readJson(request:Request){try{return await request.json() as unknown;}catch{return null;}}
export default {async fetch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);const path=url.pathname;const cors=corsHeaders(request,env);const fail=(message:string,status:number)=>error(message,status,cors);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 try{
  if(path==="/api/health"&&request.method==="GET")return json({ok:true,service:"get-connected-api"},200,cors);
  if(path==="/api/v1/content"&&request.method==="GET"){
   const {results}=await env.DB.prepare("SELECT id,type,title,slug,summary,published_at AS publishedAt FROM content WHERE status = ? ORDER BY published_at DESC LIMIT 100").bind("published").all();
   return json({items:results},200,cors);
  }
  const publicContent=path.match(/^\/api\/v1\/content\/([a-z0-9-]+)$/);
  if(publicContent&&request.method==="GET"){
   const item=await env.DB.prepare("SELECT id,type,title,slug,summary,body,published_at AS publishedAt FROM content WHERE status = ? AND slug = ? LIMIT 1").bind("published",publicContent[1]).first();
   return item?json({item},200,cors):error("Content not found",404);
  }
  const publicMedia=path.match(/^\/media\/([a-f0-9-]+)$/i);
  if(publicMedia&&request.method==="GET"){
   const record=await env.DB.prepare("SELECT object_key,content_type,filename FROM media WHERE id = ? AND visibility = 'public' LIMIT 1").bind(publicMedia[1]).first<{object_key:string;content_type:string;filename:string}>();
   if(!record)return fail("Media not found",404);
   const object=await env.MEDIA.get(record.object_key);if(!object)return fail("Media not found",404);
   const headers=new Headers(cors);headers.set("content-type",record.content_type);headers.set("cache-control","public, max-age=86400, s-maxage=604800");headers.set("x-content-type-options","nosniff");
   if(record.content_type==="application/pdf")headers.set("content-disposition",`inline; filename="${safeFilename(record.filename)}"`);
   return new Response(object.body,{headers});
  }

  if(path.startsWith("/api/v1/admin/")){
   const admin=await requireAdmin(request,env);if(!admin)return fail("Unauthorized",401);
   if(path==="/api/v1/admin/content"&&request.method==="GET"){
    const {results}=await env.DB.prepare("SELECT id,type,title,slug,summary,status,published_at AS publishedAt,updated_at AS updatedAt FROM content ORDER BY updated_at DESC LIMIT 100").all();
    return json({items:results},200,cors);
   }
   if(path==="/api/v1/admin/content"&&request.method==="POST"){
    const raw=await readJson(request);const parsed=contentInputSchema.safeParse(raw);if(!parsed.success)return fail("Invalid content fields",400);
    const input=parsed.data;const body=input.body??"{}";try{JSON.parse(body);}catch{return fail("Body must be valid Tiptap JSON",400);}
    const now=Math.floor(Date.now()/1000);const id=crypto.randomUUID();const publishedAt=input.status==="published"?now:null;
    try{await env.DB.prepare("INSERT INTO content (id,type,title,slug,summary,body,status,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(id,input.type,input.title,input.slug,input.summary??null,body,input.status,publishedAt,now,now).run();}
    catch{return fail("A content item with this slug may already exist",409);}
    return json({item:{id,...input,body,publishedAt,createdAt:now,updatedAt:now}},201,cors);
   }
   const editContent=path.match(/^\/api\/v1\/admin\/content\/([a-f0-9-]+)$/i);
   if(editContent&&request.method==="GET"){
    const item=await env.DB.prepare("SELECT id,type,title,slug,summary,body,status,published_at AS publishedAt,created_at AS createdAt,updated_at AS updatedAt FROM content WHERE id=? LIMIT 1").bind(editContent[1]).first();
    return item?json({item},200,cors):fail("Content not found",404);
   }
   if(editContent&&request.method==="PUT"){
    const raw=await readJson(request);const parsed=contentInputSchema.safeParse(raw);if(!parsed.success)return fail("Invalid content fields",400);
    const input=parsed.data;const body=input.body??"{}";try{JSON.parse(body);}catch{return fail("Body must be valid Tiptap JSON",400);}
    const now=Math.floor(Date.now()/1000);const publishedAt=input.status==="published"?now:null;
    try{const result=await env.DB.prepare("UPDATE content SET type=?,title=?,slug=?,summary=?,body=?,status=?,published_at=?,updated_at=? WHERE id=?").bind(input.type,input.title,input.slug,input.summary??null,body,input.status,publishedAt,now,editContent[1]).run();
     if(!result.meta.changes)return fail("Content not found",404);}
    catch{return fail("Could not update content; check whether the slug is already in use",409);}
    return json({item:{id:editContent[1],...input,body,publishedAt,updatedAt:now}},200,cors);
   }
   if(path==="/api/v1/admin/media"&&request.method==="GET"){
    const {results}=await env.DB.prepare("SELECT id,filename,content_type AS contentType,size,alt,caption,width,height,visibility,created_at AS createdAt FROM media ORDER BY created_at DESC LIMIT 300").all<Record<string,unknown>>();
    return json({items:results.map(item=>({...item,url:item.visibility==="public"?new URL(`/media/${item.id}`,request.url).toString():new URL(`/api/v1/admin/media/${item.id}/file`,request.url).toString()}))},200,cors);
   }
   if(path==="/api/v1/admin/media"&&request.method==="POST"){
    let form:FormData;try{form=await request.formData();}catch{return fail("Expected multipart form data",400);}
    const file=form.get("file");if(!(file instanceof File)||file.size===0)return fail("Choose a file to upload",400);
    if(file.size>maxUpload)return fail("Maximum upload size is 20 MB",413);
    const ext=mimeExt[file.type];if(!ext)return fail("File type is not supported",415);
    const alt=String(form.get("alt")??"").trim().slice(0,300);const caption=String(form.get("caption")??"").trim().slice(0,500);
    const visibility=String(form.get("visibility")??"private");if(visibility!=="private"&&visibility!=="public")return fail("Invalid visibility",400);
    if(file.type.startsWith("image/")&&!alt&&visibility==="public")return fail("Add alt text before publishing an image",400);
    const id=crypto.randomUUID();const key=`media/${id}.${ext}`;const filename=safeFilename(file.name);const now=Math.floor(Date.now()/1000);
    await env.MEDIA.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:visibility==="public"?"public, max-age=86400":"private, no-store"},customMetadata:{mediaId:id,uploadedBy:admin.email}});
    try{await env.DB.prepare("INSERT INTO media (id,object_key,filename,content_type,size,alt,caption,width,height,visibility,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,key,filename,file.type,file.size,alt||null,caption||null,null,null,visibility,now,now).run();}
    catch{await env.MEDIA.delete(key);return fail("Could not save media metadata",500);}
    const item={id,filename,contentType:file.type,size:file.size,alt:alt||null,caption:caption||null,visibility,url:visibility==="public"?new URL(`/media/${id}`,request.url).toString():new URL(`/api/v1/admin/media/${id}/file`,request.url).toString(),createdAt:now};
    return json({item},201,cors);
   }
   const adminMediaFile=path.match(/^\/api\/v1\/admin\/media\/([a-f0-9-]+)\/file$/i);
   if(adminMediaFile&&request.method==="GET"){
    const record=await env.DB.prepare("SELECT object_key,content_type,filename FROM media WHERE id=? LIMIT 1").bind(adminMediaFile[1]).first<{object_key:string;content_type:string;filename:string}>();
    if(!record)return fail("Media not found",404);const object=await env.MEDIA.get(record.object_key);if(!object)return fail("Media not found",404);
    const headers=new Headers(cors);headers.set("content-type",record.content_type);headers.set("cache-control","private, no-store");headers.set("x-content-type-options","nosniff");headers.set("content-disposition",`inline; filename="${safeFilename(record.filename)}"`);
    return new Response(object.body,{headers});
   }
  }
  return fail("Not found",404);
 }catch{return fail("Internal server error",500);}
}};
