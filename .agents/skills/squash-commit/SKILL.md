---
name: squash-commit
description: Collapse a run of small commits (per-task commits, red test commits, fix-ups) into one Conventional Commit per feature without changing the final tree, with a proof that the tree is identical. Use when asked to squash commits, clean up a branch before review, or when another skill (e.g. /banna-build) says to squash its run with /squash-commit.
argument-hint: [base commit or ref to squash back onto; empty = the merge base with the default branch]
allowed-tools: Bash(git:*), Read
---

# Squash commit

Turn many small commits into one commit per feature, so the branch reads the way a reviewer
reads it. It changes history only, never the tree, and it leaves **no backup branch** behind:
the original tip is printed and stays in the reflog.

Base: $ARGUMENTS
(If empty, use `git merge-base HEAD <default branch>`. If a caller gave a base commit, use
that one.)

## 1. Look

```bash
git status --porcelain                       # must be empty; if not, stop and ask
git log --oneline --reverse <base>..HEAD
```

If the branch is already pushed, note it now: this rewrites history, so ask for an explicit
go-ahead first, and never force-push on your own.

## 2. Group first

Group commits by **feature** — the unit a reviewer reads — with that feature's tests inside it.
A caller's plan phases are the default grouping when each phase is a feature; where phases
are layers of one feature (its model, its API, its screen), group across them by feature.
Each red test commit folds into the group whose implementation turns it green. Groups must
be **contiguous** ranges of the history. If a sensible grouping isn't contiguous, leave the
history as it is and say why — do not reorder commits to force it.

A group's **tip** is its last commit in oldest-first order.

## 3. Show the human the grouping, then rewrite

Show which commits collapse into which subject, and wait for a yes. Each subject follows the
`commit` skill's rules (`<type>(<scope>): <description>`, usually `feat(<scope>): …`) and names
the feature; add a body listing what it absorbed only when the feature spanned many tasks.
No AI attribution.

`git rebase -i` is unavailable in this environment and `git merge --squash` hands you add/add
conflicts after the first group. Use the script, which **replays trees, not merges** — each
new commit takes its group tip's tree wholesale and is parented on the previous new commit:

```bash
${CLAUDE_SKILL_DIR}/scripts/squash.sh <base> <groups-file>
```

`<groups-file>` lists the groups oldest first. Each group is its tip sha on the first line,
then the commit message, then a line holding only `---`:

```
<tip sha of group 1>
feat(catalog): add the two-level category rule

Absorbs the model, the API and the screen.
---
<tip sha of group 2>
fix(catalog): reject empty category names
---
```

Write the file outside the repository (a temp file), so the tree stays clean. The last group's
tip must be the current HEAD.

## 4. Proof

The script ends by running `git diff <original tip>`; it must print nothing. **If the tree
changed, the script restores the original tip itself and exits 1** — report it and do not try
to patch the difference by hand. On success it prints the new log and the original tip sha.
Recovery, if the human wants the old history back: `git reset --hard <original tip sha>`
(it stays in the reflog).

## 5. After

- **Downstream branches.** A branch built on the tip you just rewrote now points at abandoned
  commits; merging it would drag the pre-squash history back in. Rebase it onto the new tip:
  `git rebase --onto <new tip> <original tip sha> <that branch>`, then verify its tree is
  unchanged.
- A caller that recorded commit shas (for example the frozen-tests lines in a plan's Execution
  log) must update them to the squashed commits' shas.
- Do not push unless asked.
