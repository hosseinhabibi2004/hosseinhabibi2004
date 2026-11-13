#!/usr/bin/env bash
# Usage: squash.sh <base> <groups-file>
#
# Collapses <base>..HEAD into one commit per group, without changing the final tree.
# <groups-file> lists the groups oldest first. Each group is its tip commit on the first
# line, then the commit message, then a line holding only ---:
#
#   <tip sha of group 1>
#   feat(catalog): add the two-level category rule
#
#   body, optional
#   ---
#   <tip sha of group 2>
#   fix(catalog): ...
#
# It replays trees, not merges: each new commit takes its group tip's tree wholesale and is
# parented on the previous new commit. No backup branch is created: the original tip is printed
# and stays in the reflog (git reset --hard <sha>). If the final tree differs from the original,
# it restores the original itself and exits 1.
set -euo pipefail
[ "$#" -eq 2 ] || { echo "usage: $0 <base> <groups-file>" >&2; exit 2; }
base=$1; file=$2
[ -z "$(git status --porcelain)" ] || { echo "working tree is not clean" >&2; exit 1; }
orig=$(git rev-parse HEAD)

c=$(git rev-parse "$base")
tip=""; msg=""
flush() {
  [ -n "$tip" ] || return 0
  git reset --hard -q "$tip"          # take the group tip's tree exactly
  git reset --soft "$c"               # ...but re-parent it onto the new history
  printf '%s' "$msg" | git commit -q -F -
  c=$(git rev-parse HEAD)
  tip=""; msg=""
}
while IFS= read -r line || [ -n "$line" ]; do
  if [ "$line" = "---" ]; then flush; continue; fi
  if [ -z "$tip" ]; then tip=$line; msg=""; else msg+="$line"$'\n'; fi
done < "$file"
flush

if ! git diff --quiet "$orig"; then
  echo "TREE CHANGED by the squash; restoring $orig" >&2
  git reset --hard -q "$orig"
  exit 1
fi
git log --oneline "$base"..HEAD
echo "ok: tree unchanged. original tip was $orig (recover with: git reset --hard $orig)"
