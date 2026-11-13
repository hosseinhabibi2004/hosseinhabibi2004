---
name: banna-draft
description: Build a reviewed, execution-ready plan (no code) for a change, on the models .banna/config.yaml assigns to the plan stage. Invoked with /banna-draft by the user, or by the agent itself when a task needs a plan; writes one self-contained artifact under .banna/plans/ and delegates a cold review to a subagent running the banna-review skill.
when_to_use: Invoke directly with /banna-draft <goal> before starting any non-trivial change. Pairs with /banna-build.
category: Workflow
tags: [workflow, artifacts]
argument-hint: [what you want to build or change]
allowed-tools: Read, Grep, Glob, Write, Task, Skill, Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(git branch:*), Bash(ls:*), Bash(find:*), Bash(echo:*), Bash(date:*)
---

You are producing an implementation **plan only**. You must not modify, create, or
delete any source file. The only files you may write are the plan itself under
`.banna/plans/` and, in multi-repo workspaces, handoff files under this repo's
`.banna/handoffs/` (see phase 2 — handoffs are planning artifacts that live next to
the plan that generated them). You deliberately have no Edit tool — if you feel the
urge to change code, that is a signal to write it into the plan instead.

This is the **planning half** of a compact two-step workflow (`/banna-draft` then
`/banna-build`). The plan you write is the single source of truth — one self-contained
artifact, no separate spec files. Its task list is what `/banna-build` walks; its ADR
section carries any invariant the change creates that an agent could not otherwise infer.
Make both execution-ready.

The plan has two readers, in priority order: a **human** who must approve it by skimming
(tables, diagrams, short bullets), and the **executor model** that follows it (concrete
paths, ordered tasks). When detail would serve only the executor, keep it to one tight
sub-bullet; when it would serve neither — code transcription, restated context — leave
it out. The executor has the codebase; the plan only needs to carry the decisions.

The plan template lives next to this skill at `${CLAUDE_SKILL_DIR}/PLAN.md` — read it
before you start writing the plan so the artifact matches the section order exactly. The
glossary format lives at `${CLAUDE_SKILL_DIR}/CONTEXT-FORMAT.md` — read it before phase 3.

This workflow keeps **durable docs** alongside the ephemeral plan, each next to the code of
the area it describes (`areas:` in `.banna/config.yaml`): `CONTEXT.md` (the project's
ubiquitous-language glossary, maintained inline during the grill phase), `adr/` (invariants
an agent would otherwise break — not a decision log), `conventions/` (ID'd rules) and
`stack.md` (language, tooling, environment facts). The plan itself is throwaway
(draft → done → archive); the docs outlive it. `/banna-build` writes them in its Record step.

**Config.** Before phase 1, Read `.banna/config.yaml`. It sets the plan paths, the areas and
where each area keeps its docs, the model catalog, and which models each stage may use per
task difficulty. If it is missing or does not parse, stop and say so — never invent defaults.

## Repository context (injected)

Recent history — orientation only (conventions, in-flight direction). This is NOT the plan's
scope; ignore it if unrelated to the goal.

- Recent commits: !`git log --oneline -5 2>/dev/null || echo "(no git history — not a repo, or no commits yet)"`
- Today's date: !`date +%F`

Goal from the requester: $ARGUMENTS

Work through these phases in order. Do not skip ahead, and do not start writing the
plan file until phase 10.

**1. Understand the request.**
Restate the goal in your own words. Define scope explicitly: what is in scope and
what is out of scope. If the request is ambiguous in a way that would change the
implementation, STOP and ask before continuing — do not guess past a fork that
matters.

**2. Investigate the real codebase + domain.**
Use Glob / Grep / Read to find the files, modules, and patterns this change touches.
Reference concrete paths, not assumptions. Identify the existing conventions you must
follow (naming, structure, error handling, test style). If you expected something and
can't find it, say so rather than inventing it.
**The plan has no findings section.** Investigation is how you earn the plan's content,
not content itself — a table of everything you read is noise the reviewer must wade
through. Each fact you keep goes where it does work: a `path:line` in the task that acts
on it (§3), an entry in §2 if it is an assumption or an open question, a row in §5 if it
is a risk. A fact that lands in none of those was not worth recording.
Also read the domain docs of every area the change touches (path prefix → `areas:` in the
config): that area's `CLAUDE.md` index, `CONTEXT.md` (or `CONTEXT-MAP.md` at root → the
per-context `CONTEXT.md` it points to) if present, `conventions/`, `stack.md`, and `adr/` for
invariants that constrain this change — each one names code an agent would otherwise write
wrongly, so a plan that violates one is a plan that will be built wrong. Honour the canonical
terms and the invariants in the plan.

