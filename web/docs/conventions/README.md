# Web conventions

Rules for `web/src/`. IDs are append-only: a new rule takes the next free
number, and a removed rule's number retires with it. The checks that always
apply: `pnpm lint`, `pnpm test` and `pnpm build`.

Rule IDs: `web-data-` content, `web-ui-` design system, `web-i18n-` language,
`web-seo-` URLs, `web-route-` routes.

## Content

- **web-data-01** — Pages and components read content only through `@/lib/content`, never the
  generated SDK (`@/sdk`). The SDK runs in `scripts/` (`pnpm sync`) alone.
  ✓ `import { getPosts } from "@/lib/content"`; ✗ `import { Public } from "@/sdk/generated"`.
  Enforced by ESLint `no-restricted-imports` and `lib/__tests__/eslint-sdk-boundary.test.ts`.
- **web-data-02** — A Markdown body is rendered with the `Markdown` component; pages `await`
  `renderMarkdown` for it. Never inject Markdown or HTML by hand.
  ✓ `await renderMarkdown({ source, ... })`; ✗ `dangerouslySetInnerHTML={{ __html: body }}`.
  Covered by `components/Markdown/__tests__/Markdown.test.tsx` (sanitised, copy button).

## Design system

- **web-ui-01** — Colours come only from the tokens in `app/globals.css`, through their
  semantic classes (`bg-band text-band-foreground`, `bg-paper`, `bg-code`).
  ✓ `bg-card text-muted-foreground`; ✗ `bg-black`, `text-white`, `bg-[#111]`.
  Enforced by `components/__tests__/style-guards.test.ts`.
- **web-ui-02** — Layout uses logical utilities so one page serves English and Persian.
  ✓ `ms-2 ps-4 text-start border-s`; ✗ `ml-2 pl-4 text-left border-l`.
  Enforced by `components/__tests__/style-guards.test.ts`.

## Language

- **web-i18n-01** — Every user-facing string is a key in `i18n/locales/{en,fa}/<namespace>.json`
  with the same keys in both. Server components get `t` from `getT("ns", { lng })`.
  ✓ `t("home.title")`; ✗ `"Home"`.
  Enforced by `i18n/__tests__/locales.test.ts`.

## URLs

- **web-seo-01** — An absolute URL is built with `absoluteUrl` (or `buildMetadata` for page
  metadata), and a file in `public/` is referenced with `assetPath`, so the base path is
  never forgotten. Never write the origin or `/portfolio` by hand.
  ✓ `absoluteUrl("/en/posts/x/")`, `assetPath("/illustrations/hero.svg")`.
  Checked by `pnpm verify:export` (canonical, sitemap, images) and `lib/__tests__/seo.test.ts`.

## Routes

- **web-route-01** — A dynamic route's `generateStaticParams` returns `staticSlugParams(lng, …)`
  and sets `dynamicParams = false`. Why: a locale with no posts, projects or tags would
  otherwise emit an incomplete param entry and fail the export for every locale.
  Enforced by `lib/__tests__/static-params.test.ts` and `pnpm verify:export` (no `_` pages).
- **web-route-02** — A route handler is allowed only as `export const dynamic = "force-static"`,
  evaluated at build (`feed.xml`). No `proxy.ts`, no runtime API route.
