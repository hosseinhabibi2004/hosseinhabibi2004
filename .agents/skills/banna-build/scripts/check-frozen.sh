#!/usr/bin/env bash
# Usage: check-frozen.sh <red-sha> <frozen-path>...
# Exit 0 when none of the frozen test paths differ from <red-sha>, in the commits or in the
# working tree. Exit 1 (and say what changed) otherwise.
set -euo pipefail
[ "$#" -ge 2 ] || { echo "usage: $0 <red-sha> <frozen-path>..." >&2; exit 2; }
sha=$1; shift
changed=$(git diff --name-status "$sha" -- "$@"; git status --porcelain -- "$@")
if [ -z "$changed" ]; then
  echo "frozen tests unchanged since $sha"
else
  echo "FROZEN TESTS CHANGED since $sha:" >&2
  echo "$changed" >&2
  exit 1
fi
