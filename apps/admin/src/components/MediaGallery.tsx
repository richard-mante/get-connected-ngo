"use client";

import { useMemo, useState } from "react";

export type MediaItem = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  alt: string | null;
  caption: string | null;
  url: string;
};

type Props = { items?: MediaItem[]; onSelect?: (item: MediaItem) => void };

export function MediaGallery({ items = [], onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const filtered = useMemo(() => items.filter(item => {
    const matchesQuery = item.filename.toLowerCase().includes(query.toLowerCase()) || (item.alt ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesKind = kind === "all" || (kind === "images" ? item.contentType.startsWith("image/") : item.contentType.startsWith("video/"));
    return matchesQuery && matchesKind;
  }), [items, query, kind]);

  return <section className="media-library">
    <header className="media-header"><div><small>ASSETS / LIBRARY</small><h1>Media library</h1><p>Keep approved photos and files organized for reuse across the website.</p></div><button type="button" disabled title="Secure R2 upload will be enabled with CMS authentication">Upload media</button></header>
    <div className="media-tools"><input aria-label="Search media" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search files or alt text…" /><select aria-label="Filter media type" value={kind} onChange={e=>setKind(e.target.value)}><option value="all">All media</option><option value="images">Images</option><option value="video">Videos</option></select><div className="view-toggle"><button type="button" aria-pressed={view==="grid"} onClick={()=>setView("grid")}>Grid</button><button type="button" aria-pressed={view==="list"} onClick={()=>setView("list")}>List</button></div></div>
    {filtered.length ? <div className={view==="grid"?"media-grid":"media-list"}>{filtered.map(item=><button className="media-item" key={item.id} type="button" onClick={()=>onSelect?.(item)}><div className="media-preview">{item.contentType.startsWith("image/")?<img src={item.url} alt={item.alt ?? ""}/>:<span>FILE</span>}</div><div><strong>{item.filename}</strong><small>{item.alt || "Alt text not added"} · {Math.ceil(item.size/1024)} KB</small></div></button>)}</div> : <div className="media-empty"><div className="media-empty-icon">▧</div><h2>{query ? "No matching media" : "Your media library is ready"}</h2><p>{query ? "Try a different search or media type." : "Once secure uploads are connected, approved images and documents will appear here. You’ll be able to reuse the same asset across stories, pages, and programs."}</p><small>R2 storage and media metadata are planned for this library. Upload is intentionally disabled until authenticated upload permissions are in place.</small></div>}
  </section>;
}