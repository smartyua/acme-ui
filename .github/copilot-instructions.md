# Copilot instructions

This repo implements the **Acme UI** design system (Linear-style minimal SaaS, light + dark).
Follow [`DESIGN.md`](../DESIGN.md) for every UI change and [`AGENTS.md`](../AGENTS.md) for
structure and commands.

Key rules: tokens only (no hex in components; new colours in both themes in
`src/styles/globals.scss`), reuse `src/components/ui.tsx` / `primitives.tsx`, breakpoint mixins
from `src/styles/_breakpoints.scss`, one primary button per view, toast after every mutation,
arrow functions only, verify light/dark at 390/820/1440 px and run `npm run verify`.
