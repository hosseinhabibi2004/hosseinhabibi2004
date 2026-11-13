# Admin

The author's own screens for writing content. A Next.js app (App Router) that
runs only on the author's machine and talks to the Django API on the same
machine. There is no Django admin: this is the admin.

## Screens

- **Sign in** (`/login`) — username and password; the session is a cookie.
- **Dashboard** (`/`) — how many posts and projects there are, and the latest posts.
- **Posts** (`/posts`) — the list with a Trash tab, restore and delete;
  `/posts/new` and `/posts/<uuid>` hold the form: a slug, a cover image, and a tab per
  language (English, Persian) with its title, summary, Markdown body and published switch.

## Language and design

The interface is English (left to right) or Persian (right to left); the header's
switcher stores the choice in a cookie. The design is dark, black and white.
Rules and tokens: [`conventions/`](conventions/README.md), [`stack.md`](stack.md).

## Run it

```bash
cd api && uv run python manage.py runserver 8010   # API
cd admin && pnpm install && pnpm dev               # this app on :3001
cd admin && pnpm storybook                         # every component, on :6006
```

Set `NEXT_PUBLIC_API_URL` in `admin/.env.local` when the API is not on port 8000.
`pnpm generate:api` regenerates the SDK from the running API.

## How it signs in

Session cookie plus CSRF. The browser treats `localhost:3001` and the API's port as the
same site, so the session cookie travels with every call (`credentials: "include"`).
Unsafe requests carry the CSRF token in `X-CSRFToken`. The API's `CORS_ALLOWED_ORIGINS`
and `CSRF_TRUSTED_ORIGINS` list `http://localhost:3001`.

## Not here yet

Projects, the profile and tags have no screens; the dashboard counts projects only.
