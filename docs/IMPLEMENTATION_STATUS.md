# Implementation Status

## Implemented in the repository
- pnpm/Turborepo monorepo with Astro public site, Next.js admin, Cloudflare Worker API, shared Zod contracts, and D1/Drizzle schema/migrations.
- Public Astro homepage and server-rendered story list/detail pages connected to published content endpoints.
- Safe Tiptap JSON rendering with escaped text and constrained links/media.
- Admin content editor with stories, programs, events, and pages; searchable/type/status-filtered content library; Tiptap rich text; structured program objectives and event date/time/location/registration fields; draft save and publish.
- R2 media library workflow: upload, private/public visibility, metadata editing, private preview, and reference-aware deletion.
- Worker API with health route, published-content reads, Access-protected admin content/media routes, D1 persistence, R2 storage, and minimal feature-oriented Clean Architecture.
- Public enquiry form, D1/API submission, protected admin inbox, statuses, internal notes, and reply-by-email handoff are present in source.
- Program and event listing/detail routes on the public website; published content is fetched from the API, and event date/location details are rendered.
- Organization settings editor and protected D1 API for approved organization name, contact channels, social URLs, footer text, and default SEO metadata; public SEO defaults and contact page use these settings.
- D1 migrations added for organization settings and structured content metadata.
- GitHub Actions checks for workspace checks, static checks, and builds; workflow is configured for both main and development branches.
- Product scope and release acceptance checklist documented in [LAUNCH_SCOPE.md](./LAUNCH_SCOPE.md). Sponsorships are explicitly excluded from this release.

## Not yet end-to-end / launch blockers
- No verified successful install, type-check, lint, or build yet. Recent Actions runs continue to fail very quickly with no job logs/steps available; this has not provided a code-level pass or actionable compiler output. Treat CI as unverified until a complete job runs.
- The repository cannot be built in this working environment because outbound GitHub access is unavailable. Run the workflow again once runners are available and fix any actual code failures it reports.
- Cloudflare D1 and R2 resources are not provisioned; Wrangler still contains placeholder team/audience/admin/database values.
- Cloudflare Access applications, allowed origins, admin access, and production environment variables must be configured and tested.
- D1 migrations must be applied in order against the real database; media upload/public/private flows need a live Cloudflare smoke test.
- Programs, events, and organization settings are now implemented in source but have not passed a verified workspace build or live deployment test. Team member management remains optional/not implemented.
- Enquiry flow is not yet proven end-to-end. Turnstile/server-side anti-spam verification, edge rate limiting, privacy/retention policy, email notification (if required), and a live submission-to-admin test remain.
- Volunteer-interest form/inbox is planned only if Get Connected confirms active volunteer recruitment; it is not implemented as a complete workflow.
- The public site has provisional organization copy and temporary stock images. Approved Get Connected details, images, email, and domain are needed before launch.
- SEO metadata/structured data, accessibility audit, security review, backups/restore test, and deployment verification remain.
- Sponsorships, sponsor management, online donations, and fundraising/payment processing are outside the current release scope.
- Homepage program concepts and contact CTA must be confirmed against official NGO information before publication.

## Environment setup still required
- Configure ACCESS_TEAM_DOMAIN, ACCESS_AUD, ADMIN_EMAILS, and ALLOWED_ORIGINS.
- Create the D1 database and R2 bucket; replace the D1 ID and verify bucket names.
- Set NEXT_PUBLIC_API_BASE_URL for admin and PUBLIC_API_BASE_URL for the Astro website.
- Apply migrations, deploy API, deploy website, configure Access for the deployed admin/API, then test an actual admin login and public story publication.

## Honest readiness
The foundation, program/event content workflow, organization settings, and initial enquiry workflow are present in source. The product is not launch-ready or proven end-to-end until CI completes, remaining anti-spam/privacy controls and optional modules are addressed, Cloudflare is configured, and live smoke tests pass.
