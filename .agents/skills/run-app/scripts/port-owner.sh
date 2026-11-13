#!/usr/bin/env bash
# Usage: port-owner.sh <port>...
# For each port: prints "free" or the process that is listening on it (pid,
# command, working directory), so you can tell your own server from someone
# else's before you start one. Exit 0 if every port is free, 1 otherwise.
# It never kills anything.
status=0
for port in "$@"; do
  pids=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null | sort -u)
  if [ -z "$pids" ]; then
    echo "$port: free"
    continue
  fi
  status=1
  for pid in $pids; do
    cmd=$(ps -p "$pid" -o command= 2>/dev/null | cut -c1-120)
    cwd=$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')
    echo "$port: in use by pid $pid  $cmd  (cwd: ${cwd:-unknown})"
  done
done
exit $status
