"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { MediaGallery } from "./MediaGallery";

const API_BASE=(process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8787").replace(/\/$/,"");
type ContentStatus="draft"|"review"|"published"|"archived";
export function ContentEditor({contentId:initialContentId=null}:{contentId?:string|null}){
 const [title,setTitle]=useState("");const [slug,setSlug]=useState("");const [summary,setSummary]=useState("");const [savedBody,setSavedBody]=useState('{"type":"doc","content":[{"type":"paragraph"}]}');
 const [showMediaPicker,setShowMediaPicker]=useState(false);const [contentId,setContentId]=useState<string|null>(initialContentId);const [busy,setBusy]=useState(false);const [notice,setNotice]=useState("");const [noticeError,setNoticeError]=useState(false);const [status,setStatus]=useState<ContentStatus>("draft");
 const editor=useEditor({immediatelyRender:false,extensions:[StarterKit,Image.configure({allowBase64:false,inline:false}),Placeholder.configure({placeholder:"Start writing your story…"})],content:{type:"doc",content:[{type:"paragraph"}]},onUpdate:({editor})=>setSavedBody(JSON.stringify(editor.getJSON()))});
 useEffect(()=>{if(!initialContentId||!editor)return;let active=true;(async()=>{try{const response=await fetch(`${API_BASE}/api/v1/admin/content/${initialContentId}`,{credentials:"include"});if(!response.ok)throw new Error(response.status===401?"Sign in through Cloudflare Access to edit this story.":"Could not load this story.");const data=await response.json() as {item:{id:string;title:string;slug:string;summary:string|null;body:string|null;status:ContentStatus}};if(!active)return;const item=data.item;setContentId(item.id);setTitle(item.title);setSlug(item.slug);setSummary(item.summary??"");setStatus(item.status);const body=item.body??"{}";setSavedBody(body);editor.commands.setContent(JSON.parse(body));}catch(e){if(active){setNoticeError(true);setNotice(e instanceof Error?e.message:"Could not load this story.");}}})();return()=>{active=false;};},[initialContentId,editor]);
 const updateTitle=(value:string)=>{setTitle(value);setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));};
 const save=async(nextStatus:"draft"|"published")=>{
  if(!title.trim()||!slug.trim()){setNoticeError(true);setNotice("Add a title and valid URL slug before saving.");return;}
  setBusy(true);setNotice("");setNoticeError(false);
  try{const payload={type:"story",title:title.trim(),slug:slug.trim(),summary:summary.trim()||undefined,body:savedBody,status:nextStatus};
   const response=await fetch(contentId?`${API_BASE}/api/v1/admin/content/${contentId}`:`${API_BASE}/api/v1/admin/content`,{method:contentId?"PUT":"POST",credentials:"include",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json() as {item?:{id:string};error?:string};if(!response.ok)throw new Error(data.error??"Could not save this story.");
   if(data.item?.id)setContentId(data.item.id);setStatus(nextStatus);setNotice(nextStatus==="published"?"Story published.":"Draft saved.");setNoticeError(false);
  }catch(e){setNoticeError(true);setNotice(e instanceof Error?e.message:"Could not save this story.");}finally{setBusy(false);}
 };
 return <div className="content-editor-page">
  <header className="editor-header"><div><small>CONTENT / {contentId?"EDIT STORY":"NEW STORY"}</small><h1>{contentId?"Edit story":"Create a story"}</h1><p>Draft a community update for the Get Connected website.</p></div><span className="draft-pill">{status==="published"?"Published":status==="review"?"In review":status==="archived"?"Archived":"Draft"}</span></header>
  {notice&&<p className={noticeError?"editor-alert error":"editor-alert"} role="status">{notice}</p>}
  <div className="editor-grid"><section className="editor-main">
   <label className="field-label">Story title<input value={title} onChange={e=>updateTitle(e.target.value)} placeholder="Give your story a clear title"/></label>
   <label className="field-label">URL slug<input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="story-url"/></label>
   <label className="field-label">Short summary<textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={3} placeholder="A short introduction for cards and search results"/></label>
   <div className="editor-card"><div className="editor-toolbar" aria-label="Text formatting">
    <button type="button" onClick={()=>editor?.chain().focus().toggleBold().run()} aria-pressed={editor?.isActive("bold")}>Bold</button><button type="button" onClick={()=>editor?.chain().focus().toggleItalic().run()} aria-pressed={editor?.isActive("italic")}>Italic</button><button type="button" onClick={()=>editor?.chain().focus().toggleHeading({level:2}).run()} aria-pressed={editor?.isActive("heading",{level:2})}>Heading</button><button type="button" onClick={()=>editor?.chain().focus().toggleBulletList().run()} aria-pressed={editor?.isActive("bulletList")}>List</button><button type="button" onClick={()=>editor?.chain().focus().toggleBlockquote().run()} aria-pressed={editor?.isActive("blockquote")}>Quote</button><button type="button" onClick={()=>setShowMediaPicker(value=>!value)} aria-expanded={showMediaPicker}>Insert image</button><button type="button" onClick={()=>editor?.chain().focus().undo().run()}>Undo</button><button type="button" onClick={()=>editor?.chain().focus().redo().run()}>Redo</button>
   </div><EditorContent editor={editor} className="tiptap-content"/></div>
   {showMediaPicker&&<div className="editor-media-picker"><MediaGallery publicOnly onSelect={item=>{editor?.chain().focus().setImage({src:item.url,alt:item.alt??""}).run();setShowMediaPicker(false);}}/><button type="button" className="picker-close" onClick={()=>setShowMediaPicker(false)}>Close media picker</button></div>}
   <p className="editor-note">Content is stored as structured Tiptap JSON. Save and publish requests use the authenticated CMS API.</p><details className="content-json"><summary>Editor document preview</summary><pre>{savedBody}</pre></details>
  </section><aside className="editor-sidebar">
   <section><h2>Publishing</h2><p>{status==="published"?"This story is marked as published.":"Save a draft or publish the story when it is ready."}</p><button type="button" disabled={busy||!title.trim()||!slug.trim()} onClick={()=>void save("draft")}>{busy?"Saving…":"Save draft"}</button><button type="button" className="secondary" disabled={busy||!title.trim()||!slug.trim()} onClick={()=>void save("published")}>{busy?"Saving…":"Publish story"}</button><small>Cloudflare Access protects CMS write endpoints.</small></section>
   <section><h2>Featured image</h2><p>Insert approved public images into the story using the media picker.</p><button type="button" className="secondary" onClick={()=>setShowMediaPicker(true)}>Choose from media</button></section>
   <section><h2>Story details</h2><p>Type: Story</p><p>Status: {status}</p><p>Body format: Tiptap JSON</p>{contentId&&<small>Record ID: {contentId}</small>}</section>
  </aside></div>
 </div>;
}