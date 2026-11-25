"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE=(process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8787").replace(/\/$/,"");
export type MediaItem = {
  id:string;filename:string;contentType:string;size:number;alt:string|null;caption:string|null;url:string;visibility:"public"|"private";
};
type Props={items?:MediaItem[];onSelect?:(item:MediaItem)=>void;publicOnly?:boolean};

export function MediaGallery({items,onSelect,publicOnly=false}:Props){
 const [loaded,setLoaded]=useState<MediaItem[]>(items??[]);
 const [query,setQuery]=useState("");const [kind,setKind]=useState("all");const [view,setView]=useState<"grid"|"list">("grid");
 const [loading,setLoading]=useState(!items);const [error,setError]=useState("");const [uploadError,setUploadError]=useState("");const [file,setFile]=useState<File|null>(null);const [alt,setAlt]=useState("");const [caption,setCaption]=useState("");const [visibility,setVisibility]=useState<"private"|"public">("private");const [uploading,setUploading]=useState(false);
 const refresh=async()=>{
  setLoading(true);setError("");
  try{const response=await fetch(`${API_BASE}/api/v1/admin/media`,{credentials:"include"});if(!response.ok)throw new Error(response.status===401?"Sign in through the configured Cloudflare Access admin app to view media.":"Unable to load the media library.");
   const data=await response.json() as {items:MediaItem[]};setLoaded(data.items??[]);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load media.");}finally{setLoading(false);}
 };
 useEffect(()=>{if(!items)void refresh();},[items]);
 const source=items??loaded;
 const filtered=useMemo(()=>source.filter(item=>{
  const matchesQuery=item.filename.toLowerCase().includes(query.toLowerCase())||(item.alt??"").toLowerCase().includes(query.toLowerCase())||(item.caption??"").toLowerCase().includes(query.toLowerCase());
  const matchesKind=kind==="all"||(kind==="images"?item.contentType.startsWith("image/"):kind==="video"?item.contentType.startsWith("video/"):item.contentType==="application/pdf");
  return matchesQuery&&matchesKind;
 }),[source,query,kind]);
 const submitUpload=async()=>{
  if(!file)return;setUploading(true);setUploadError("");
  try{const form=new FormData();form.set("file",file);form.set("alt",alt);form.set("caption",caption);form.set("visibility",visibility);
   const response=await fetch(`${API_BASE}/api/v1/admin/media`,{method:"POST",body:form,credentials:"include"});
   const data=await response.json() as {item?:MediaItem;error?:string};if(!response.ok)throw new Error(data.error??"Upload failed.");
   if(items){setUploadError("Upload succeeded. Refresh this picker to see the new asset.");}else{setLoaded(current=>[data.item!,...current]);}
   setFile(null);setAlt("");setCaption("");
  }catch(e){setUploadError(e instanceof Error?e.message:"Upload failed.");}finally{setUploading(false);}
 };
 return <section className="media-library">
  <header className="media-header"><div><small>ASSETS / LIBRARY</small><h1>{publicOnly?"Choose an image":"Media library"}</h1><p>{publicOnly?"Select a public image to insert into this story.":"Manage approved images and files reused across the website."}</p></div>
   {!publicOnly&&<label className="upload-label">Upload media<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf" onChange={e=>{const selected=e.target.files?.[0]??null;setFile(selected);setAlt("");setUploadError("");}} /></label>}
  </header>
  {file&&!publicOnly&&<div className="upload-panel"><strong>{file.name}</strong><small>{Math.ceil(file.size/1024)} KB · {file.type}</small>
   {file.type.startsWith("image/")&&<label className="field-label">Alt text{visibility==="public"?" (required)":" (recommended)"}<input value={alt} onChange={e=>setAlt(e.target.value)} maxLength={300} placeholder="Describe the meaningful content of the image"/></label>}
   <label className="field-label">Caption<input value={caption} onChange={e=>setCaption(e.target.value)} maxLength={500} placeholder="Optional caption"/></label>
   <label className="field-label">Visibility<select value={visibility} onChange={e=>setVisibility(e.target.value as "private"|"public")}><option value="private">Private — admin only</option><option value="public">Public — usable on website</option></select></label>
   <div className="upload-actions"><button type="button" disabled={uploading||!file||(visibility==="public"&&file.type.startsWith("image/")&&!alt.trim())} onClick={()=>void submitUpload()}>{uploading?"Uploading…":"Upload to media library"}</button><button type="button" className="secondary" disabled={uploading} onClick={()=>setFile(null)}>Cancel</button></div>
  </div>}
  {uploadError&&<p className="media-error" role="alert">{uploadError}</p>}
  {error&&<div className="media-error" role="alert"><p>{error}</p><button type="button" onClick={()=>void refresh()}>Try again</button></div>}
  <div className="media-tools"><input aria-label="Search media" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search files, captions or alt text…"/><select aria-label="Filter media type" value={kind} onChange={e=>setKind(e.target.value)}><option value="all">All media</option><option value="images">Images</option><option value="video">Videos</option><option value="pdf">PDFs</option></select><div className="view-toggle"><button type="button" aria-pressed={view==="grid"} onClick={()=>setView("grid")}>Grid</button><button type="button" aria-pressed={view==="list"} onClick={()=>setView("list")}>List</button></div></div>
  {loading?<div className="media-empty"><h2>Loading media…</h2></div>:filtered.length?<div className={view==="grid"?"media-grid":"media-list"}>{filtered.map(item=>{
   const disabled=publicOnly&&item.visibility!=="public";
   return <button className="media-item" key={item.id} type="button" disabled={disabled} onClick={()=>onSelect?.(item)} title={disabled?"Private media cannot be inserted into public content":item.filename}>
    <div className="media-preview">{item.contentType.startsWith("image/")?<img src={item.url} alt={item.alt??""} crossOrigin={item.visibility==="private"?"use-credentials":"anonymous"}/>:<span>{item.contentType.startsWith("video/")?"VIDEO":item.contentType==="application/pdf"?"PDF":"FILE"}</span>}</div>
    <div><strong>{item.filename}</strong><small>{item.alt||"Alt text not added"} · {Math.ceil(item.size/1024)} KB</small><small className={item.visibility==="public"?"media-public":"media-private"}>{item.visibility}</small></div>
   </button>;
  })}</div>:<div className="media-empty"><div className="media-empty-icon">▧</div><h2>{query?"No matching media":error?"Media library unavailable":"Your media library is ready"}</h2><p>{query?"Try a different search or media type.":publicOnly?"Upload and publish an image in the media library first.":"Upload approved images and files here, then reuse them across pages, stories, and programs."}</p><small>{publicOnly?"Only explicitly public media can be inserted into public content.":"Uploads are stored in R2 and metadata is managed in D1."}</small></div>}
 </section>;
}