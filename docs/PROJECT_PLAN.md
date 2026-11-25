# Get Connected NGO — Project Plan

## Architecture
- Turborepo monorepo with pnpm
- Astro public website rendered on Cloudflare
- Next.js admin CMS with Tiptap
- Cloudflare Workers API
- Cloudflare D1 database with Drizzle ORM
- Cloudflare R2 for media storage

## Applications
- `apps/website`: public pages, SSR published stories, SEO, sitemap, accessibility, responsive design
- `apps/admin`: secure CMS for posts, events, programs, gallery, media, settings, and enquiries
- `apps/api`: versioned API, public published-content endpoints, admin operations, authentication, authorization, and media lifecycle

## Shared packages
- `packages/database`: Drizzle schema and migrations
- `packages/shared`: TypeScript types and validation schemas
- `packages/ui`: reusable UI components
- `packages/config`: shared tooling configuration

## Media upload flow
1. Authenticated admin sends a multipart upload to the Worker.
2. Worker validates staff identity, MIME type, and file size; generates an opaque object key.
3. Worker streams the file into R2 and records metadata in D1.
4. Public assets are explicitly marked public; private assets are served only through authenticated routes.
5. Tiptap may insert only approved public media URLs into public content.

Never expose R2 credentials in browser code. Restrict CORS, validate uploads, use generated object keys, and clean up abandoned uploads.

## Delivery
1. Set up workspace and app scaffolds.
2. Configure Worker, D1, Drizzle, and API conventions.
3. Implement authentication, roles, and audit logs.
4. Implement R2 media uploads and library.
5. Build admin content management.
6. Connect Astro SSR pages to published content.
7. Complete SEO, accessibility, security, testing, deployment, and backup documentation.

## Initial scope
Defer donations/payment processing, advanced volunteer CRM, newsletter automation, multi-tenant support, advanced analytics, AI generation, and ticketing unless required for launch.

## Information to confirm
NGO mission and branding, domain, audience, programs, languages, event registration, donation requirements, admin users, and privacy/contact details.