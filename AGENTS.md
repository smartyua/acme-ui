# AGENTS.md

Entry point for coding agents in **design**: a React 19 + TypeScript + Vite app (SCSS modules,
`react-router-dom`, `lucide-react`; no Tailwind, no UI libraries) that implements the
**Acme UI** design system — a Linear-style minimal SaaS look with light and dark themes.

**Before touching any UI, read [`DESIGN.md`](./DESIGN.md).** It is the contract for tokens,
layout, responsive behaviour, components, copy and the definition of done. When a request
conflicts with it, follow the request and say which rule you broke and why.

## Commands

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # tsc -b && vite build
npm run check    # typecheck + eslint + design lint + unit tests (a few seconds)
npm run e2e      # browser matrix: every route, light/dark × 390/820/1440 (Playwright)
npm run verify   # check + build + e2e — must pass before you call a task done
```

## Where things live

| Area | Path |
|---|---|
| Theme palettes (light/dark CSS variables) | `src/styles/globals.scss` |
| SCSS token aliases | `src/styles/tokens.scss` |
| Breakpoint mixins | `src/styles/_breakpoints.scss` |
| Shared components | `src/components/ui.tsx`, `src/components/primitives.tsx` |
| App shell (sidebar, phone drawer, logout, toasts) | `src/layout/Shell.tsx` |
| Page container | `src/layout/Page.tsx` |
| Shared state (theme, notifications, orders, toasts) | `src/lib/app.tsx` |
| Routes | `src/main.tsx`; sidebar items in `src/data.ts` (`RAIL_PRIMARY`, `RAIL_SECONDARY`, `ALL_ROUTES`) |
| Screens | `src/pages/*Page.tsx` (+ `pages.module.scss` for shared page styles) |
| Demo content | `src/content/*.ts`, `src/data.ts` |
| Browser tests and screenshot baselines | `e2e/`, `playwright.config.ts` |
| Contract tests (token parity, route wiring) | `tests/`; unit tests sit next to the source as `*.test.ts(x)` |
| Agent team | `.claude/agents/*.md` (read by Cursor, Claude Code and Empryo) |
| Stop-hook gate for agents | `.claude/settings.json` → `scripts/agent-gate.mjs` |
| Recorded debt the gate tolerates | `eslint-suppressions.json`, `stylelint-suppressions.json`, `e2e/a11y-debt.ts` |

## Non-negotiable rules (summary of DESIGN.md)

1. **Tokens only.** No hex/rgb in components. New colour → add to *both* theme blocks in
   `globals.scss` + alias in `tokens.scss`.
2. **Both themes, three viewports.** Verify light + dark at 390 / 820 / 1440 px.
3. **Reuse components** from `ui.tsx` / `primitives.tsx`; extend them instead of forking styles.
4. **Breakpoints via mixins** (`bp.phone`, `bp.tablet`, `bp.below-desktop`, `bp.desktop`).
5. **Every action gives feedback** (toast / visible state change); no dead buttons.
6. **Arrow functions only**, SCSS module per component/page, `aria-*` on custom controls.
7. **New screen** = page in `src/pages`, route in `main.tsx`, item in `src/data.ts`, uses `<Page>`.
8. **No third-party logos** — integrations use `AppChip` monograms.

## Adding a screen (recipe)

1. `src/pages/FooPage.tsx` → `<Page><PageHeader …/> … </Page>`; styles from `pages.module.scss`
   or a new `Foo.module.scss` that starts with
   `@use '../styles/tokens' as *; @use '../styles/breakpoints' as bp;`.
2. Route in `src/main.tsx` inside the `<Route element={<Shell />}>` block.
3. Sidebar item in `src/data.ts` (`RAIL_PRIMARY` or `RAIL_SECONDARY`, lucide icon, `path`).
4. Run the Definition of done (DESIGN.md §11).

## Quality gate

`npm run verify` is the definition of done in executable form. Its stages:

| Stage | What it enforces |
|---|---|
| `typecheck` | `tsc` on the app and on `e2e/`, `tests/` and the configs |
| `lint` | ESLint: arrow functions only, React hooks rules, no colour literals in components |
| `lint:design` | Stylelint: tokens only, no raw width media queries (DESIGN.md §2, §5) |
| `test` | Vitest: every token in both themes, routes ↔ sidebar ↔ `ALL_ROUTES`, unit tests |
| `build` | `tsc -b && vite build` |
| `e2e` | Playwright, every route × light/dark × 390/820/1440: renders, no console errors, no sideways scroll, navigation reachable, axe WCAG A/AA, screenshot equals its baseline |

- **It runs by itself.** A Stop hook runs these stages when an agent ends a turn with uncommitted
  code changes and sends the agent back if one fails (at most three times in a row). Last result:
  `node_modules/.cache/agent-gate.json`. `AGENT_GATE=off` disables it.
- **Never weaken it to pass.** No new lint suppressions, no skipped tests, no new a11y-debt entries.
- **Recorded debt only shrinks.** The violations that existed when the gate was added are listed in
  the three debt files. After fixing some, run `npx eslint . --prune-suppressions` or
  `npx stylelint "src/**/*.scss" --suppress`, or delete the entry from `e2e/a11y-debt.ts`, and check
  that the file only got smaller.
- **Screenshots.** `npm run e2e` fails on any pixel change. For an intended change, look at the diff
  in `test-results/`, run `npm run e2e:update` and commit the PNGs. Baselines are per platform
  (`e2e/__screenshots__/darwin/`); a platform without baselines skips the comparison in CI.
  Live screens are captured paused (`freezeLive` in `e2e/fixtures.ts`): the app starts from its own
  remembered "Pause" and a seeded first state, so the frame is the same on every run. The other
  specs still load the running screen.
- **Isolation.** `npm run e2e` serves its own checkout on a free port, so parallel agents and git
  worktrees never test each other's code. It does not use the dev server on :5180.

## Agent team

Definitions live in `.claude/agents/`. One change goes through:

```
planner → ui-engineer ∥ api-engineer → design-reviewer ∥ code-reviewer ∥ browser-tester → release-gate
              ↑                                                                               │
              └──────────────── FAIL: back to the engineer, at most two rounds ───────────────┘
```

| Agent | May edit | Job |
|---|---|---|
| `planner` | nothing | Acceptance criteria, change sites, reuse, tests, expected screenshot changes |
| `ui-engineer` | `src/components`, `pages`, `layout`, `styles`, `e2e` | Builds UI from the plan and DESIGN.md |
| `api-engineer` | `src/data.ts`, `src/content`, `src/lib`, `src/api` | Types, data, shared state, API client — contract first |
| `design-reviewer` | nothing | Strict DESIGN.md review, including every changed screenshot |
| `code-reviewer` | nothing | Correctness, types, states, tests, scope |
| `browser-tester` | `e2e` | Runs the matrix, uses the changed screens by hand, turns findings into specs |
| `release-gate` | nothing | Re-runs `npm run verify`, checks evidence and reviews, returns PASS/FAIL and a handoff |

- **Keep it proportionate.** Docs-only change: no pipeline. One-file fix with no visible effect:
  engineer → `code-reviewer` → `release-gate`. No UI files changed: skip `design-reviewer` and
  `browser-tester`. No data or state changed: skip `api-engineer`.
- **No shared files.** The planner gives each file to one engineer. Agents that edit in parallel
  work in separate git worktrees.
- **Independent reviews.** Reviewers get the plan and the diff, not each other's conclusions. A
  review is stale as soon as the code changes after it.

## Reusing the style elsewhere

Follow DESIGN.md §12 — it lists the exact files to copy and the setup steps.
