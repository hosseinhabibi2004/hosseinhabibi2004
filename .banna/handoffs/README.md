# Handoffs

A handoff is a planning artifact for work that is outside the current task or belongs to
another repository. Its template and lifecycle live in
[`banna-handoff`](../../.agents/skills/banna-handoff/SKILL.md).

Write one with `/banna-handoff`, then consume it with `/banna-draft <handoff path>` in the
target repository. Status moves `open → planned → done`. This folder holds `open` and
`planned` handoffs only: a `done` one moves to `archive/<yyyy-mm>/` when `/banna-build`
closes the plan that consumed it, or when you run `/banna-archive`.
