#!/usr/bin/env bash
# Usage: wait-for.sh <url> [timeout-seconds]
# Polls <url> until it answers with any HTTP status (the server is up), or fails
# after the timeout (default 60). Prints the status it got.
set -u
url=${1:?usage: wait-for.sh <url> [timeout-seconds]}
timeout=${2:-60}
end=$((SECONDS + timeout))
while [ "$SECONDS" -lt "$end" ]; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 -L "$url" 2>/dev/null || true)
  if [ -n "$code" ] && [ "$code" != "000" ]; then
    echo "up: $url answered $code"
    exit 0
  fi
  sleep 1
done
echo "timeout: $url did not answer within ${timeout}s" >&2
exit 1
