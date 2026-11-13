@AGENTS.md

# Working in `admin/`

The author's own admin screens: where posts and page content are written. A
Next.js app that runs **only on the author's machine** (`pnpm dev`, port 3001).
It is never exported or deployed, and the public site (`web/`) never
contains it. It talks to the Django API with a session cookie.

- `pnpm lint`, `pnpm test` and `pnpm build` pass before a change is done. Node 24.
- Signing in: `loadCsrfToken()`, then `Auth.authLogin`, then `setCsrfToken` with
  the token it returns (`src/sdk/session.ts`). Import that module once,
  at the root, so the CSRF interceptor is registered.
- The SDK in `src/sdk/generated` comes from the API's OpenAPI
  document: run the API, then `pnpm generate:api`. Never hand-edit it. Every
  response is the envelope `{success, message, result, meta}`; the payload is
  `data.result`.
- Docs for this area live in [`docs/`](docs/README.md).
- Non-trivial changes: `/banna-draft`, approval, then `/banna-build`.
