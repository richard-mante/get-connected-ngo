"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { MediaGallery } from "./MediaGallery";

export function ContentEditor() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [savedBody, setSavedBody] = useState("{}");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false, inline: false }),
      Placeholder.configure({ placeholder: "Start writing your story…" }),
    ],
    content: { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => setSavedBody(JSON.stringify(editor.getJSON())),
  });

  const updateTitle = (value: string) => {
    setTitle(value);
    setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <div className="content-editor-page">
      <header className="editor-header">
        <div><small>CONTENT / NEW STORY</small><h1>Create a story</h1><p>Draft a community update for the Get Connected website.</p></div>
        <span className="draft-pill">Draft</span>
      </header>
      <div className="editor-grid">
        <section className="editor-main">
          <label className="field-label">Story title<input value={title} onChange={e=>updateTitle(e.target.value)} placeholder="Give your story a clear title" /></label>
          <label className="field-label">URL slug<input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="story-url" /></label>
          <label className="field-label">Short summary<textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={3} placeholder="A short introduction for cards and search results" /></label>
          <div className="editor-card">
            <div className="editor-toolbar" aria-label="Text formatting">
              <button type="button" onClick={()=>editor?.chain().focus().toggleBold().run()} aria-pressed={editor?.isActive("bold")}>Bold</button>
              <button type="button" onClick={()=>editor?.chain().focus().toggleItalic().run()} aria-pressed={editor?.isActive("italic")}>Italic</button>
              <button type="button" onClick={()=>editor?.chain().focus().toggleHeading({level:2}).run()} aria-pressed={editor?.isActive("heading",{level:2})}>Heading</button>
              <button type="button" onClick={()=>editor?.chain().focus().toggleBulletList().run()} aria-pressed={editor?.isActive("bulletList")}>List</button>
              <button type="button" onClick={()=>editor?.chain().focus().toggleBlockquote().run()} aria-pressed={editor?.isActive("blockquote")}>Quote</button>
              <button type="button" onClick={()=>setShowMediaPicker(value=>!value)} aria-expanded={showMediaPicker}>Insert image</button>
              <button type="button" onClick={()=>editor?.chain().focus().undo().run()}>Undo</button>
              <button type="button" onClick={()=>editor?.chain().focus().redo().run()}>Redo</button>
            </div>
            <EditorContent editor={editor} className="tiptap-content" />
          </div>
          {showMediaPicker && <div className="editor-media-picker"><MediaGallery onSelect={item=>{editor?.chain().focus().setImage({src:item.url,alt:item.alt??""}).run();setShowMediaPicker(false);}} /><button type="button" className="picker-close" onClick={()=>setShowMediaPicker(false)}>Close media picker</button></div>}
          <p className="editor-note">Rich text is edited with Tiptap and represented as structured JSON. Draft persistence will be connected through the authenticated CMS API.</p>
          <details className="content-json"><summary>Editor document preview</summary><pre>{savedBody}</pre></details>
        </section>
        <aside className="editor-sidebar">
          <section><h2>Publishing</h2><p>Draft content is private until reviewed and published.</p><button type="button" disabled>Save draft</button><button type="button" className="secondary" disabled>Publish story</button><small>Saving and publishing will be enabled after CMS authentication and write endpoints are connected.</small></section>
          <section><h2>Featured image</h2><p>Choose an approved image from the media library.</p><a className="media-link" href="/media">Open media library ↗</a></section>
          <section><h2>Story details</h2><p>Type: Story</p><p>Status: Draft</p><p>Body format: Tiptap JSON</p></section>
        </aside>
      </div>
    </div>
  );
}