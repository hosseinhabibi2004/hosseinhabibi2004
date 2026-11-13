# Plans

Implementation plans written with `/banna-draft` and built with `/banna-build`. Config:
[`../config.yaml`](../config.yaml). Design: [`../DESIGN.md`](../DESIGN.md).

- File name: `YYYY-MM-DD-NNN-<slug>.md`. `NNN` counts plans within that day (`001`, `002`, …);
  the plan id is the date plus `NNN`, for example `2026-11-13-001`.
- A plan moves through `draft → approved → done`.
- This folder holds live plans only. A plan that is `done` moves to `archive/<yyyy-mm>/`
  when `/banna-build` closes it, or when you run `/banna-archive`.
- Once a plan is done, its durable outputs are the docs it wrote next to the code of each
  area (ADRs, conventions, `CONTEXT.md`, `stack.md`); the plan itself is history.
