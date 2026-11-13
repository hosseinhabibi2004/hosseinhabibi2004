---
name: banna-build
description: Execute an approved plan from .banna/plans test-first — failing tests committed, approved and frozen before the code — walking its task checklist one Conventional Commit at a time (via /commit) on the model each task names, squashing the run into one commit per feature, writing the docs the plan promised, and driving the real stack with /run-app before calling it done.
when_to_use: Invoke directly with /banna-build after a plan from /banna-draft has been set to status approved.
argument-hint: [path to plan, or empty for the latest approved one]
tags: [workflow, artifacts]
category: Workflow
allowed-tools: "*"
---

You are executing an approved implementation plan — the **execution half** of the compact
two-step workflow. The plan is the single source of truth: its section 3 task checklist is
your work queue: walk it one task at a time, flipping `- [ ]` to `- [x]` the moment each lands.

The run is **test-first, frozen and committed as you go**: tests land red before the code that
turns them green, the human approves them, and from then on they are **frozen** — failing
tests are fixed by changing the code, never the tests. Every task is its own small commit
written with `/commit` in Conventional Commits form, and the whole run collapses at the
end into one commit per feature. The change then leaves its durable docs behind, next to the
code they describe. Nothing is done until `/run-app` has driven the real stack (step 9).

Plan target: $ARGUMENTS
(If empty, use the most recently modified file in `.banna/plans/` whose frontmatter
`status` is `approved` — not the `archive/` folders. If none is approved, list the available
drafts and stop.)

**Config.** Before step 1, Read `.banna/config.yaml`: paths, areas and their docs, the model
catalog, which models each stage may use per difficulty, the test commands and the freeze
rules. If it is missing or does not parse, stop and say so — never invent defaults.

**1. Load and gate.**
Read the plan. Check frontmatter `status`:

- If `done` → already executed. Report it and stop (offer to archive if not archived).
- If NOT `approved` → **blocked**. Do not implement. Show the plan summary + its task list
  and ask the human to review and set `status: approved` first. The approval gate is the
  entire point of this workflow — never bypass it on your own initiative, even if the plan
  looks obviously fine.

Then check frontmatter `handoffs:`. If non-empty, Read each listed handoff file (in
`.banna/handoffs/`, or its `archive/` folders) and check its `status`: every one this plan
depends on must be `done`. For any that is `open` or `planned`, the status may simply be
stale (the human forgot to flip it) — verify against ground truth before blocking:

- If the handoff's `plan:` field is set, Read that target plan: its frontmatter
  `status: done` means the work landed — update the handoff to `status: done` yourself,
  note the repair in the Execution log, and treat it as satisfied.
- Otherwise ask the human directly: "handoff `<slug>` is marked `<status>` — has the
  `<target>` side actually been executed?" If they confirm it's done, flip the handoff to
  `done` (log the confirmation) and proceed. If not done — **blocked**: tell the human to
  open a session in the target repo, run `/banna-draft` from the handoff, approve and
  `/banna-build` it, then come back. Proceed past a genuinely unfinished handoff only if
  the human explicitly says the dependency is not actually blocking (record that override
  in the Execution log).

**2. Load the skills the plan named + the docs of the areas it touches.**
Read section 6 ("Skills Needed") and the `skills:` frontmatter list. As you reach each task
in section 3, load its required skills (or load only once if a skill covers multiple tasks).
Lazy loading keeps context lean. If a listed skill does not exist, note it and continue.
Also read, for each area the plan touches (`areas:` in the config), that area's `CLAUDE.md`
index and `CONTEXT.md` (or `CONTEXT-MAP.md` → the relevant per-context glossary) if present,
and use its canonical terms in code, identifiers, and comments. If implementation forces a
new domain term or changes an existing one, update that area's `CONTEXT.md` inline (glossary
only, no implementation detail) — same as the plan phase did.

