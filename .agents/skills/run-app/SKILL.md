---
name: run-app
description: Launch the Roshan Clinic stack locally with no Docker (Postgres + Django + Next.js, Redis optional), seed demo data, and drive the team panel in a headless browser to check a change by hand. Use whenever a change needs to be seen rather than only tested — root CLAUDE.md requires this before any change is called done — or when asked to run, start, seed, or screenshot the app.
---

# Running Roshan Clinic locally (no Docker)

Needs: `uv`, `pnpm`, Node, PostgreSQL 16 binaries (`/usr/lib/postgresql/16/bin`
on Debian/Ubuntu), and for screenshots Playwright + a Chromium
(`PLAYWRIGHT_CHROMIUM` / `/opt/pw-browsers`). Redis is optional — the stack runs
with `REDIS_URL=none` and eager Celery.

## 1. Bring it up

```bash
.claude/skills/run-app/scripts/up.sh      # Postgres :5433, Django :8000, Next :3000
.claude/skills/run-app/scripts/down.sh    # stop all three
```

`up.sh` is idempotent: it creates a throwaway Postgres cluster under
`/tmp/roshan-run/` (owned by the `postgres` user when run as root), writes
`backend/.env` if missing (gitignored), runs `migrate` and `seed_demo`, starts
`runserver --nothreading` (threaded dev servers leak Postgres connections; the autoreloader stays on, so backend edits restart it) and `pnpm dev`, waits until both answer, and prints the credentials.
Logs: `/tmp/roshan-run/{postgres,django,next}.log`.

Next proxies `/api/*` to Django (`API_UPSTREAM` in `frontend/.env`), so the
browser stays on `http://localhost:3000` and the refresh cookies are
first-party. After a new backend app, restart Django (`down.sh && up.sh`).

## 2. Accounts (password `Demo12345`)

| Who | Mobile | Roles · where |
|---|---|---|
| Platform admin (no clinic seat) | `09120000001` | `/login`, lands on `/admin/clinics` |
| «مریم احمدی» | `09120000002` | **owner + practitioner** in «کلینیک روشن» (role picker at sign-in), owner in «کلینیک آرام» |
| «نرگس کریمی» | `09120000003` | secretary of «کلینیک روشن» |
| «علی کریمی» | `09120000005` | practitioner only in «کلینیک روشن» (straight to their read-only calendar) |
| «سارا موسوی» | `09120000006` | **secretary + practitioner** in «کلینیک روشن» (role picker) |
| «سارا رحیمی» | `09120000004` | secretary of «کلینیک آرام» |
| «نگار صادقی» | `09120000007` | practitioner only in «کلینیک آرام» |
| «پویا رضایی» | `09120000008` | practitioner only in «کلینیک آرام» |

Seeded by `seed_demo` (`clinics` app): two clinics, their members with the roles above, and
the admin without a seat. A practitioner is a role of a member (ADR 0129): there is no separate
practitioner record. `grant_membership --phone … --clinic <uuid> --role owner --role practitioner`
(repeat `--role`) gives anyone, the admin included, a seat. A person with several roles in the
clinic picks one at sign-in and switches from the header (`X-Role`); the practitioner role is a
strictly read-only calendar of their own column.

A freshly **created** account or a **reset** one gets a one-time temporary
password and lands on the forced change-password screen. Five wrong passwords
lock a phone for 15 minutes (`AUTH_005`); restart Django to clear the in-memory
counter.

The `users` initial migration was regenerated in Plan 1: a database made before
it must be recreated — `down.sh`, delete `/tmp/roshan-run`, `up.sh`.

Plan 2 demo data: the practitioners of «کلینیک روشن» are «مریم احمدی», «علی کریمی» and «سارا موسوی»
with weekly hours, and there is one closure ten days out; «کلینیک آرام» has «نگار صادقی»
and «پویا رضایی». The migration holds the 26 holidays of 1405. After changing the seed or the
role model use a fresh database (`down.sh`, delete `/tmp/roshan-run`, `up.sh`).

