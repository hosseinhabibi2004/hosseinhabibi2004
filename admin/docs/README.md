# Admin

The author's own screens for writing content. A Next.js app (App Router) that
runs only on the author's machine and talks to the Django API on the same
machine. There is no Django admin: this is the admin.

## Run it

```bash
cd api && uv run python manage.py runserver        # API on :8000
cd admin && pnpm install && pnpm dev                    # this app on :3001
```

`pnpm generate:api` regenerates the SDK from the running API.

## How it signs in

Session cookie plus CSRF. The browser treats `localhost:3001` and
`localhost:8000` as the same site, so the API's session cookie travels with every
call (`credentials: "include"`). Unsafe requests carry the CSRF token in
`X-CSRFToken`. The API's `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`
list `http://localhost:3001`.

## Not here

No i18n yet (the author's interface language is not decided), no sign-in screen,
no content screens. Those are written when the first content type exists.
