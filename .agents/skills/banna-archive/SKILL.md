---
name: banna-archive
description: Sweep finished plans and handoffs out of .banna/plans and .banna/handoffs into their archive/<yyyy-mm>/ folders so the active folders only hold live work. Moves with git mv, keeps file names and ids, and fixes the paths that pointed at the old location. Never deletes, never touches a plan that is not done.
when_to_use: Run manually with /banna-archive when .banna/plans or .banna/handoffs has grown noisy, or after a batch of plans closed without auto-archive.
argument-hint: [optional: a plan id or handoff path to archive, or empty to sweep everything finished]
category: Workflow
tags: [workflow, artifacts]
allowed-tools: Read, Grep, Glob, Bash(git mv:*), Bash(git status:*), Bash(git log:*), Bash(ls:*), Bash(find:*), Bash(mkdir:*), Bash(date:*), Edit, Write
---

You are tidying `.banna/`. You move finished work into `archive/`; you never delete and
you never change what a file says except the paths inside it that the move invalidates.

Target: $ARGUMENTS
(If empty, sweep both folders.)

**Config.** Read `.banna/config.yaml` first: `paths.plans`, `paths.handoffs`, `paths.archive`
(`archive/{yyyy}-{mm}`) and `archive.keep_active_days`. If it is missing or does not parse,
stop and say so.

**1. Find what is finished.**

- **Plans** in `paths.plans` (not in `archive/`): frontmatter `status: done`. A `draft` or
  `approved` plan is live work — leave it, even if it is old, and list it as "stale?" if it is
  older than `archive.keep_active_days` so the human can decide.
- **Handoffs** in `paths.handoffs` (not in `archive/`): frontmatter `status: done`. `open` and
  `planned` stay.
- Only move a finished file when it is older than `archive.keep_active_days` days, unless the
  target names it explicitly. "Age" is the date in its file name.

**2. Show the list, then move.**
Print what will move and where (`<file>` → `archive/<yyyy-mm>/`, month from the date in the
file name), and wait for a yes unless the target named the file. Then, per file:
`mkdir -p` the archive folder and `git mv` the file, keeping its name — the id never changes.

**3. Fix the references.**
Grep `.banna/`, the docs and the code for the old path of each moved file and update it: a
plan's `handoffs:` and `from_handoff:`, a handoff's `plan:` and `origin_plan:`. Do not rewrite
anything else. Report each reference you changed, and any you found outside this repo that
you could not change.

**4. Report.**
Counts moved per folder, what stayed and why (live, too recent), and the stale drafts. Do not
commit unless asked; if asked, one commit: `chore(banna): archive finished plans and handoffs`.
