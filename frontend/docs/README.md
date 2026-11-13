# Frontend

Next.js (App Router) static export. Everything the visitor sees is HTML built
ahead of time; the Django API is read once, during `next build`.

## Run it

```bash
cd frontend
pnpm install
pnpm dev                       # http://localhost:3000 -> /en/
pnpm build                     # writes the static site to out/
npx serve out                  # look at the built site
```

## Config

`.env` holds committed defaults; personal overrides go in `.env.local`.

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Where the site is served, e.g. `https://<user>.github.io` |
| `NEXT_PUBLIC_BASE_PATH` | `/<repo>` for a GitHub project page; empty for a user page, custom domain or local |
| `BACKEND_API_URL` | The Django API, read at build time only |

## Layout

```
src/app/(redirect)/   `/` -> default locale (meta refresh, works without JS)
src/app/[lng]/        root layout + pages, one set per locale (en, fa)
src/app/robots.ts, sitemap.ts
src/i18n/             next-i18next config; locales/<lng>/<namespace>.json
src/lib/locale.ts     locales, default locale, text direction (pure)
src/lib/site.ts       absolute URLs (reads env)
src/api/backend/      SDK generated from the Django OpenAPI document
```

## Not carried over

From `vanenshi/nextjs-boilerplate`: the petstore demo and its generated client,
React Query, the plan/handoff skills (replaced by the `banna-*` skills), and its
`docs/` rulebook (it describes the petstore app). From `vanenshi.com`: Chakra UI,
the pages router and the MDX-in-git content pipeline (content comes from the
Django API instead), plus the RSS, OG-image and SEO plumbing, which return when
the first content pages exist.
