---
name: commit
description: Commit the working tree without asking — group the dirty files by concern and write one Conventional Commits message per group (types, scopes, breaking changes, body, footer per the qoomon convention). Use when asked to commit, "commit this", "auto-commit", when drafting or reviewing a commit message, when the user mentions commits or conventional commits, or when another skill (e.g. /banna-build) says to write a commit with /commit.
---

# Commit

Commit what is on disk, now, with no confirmation round-trip. The human asked
for a commit; asking "shall I commit?" back is noise. Stop only for the hazards
in §5. Messages follow the qoomon conventional commits convention (compatible
with [conventionalcommits.org](https://www.conventionalcommits.org/)). Do not
invent types or formatting rules outside this skill.

## 1. Look before staging

```bash
git status --porcelain
git diff --stat
git diff --cached --stat
git log --oneline -20
```

Read `git log` for **scope names** already in use and reuse them. If older
history has no `type:` prefix, never copy that.

## 2. Group by concern

One commit per logical change, not one per file and not one for everything.
Split the dirty tree into groups a reviewer would read on their own:

- a feature or fix together with its own tests → one group
- an unrelated doc edit, a config tweak, a lockfile bump → each its own group
- a generated artefact (SDK regen, migration) goes with the change that caused it

Stage each group by explicit path (`git add <paths>`). **Never `git add -A` or
`git add .`**: they sweep in scratch files and another session's work.

**When a caller has already decided the grouping** (e.g. `/banna-build`: one
task, one commit), keep that grouping. Stage only the files it names and use
only this skill's message rules.

## 3. Message structure

```
<type>(<optional scope>): <description>

<optional body>

<optional footer>
```

**Special cases** — use as-is; do not conventionalize merge/revert messages:

| Case           | Format                                    |
| -------------- | ----------------------------------------- |
| Initial commit | `chore: init`                             |
| Merge          | `Merge branch '<branch name>'`            |
| Revert         | `Revert "<reverted commit subject line>"` |

### Types

Pick exactly one:

| Type       | Use when                                           |
| ---------- | -------------------------------------------------- |
| `feat`     | Add, adjust, or remove an API or UI feature        |
| `fix`      | Fix a bug in a prior `feat`                        |
| `refactor` | Restructure code without changing API/UI behavior  |
| `perf`     | Improve performance (special case of refactor)     |
| `style`    | Formatting or whitespace only — no behavior change |
| `test`     | Add or correct tests (including a red test commit) |
| `docs`     | Documentation only: docs, ADRs, plans, glossary    |
| `build`    | Build tools, dependencies, project version         |
| `ops`      | IaC, CI/CD, deployment, monitoring, backups        |
| `chore`    | Misc maintenance (`.gitignore`, init, tooling, skills) |

### Scope

Optional. Use project-specific context (module, area, component, `deploy`,
`banna`, `skills`). Leave it out rather than invent a vague one. **Do not** use
issue identifiers as scopes.

### Subject

- Mandatory.
- Imperative present tense — think "This commit will…" (`add`, not `added`).
- Lowercase first letter, no trailing period, about 72 characters at most.
- Breaking change: `!` before `:` — e.g. `feat(api)!: remove status endpoint`.

### Body

Optional. Only when the *why* isn't obvious from the diff. Explain the reason
and contrast with previous behavior, not a list of files. Imperative present
tense, wrapped at about 72 columns.

### Footer

Optional unless the commit is breaking.

- Issue refs: `Closes #123`, `Fixes JIRA-456`
- Breaking changes **must** start with `BREAKING CHANGE:`
  - One line: space after the colon
  - Multi-line: blank line after `BREAKING CHANGE:`

If the subject with `!` is not informative enough, describe the break in the
footer. Use it for public API contract changes and renamed routes.

### No AI attribution, ever

No `Co-Authored-By` trailer for an AI, no "Generated with …", and no model or
vendor name in the subject, body or trailers. Branch names get the same rule:
`feature/…`, `fix/…`, never tool-branded names.

## 4. Commit command

Always pass the message through a heredoc so the formatting survives:

```bash
git commit -q -F - <<'MSG'
feat(seo): add Redirect model and slug-change service

Every public slug change writes a Redirect so old links keep working.
MSG
```

Examples:

```
feat: add email notifications on new direct messages
fix(shopping-cart): prevent ordering an empty shopping cart
perf: decrease memory footprint for unique visitors using HyperLogLog
build: update dependencies
refactor: implement fibonacci calculation as recursion
```

```
feat!: remove ticket list endpoint

refers to JIRA-1337

BREAKING CHANGE: ticket endpoints no longer support listing all entities.
```

When inferring semver from commits: breaking → **major**; `feat` or `fix` →
**minor**; everything else → **patch**.

## 5. Hazards: stop and ask instead

- Something that looks like a secret is staged (`.env`, keys, tokens).
- The tree holds changes you didn't make and can't place in a group.
- The current branch is `main`/`develop`: branch first (`feature/<slug>`).
- A hook fails. Fix the cause and make a **new** commit. Never `--no-verify`,
  and never `--amend` a commit that already exists.

## 6. Report

After committing, print `git log --oneline -<n>` for the commits just made.
Do not push unless asked.
