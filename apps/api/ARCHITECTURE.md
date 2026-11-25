# API architecture

The Worker is the HTTP composition root. Keep the architecture intentionally small: no framework and no generic abstraction layer.

```
src/
  index.ts                 Worker entry, middleware and feature dispatch
  core/
    env.ts                 Cloudflare binding contract
    http.ts                HTTP response helpers
  features/
    content/
      route.ts              URL/method mapping and HTTP responses
      service.ts            validation and content use cases
      repository.ts         D1 persistence
```

## Request flow
HTTP request → Worker entry → feature route → service/use case → repository → D1/R2.

- **Routes** understand HTTP and translate requests/responses.
- **Services** enforce application rules and validate Tiptap documents.
- **Repositories** own SQL and persistence details.
- **Core** contains only shared runtime contracts/helpers.
- Shared Zod schemas remain in `packages/shared` so admin and API use the same input shape.

Keep it pragmatic: add a layer only when it has a clear responsibility. Avoid controllers plus handlers plus use-cases plus managers that simply forward calls. Cloudflare bindings are injected through the `Env` interface; no global database client.

## Monorepo
- `apps/website`: Astro public experience
- `apps/admin`: Next.js CMS/admin
- `apps/api`: Cloudflare Worker API
- `packages/shared`: shared validation/contracts
- `packages/database`: Drizzle schema and D1 migrations

## Runtime and security
The API uses Cloudflare Access JWT verification for CMS routes. D1 is the source of content metadata and R2 stores file bytes. Public routes expose only published content and explicitly public media. Admin endpoints must remain behind Access and the allowlist.

This structure is deliberately a minimal clean architecture, not a framework-heavy enterprise design.