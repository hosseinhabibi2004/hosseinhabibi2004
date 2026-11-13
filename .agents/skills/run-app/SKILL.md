---
name: run-app
description: Bring a project's app up on this machine and exercise it to see a change working, not only tested — start the servers (checking ports and databases first, without disturbing anything else running), sign in, click through the screens a change touched or smoke-check the API, then clean up. Use when asked to run, start, try, screenshot or demo the app, or when a skill such as /banna-build needs the real stack driven before a change is called done. Works for any stack; it learns how the project runs from the project itself.
---

# Run the app

A green test suite is not "done" for a change someone will look at or call: tests
assert values, and rendering, wiring and configuration fail where assertions are
blindest. This skill gets the real thing running and uses it. It assumes nothing
about the stack: it reads how **this** project runs, and leaves everything it did
not start alone.

## 1. Learn how this project runs

Look, in this order, and use the first that answers:

1. `.claude/launch.json` — named server configurations, with ports.
2. The project's instruction files: `CLAUDE.md` / `AGENTS.md`, the area's `docs/README.md`,
   the root `README.md` — a "run it" section.
3. The manifests: `package.json` scripts, `Makefile`, `docker-compose*.yaml`,
   `manage.py`, `pyproject.toml`, `Cargo.toml`, `go.mod`.

Write down: which processes make up the app (API, web, admin, worker, database), the
command and port of each, which environment files they read, whether a database
needs creating, migrating or seeding, and how a person signs in. If a project
declares several areas (for example `api`, `web`, `admin`), run every one a change
touches or depends on.

If nothing documents it, say so, work it out from the manifests, and offer to add a
`.claude/launch.json` entry once it works.

## 2. Check ports and data before starting anything

```bash
${CLAUDE_SKILL_DIR}/scripts/port-owner.sh 8000 3000   # free, or who holds it
```

- **A port is taken by something you did not start:** it is someone's other project.
  Never kill it and never bind over it (a server on `127.0.0.1:P` shadows one on
  `*:P` for local traffic). Pick another free port and pass it through the project's
  own mechanism: a flag, or a **gitignored** override file (`.env.local`). Keep
  everything that names the port consistent: base URLs, CORS and CSRF origins, proxy
  targets, OAuth callbacks. Say which ports you used.
- **Data:** do not point a seeding or destructive run at the person's real database.
  Use a throwaway one (a temporary SQLite file, or a scratch database you create and
  drop) unless they asked to use their own data. Migrations on their local dev database
  are fine when the app cannot start without them; say so.
- **Environment files:** create a missing one from `.env.example` into the gitignored
  file; never overwrite or print an existing one.

## 3. Start it

Prefer the preview tools with a `.claude/launch.json` entry (create one if missing: a
name, the command, the port). Otherwise start each process in the background with its
output going to a log file in the session scratch directory, never a bare `&` in the
foreground shell. Then wait until it answers:

```bash
${CLAUDE_SKILL_DIR}/scripts/wait-for.sh http://localhost:8010/health 60
```

Check the logs for tracebacks even when the port answers. A dev server that "started"
and a request that works are different things.

Needs a runtime or tool you do not have (a database server, a browser binary)? Say
exactly which, and stop; do not install system software unasked.

## 4. Use it

**Something a person looks at** (a page, a form, an editor): open it in a browser —
the built-in browser for `localhost`, or Playwright when the project already uses it.
Sign in with the project's test or seed accounts (its seed command, fixtures or
example config; a local-dev test account you create is fine, and its password is
recorded in a gitignored file, not repeated in chat). Click through **the screens the
change touched**, the empty, error and success states, and the other languages,
themes and widths the project supports. Take screenshots and read them. Read the
browser console and failed network requests.

**No screen** (an API, a library, a job): drive it with real requests against the live
process: the sign-in handshake the project uses, a happy path through each touched
endpoint, and the refusals (unauthenticated, forbidden, invalid input, not found). A
smoke script in the scratch directory is fine; it is not a test to commit unless asked.

What to look for, because tests miss it: a layout that breaks at one width, numbers or
dates formatted wrongly for a locale, text in the wrong language or direction, a
missing loading or empty state, a request the browser blocks (CORS, cookies, mixed
content), a stale generated client, a migration or seed that was never run.

## 5. Fix, report, clean up

- Fix what the run finds before reporting, each fix as its own change; a finding that
  changes the design is a divergence to raise, not to improvise.
- Report what you ran (processes, ports, accounts by name), what you covered (screens,
  requests, locales) and what you could not run. A skipped check is said plainly, never
  omitted.
- Leave servers running only if the person asked to try the app themselves; then give
  the URLs and how to stop them. Otherwise stop every process you started, drop scratch
  databases, and delete temporary files and uploaded media you created. Never stop or
  remove anything that was already there.
