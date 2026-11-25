# Enquiries — end-to-end workflow

Enquiry handling is a core launch feature of Get Connected, not a later add-on.

## Public website
- Provide an accessible enquiry form (name, email, subject, message; phone optional).
- Explain what the form is for and provide a privacy notice link before submission.
- Consent checkbox is required; do not request unrelated personal information.
- Include a hidden honeypot field and submit to `POST /api/v1/enquiries`.
- Validate in the browser for usability and again in the Worker. Never trust client validation.
- Show clear success and recoverable error states; prevent duplicate submissions while pending.
- Do not expose internal notes or enquiry records publicly.

## API
- Public submission stores the enquiry in D1 with status `new`.
- Admin list: `GET /api/v1/admin/enquiries?status=new&limit=25&offset=0`.
- Admin update: `PATCH /api/v1/admin/enquiries/:id` with status and optional internal note.
- Admin endpoints require the existing Cloudflare Access authentication.
- Status lifecycle: new → in progress → responded → archived (staff may update status as needed).
- Keep private contact data out of public content APIs and logs. Do not log message bodies or email addresses.

## Admin dashboard
- Dedicated Enquiries inbox, newest first, with status filters and pagination.
- Detail view with sender, subject, message, received date, and optional phone.
- Staff can change status, add/update an internal note, and use a mailto link to reply externally.
- Show unread/new count and empty/loading/error states.
- Do not claim an email was sent; replying opens the staff member's email client unless a mail provider is deliberately integrated.

## Production safeguards required before launch
- Configure Cloudflare Turnstile (server-side token verification) and edge rate limiting; honeypot alone is not adequate anti-spam protection.
- Add privacy/retention policy and a deletion/retention process for enquiries.
- Ensure backups and access controls cover enquiry data.
- Test public submission → D1 persistence → admin inbox → status/note update → reply handoff.
- Confirm the organization contact email and privacy notice with Get Connected.

## Current implementation note
The development branch now contains the public homepage form, Worker submission endpoint, D1 migration and Drizzle table, protected admin list/status/note API, and admin inbox UI with reply-by-email handoff. This is an implementation in source, not a verified production workflow. Turnstile verification, edge rate limiting, privacy/retention controls, notifications if the NGO requires them, and live Cloudflare validation are still outstanding.