Plan 3 demo data: «کلینیک روشن» has 40 invented patients, «کلینیک آرام» has 10
(`patients/demo.py`, through the service). «علي رضايي» was typed with Arabic letters and is
stored as «علی رضایی» (phone `09121110001`, national code `0499370899`); «مینا حسینی» and
«آرمان حسینی» share the phone `09121110010`; «لیلا صفایی» is archived; «رضایی» is a family of
four, so searching «رضای» finds several. «کلینیک آرام» holds a patient with the same phone
`09121110001` and one with the same national code `0499370899` (per-clinic uniqueness: nothing
leaks or collides). Routes: `/patients` (`?q=&status=all`) and `/patients/<id>` (`?merge=<uuid>`).
Things to try: «رضای», a phone typed in Persian digits, `04993`, «نیکپور» (finds «نیک‌پور»), a
search with no match and its «بیمار جدید: «…»» row, a new patient with `09121110010` (the
warning and the toast's «ادغام با…»), the merge comparison, archive and «نمایش بایگانی‌شده‌ها».
The admin has no «بیماران» link; `GET /api/team/clinic/patients/` with the admin's token is
`403 CLINIC_001`.

Plan 4 demo data: `seed_demo` also books appointments from the Saturday of the current week for three weeks in «کلینیک روشن» (three practitioners, different densities, marks by date: past days «آمد», the next two days «تأیید شد») and a handful in «کلینیک آرام». It includes one deleted row, one moved row, a booking on the Friday holiday and one in a hatched zone; the demo closure and the Friday holiday fall in the window. Seeding is anchored to a date (`seed_demo --today YYYY-MM-DD`): the same day twice changes nothing, a later day adds only the new weeks; **use a fresh database** (`down.sh`, delete `/tmp/roshan-run`, `up.sh`) after changing the seed. The calendar is the home `/` (`?view=week|day&p=<practitioner>&d=<YYYY-MM-DD>&patient=<patient>`); `/patients/<id>` lists the patient's appointments. Restart Django after pulling a new app. `scripts/card-matrix.cjs --states|--move|--dark|--grey --out <dir>` route-mocks a synthetic day and shoots every card state and length, printing the card contrast. Running the flows moves the owner's last-used clinic: re-enter «کلینیک روشن» before the e2e.

Plan 5 demo data and screens: the next working day after the seed's `today` is the day of tomorrow's calls (12+ rows over at least two practitioners, about 55 % confirmed). `/calls` lists it (`?date=<YYYY-MM-DD>` picks a day, `?p=<practitioner>` filters; no `date` = automatic); a closure ten days out in «کلینیک روشن» gives the closed-day state (find a closed date with `GET /api/team/clinic/calendar/days/?from=&to=`), a date far away the empty state, the Friday is skipped by prev/next. Read it with `curl -H "Authorization: Bearer …" -H "X-Clinic: <uuid>" /api/team/clinic/calls/` and `…/free-slots/?practitioner=<uuid>&from=<date>&anchor=<appointment uuid>`; the admin without a seat gets `403 CLINIC_001` on both. The free-slot panel opens from the calendar: the toolbar «وقت خالی» (`/?panel=free`), a card's «نوبت بعدی» (`/?panel=free&anchor=<appointment>&fp=<practitioner>&ff=<date>`), or a patient's «نوبت جدید برای این بیمار» (`/?patient=<uuid>&panel=free`); `fp`, `ff` and `anchor` are the panel's own params and compose with `view`, `p`, `d`. `/?view=week&p=<practitioner>&d=<date>&move=<appointment>` opens the week in move mode (the «جابه‌جایی» link of `/calls`). The panel is a side sheet below 1440 px and a docked column from 1440 px. Booking from a slot or a card goes through Plan 4's create and leaves a «واگرد» toast: press it (or Delete on the card) so the demo data stays as found.

**Whole e2e run.** `pnpm e2e` signs in about a hundred times in a few minutes, more than the default `LOGIN_THROTTLE_RATE` (30 per minute per IP) allows, so the last tests fail at the login screen. Bring the stack up with `LOGIN_THROTTLE_RATE=1000/minute .claude/skills/run-app/scripts/up.sh` before a whole run.

**Holiday fetch stub.** persian-calendar.ir is unreachable from some machines. To exercise
the fetch, serve the bundled file and point Django at it:

```bash
python3 - <<'PY' &   # a loopback stub on :8765
import http.server, pathlib
f = pathlib.Path("backend/src/apps/clinics/data/holidays-1405.json").read_bytes()
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.send_header("Content-Type","application/json"); self.end_headers(); self.wfile.write(f)
http.server.HTTPServer(("127.0.0.1", 8765), H).serve_forever()
PY
HOLIDAY_API_BASE_URL=http://127.0.0.1:8765 .claude/skills/run-app/scripts/up.sh   # restart Django with it
```

Plain HTTP to loopback is accepted only with `DEBUG=True`. With the default host the fetch
dialog shows its graceful failure state.

## 3. Drive it

```bash
node .claude/skills/run-app/scripts/drive.cjs shot /admin/clinics --as 09120000001 --out /tmp/clinics.png
node .claude/skills/run-app/scripts/drive.cjs shot /staff --as 09120000002 --clinic آرام --mobile
node .claude/skills/run-app/scripts/drive.cjs shot / --as 09120000001 --mobile --dark
```

Flags: `--as <phone>`, `--password`, `--clinic <name>` (after sign-in, open
«تغییر کلینیک», choose that clinic and wait for the reload), `--mobile` (390×844),
`--dark`, `--full`, `--out`. For multi-step flows write a short Playwright script that
`require`s `playwright` from `$(npm root -g)` and use the labels the screens
show (everything is Persian — `getByRole("button", { name: "کلینیک جدید" })`).

Read the PNG. In this UI the defects tests miss are: Latin digits beside Persian
ones, collapsed title/hint lines, English words inside Persian sentences,
text running the wrong way around a Latin name, and layouts that break at
390px or in dark mode.

## 4. Checks that go with it

```bash
cd frontend && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd backend && uv run pytest && uv run ruff check .
```
