# Get Connected NGO

A digital platform for an NGO, built as a pnpm/Turborepo monorepo with a public website, content administration dashboard, and Cloudflare API.

## Planned stack

- **Monorepo:** Turborepo + pnpm
- **Public website:** Astro
- **Admin CMS:** Next.js
- **API:** Cloudflare Workers
- **Database:** Cloudflare D1 + Drizzle ORM
- **Media:** Cloudflare R2 with presigned direct browser uploads

## Project status

The repository is initialized with architecture and implementation planning. Application code has not yet been scaffolded.

## Documentation

- [Project plan](docs/PROJECT_PLAN.md)

## Planned workspace

```
apps/
  website/   Astro public website
  admin/     Next.js administration/CMS
  api/       Cloudflare Worker API
packages/
  database/  Drizzle schema and migrations
  shared/    Shared types and validation
  ui/        Reusable UI components
  config/    Shared tooling configuration
docs/
```
