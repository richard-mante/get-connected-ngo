# Implementation Status

## Completed in development
- Created isolated `development` branch and Turborepo/pnpm workspace.
- Built the initial Astro public website with sea-blue visual direction, GSAP/ScrollTrigger, Lenis, responsive navigation, and reduced-motion support.
- Added Next.js admin starter and Tiptap rich-text editor with formatting, JSON document handling, draft save, and publish actions.
- Added content workspace with searchable/status-filtered content list and edit routes for saved stories.
- Added searchable media gallery with grid/list modes, file-type filtering, upload metadata, private/public visibility, editor media picker, metadata editing, and reference-aware deletion.
- Added Cloudflare Access JWT verification and email allowlist to protected admin Worker routes.
- Added authenticated D1 content create/read/update/list endpoints and public published-content endpoints.
- Added authenticated R2 media upload and private preview endpoints, plus public media delivery for explicitly public assets.
- Added server validation that public content image nodes can reference only approved public media hosted by this API.
- Added D1 media metadata and visibility migrations; media is private by default and public images require alt text.
- Added a GitHub Actions workflow for workspace checks and builds.

## Requires environment configuration
- Configure Cloudflare Access applications for the admin site and API, including audience and team issuer.
- Set `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ADMIN_EMAILS`, and `ALLOWED_ORIGINS`.
- Create the D1 database and R2 bucket, replace the D1 ID in Wrangler config, and apply migrations in order.
- Set the admin app's `NEXT_PUBLIC_API_BASE_URL` to the deployed Worker URL.
- Configure CORS and Access handling for preflight requests.

## Temporary content
- Mission and program copy is provisional pending approved NGO information.
- Homepage photography is temporary stock imagery and must be replaced by approved Get Connected photos.
- Email and organization domain are placeholders and must be confirmed.

## Remaining
- Validate install, type checks, migrations, and production builds locally.
- Complete editorial review roles and workflow refinements.
- Connect the Astro website to the published content API and render Tiptap JSON safely.
- Add SEO fields, accessibility checks, image optimization, backups, deployment and security review.

The first GitHub Actions attempts failed before any job steps ran (no runner was assigned), so no type-check or build result is available yet.