**Multi-repo workspaces.** If the loaded context (`CLAUDE.md` / `.claude/CLAUDE.md`)
declares sibling repositories and the goal touches one, investigate it too — via a
codebase-index MCP if one is available, otherwise Read with absolute paths. How the
change itself gets made is the **workspace's cross-repo policy**, declared in that same
context — follow it. The two policies:

- **Inline** (default when the workspace declares none): a small, well-bounded
  foreign-repo change (a few tasks, no need for that repo's own MCP servers) may be
  planned as direct edits — mark each such task in §3 with a `Repo:` sub-bullet, and list
  that repo's convention skill(s) in §6 **by absolute path** (not auto-registered here).
  Anything larger gets its own plan in its own repo: add a §3 task
  "run `/banna-draft` in `<repo>` for `<sub-goal>`".
- **Handoff-only** (when the workspace declares sibling edits forbidden): never plan
  direct edits to a sibling. Instead the handoff is a **planning artifact you write
  yourself in phase 10, alongside the plan** — not an execution task, and following
  `${CLAUDE_SKILL_DIR}/../banna-handoff/SKILL.md` for the mechanics (target, template,
  file contents) rather than reinventing them here — with `target:` naming the repo
  that must act on it. List every handoff you write in the plan's `handoffs:`
  frontmatter. If this plan **consumes** the sibling's output (e.g. a web plan
  needing a new API), say so in §1: the requester passes the handoff's absolute
  path to a session in the target repo, which plans and executes it **first** —
  `/banna-build` will refuse to run this plan while any listed handoff is not `done`.

