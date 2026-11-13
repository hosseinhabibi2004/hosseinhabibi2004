---
status: draft # draft -> approved -> done
id: YYYY-MM-DD-NNN # the date plus the plan's number within that day; matches the file name
date: YYYY-MM-DD
adr: none # none | required | NNNN (set to the committed ADR number once written)
record: [] # docs this plan expects to write, as <area>/<kind>, e.g. [api/adr, web/conventions]
skills: [] # skills /banna-build should preload, e.g. [coding-standards, ui-testing]
execution_model: sonnet # the strongest model any task uses (per-task models are in §3): haiku | sonnet | opus
execution_effort: medium # recommended reasoning effort: low | medium | high
handoffs: [] # handoff files this plan generated (sibling side must be planned+executed first; /banna-build gates on their status)
from_handoff: # path of the handoff this plan was drafted from, if any
---

<!--
Formatting rules — the first audience is a HUMAN skimming this for review:
- Prefer tables and short bullets over prose. No paragraph longer than 3 sentences.
- Each fact lives in exactly one section; reference it ("see §2") instead of repeating it.
- Task titles are short imperatives; details go in indented sub-bullets. Never pack
  files + change + why into one long bullet line.
- Include a mermaid diagram (```mermaid fence — renders in VSCode Mermaid Preview and
  GitHub) only when the plan changes architecture or module boundaries.
- Include before/after payload examples (fenced json) only when the plan changes an
  API/data contract — that is what the human reviewer checks hardest.
- Omit any heading or sub-heading that would be empty. Never write "none" placeholders
  (exceptions: §6 and §7 require an explicit "None"/"No ADR needed" + why).
-->

# <Plan title>

> **Run with:** `<model>` / `<effort>` effort — <one line: why this tier fits (task
> complexity, blast radius)>. Instruction for whoever launches `/banna-build`; each task
> carries its own model in §3.

## 1. Goal & scope

<Goal in 2–4 sentences: what changes and why.>

<Mermaid diagram of the target state — only if architecture/module boundaries change.>

**In scope:**
- <tight bullets>

**Out of scope:**
- <item — one-line reason it is excluded>

## 2. Assumptions & open questions

<Include only the non-empty groups below; omit the rest entirely.>

**Safe assumptions:**

**Blocking (resolve before approving):**

**Residual risks / unknowns for reviewer:**

**Bookkeeping** (one line each, only if any): terms resolved → `CONTEXT.md`; glossary
conflicts surfaced; prior ADRs that constrained this plan.

## 3. Implementation tasks

<The execution checklist. /banna-build walks these top-to-bottom and flips - [ ] -> - [x]
as each lands. One task = one coherent, verifiable unit, ordered so each builds on the
last. Group into phases when cross-group ordering matters. Sub-bullets carry the detail:
Files, Change (1–2 lines), plus a constraint/ordering note only when load-bearing. Add a
"Why" sub-bullet only when the reason is not obvious from the title.>

### Phase A — <name>

- [ ] **A1. <short imperative title>**
  - Files: `path/one.cs`, `path/two.cs` (new)
  - Change: <1–2 lines>
  - Difficulty: S | M | L
  - Model: <haiku | sonnet | opus — from `.banna/config.yaml`, first allowed and available>
  - <constraint or ordering note, only if load-bearing>

## 4. Definition of done

- [ ] <criterion> — verify: `<test file> — <layer: contract | integration | e2e | unit> — <what it asserts>`
  (/banna-build writes these tests first, you approve and freeze them, then the code makes them pass)

## 5. Risk & rollback

| Risk | Severity | Mitigation |
|---|---|---|
| <failure mode> | high/med/low | <how the plan addresses it> |

- **Rollback:** <how to undo>
- **Irreversible:** <migrations, data changes, contract/API changes — omit if none>

## 6. Skills Needed

<Skills /banna-build should load for §3, by exact name (mirrored in `skills:`
frontmatter). Project-local (`.claude/skills/`) or global (installed on the
operator's machine) — either counts, as long as it actually exists on the
available-skills list. Mark which. If none apply, write "None" + why.>

- `<skill-name>` (project | global) — for: <task ref> — why: <reason>

## 7. Record (docs — /banna-build writes them)

<The docs this change leaves behind, per area (see /banna-draft phase 9). Set frontmatter
`record:` to match. For an ADR also set `adr: required`, write bullets only, ≤20 lines, and
/banna-build writes `<area docs>/adr/NNNN-<slug>.md` and the number back. If nothing earns a
doc: "No doc needed" + the file that carries the rule instead (convention rule ID,
constraint, or comment).>

- **ADR** (`<area>/adr`) — **Title:** <the invariant stated as an assertion, not the topic>
  - **Invariants:** <one bullet each: the rule — the wrong code it prevents — where it is
    enforced or visible (`file:line`, a CHECK, a convention rule ID)>
  - **Where it lives:** <the paths that own it, one line each>
  - **Known gaps:** <only if real>
- **Convention** (`<area>/conventions`) — <rule ID to add or correct, one line>
- **Context** (`<area>/CONTEXT.md`) — <term added or sharpened>
- **Stack** (`<area>/stack.md`) — <fact added>

## Execution log

<Filled in by /banna-build: files changed, task/verify results, divergences and how they were resolved.>
