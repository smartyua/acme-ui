# AGENTS.md

Entry point for coding agents in **g-design**: a React 19 + TypeScript + Vite app (SCSS modules,
`react-router-dom`, `lucide-react`; no Tailwind, no UI libraries) that implements the
**Acme UI** design system — a Linear-style minimal SaaS look with light and dark themes.

**Before touching any UI, read [`DESIGN.md`](./DESIGN.md).** It is the contract for tokens,
layout, responsive behaviour, components, copy and the definition of done. When a request
conflicts with it, follow the request and say which rule you broke and why.

## Commands

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # tsc -b && vite build — must pass before you call a task done
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

## Reusing the style elsewhere

Follow DESIGN.md §12 — it lists the exact files to copy and the setup steps.
