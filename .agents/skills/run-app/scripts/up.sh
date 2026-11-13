#!/usr/bin/env bash
# Bring up Postgres + Django + Next.js locally, with no Docker. Idempotent.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
RUN=/tmp/roshan-run
PG_BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
PG_PORT=5433
PGDATA="$RUN/pgdata"
mkdir -p "$RUN"

# --- Postgres -------------------------------------------------------------
PG_RUN_AS=""
if [ "$(id -u)" = "0" ]; then PG_RUN_AS="su postgres -s /bin/bash -c"; fi
pg() { if [ -n "$PG_RUN_AS" ]; then $PG_RUN_AS "$*"; else bash -c "$*"; fi; }

if [ ! -d "$PGDATA" ]; then
  mkdir -p "$PGDATA"
  [ -n "$PG_RUN_AS" ] && chown -R postgres:postgres "$RUN" && chmod 755 "$RUN"
  pg "$PG_BIN/initdb -D $PGDATA -A trust -E UTF8 >/dev/null"
fi
if ! "$PG_BIN/pg_isready" -h "$RUN" -p $PG_PORT >/dev/null 2>&1; then
  pg "$PG_BIN/pg_ctl -D $PGDATA -o '-p $PG_PORT -k $RUN' -l $RUN/postgres.log -w start" >/dev/null
fi
PSQL="psql -h $RUN -p $PG_PORT -U postgres -qtA"
$PSQL -c "select 1 from pg_roles where rolname='roshan'" | grep -q 1 \
  || $PSQL -c "create role roshan login superuser password 'roshan'"
$PSQL -c "select 1 from pg_database where datname='roshan'" | grep -q 1 \
  || $PSQL -c "create database roshan owner roshan"

# --- Backend --------------------------------------------------------------
cd "$ROOT/backend"
if [ ! -f .env ]; then
  cat > .env <<ENV
DEBUG=True
SECRET_KEY=local-dev-only
ALLOWED_HOSTS=*
LANGUAGE_CODE=fa
POSTGRES_HOST=localhost
POSTGRES_PORT=$PG_PORT
POSTGRES_DB=roshan
POSTGRES_USER=roshan
POSTGRES_PASSWORD=roshan
REDIS_URL=none
CELERY_TASK_ALWAYS_EAGER=True
ENV
fi
uv run python manage.py migrate --noinput >/dev/null
uv run python manage.py seed_demo

if ! curl -fs localhost:8000/api/health/ >/dev/null 2>&1; then
  nohup uv run python manage.py runserver 0.0.0.0:8000 --nothreading >"$RUN/django.log" 2>&1 &
fi

# --- Frontend -------------------------------------------------------------
cd "$ROOT/frontend"
[ -d node_modules ] || pnpm install --frozen-lockfile
if ! curl -fs -o /dev/null localhost:3000/login 2>/dev/null; then
  nohup pnpm dev >"$RUN/next.log" 2>&1 &
fi

for _ in $(seq 1 60); do
  curl -fs localhost:8000/api/health/ >/dev/null 2>&1 \
    && curl -fs -o /dev/null localhost:3000/login 2>/dev/null && break
  sleep 1
done

cat <<MSG

Roshan Clinic is up.
  Team panel : http://localhost:3000/login   admin 09120000001
  API / docs : http://localhost:8000/api/team/docs/
  Password   : Demo12345
  Logs       : $RUN/{postgres,django,next}.log   Stop: $(dirname "$0")/down.sh
MSG
