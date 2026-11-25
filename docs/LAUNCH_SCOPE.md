# Get Connected — launch scope and completion checklist

This document defines the practical first release of the Get Connected NGO website and its staff CMS. The goal is for the organization to maintain its public information, publish activities, and respond to community enquiries without routine developer help.

## Product boundary

**Included:** public information website, CMS, stories/news, programs, events, team information (if approved), media library, general enquiries, volunteer-interest submissions, organization settings, and basic operational/security requirements.

**Explicitly excluded from this release:** sponsorships of every kind (sponsor packages, sponsor tiers, sponsor applications, sponsor logos/sections, sponsor CRM or dashboards); online donations/fundraising and payment processing; e-commerce; ticketing; public member accounts/portals; mobile app; advanced volunteer CRM; newsletter automation; multi-tenant features; advanced analytics; AI content generation.

Sponsorships must not appear in navigation, public page content, admin modules, data models, or launch acceptance criteria. Do not add sponsorship functionality unless the organization requests it later. Donations are also out of scope unless separately confirmed.

## 1. Public website

### Required pages
- Home: approved introduction, mission/vision summary, approved featured programs, latest stories, upcoming events, participation/contact calls to action.
- About: approved background, mission, vision, values, and organizational approach.
- Programs index and individual program detail pages.
- Stories/news index and individual article pages.
- Events index with upcoming and past events, and event detail pages.
- Team page only when approved names, roles, and photographs are supplied.
- Get involved page explaining verified participation opportunities, including volunteering where available.
- Contact page with confirmed contact details and enquiry form.
- Privacy notice and any required accessibility/legal information.
- Custom 404 and useful empty, loading, and error states.

Do not fabricate organizational history, staff, programs, locations, outcomes, statistics, testimonials, partners, or contact information. Use clearly marked placeholders until approved content is provided.

### Public experience
- Responsive mobile/tablet/desktop layouts.
- Accessible semantic structure, keyboard operation, visible focus, labels, contrast, and reduced-motion support.
- Performance-conscious images, fonts, and animation.
- Page titles/descriptions, canonical URLs, Open Graph metadata, sitemap, robots.txt, and appropriate structured data.
- Search only if the published content volume justifies it for launch; otherwise defer rather than shipping a nonfunctional search box.

## 2. CMS content types

The staff CMS should manage:

- Pages (structured page content; no arbitrary unsafe HTML).
- Programs (title, slug, summary, full content, objectives/activities where approved, cover media, status, dates if relevant).
- Stories/news (title, slug, summary, rich content, cover media, author/byline if approved, publication date, status).
- Events (title, slug, summary, content, start/end date and timezone, location or online details, media, optional external registration/enquiry URL, status).
- Team members (optional module; name, approved role/biography/photo, display order, publication state).
- Media (upload, metadata, alt text, caption, visibility, preview, reuse, reference-aware deletion).
- Enquiries and volunteer-interest submissions.
- Organization settings (approved logo/name, contact channels, address if public, social links, footer text, default SEO metadata, optional announcement).

Every content type needs appropriate create/edit/preview/publish/unpublish/archive behavior, validation, empty/loading/error states, and a clear slug strategy. Avoid creating an elaborate workflow or permission matrix for the first release.

## 3. Public participation and inboxes

### General enquiries
- Accessible form with name, email, subject/type, message, optional phone, privacy notice, and consent where legally/operationally appropriate.
- Client and server validation, honeypot plus server-verified anti-bot protection, edge rate limiting, duplicate-submit prevention, and clear success/error feedback.
- Store in D1; protect all enquiry records and internal notes behind staff authentication.
- Admin inbox: search/filter, newest first, pagination, detail view, status, internal note, optional assignee, received timestamp, and reply handoff.
- Statuses: new, in progress, responded, archived.
- Notification email for new enquiries should be configured if an approved sender/provider is available. Do not claim an email was sent unless an email provider confirms it.
- Never log full message bodies or personal contact details.

### Volunteer interest
A lightweight volunteer-interest form is in scope if the NGO confirms it is currently recruiting. Collect only necessary details: name, email, optional phone, area of interest, availability, relevant skills (optional), and a short message. Staff can review, mark status, add internal notes, and contact the applicant. This is an interest inbox, not a full volunteer CRM, scheduling, or background-check system.

## 4. Authentication, privacy, and operations
- Admin protected by Cloudflare Access; enforce server-side authorization on every protected API route.
- Keep personal enquiry/volunteer data private; least-privilege access.
- Validate uploads by size/type, generate opaque object keys, and keep private media private.
- Configure CORS to exact approved origins.
- Configure secrets/variables outside source control.
- D1 migrations applied in order; backups and restore procedure documented and tested.
- Retention/deletion policy for enquiry and volunteer submissions approved by the organization.
- Error logging/monitoring without sensitive payloads.
- Basic security and dependency review before launch.

## 5. Launch acceptance tests
1. Staff can authenticate and access the admin CMS; unauthenticated users cannot access protected data.
2. Staff can create, preview, publish, edit, and unpublish a story and program; public pages reflect the published version only.
3. Staff can create and publish an event; date/time/location display correctly.
4. Staff can upload media, add alt text/caption, choose visibility, reuse it, and delete only when safe.
5. A public enquiry submits successfully, persists in D1, appears in the staff inbox, can be updated with a note/status, and supports reply handoff.
6. If volunteer-interest is enabled, submission persists privately and staff can review it.
7. Public forms reject invalid/spam submissions and are rate limited.
8. SEO metadata, sitemap, robots, responsive layouts, keyboard accessibility, reduced motion, 404, and error states are checked.
9. CI install/check/lint/build succeeds; deployed Cloudflare smoke tests pass.
10. Approved official content, images, contact details, privacy notice, domain, and staff access list are in place.

## 6. Delivery order
1. Verify and harden the existing stories/media/enquiries foundation.
2. Add reusable content model/API/admin patterns for programs and events.
3. Add public program and event pages wired to published API data.
4. Add organization settings and optional team management.
5. Complete volunteer-interest workflow only after the organization confirms recruitment.
6. Finish SEO, accessibility, security, backup, deployment, and end-to-end validation.

## Organization inputs required before launch
Get Connected must provide/approve its mission and description, program information, event details, team information if displayed, public contact channels, official logo and photographs, privacy/retention wording, domain, and authorized admin email addresses.
