# CMS editor and media library

## Rich text

The admin app uses Tiptap (React) for story and page body editing. The initial editor enables paragraph text, headings, bold/italic, lists, blockquotes, undo/redo, and image nodes. The editor document is stored as Tiptap JSON rather than generated HTML so the public site can render content using a controlled renderer.

Tiptap is initialized with `immediatelyRender: false` to avoid Next.js server/client hydration mismatches. Images are not allowed as base64 editor payloads; content should reference media URLs managed by the media library.

## Media library

The admin includes a searchable/filterable media gallery UI with grid and list layouts. The media metadata model includes filename, MIME type, byte size, object key, alt text, caption, dimensions, and timestamps.

Actual upload, media selection persistence, and secure R2 delivery are intentionally not enabled yet. They require CMS authentication and authorization first. The planned upload flow is:
1. Authenticated editor requests an upload intent from the API.
2. API validates role, file size, MIME type, and a generated object key.
3. Browser uploads directly to R2 using a short-lived signed URL or a Worker-mediated upload.
4. API verifies the object and writes metadata to D1.
5. Gallery and editor consume the same media record; selecting an asset inserts its managed URL and alt text.

Do not expose arbitrary R2 object keys or accept untrusted public URLs as editor images. Public/private visibility should be explicit in the media record before production launch.

## Current status

- Tiptap editor and formatting toolbar are wired in the admin UI.
- Media library page, search/filter controls, grid/list view, and empty state are present.
- Save/publish controls and upload are disabled until secure authenticated API endpoints are implemented.
- Migration `0001_media_metadata.sql` extends the existing media table; apply migrations in order.
- This starter has not been locally installed, built, or tested in this environment.