import type { APIRoute } from "astro";
const apiBase=(import.meta.env.PUBLIC_API_BASE_URL??"http://localhost:8787").replace(/\/$/,"");
type Item={type:string;slug:string;publishedAt:number|null};
const escapeXml=(value:string)=>value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
export const GET:APIRoute=async({url})=>{
 const fixed=["/","/about","/programs","/events","/stories","/get-involved","/contact","/privacy"];
 let items:Item[]=[];
 try{const response=await fetch(`${apiBase}/api/v1/content`);if(response.ok){const data=await response.json() as {items:Item[]};items=data.items??[];}}catch{}
 const dynamic=items.map(item=>item.type==="story"?`/stories/${item.slug}`:item.type==="program"?`/programs/${item.slug}`:item.type==="event"?`/events/${item.slug}`:item.type==="page"?`/${item.slug}`:null).filter((path):path is string=>Boolean(path));
 const locations=[...new Set([...fixed,...dynamic])].map(path=>`<url><loc>${escapeXml(new URL(path,url.origin).toString())}</loc></url>`).join("");
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations}</urlset>`,{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=3600"}});
};
