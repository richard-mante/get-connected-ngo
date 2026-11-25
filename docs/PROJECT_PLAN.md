# Get Connected NGO — Project Plan

## Architecture
- Turborepo monorepo with pnpm
- Astro public website
- Next.js admin CMS
- Cloudflare Workers API
- Cloudflare D1 database with Drizzle ORM
- Cloudflare R2 for media storage and presigned direct browser uploads

## Applications
- `apps/website`: public pages, content display, SEO, sitemap, accessibility, responsive design
- `apps/admin`: secure CMS for posts, events, programs, projects, impact, gallery, media, settings, and enquiries
- `apps/api`: versioned API, public published-content endpoints, admin operations, authentication, authorization, and upload lifecycle

## Shared packages
- `packages/database`: Drizzle schema and migrations
- `packages/shared`: TypeScript types and validation schemas
- `packages/ui`: reusable UI components
- `packages/config`: shared tooling configuration

## Upload flow
1. Admin requests upload authorization from the Worker.
2. Worker checks user role, file type, and size; generates an object key and short-lived presigned URL.
3. Browser uploads directly to R2.
4. API verifies the uploaded object and records metadata in D1.

Never expose R2 credentials in browser code. Restrict CORS, validate uploads, use generated object keys, and clean up abandoned uploads.

## Delivery
1. Set up workspace and app scaffolds.
2. Configure Worker, D1, Drizzle, and API conventions.
3. Implement authentication, roles, and audit logs.
4. Implement R2 media uploads and library.
5. Build admin content management.
6. Build Astro public pages and connect published content.
7. Complete SEO, accessibility, security, testing, deployment, and backup documentation.

## Initial scope
Defer donations/payment processing, advanced volunteer CRM, newsletter automation, multi-tenant support, advanced analytics, AI generation, and ticketing unless required for launch.

## Information to confirm
NGO mission and branding, domain, audience, programs, languages, event registration, donation requirements, admin users, and privacy/contact details.