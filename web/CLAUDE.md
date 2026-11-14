@AGENTS.md

# Working in `web/`

The public site: a Next.js static export (`output: "export"`) in English and
Persian (RTL), served from GitHub Pages. It reads the Django API once, at build
time; nothing runs on a server at runtime.

- `pnpm lint`, `pnpm test` and `pnpm build` pass before a change is done. Node 24.
- The locale is part of the path (`/en/`, `/fa/`). Pass `lng` from the route
  params to `getT("ns", { lng })` in every server component; never read it from a
  cookie or header (a static export has neither).
- No `proxy.ts`, `redirect()` for navigation, runtime API routes or server image
  optimisation: none of them exists in a static export. A route handler is
  allowed only as `force-static` (the RSS feed), evaluated at build.
- `pnpm build` syncs the content from the API first, so the API must be running;
  without it, use `SKIP_SYNC=1 pnpm build` with an existing `.content/` (or
  `CONTENT_DIR` at the test fixture). Docs-only and UI-only work uses the second.
- The SDK in `src/sdk/generated` comes from the API's OpenAPI
  document: run the API, then `pnpm generate:api`. Never hand-edit it.
- Docs for this area live in [`docs/`](docs/README.md):
  [`CONTEXT.md`](docs/CONTEXT.md) (terms), [`conventions/`](docs/conventions/README.md) (rules),
  [`stack.md`](docs/stack.md) (how it is built).
- Non-trivial changes: `/banna-draft`, approval, then `/banna-build`.