**3. Restate, and pin the base commit.**
Briefly confirm what you are about to do, the task count (N tasks), and the acceptance
criteria you will be held to. Show the human each task's `Difficulty` and `Model` from §3 in
one short table. Each model must be in `catalog` and in `selection.available`; if one is
not, say so and let the human pick before you go on. Then compare the model you are running
as (your system prompt names it) with the strongest model the plan needs
(`execution_model` / `execution_effort` frontmatter). The session only coordinates and runs
tasks whose model equals its own inline, so a weaker session is a problem only when
`selection.enforcement` is `stop`: then stop, tell the human to switch with `/model`, and
wait. With `warn`, say so and continue.

Then set up the git ground you will build on:

- `git status --porcelain` must be **empty**. If it isn't, stop and ask the human whether
  to commit or stash the pending work first — the per-task commits below must not sweep up
  changes this plan didn't make.
- Record the base: `git rev-parse HEAD`. Write it into the plan's Execution log
  (`Base commit: <sha>`). Every commit this run creates sits on top of it, and step 10
  squashes back down onto it.
- **Commit convention: Conventional Commits, written by `/commit`.** Invoke the
  `commit` skill once here and keep its rules loaded for the whole run — every commit
  below (red tests, per-task, fixes, squashed subjects, close-out) is
  `<type>(<scope>): <subject>` per https://www.conventionalcommits.org/en/v1.0.0/.
  `git log --oneline -20` is still worth reading for scope names, but do not copy a
  missing `type:` prefix.
  One caveat on `/commit`'s default behavior: it stages the whole dirty tree grouped by
  concern. Here the grouping is already decided — one task, one commit — so use its message
  rules and its no-confirmation flow, but keep this skill's staging discipline (`git add`
  only that task's files).
- If the branch is already pushed, note it now: step 10 rewrites history and will need the
  human's go-ahead.

**4. Tests first (the red commit), then freeze.**
Before implementing, write the tests. Source them from section 4 ("Definition of done") —
each criterion names its test, layer and what it asserts — plus any section 3 task that
names test files. Run this on the model `stages.tests` gives for the difficulty of the code
the tests cover. Order them as `tests.order` in the config says (contract → integration →
e2e → unit).

- **Scope per group.** If section 3 is split into phases, write that group's tests
  immediately before that group's tasks, not all of the plan's tests up front — a red suite
  for code six phases away is dead weight. Small single-group plans: one test commit up front.
