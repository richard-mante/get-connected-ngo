"use client";
import { useCallback, useEffect, useState } from "react";

type Enquiry={id:string;name:string;email:string;phone:string|null;subject:string;message:string;status:"new"|"in_progress"|"responded"|"archived";internalNote:string|null;createdAt:number;updatedAt:number};
const statuses=["new","in_progress","responded","archived"] as const;
const api=(process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8787").replace(/\/$/,"");

export default function EnquiriesPage(){
 const [items,setItems]=useState<Enquiry[]>([]);
 const [filter,setFilter]=useState("new");
 const [selected,setSelected]=useState<Enquiry|null>(null);
 const [note,setNote]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{
   const response=await fetch(`${api}/api/v1/admin/enquiries?limit=50${filter==="all"?"":`&status=${filter}`}`,{credentials:"include"});
   if(!response.ok)throw new Error("Unable to load enquiries. Check that you are signed in through Cloudflare Access.");
   const data=await response.json() as {items:Enquiry[]};
   setItems(data.items??[]);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load enquiries");}
  finally{setLoading(false);}
 },[filter]);
 useEffect(()=>{void load();},[load]);
 function open(item:Enquiry){setSelected(item);setNote(item.internalNote??"");}
 async function update(){
  if(!selected)return;setSaving(true);setError("");
  try{
   const response=await fetch(`${api}/api/v1/admin/enquiries/${selected.id}`,{method:"PATCH",credentials:"include",headers:{"content-type":"application/json"},body:JSON.stringify({status:selected.status,internalNote:note})});
   if(!response.ok)throw new Error("Couldn't update this enquiry.");
   setSelected({...selected,internalNote:note});
   await load();
  }catch(e){setError(e instanceof Error?e.message:"Couldn't update enquiry");}
  finally{setSaving(false);}
 }
 return <main className="admin-page">
  <header className="page-header"><div><p className="eyebrow">COMMUNICATIONS</p><h1>Enquiries</h1><p>Review messages received through the public website.</p></div><button onClick={()=>void load()} disabled={loading}>Refresh</button></header>
  <div className="toolbar"><label htmlFor="enquiry-filter">Status</label><select id="enquiry-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="new">New</option><option value="in_progress">In progress</option><option value="responded">Responded</option><option value="archived">Archived</option><option value="all">All enquiries</option></select><span>{items.length} shown</span></div>
  {error&&<p role="alert" className="error-message">{error}</p>}
  {loading?<p>Loading enquiries…</p>:items.length===0?<div className="empty-state"><h2>No enquiries here</h2><p>New messages from the website will appear in this inbox.</p></div>:
  <section className="enquiry-layout"><div className="enquiry-list" aria-label="Enquiry list">{items.map(item=><button className={selected?.id===item.id?"enquiry-item selected":"enquiry-item"} key={item.id} onClick={()=>open(item)}><span className="enquiry-item-top"><strong>{item.name}</strong><small>{new Date(item.createdAt*1000).toLocaleDateString()}</small></span><strong>{item.subject}</strong><span>{item.message.slice(0,110)}{item.message.length>110?"…":""}</span><small>{item.status.replace("_"," ")}</small></button>)}</div>
  <article className="enquiry-detail">{selected?<><div className="detail-heading"><div><h2>{selected.subject}</h2><p>{selected.name} · <a href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent("Re: "+selected.subject)}`}>{selected.email}</a>{selected.phone? ` · ${selected.phone}`:""}</p><small>Received {new Date(selected.createdAt*1000).toLocaleString()}</small></div></div><p className="message-body">{selected.message}</p><label>Status<select value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value as Enquiry["status"]})}>{statuses.map(status=><option key={status} value={status}>{status.replace("_"," ")}</option>)}</select></label><label>Internal note<textarea rows={5} value={note} onChange={e=>setNote(e.target.value)} placeholder="Notes for the team only…" /></label><div className="detail-actions"><a className="button" href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent("Re: "+selected.subject)}`}>Reply by email ↗</a><button onClick={()=>void update()} disabled={saving}>{saving?"Saving…":"Save changes"}</button></div></>:<div className="empty-state"><p>Select an enquiry to read and manage it.</p></div>}</article></section>}
 </main>;
}
