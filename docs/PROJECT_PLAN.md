# Get Connected NGO — Project Plan

## Product goal
A practical NGO website and staff CMS that lets Get Connected publish approved information and activities, maintain its media, receive community enquiries, and coordinate lightweight volunteer interest without routine developer support.

The detailed first-release requirements and acceptance checklist live in [Launch Scope](./LAUNCH_SCOPE.md).

## Explicit scope boundary
Included: public information pages, programs, stories/news, events, media library, general enquiries, volunteer-interest intake (when recruiting is confirmed), approved team information, organization settings, SEO, accessibility, and basic operational/security requirements.

**Sponsorships are excluded entirely from this release.** Do not build sponsor tiers/packages, sponsor applications, sponsor logos/sections, sponsor management, sponsor CRM, or sponsor dashboards. Online donations/fundraising and payment processing are also excluded unless the NGO separately confirms a requirement. E-commerce, ticketing, member portals, mobile apps, advanced volunteer CRM, newsletter automation, multi-tenancy, advanced analytics, and AI generation are deferred.

Do not invent NGO facts, programs, staff, outcomes, partners, statistics, testimonials, or contact details. Use placeholders until official materials are approved.

## Architecture
- Turborepo monorepo with pnpm
- Astro public website rendered on Cloudflare
- Next.js admin CMS with Tiptap
- Cloudflare Workers API with minimal feature-oriented Clean Architecture
- Cloudflare D1 database with Drizzle ORM
- Cloudflare R2 for media storage

## Applications
- `apps/website`: responsive public pages; published stories, programs, and events; contact and approved participation forms; SEO, sitemap, accessibility, and useful error states.
- `apps/admin`: secure CMS for pages, stories, programs, events, optional team records, media, organization settings, enquiries, and lightweight volunteer-interest submissions.
- `apps/api`: versioned public published-content endpoints, protected admin operations, authentication/authorization, enquiry and volunteer intake, and media lifecycle.

## Shared packages
- `packages/database`: Drizzle schema and ordered D1 migrations
- `packages/shared`: shared TypeScript types and Zod validation contracts
- `packages/ui`: reusable UI components
- `packages/config`: shared tooling configuration

## Content management
All content types need validated create/edit, preview, publish/unpublish, and archive behavior as appropriate. Public API responses must expose published content only. CMS lists need useful search/filtering, pagination where needed, and loading/empty/error states. Keep editorial workflows simple for the first release.

## Media upload flow
1. Authenticated admin sends a multipart upload to the Worker.
2. Worker validates staff identity, MIME type, and file size; generates an opaque object key.
3. Worker streams the file into R2 and records metadata in D1.
4. Public assets are explicitly marked public; private assets are served only through authenticated routes.
5. Tiptap may insert only approved public media URLs into public content.
6. Prevent deletion of media referenced by published content.

Never expose R2 credentials in browser code. Restrict CORS, validate uploads, use generated object keys, and clean up abandoned uploads.

## Public participation
- General enquiry form with minimal required fields, privacy notice, server-side validation, anti-spam verification, and rate limiting.
- Protected staff inbox with statuses, internal notes, and reply handoff; notification email requires a configured provider and approved sender.
- Lightweight volunteer-interest form and inbox only if Get Connected confirms it is recruiting. This is not a volunteer CRM.
- Keep personal data private and out of logs; agree retention/deletion policy before launch.

## Delivery order
1. Verify and harden existing stories, media, and enquiry foundation.
2. Implement reusable content model/API/admin patterns for programs and events.
3. Connect public program and event pages to published API data.
4. Add organization settings and optional team management.
5. Add volunteer-interest workflow only after recruitment is confirmed.
6. Complete SEO, accessibility, security, backups/restore, deployment, and live end-to-end validation.

## Launch requirements
- Successful install, checks, lint, and builds in CI.
- Cloudflare D1/R2 provisioned and migrations applied.
- Cloudflare Access, allowed origins, environment variables, and authorized staff configured.
- Live tests for admin login, publishing, media privacy, enquiry submission-to-inbox, and enabled volunteer intake.
- Approved mission, programs, event details, logo/photos, contact information, privacy notice, domain, and admin emails supplied by Get Connected.

## Information to confirm
Official mission and description, program information, events, team details if shown, languages, volunteer recruitment status, public contact channels, domain, privacy/retention wording, and authorized admin users.
