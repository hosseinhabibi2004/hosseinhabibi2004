# Backend

Django + DRF. It serves the **API** behind the author's own admin screens (where
content is written) and a read-only **content API** the static site reads once,
at build time. It runs on the author's machine; the public site is a static
export and never calls it at runtime. **There is no Django admin** (it is not
a delivery surface): every screen is a real frontend page over this API.

Layout follows the author's other Django projects: `src/config` (settings, urls,
wsgi/asgi), `src/apps/<app>` (one folder per app), `src/apps/core` (shared
plumbing: response envelope, exception handler, default permission, log
redaction, health and schema views), `src/apps/users` (custom user model).

## Run it

```bash
cd backend
cp .env.example .env          # SECRET_KEY is generated on first run when empty
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser   # the author's account for the API
uv run python manage.py runserver   # API: /api/  docs: /api/docs/
```

## Checks (all must pass before a change is done)

```bash
uv run ruff check .
uv run ruff format --check .
uv run ty check        # 0 errors (warnings are the known no-Django-stubs ones)
uv run pytest
```

## Notes

- **Database:** SQLite at `backend/db.sqlite3` by default. The content lives
  only there, not in git: back it up. `DATABASE_URL=postgres://…` switches to
  PostgreSQL with no code change.
- **Uploads:** `backend/media/`, also outside git.
- **API:** every response is the envelope `{success, message, result, meta}`.
  A view that names no `permission_classes` answers 403 (`DenyAll`); the public
  content endpoints will name `AllowAny` on purpose.
- **Not carried over from roshan-clinic:** Celery/Redis, JWT, RBAC, audit log,
  the clinic apps, Docker files. None is needed for a local API; add them when
  a feature needs them.
- **Conventions:** roshan-clinic's `docs/backend/conventions/` is the rulebook
  these files came from. It has not been copied here yet (it mentions the clinic
  apps); review and bring over what applies.
