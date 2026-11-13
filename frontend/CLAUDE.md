@AGENTS.md

# Working in `frontend/`

The public site: a Next.js static export (`output: "export"`) in English and
Persian (RTL), served from GitHub Pages. It reads the Django API once, at build
time; nothing runs on a server at runtime.

- `pnpm lint`, `pnpm test` and `pnpm build` pass before a change is done. Node 24.
- The locale is part of the path (`/en/`, `/fa/`). Pass `lng` from the route
  params to `getT("ns", { lng })` in every server component; never read it from a
  cookie or header (a static export has neither).
- No `proxy.ts`, API routes, `redirect()` for navigation, or server image
  optimisation: none of them exists in a static export.
- The SDK in `src/api/backend/generated` comes from the backend's OpenAPI
  document: run the backend, then `pnpm generate:api`. Never hand-edit it.
- Docs for this area live in [`docs/`](docs/README.md).
- Non-trivial changes: `/banna-draft`, approval, then `/banna-build`.