- **They must fail for the right reason.** Run them (with the area's `tests.commands`) and
  show the failure. A missing module or a collection error while the code doesn't exist yet
  counts as red — say so. A typo in the test file does not; fix that before committing.
- **Commit them alone**, no implementation in the same commit: e.g.
  `test(catalog): add failing tests for the two-level category rule`. Do not tick any
  section 3 checkbox for a test commit — tests are not the task.
- **Every area.** Each area with tests (for example `api`, `web`, `admin`) gets its own red
  commit, run with that area's runner from that area's directory.
- **No test setup for the touched area?** Do not invent a framework mid-plan. Say so
  explicitly, skip the red commit and the freeze for that group, and fall back to step 8's
  other verification. If the plan's section 4 named tests that the project can't run, that is
  divergence — step 6.

**Freeze gate (the human approves the tests).** After a group's red commit, show the human
the test files and what each asserts, and **wait for approval**. Never start that group's
code before it. On approval, freeze them: write into the Execution log
`Frozen tests: <paths> @ <red commit sha>` (the group, its paths, its sha). From that
moment, every commit and the close-out must pass

```bash
${CLAUDE_SKILL_DIR}/scripts/check-frozen.sh <red-sha> <frozen paths...>
```

and a non-zero exit blocks the commit. Frozen means: no edits to those test files, their
fixtures, snapshots or mocks; no `skip`, `xfail`, `only` or snapshot updates (`tests.forbid_in_frozen`);
no loosened thresholds or timeouts. A test amendment is possible only through step 6.
If `tests.freeze` is `false` in the config, skip this gate and the check.

**5. Walk the task checklist (apply loop).**
Work section 3's tasks top-to-bottom. For each task:

- Announce it: `Working on task K/N: <task> (<Model>)`.
- Run it on the task's `Model` (resolved in the plan from `stages.implement`): dispatch a
  subagent with that `model` set explicitly and a self-contained prompt — the task's text and
  file list, the area's build/lint/test command, the frozen-tests rule, and the commit rule
  below. If the task's model equals the running session's model, do it inline. Never leave
  the model to be inherited.
- Make the code changes that task describes — minimal and scoped, no opportunistic refactors.
- Run the relevant build / lint / test for the area you touched. Name which of the red tests
  this task turned green.
- **A failing test means the code is wrong.** Fix the code until the test passes. Do not touch
  the frozen tests to get green.
- **Same failure twice.** When a task's gate fails twice on the same error, make no third
  attempt on your own. Get the root cause first from a read-only reviewer subagent on the
  `stages.root_cause` model. If `selection.escalate_on_failure` is true and the cause is a
  matter of difficulty, rerun the task one tier up (the next catalog model with a higher
  `tier`, within `max_tier`) and log the escalation. If the cause says the test or the plan
  is wrong, that is divergence — step 6.
- The instant it lands, flip its checkbox in the plan file `- [ ]` → `- [x]`.
- Run `check-frozen.sh`, then **commit that task alone.** `git add` only the files this task
  touched, plus the plan file — never `git add -A`/`git add .`, which would sweep in unrelated
  working-tree noise. One Conventional Commits subject per `/commit` (`feat:`, `fix:`,
  `refactor:`, `test:`, `docs:`, `chore:` … with the area as scope); a body only when the
  "why" isn't obvious from the diff. Never amend or fold into an earlier task's commit: one
  task, one commit, however small. Step 10 is what collapses them.
- Print `✓ Task complete` and move on.

Keep going until every task is `- [x]` or you hit a blocker. After each task show running
progress `K/N tasks complete`.

**Parallelizing independent tasks.** Before walking a phase, scan its remaining tasks for
ones that are genuinely independent — disjoint `Files:` lists, no shared type/schema either
depends on, and no ordering note in the plan (a "Depends on…" line, or a barrier task like
"regenerate the SDK before Phase B starts") standing between them. Only that subset is a
candidate; when in doubt, keep it serial — a wrong parallel guess costs a merge conflict, a
right serial guess costs a few minutes.

For a candidate batch, dispatch each task to its own Agent call with `isolation: "worktree"`
and that task's `model` — never run two tasks against the shared working tree at once, since
simultaneous `git add`/`git commit` from two tasks race on the same index. Send all the
batch's Agent calls in one message so they run in parallel, not one after another. Each
task's prompt is self-contained: the task's own text and file list, the area's
build/lint/test command, and the commit rule (stage only that task's files, one Conventional
Commits subject via `/commit`'s rules, **do not touch the plan file** or any frozen
test — the main thread owns checklist bookkeeping). Tell each agent to stop and report rather
than improvise if it hits a blocker, same as step 6.

When a batch finishes, merge its worktrees back in the checklist's original order — not
completion order — so the history reads the way a reviewer expects: for each task in turn,
cherry-pick (or fetch and fast-forward) its worktree commit onto the branch, run that area's
test/lint and `check-frozen.sh`, flip the checkbox, and let the existing per-task commit
stand (do not re-commit it). If two tasks' worktrees touched overlapping files despite the
disjointness check, that surfaces here as a cherry-pick conflict — resolve it as divergence
(step 6) rather than guessing at a merge. Discard a task's worktree once its commit has
landed on the branch.

Everything else about the loop is unchanged: divergence still pauses (step 6), a task still
gets exactly one commit, and a test-writing task (step 4) still lands before the task that
turns it green — so a red-test task and the implementation task that depends on it are never
in the same parallel batch.

**Cross-repo tasks.** First check the workspace's cross-repo policy in the loaded
context (`CLAUDE.md` / `.claude/CLAUDE.md`). Under **handoff-only**, a sibling-repo need
is never edited from here: write the handoff file the task describes (or, on unplanned
discovery, treat it as divergence per step 6 and propose a handoff), then continue with
the tasks that don't depend on it. Under **inline** policy, a task carrying a `Repo:`
sub-bullet pointing outside the cwd repo: first Read that repo's convention skill(s) at
the absolute path §6 gives, then edit via absolute paths, run that repo's
build/lint/test from inside its directory (`cd` in Bash), and treat it as a separate git
repository — never mix its changes into this repo's commits, and squash (step 10) only
this repo's history. If the task turns out to need that repo's own MCP servers, hooks, or
grows past what the plan describes, that is divergence: stop per step 6 and propose moving
it to its own plan in that repo.

**6. Handle divergence (pause, don't improvise).**
If reality contradicts the plan — a file isn't where it said, an assumption was wrong, a
task won't work, or a frozen test looks wrong — STOP. Do not invent a different design.
Record it in the plan's "Execution log", then pause with a clear options block:

```
## Execution Paused

**Plan:** <id>
**Progress:** K/N tasks complete

### Issue
<what contradicts the plan>

**Options:**
1. <option>
2. <option>
3. Other approach

How do you want to proceed?
```

Trivial mechanical fixes (a renamed import) are fine to do inline; anything that changes
the design is not. Leave the commits made so far in place — never reset away completed
work to "clean up" before asking.

**Test amendment.** A frozen test changes only when the human says so explicitly, for a
reason you state: the test contradicts the plan, or asserts something wrong. Then: make the
change in its own commit (`test(amend): <what and why>`), record the reason in the Execution
log, and re-freeze — write a new `Frozen tests: <paths> @ <new sha>` line. The code never
bends the tests; the tests move only by this route.

**7. Record (the docs the change leaves behind).**
Write the docs the plan's §7 and `record:` frontmatter promised, each in the `docs` of the
area whose code it describes (`areas:` and `knowledge:` in the config); only a rule that
spans services goes in the root `docs`. Numbers and rule IDs are per area. Run this on the
`stages.record` model.

- **ADR** (`adr: required`): read the format and rules in
  `${CLAUDE_SKILL_DIR}/../banna-draft/ADR.md` first (or the area's `adr/_TEMPLATE.md` if the
  banna-draft skill is not installed), then create `<area docs>/adr/NNNN-<slug>.md` — get the
  number by listing that `adr/` directory and taking the next free one, never by guessing
  from memory. The plan's section 7 is invariant bullets. Carry them across as invariant
  bullets: the rule, the wrong code it prevents, where it is enforced. **Do not expand them
  into prose, and do not add Context / Alternatives / Consequences sections** — the format
  has none, and narrative is exactly what makes an ADR stale and unread. Keep it under 45
  lines. **Verify every `file:line` you write by reading the file**, and add nothing the plan
  does not support. Set `Status: accepted` with today's date. Write the chosen number back
  into the plan's frontmatter (`adr: NNNN`).
- **Convention / Context / Stack**: add or correct the one rule, term or fact the plan named,
  in place, keeping the existing ID or heading. Do not create a second copy of anything.
- **Index**: add each new doc's one-clause summary to that area's `CLAUDE.md` index (the
  `knowledge.index` file), so the rule is in context whenever someone works in that area.
- If a rule you just wrote has no test, say so and offer to add one. That test is new — it
  does not touch the frozen ones.

The plan is throwaway; these files are the part that outlives it. They are committed with the
close-out in step 11.

**8. Verify against "done".**
Run every acceptance check in section 4 and report pass/fail for each. Discover the
project's verification commands from its manifest/config (e.g. `package.json` scripts,
`Makefile`, `pyproject.toml`, `cargo`, `go test`, `dotnet test`) or from `tests.commands`
rather than assuming a stack. **Run the full suite for the touched area** — the tests written
in step 4 must now be green — plus any type-check and lint the project defines, then
`check-frozen.sh` once more. **If no test suite exists**, fall back to other
verification — type-check, lint, build, a runnable smoke check, or the manual/visual checks
named in section 4 — and say which you used and why. For criteria not automatable (visual
UI, behavior), report as manual check needed. If something fails, fix it (as its own commit,
and in the code, not the frozen tests); if the fix is genuinely out of scope, log it and flag
it loudly rather than marking the plan done.

Do not squash while anything is red.

**9. Run the app (`/run-app`) — the gate, not a nicety.**
A green suite is not "done": a change that alters something a person looks at has to be
driven by hand before it is reported. So after step 8 passes, invoke the `run-app` skill
(or the project's own way of running the app if it has none): bring the stack up, sign in,
click through **the screens this plan touched**, and look at the screenshots. Rendering is
where assertions are blindest — broken layout, wrong number or date formatting, missing
states, untranslated labels.

- Fix what the run finds **before** squashing, each fix as its own commit (`fix(...): …`).
  A defect found here is not divergence — it is the point of the step.
- If the run turns up something that changes the design rather than a rendering bug, that is
  divergence: step 6.
- Record what the run covered (which screens, which flows) in the Execution log.
- Backend-only or library-only plans with no screen: say so explicitly and use `/run-app`'s
  non-UI fallback (a runnable smoke check against the live stack). "No UI to look at" is a
  reason to smoke-check, not a reason to skip.
- If the stack genuinely cannot come up, that is a **skipped check** — say so plainly in the
  report and in the Execution log. Never silently omit it.

**10. Squash the run into one commit per feature.**
The run left one commit per task plus the red test commits. Collapse them with the
`squash-commit` skill (`/squash-commit <base commit recorded in step 3>`), so the branch
carries one commit per feature — the unit a reviewer actually reads — with that feature's
tests inside it. Hand it the grouping: section 3's phase headings are the default when each
phase is a feature; where phases are layers of one feature, group across them. Each red test
commit folds into the group whose implementation turns it green. It shows the human the
grouping before rewriting, asks for a go-ahead if the branch was already pushed, proves the
tree is unchanged, and keeps **no backup branch**.

Squashing rewrites the frozen tests' commit, so afterwards re-run `check-frozen.sh` against
the new sha of each red group's squashed commit and update the `Frozen tests:` lines in the
Execution log. Do not squash while anything is red.

**11. Close out and archive.**
Append to the plan's "Execution log": base commit, files changed, per-task and verify
results, the models each task ran on and any escalation, the frozen-test lines and any test
amendment, what the step 9 `/run-app` pass covered and what it found, any divergences and
how they were resolved, the docs written (ADR number, convention IDs), and the final squashed
commits (sha + subject). Set frontmatter `status: done`. If the plan has `from_handoff:`,
also set that handoff file's `status: done` and tick its Acceptance boxes that your
verification covered — this is what unblocks the origin repo's plan. (The handoff lives in
the origin repo's `.banna/handoffs/`; this status flip is a sanctioned write outside the
cwd repo even under a handoff-only policy.)

**Archive.** When `archive.auto_on_close` is true, `git mv` the plan to
`.banna/plans/archive/<yyyy-mm>/` (keep its file name — the id never changes). Do the same
for the `from_handoff` file when `archive.handoff_on_done` is `archive` (or `git rm` it when
`delete`) and fix any path that points at the old location (`plan:`, `from_handoff:`,
`handoffs:`). Handoffs in another repo are left to that repo.

Commit the close-out last, on top of the squashed commits: the plan file, the docs from step
7, and any `CONTEXT.md` update, as one commit (`docs(banna): close out plan <id>`). Then
write a PR-ready summary: what changed, why, how it was verified (tests **and** the
`/run-app` pass), the resulting commit list, and any follow-ups.

Do not push or open a PR unless explicitly asked.
