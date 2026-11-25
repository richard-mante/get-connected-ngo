# CMS editor and media library

## Rich text and content workflow
The admin uses Tiptap and stores its document as structured JSON. The Worker validates content fields and JSON before writing to D1. Draft and published states are supported by the API; publishing should happen only after editorial review. The admin content library supports searching, filtering by status, and opening saved stories for editing. The public API returns published content only.

Tiptap image nodes are validated server-side: image sources must resolve to the same API origin, match the managed public media route, and reference a media record whose visibility is public. This prevents pasted third-party image URLs or private assets from being embedded in public content.

## Authentication and authorization
Admin API routes require a Cloudflare Access JWT in the `Cf-Access-Jwt-Assertion` header. The Worker verifies signature, issuer, and audience against Access's JWKS, then checks the email against the `ADMIN_EMAILS` allowlist. Configure Cloudflare Access applications for both the admin app and API; restrict them to the intended staff identities. The API's `ALLOWED_ORIGINS` is an explicit comma-separated CORS allowlist. Never use a wildcard origin with credentialed admin requests.

Set `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ADMIN_EMAILS`, and `ALLOWED_ORIGINS` in Wrangler vars or secrets. Keep actual production values out of Git. `wrangler.toml` and `.dev.vars.example` contain placeholders only. Ensure Cloudflare Access permits CORS preflight requests to reach the Worker.

## Media storage
Media uploads are streamed from the authenticated admin to R2 with a 20 MB limit and an allowlist of JPEG, PNG, WebP, GIF, MP4, WebM, and PDF. The Worker creates opaque object keys and writes metadata to D1. Public assets must be explicitly marked public; private assets are delivered through an authenticated Worker route. Public image uploads require alt text. Public media responses use a short cache lifetime so visibility changes and removals propagate quickly.

The media library supports listing, upload, editing alt text/captions/visibility, and deleting assets. Deletion is blocked when a content body references the asset. Tiptap's media picker inserts public media URLs into public content. Private media remains available only to authorized admins. R2 object keys are never accepted from the browser.

## Database migrations
The Wrangler D1 binding points at `../../packages/database/drizzle`. Apply migrations from the repository root:

```bash
pnpm --filter @get-connected/api exec wrangler d1 migrations apply get-connected --local
pnpm --filter @get-connected/api exec wrangler d1 migrations apply get-connected --remote
```

Apply migrations in order: `0000_initial.sql`, `0001_media_metadata.sql`, then `0002_media_visibility.sql`. Use `--local` for local development and `--remote` for the configured Cloudflare database. The Drizzle schema reflects the final table structure.

## Validation status
GitHub Actions runs workspace checks and builds on pushes and pull requests to `development`. Cloudflare Access, D1, R2, and domain configuration still require environment-specific setup before end-to-end testing.