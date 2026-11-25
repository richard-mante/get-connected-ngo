# Get Connected NGO

A digital platform for Get Connected, organized as a pnpm/Turborepo monorepo.

## Stack
- pnpm + Turborepo
- Astro public website with Cloudflare SSR
- Next.js admin CMS with Tiptap
- Cloudflare Workers API
- Cloudflare D1 + Drizzle ORM
- Cloudflare R2 media library
- GSAP + ScrollTrigger and Lenis for motion

## Architecture

This is a **monorepo** with a deliberately minimal clean architecture for the Cloudflare Workers API. The Worker is the composition root; each feature is organized into route → service → repository, with shared contracts in `packages/shared`. We avoid layering frameworks or abstractions that only forward calls.

- `apps/website` — Astro public website
- `apps/admin` — Next.js CMS/admin with Tiptap
- `apps/api` — Cloudflare Worker HTTP API
- `packages/shared` — shared Zod validation and contracts
- `packages/database` — Drizzle schema and D1 migrations

See [API architecture](apps/api/ARCHITECTURE.md) for the request flow and responsibilities.

## Development

Requires Node.js 20+ and pnpm 9.

```bash
pnpm install
pnpm dev
```

Run an individual app:

```bash
pnpm --filter @get-connected/website dev
pnpm --filter @get-connected/admin dev
pnpm --filter @get-connected/api dev
```

Validate and build the workspace:

```bash
pnpm check
pnpm build
```

## Cloudflare setup
1. Create the D1 database and R2 bucket referenced by `apps/api/wrangler.toml`.
2. Replace the D1 database ID and configure the R2 bucket name.
3. Configure Cloudflare Access for the admin app and API. Set the Access team issuer, application audience, allowed staff email(s), and allowed CORS origins in Wrangler variables.
4. Set `NEXT_PUBLIC_API_BASE_URL` in `apps/admin/.env.local` to the Worker API URL.
5. Set `PUBLIC_API_BASE_URL` in `apps/website/.env` (and in the website build environment) to the API's public origin.
6. Set `PUBLIC_TURNSTILE_SITE_KEY` in the website build environment and `TURNSTILE_SECRET_KEY` as a Worker secret; production enquiry submissions fail closed without the secret.
7. Apply D1 migrations in order, deploy the API, then build and deploy the Astro website.

```bash
pnpm --filter @get-connected/api exec wrangler deploy
pnpm --filter @get-connected/website build
pnpm --filter @get-connected/website deploy
```

See [CMS and media setup](docs/CMS_AND_MEDIA.md) for the content workflow, authentication, media security, and migration commands. See [Enquiries](docs/ENQUIRIES.md) for public-form safeguards and [the staff guide](docs/ADMIN_GUIDE.md) for creating programs/events and managing settings. Review [the launch scope](docs/LAUNCH_SCOPE.md) before release.

## Project docs
- [Project plan](docs/PROJECT_PLAN.md)
- [Animation guidelines](docs/ANIMATION_GUIDELINES.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)
- [Launch scope and acceptance checklist](docs/LAUNCH_SCOPE.md)
- [Admin staff guide](docs/ADMIN_GUIDE.md)
- [Enquiry workflow](docs/ENQUIRIES.md)

The homepage still uses provisional copy and temporary stock imagery. Replace both with Get Connected's approved materials before launch.