**Drafting FROM a handoff:** if the goal points at a handoff file (usually an absolute
path into the origin repo's `.banna/handoffs/`), read it and treat its Contract section
as settled input — do not re-grill what the origin plan already decided (grill only what
the handoff leaves open). Set the plan's `from_handoff:` frontmatter to the handoff path,
and update the handoff's frontmatter: `status: planned`, `plan:` → your plan's path.
(That status flip is the one sanctioned write outside this repo besides `CONTEXT.md`
edits here.)

Either way, record the cross-repo contract (API shape, event, schema) this plan depends
on in §2 as a blocking assumption until the other side lands.

**3. Grill (interview to a shared understanding).**
Run the `grill` skill (`/grill <the goal>`) **in this session** — the interview
needs the requester's answers, so never hand it to a subagent. It interviews the requester
one question at a time, with a recommended answer for each, down every branch of the design
tree that changes the implementation; it answers from the codebase and docs what they can
answer; and it updates the area's `CONTEXT.md` inline as terms resolve. When a Contract from
a handoff (phase 2) is settled input, tell it to grill only what the handoff leaves open.
Take its hand-back summary — decisions, resolved terms, assumptions, open questions,
contradictions — as the input to phases 4 to 7. Do not skip this phase because the request
looks clear: if it really is clear, the skill says so in one line and moves on.

**4. State assumptions and open questions.**
After grilling, list what remains. Split assumptions into "safe" (low risk if wrong) and
"blocking" (the plan is invalid if wrong). Any blocking question not settled in phase 3 goes
to the requester now.

**5. Write the implementation tasks (the apply-loop checklist).**
Produce an ordered checklist of `- [ ]` tasks — this is exactly what `/banna-build` walks
and flips to `- [x]`. One task = one coherent, verifiable unit: small enough to land and
check on its own, ordered so each builds on the last.
Format each task as a **short imperative title** with the detail in indented sub-bullets:
Files, Change (1–2 lines), Difficulty and Model (see phase 8), and a constraint/ordering
note only when load-bearing. Add a
"Why" sub-bullet only when the reason is not obvious from the title — never cram
files + change + why into one long bullet line. Group tasks into phases when ordering
across groups matters. Be specific enough that the executor can follow without
re-deriving your reasoning. Cite a `path:line` when it pins down a decision; never
transcribe the code itself — the executor reads the file at run time.

**6. Define done.**
Write acceptance criteria as a checklist. For each item, specify exactly how it will be
verified. `/banna-build` is test-first: it writes the tests from this section, you approve
and freeze them, and only then does code get written to make them pass. So each criterion
must name the test that proves it (file and what it asserts) and its layer (contract,
integration, e2e or unit), concrete enough to write before any code exists. If the project
has a test suite, name the test(s); if no tests cover the touched area, say which tests
should be added. If the project has no test setup at all, do not
invent one — specify the verification that does apply (build, type-check, lint, smoke run,
or a manual/visual check) and note tests as a future add-on.

**7. Assess risk.**
What can break? What is the blast radius (other modules, services, consumers)? What is
the rollback path? Flag anything irreversible (migrations, data changes, public API or
contract changes).

**8. Determine the skills needed (section 6).**
Decide which skills `/banna-build` should load to carry out section 3 — from **either**
source: this repo's own `.claude/skills/`, or a skill installed globally on the operator's
machine (outside this repo, e.g. under their personal skill directories) that the
available-skills list surfaces for this session. Check both; use only skills that
actually appear in `.claude/skills/` or that list — do not invent names. A global skill
is fair game here (a framework/language best-practice skill, a build tool, a design
critique skill) even though this repo's own files never *depend* on one existing — the
plan may still recommend loading it if it happens to be present, and should degrade
gracefully (fall back to the relevant `docs/conventions/` rule, or note the gap) if a
later `/banna-build` run is on a machine without it. Look for skills matching the areas
the tasks touch: UI / visual-verification skills for visible UI work, coding-standards or
framework best-practice skills for code-quality-sensitive work, build/run workflow skills
for anything that must be launched to verify.
List each skill with which task(s) it serves and why, noting whether it's project-local
or global. Record them in the plan's `skills:` frontmatter as a YAML list so
`/banna-build` can preload them on demand. If none apply, write "None".

Also choose the **model for each task**. Rate every §3 task `S`, `M` or `L` per the
`difficulty:` table in the config, judging from the task itself, not the goal's prestige.
Then resolve its model from `stages.implement[<rating>]` (and `stages.tests` for the tests
that cover it) in the config: take the first entry that is in `selection.available`, or
the cheapest one when `selection.prefer` is `cheapest`. Write the result in the task as
`Difficulty:` and `Model:` sub-bullets. If no allowed model is available, say so under §2
Blocking instead of picking one. Set frontmatter `execution_model` / `execution_effort` to
the strongest model any task uses and its stage effort, and fill the "Run with" line under
the plan title with a one-line justification.

The choice binds the human, not the tooling: `/banna-build` runs each task in a subagent
on that task's `Model:`, and shows you the models when you approve. A skill cannot switch
the session's own model, so the human picks it when launching.

**9. Record check (section 7).**
An ADR under `docs/adr/` records **an invariant an LLM agent could not infer from the
codebase and would plausibly violate** — nothing else. It is not a record of what changed
or why; that is the plan's job, and the plan is throwaway on purpose. Read
`${CLAUDE_SKILL_DIR}/ADR.md` before deciding — it holds the four gates and the format.

An ADR is REQUIRED only when the change creates a rule that survives all four gates:
it is not already a convention rule ID, not enforced by a machine (schema, CHECK,
dependency-cruiser, the type-checker), not a comment's job at one call site, and an agent
writing ordinary code would break it. In practice that means **an absence** (a field that
must never exist, a value that must never be returned, a retry that must never be added)
or **a deliberate contradiction** of an existing convention.

None of these earns an ADR on its own: adding or removing a dependency; picking library A
over B; a new module or slice that follows the existing pattern; a schema change whose
rules are visible in the schema.

If required, set frontmatter `adr: required` and draft section 7 as **invariant bullets
only** (≤20 lines — see the §7 stub in `${CLAUDE_SKILL_DIR}/PLAN.md`): the rule, the wrong
code it prevents, and where it is enforced. Never Context / Alternatives / Consequences
prose — the ADR format has no such sections. If a gate caught it instead, set `adr: none`
and name the file that carries the rule (the convention rule ID, the constraint, the
comment) — naming the better home IS the answer, not a fallback.

Before the ADR, decide what the change should leave behind, per area it touched. ADR is
one of several doc kinds, and the choice follows what was learned: an invariant an agent
cannot infer → `adr/`; a repeatable code rule → `conventions/` (correct the existing rule in
place, keep its ID); a domain term → `CONTEXT.md`; a language, tooling or environment fact →
`stack.md`; something a machine already catches (schema, CHECK, lint, type-checker) → no doc,
the enforcement is the record; one call site → a comment. A doc goes in the `docs` of the
area whose code it describes; only a rule that spans services goes in the root `docs`.
List the docs the plan expects to write in the `record:` frontmatter list.

**10. Save the draft.**
Write the plan to `.banna/plans/YYYY-MM-DD-NNN-<short-slug>.md`. Use the injected "Today's
date" for `YYYY-MM-DD`, never a guessed date. `NNN` is the plan's number **within that day**,
zero-padded to `plan_id_digits`: list `.banna/plans/` and `.banna/plans/archive/*/` for files
starting with today's date, take the highest `NNN` and add one (`001` if none). Never guess
it from memory, and never reuse a number, even one belonging to an archived plan. The plan's
id is the date plus `NNN` (`2026-11-13-001`); write it in the `id:` frontmatter. Follow the
structure in
`${CLAUDE_SKILL_DIR}/PLAN.md` exactly (sections 1–7 + Execution log). Set frontmatter
`status: draft`, `id`, `date` (today's date), the `adr` and `record` fields, and the `skills` list from phase 8.
In a multi-repo workspace, **also write now** every handoff file phase 2 decided on,
per `${CLAUDE_SKILL_DIR}/../banna-handoff/SKILL.md` (`origin_plan` → this plan's path,
`target` → the repo that must act), and list their paths in the plan's `handoffs:`
frontmatter — the requester needs them to exist immediately so the target side can be
planned and executed before this plan runs.
Print each handoff's absolute path at the end so the requester can paste it into a
session in the target repo. If this plan was drafted from a handoff, set `from_handoff:`
and update that handoff's frontmatter as phase 2 describes.
(It must exist as a
file so the reviewer can read it cold.) Create `.banna/plans/` with the Write tool path if
it does not exist. Do not write any other file. Do not start implementing.

The first audience is the **human reviewer** — write for a skim, not a read. Follow the
formatting rules in the template's header comment, in particular:

- Tables and short bullets over prose; no paragraph longer than 3 sentences.
- Each fact lives in one section; cross-reference ("see §3") instead of repeating.
- Add a mermaid diagram (renders in VSCode Mermaid Preview / GitHub) only when the plan
  changes architecture or module boundaries; add before/after payload examples (fenced
  json) only when it changes an API/data contract. Skip both otherwise.
- Omit empty headings — no "none" placeholders (except §6/§7 which require an explicit
  "None"/"No ADR needed" + why).
- A reviewer should grasp goal, approach, and risk in ~5 minutes. If the plan runs long,
  trim task sub-bullets and §5 rows first — never the task list itself or the
  definition of done.

**11. Delegate the review.**
The review must be cold — a fresh context that did not write the plan. Spawn a
general-purpose subagent with the Task tool, passing `model` from `stages.plan_review` in
the config (first entry that is in `selection.available`). Its prompt: read
`${CLAUDE_SKILL_DIR}/../banna-review/SKILL.md` and follow those instructions exactly,
reviewing the plan file at the path you just wrote. Tell it to verify every `path:line`
and every negative assertion ("X does not exist", "only N call sites") against the
codebase, since those are what the plan stakes its tasks on.

If subagents are unavailable, or the `banna-review` skill cannot be found, stop here:
print the plan path and tell the requester to run `/banna-review <path>` (ideally in a
fresh session), then bring back the verdict so phase 12 can run.

The reviewer reads the plan cold, verifies the claims against the codebase, checks the
task list is atomic/ordered/verifiable and the skills list is real, and returns a
structured verdict (APPROVE / REVISE) with prioritised findings. Do not review your own
plan inline — the point is a cold, separate reviewer. Run the review exactly once; do not
re-delegate. Proceed to phase 12 with the verdict and findings.

**12. Apply the findings.**
Address every CRITICAL and SHOULD-FIX item by rewriting the plan file with Write. Resolve
each UNVERIFIED CLAIM (check it, or move it to section 2 "Assumptions & open questions" if it
can't be settled here). If a finding reveals a blocking question for the requester, surface
it. Keep `status: draft` — approval is the human's call, never yours.

**13. Print the review brief (in chat, not in the plan).**
End with a compact brief so the requester can catch problems without reading the whole
plan. Include ONLY the decisions that would be expensive to discover late — for each, one
line: the decision + the alternative it beat (so a wrong call is visible at a glance).
Cover, when present (omit empty categories, no placeholders):

- **Dependencies:** libraries/packages added, removed, or version-bumped.
- **Contracts:** API/schema/event changes — one line each, breaking ones flagged.
- **Flow/architecture changes:** anything that reroutes an existing behavior, moves a
  boundary, or changes where a rule lives.
- **Convention deviations:** anywhere the plan knowingly departs from the codebase's
  established patterns.
- **Irreversibles:** migrations, data changes, anything with no clean rollback.
- **Blocking assumptions & open questions** the human must settle before approving.
- **Handoffs:** target repo + one-line contract each, with absolute paths.
- **Models:** the per-task models, and the strongest one the plan needs.

Cap it at ~15 lines; if a category would push past that, keep the riskiest items and say
"N more in plan §X". This brief is chat output only — never duplicate it into the plan
file. Then print the file path, the reviewer's verdict, and what changed after review.
Tell the requester to set `status: approved` when satisfied, then run `/banna-build`.
