#!/usr/bin/env bash
# Stop what up.sh started. The Postgres data directory is kept (re-run up.sh to resume).
RUN=/tmp/roshan-run
PG_BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
pkill -f "manage.py runserver 0.0.0.0:8000" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
if [ -d "$RUN/pgdata" ]; then
  if [ "$(id -u)" = "0" ]; then
    su postgres -s /bin/bash -c "$PG_BIN/pg_ctl -D $RUN/pgdata -m fast stop" 2>/dev/null
  else
    "$PG_BIN/pg_ctl" -D "$RUN/pgdata" -m fast stop 2>/dev/null
  fi
fi
echo "stopped"
