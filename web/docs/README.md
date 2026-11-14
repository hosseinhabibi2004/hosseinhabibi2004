# Web

Next.js (App Router) static export. Everything the visitor sees is HTML built
ahead of time; the Django API is read once, during `next build`.

## Run it

```bash
cd web
pnpm install
pnpm sync                      # snapshot the API (must be running) into .content/ and public/media/
pnpm dev                       # http://localhost:3000 -> /en/ (needs a snapshot)
pnpm build                     # runs `pnpm sync` first, then writes the static site to out/
SKIP_SYNC=1 pnpm build        # build from an existing .content/ without the API
SKIP_SYNC=1 CONTENT_DIR=src/lib/content/__fixtures__ pnpm build   # build the test fixture
pnpm verify:export             # check out/ after a build (see below)
npx serve out                  # look at the built site
pnpm exec tsx scripts/render-og.ts   # re-draw public/<lng>/opengraph-image.png (needs Playwright)
```

`pnpm build` needs the API running, or `SKIP_SYNC=1` with a snapshot already in
place. How the snapshot flows: [`stack.md`](stack.md).

## Check the export

`pnpm verify:export` reads `out/` and asserts the build is complete: a file per
route, `lang`/`dir`, canonical and hreflang, sitemap entries, RSS, `404.html`, no
`localhost` URL, every local image present. Build and verify with a non-local
site URL, since `.env` defaults to `http://localhost:3000`:

```bash
export NEXT_PUBLIC_SITE_URL=https://example.github.io NEXT_PUBLIC_BASE_PATH=/portfolio
pnpm build && pnpm verify:export
```

On the fixture, put placeholder files named like its `/media/*` URLs in
`public/media/` first (gitignored). `pnpm test` does not run this check.

## Config

`.env` holds committed defaults; personal overrides go in `.env.local`.

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Where the site is served, e.g. `https://<user>.github.io` |
| `NEXT_PUBLIC_BASE_PATH` | `/<repo>` for a GitHub project page; empty for a user page, custom domain or local |
| `BACKEND_API_URL` | The Django API, read at build time only |
| `CONTENT_DIR` | Where the snapshot lives; default `.content/` |
| `MEDIA_DIR` | Where `pnpm sync` writes downloaded images; default `public/media/` |
| `SKIP_SYNC` | `1` makes `pnpm build` skip `pnpm sync` |

## Layout

```
src/app/(redirect)/   `/` -> default locale (meta refresh, works without JS)
src/app/[lng]/        root layout + pages per locale (en, fa): home, about, posts, projects, tags,
                      contact, feed.xml (force-static route handler), not-found
src/app/global-not-found.tsx   bilingual 404.html; icon.svg, apple-icon.png
src/app/robots.ts, sitemap.ts
src/components/       shell, cards, Markdown/ (renderer, code block), ThemeScript
src/i18n/             next-i18next config; locales/<lng>/<namespace>.json
src/lib/content/      typed reader of the snapshot (the only way pages read content)
src/lib/seo.ts        buildMetadata and JSON-LD
src/lib/site.ts       absoluteUrl, assetPath (read env)
src/lib/locale.ts     locales, default locale, text direction (pure)
src/lib/static-params.ts   staticSlugParams for dynamic routes
src/sdk/              SDK generated from the Django OpenAPI document (scripts only)
scripts/              sync-content.ts, postbuild.ts, render-og.ts, verify-export.ts
public/               illustrations/, <lng>/opengraph-image.png, media/ (synced, gitignored)
.content/             the snapshot (gitignored)
```

See also [`CONTEXT.md`](CONTEXT.md), [`conventions/`](conventions/README.md) and
[`stack.md`](stack.md).

## Not carried over

From `vanenshi/nextjs-boilerplate`: the petstore demo and its generated client,
React Query, the plan/handoff skills (replaced by the `banna-*` skills), and its
`docs/` rulebook (it describes the petstore app). From `vanenshi.com`: Chakra UI,
the pages router and the MDX-in-git content pipeline (content comes from the
Django API instead).
