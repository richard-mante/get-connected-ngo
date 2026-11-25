import type {Env} from "../../core/env";
import {error,json} from "../../core/http";
type Auth=(request:Request,env:Env)=>Promise<{email:string}|null>;
const mimeExt:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","video/mp4":"mp4","video/webm":"webm","application/pdf":"pdf"};
const maxUpload=20*1024*1024;
function safeFilename(name:string){return name.replace(/[^a-zA-Z0-9._ -]/g,"_").slice(0,180)||"upload";}
async function readJson(request:Request){try{return await request.json() as unknown;}catch{return null;}}
export async function handleMediaRoute(request:Request,env:Env,cors:Record<string,string>,authenticate:Auth):Promise<Response|null>{
 const url=new URL(request.url);const path=url.pathname;const fail=(message:string,status:number)=>error(message,status,cors);
 try{
  const publicMedia=path.match(/^\/media\/([a-f0-9-]+)$/i);
  if(publicMedia&&request.method==="GET"){
   const record=await env.DB.prepare("SELECT object_key,content_type,filename FROM media WHERE id = ? AND visibility = 'public' LIMIT 1").bind(publicMedia[1]).first<{object_key:string;content_type:string;filename:string}>();
   if(!record)return fail("Media not found",404);
   const object=await env.MEDIA.get(record.object_key);if(!object)return fail("Media not found",404);
   const headers=new Headers(cors);headers.set("content-type",record.content_type);headers.set("cache-control","public, max-age=60, s-maxage=60");headers.set("x-content-type-options","nosniff");
   if(record.content_type==="application/pdf")headers.set("content-disposition",`inline; filename="${safeFilename(record.filename)}"`);
   return new Response(object.body,{headers});
  }
  if(path.startsWith("/api/v1/admin/media")){
   const admin=await authenticate(request,env);if(!admin)return fail("Unauthorized",401);
   if(path==="/api/v1/admin/media"&&request.method==="GET"){
    const {results}=await env.DB.prepare("SELECT id,filename,content_type AS contentType,size,alt,caption,width,height,visibility,created_at AS createdAt FROM media ORDER BY created_at DESC LIMIT 300").all<Record<string,unknown>>();
    return json({items:results.map(item=>({...item,url:item.visibility==="public"?new URL(`/media/${item.id}`,request.url).toString():new URL(`/api/v1/admin/media/${item.id}/file`,request.url).toString()}))},200,cors);
   }
   const editMedia=path.match(/^\/api\/v1\/admin\/media\/([a-f0-9-]+)$/i);
   if(editMedia&&request.method==="PATCH"){
    const raw=await readJson(request);if(!raw||typeof raw!=="object")return fail("Invalid media fields",400);
    const fields=raw as Record<string,unknown>;
    const record=await env.DB.prepare("SELECT content_type,alt,caption,visibility FROM media WHERE id=? LIMIT 1").bind(editMedia[1]).first<{content_type:string;alt:string|null;caption:string|null;visibility:string}>();
    if(!record)return fail("Media not found",404);
    const alt=typeof fields.alt==="string"?fields.alt.trim().slice(0,300):record.alt;
    const caption=typeof fields.caption==="string"?fields.caption.trim().slice(0,500):record.caption;
    const visibility=typeof fields.visibility==="string"?fields.visibility:record.visibility;
    if(visibility!=="private"&&visibility!=="public")return fail("Invalid visibility",400);
    if(record.content_type.startsWith("image/")&&visibility==="public"&&!alt)return fail("Add alt text before publishing an image",400);
    const now=Math.floor(Date.now()/1000);
    await env.DB.prepare("UPDATE media SET alt=?,caption=?,visibility=?,updated_at=? WHERE id=?").bind(alt||null,caption||null,visibility,now,editMedia[1]).run();
    return json({item:{id:editMedia[1],alt:alt||null,caption:caption||null,visibility,updatedAt:now}},200,cors);
   }
   if(editMedia&&request.method==="DELETE"){
    const record=await env.DB.prepare("SELECT object_key FROM media WHERE id=? LIMIT 1").bind(editMedia[1]).first<{object_key:string}>();
    if(!record)return fail("Media not found",404);
    const referenced=await env.DB.prepare("SELECT id FROM content WHERE body LIKE ? LIMIT 1").bind(`%/media/${editMedia[1]}%`).first();
    if(referenced)return fail("This media is referenced by content. Remove it from the story before deleting.",409);
    await env.MEDIA.delete(record.object_key);
    await env.DB.prepare("DELETE FROM media WHERE id=?").bind(editMedia[1]).run();
    return new Response(null,{status:204,headers:cors});
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
  return path.startsWith("/media/")||path.startsWith("/api/v1/admin/media")?fail("Not found",404):null;
 }catch{return fail("Internal server error",500);}
}
