# Get Connected CMS — staff guide

This guide is for authorized Get Connected staff. Admin access is protected by Cloudflare Access.

## Stories and pages
1. Open **Content** in the admin.
2. Choose the content type when creating a record.
3. Add a title, URL slug, summary, and rich-text body.
4. Use the media picker only for approved public images; provide meaningful alt text.
5. Save as draft or publish. Only published records appear on the public website.
6. CMS-managed pages use their slug as the public path (for example, a page with slug `about` appears at `/about`). Avoid reserved paths such as `stories`, `programs`, `events`, `contact`, `privacy`, and `get-involved`.

## Programs
Create a **Program** record and provide the approved focus area, who it serves, objectives, summary, and full description. Published programs appear at `/programs` and `/programs/{slug}`.

## Events
Create an **Event** record. A valid start date/time is required. Add an optional end date/time, location or online details, and a public HTTP(S) registration/information link if one exists. Published events appear at `/events` and `/events/{slug}`. Confirm the intended local timezone and display time with the organization before publishing; date-time fields currently use the staff browser's local date/time entry.

## Organization settings
Use **Organization settings** to maintain only approved organization information:
- public organization name and contact details
- website and social URLs
- footer statement
- default SEO title/description

The contact page reads approved contact and social settings. The website uses default SEO values where a page has no specific title/description.

## Volunteer interest
The volunteer interest form is **disabled by default**. Enable it in Organization settings only after Get Connected confirms it is currently accepting volunteers. Submissions are stored as enquiries with a subject beginning “Volunteer interest”; staff can search the inbox, update status, add an internal note, and reply by email. This is a lightweight interest intake, not a volunteer CRM.

## Enquiries
Use the Enquiries inbox to search by name, email, subject, or message and filter by status. Open a message to read it, add an internal note, update status, or use Reply by email. The reply link opens your mail client; the CMS does not send email itself.

## Launch and privacy reminders
- Replace all provisional text and stock imagery with approved Get Connected materials.
- Review the privacy notice and set a retention/deletion policy before collecting live enquiries.
- Configure Turnstile site key/secret for production; the API requires server verification in production.
- Never put confidential or sensitive personal information into public pages or story content.
- Do not publish sponsor-related sections or features; sponsorships are outside the current release.
