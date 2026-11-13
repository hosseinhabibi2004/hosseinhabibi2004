# Admin conventions

Rules for `admin/src/`. IDs are append-only: a new rule takes the next free
number, and a removed rule's number retires with it. The checks that always
apply: `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`.

Rule IDs: `adm-ui-` design system, `adm-i18n-` language, `adm-str-` structure.

## Design system

- **adm-ui-01** — Colours come only from the tokens in `app/globals.css`, through their
  semantic classes. The scale is grayscale; only `destructive` has a hue.
  ✓ `bg-card text-muted-foreground`; ✗ `bg-[#111]`, `text-red-500`, `bg-gray-900`.
  Enforced by `app/__tests__/no-literal-colors.test.ts` and `theme-tokens.test.ts`.
- **adm-ui-02** — Layout uses logical utilities so one screen serves English and Persian.
  Icons that point somewhere take `rtl:rotate-180`.
  ✓ `ms-2 ps-4 text-start border-s`; ✗ `ml-2 pl-4 text-left border-l`.
  Enforced by `app/__tests__/rtl-icons.test.ts`; spacing by `spacing-scale.test.ts`.
- **adm-ui-03** — Every file in `components/ui/`, `components/`, `components/data-table/` and
  `components/rich-text/` has a `*.stories.tsx` beside it; check the screen in both
  directions with the Storybook language toolbar.
  Enforced by `components/__tests__/stories.test.ts`.

## Language

- **adm-i18n-01** — Every user-facing string is a key in `i18n/locales/{en,fa}/<namespace>.json`,
  with the same keys in both languages. Text in a component is never a literal.
  ✓ `t("form.save")`; ✗ `"Save"`.
  Enforced by `i18n/__tests__/locales.test.ts`.

## Structure

- **adm-str-01** — One folder per screen under `features/<screen>/`, holding its components,
  service (`*-service.ts`) and schema. Pieces used by two screens live in `components/`.
  Pages in `app/` only compose a feature; they hold no logic.
