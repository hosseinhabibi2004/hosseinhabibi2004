# Web stack

- **Run**: Node 24. `pnpm dev` (port 3000), `pnpm sync`, `pnpm build`, `pnpm verify:export`.
  Checks: `pnpm lint && pnpm test && pnpm build`. Commands in detail: [`README.md`](README.md).
- **Framework**: Next 16 App Router, React 19, Tailwind 4, shadcn on Base UI. `next.config.ts`:
  `output: "export"`, `trailingSlash`, `basePath` from `NEXT_PUBLIC_BASE_PATH`, unoptimised images,
  `experimental.rootParams` (next-i18next) and `experimental.globalNotFound`.
- **Snapshot flow**: `prebuild` runs `pnpm sync` (skipped by `SKIP_SYNC=1`), which calls the API
  through the generated SDK and writes `<lng>.json` and `meta.json` (time, counts) to `CONTENT_DIR`
  (default `.content/`), and downloads cover and in-body images to `MEDIA_DIR` (default
  `public/media/`), rewriting their URLs with the base path. `@/lib/content` reads the JSON; a
  missing snapshot fails the build with a message. The snapshot is gitignored.
- **Language**: the locale is the first path segment; `lng` is passed from the route params.
  `[lng]/layout.tsx` sets `<html lang dir>` (Persian is `rtl`).
- **Fonts**: self-hosted with fontsource: Sora (Latin sans) with Vazirmatn (Persian) as `font-sans`,
  Source Serif 4 with Vazirmatn as `font-serif` for article bodies, Geist Mono as `font-mono`.
- **Theme**: `ThemeScript` is an inline script in `<head>` that sets the `dark` class before paint
  from `localStorage`, else the system preference; `ThemeToggle` stores the choice.
- **Markdown**: unified pipeline in `components/Markdown`: remark-parse, GFM, remark-rehype, rehype-raw,
  rehype-sanitize (plus `mark`), rehype-slug, rehype-highlight, rendered to JSX with a code block
  that has a copy button. It is async, so pages `await renderMarkdown`.
- **404**: `app/global-not-found.tsx` (the app has two root layouts) becomes `out/404.html`: bilingual,
  `noindex`. `[lng]/not-found.tsx` is shown when a page under a locale calls `notFound()`.
- **SEO**: `lib/seo.ts` builds metadata (canonical, hreflang only for published twins, Open Graph)
  and JSON-LD; `sitemap.ts` and `robots.ts` are static; `[lng]/feed.xml/route.ts` is a force-static RSS feed.
- **Open Graph images**: Satori cannot shape Persian, so `scripts/render-og.ts` pre-renders
  `public/<lng>/opengraph-image.png` with a local browser; the PNGs are committed.
- **Postbuild**: `scripts/postbuild.ts` removes the `_` placeholder pages the build emits for a section
  with no items in any locale, and fails if `out/404.html` is missing.
- **Tests**: Vitest, jsdom, Testing Library; `vitest.config.ts` inlines `next-i18next`. The export
  check has its own config, `vitest.export.config.ts` (`pnpm verify:export`).
