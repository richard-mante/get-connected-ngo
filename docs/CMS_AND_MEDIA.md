# CMS editor and media library

## Rich text and content workflow
The admin uses Tiptap and stores its document as structured JSON. The Worker validates content fields and JSON before writing to D1. Draft and published states are supported by the API; publishing should happen only after editorial review. The admin content library supports searching, filtering by status, and opening saved stories for editing. The public API returns published content only.

## Authentication and authorization
Admin API routes require a Cloudflare Access JWT in the `Cf-Access-Jwt-Assertion` header. The Worker verifies signature, issuer, and audience against Access's JWKS, then checks the email against the `ADMIN_EMAILS` allowlist. Configure Cloudflare Access applications for both the admin app and API; restrict them to the intended staff identities. The API's `ALLOWED_ORIGINS` is an explicit comma-separated CORS allowlist. Never use a wildcard origin with credentialed admin requests.

Set `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ADMIN_EMAILS`, and `ALLOWED_ORIGINS` in Wrangler vars or secrets. Keep actual production values out of Git. `wrangler.toml` and `.dev.vars.example` contain placeholders only.

## Media storage
Media uploads are streamed from the authenticated admin to R2 with a 20 MB limit and an allowlist of JPEG, PNG, WebP, GIF, MP4, WebM, and PDF. The Worker creates opaque object keys and writes metadata to D1. Public assets must be explicitly marked public; private assets are delivered through an authenticated Worker route. Public image uploads require alt text.

The media library supports listing, upload, editing alt text/captions/visibility, and deleting assets. Deletion is blocked when a content body references the media. Tiptap's media picker inserts public media URLs into public content. Private media remains available only to authorized admins. R2 object keys are never accepted from the browser.

## Database
Apply migrations in order: `0000_initial.sql`, `0001_media_metadata.sql`, then `0002_media_visibility.sql`. The Drizzle schema reflects the final table structure.

## Validation status
The source has been committed to the development branch, but this environment has not run pnpm install, type checks, migrations, or deployment. Configure Access, D1, R2, and origins before testing end-to-end.