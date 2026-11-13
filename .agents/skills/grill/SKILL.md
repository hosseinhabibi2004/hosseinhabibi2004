---
name: grill
description: Interview the requester relentlessly about a goal, plan or design until everything that would change the implementation is clarified, one question at a time with a recommended answer each, resolving the design tree branch by branch and keeping the domain glossary current as terms resolve. Use when /banna-draft reaches its grill phase, or when the user wants to stress-test a plan or idea before building, or says "grill me".
when_to_use: Invoked by /banna-draft (phase 3). Also run directly with /grill <goal or plan path> to stress-test an idea or an existing plan.
argument-hint: [the goal, or the path of a plan to stress-test]
category: Workflow
tags: [workflow, clarify]
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(git log:*), Bash(git status:*), Bash(git diff:*), Bash(ls:*), Bash(find:*)
---

Interview the requester relentlessly about every aspect of the goal until you reach a shared
understanding. Walk down each branch of the design tree, resolving dependencies between
decisions one by one. This is where everything gets clarified: a wrong assumption caught
here costs one question, and caught after the plan is approved it costs a rebuild.

Target: $ARGUMENTS
(A goal, or the path of a plan to stress-test. If empty and you were invoked from
`/banna-draft`, the goal is the one it is drafting.)

**Run it in the main session.** The interview needs the requester's answers, so never
delegate it to a subagent.

## Before the first question

Read what already answers things, so you do not ask for it: `.banna/config.yaml` (areas and
where each keeps its docs), and for every area the goal touches its `CLAUDE.md` index,
`CONTEXT.md` (or `CONTEXT-MAP.md` at root → the per-context `CONTEXT.md` it points to),
`conventions/`, `stack.md` and `adr/`. Explore the code the goal touches. The glossary
format is `${CLAUDE_SKILL_DIR}/../banna-draft/CONTEXT-FORMAT.md` — read it before you write
a term.

## How to interview

- **One question at a time.** Wait for the answer before the next. Several questions at once
  is bewildering.
- **State your recommended answer** with every question. Never ask open-endedly.
- **Walk the tree in dependency order.** Settle the decision others depend on first; a
  question whose answer is implied by an earlier one is not asked.
- **If the codebase or the docs can answer it, answer it from them** and say where, instead
  of asking.
- **Only grill forks that change the implementation.** If the request is already clear on a
  point, say so and move on. Do not manufacture questions.
- **Sharpen fuzzy language.** When a term is vague or overloaded, propose a precise canonical
  term ("you said 'account' — Customer or User? those differ"). When a term conflicts with
  `CONTEXT.md`, call it out immediately.
- **Stress-test with concrete scenarios.** Invent edge cases that force precision about the
  boundaries between concepts: empty, duplicate, concurrent, partial failure, permission,
  time zone, old data.
- **Cross-reference the code.** If a stated behaviour contradicts the code or an ADR, surface
  it now.
- **Push back once** when an answer looks wrong or contradicts an earlier one, with the
  evidence; then accept the requester's call and record it as theirs.

## Keep the glossary current

Update the area's `CONTEXT.md` **inline**, as each term resolves — do not batch. Create it
lazily, only once the first term is worth recording, in the `docs` of the area the term
belongs to. Keep it a glossary and nothing else: canonical terms + `_Avoid_` synonyms, zero
implementation detail. Record only terms specific to this project's domain, not general
programming concepts. When called from `/banna-draft` this is the only source file you may
touch besides the plan.

## When to stop

Stop when every fork that changes the implementation is settled, or parked as a **blocking
question** only the requester can answer later. Do not keep going to be thorough: when you
could not name a decision the answer would change, you are done.

## Hand back

End with a short summary the caller can write straight into the plan, nothing else:

- **Decisions:** one line each: the decision, and the alternative it beat.
- **Terms:** resolved or sharpened, and which `CONTEXT.md` they went to.
- **Assumptions:** safe (low risk if wrong) and blocking (the plan is invalid if wrong).
- **Open questions:** only those that stay blocking.
- **Contradictions found** between the goal and the code or an ADR.
