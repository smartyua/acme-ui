# Acme UI — design system & rules for AI agents

Source of truth for how screens in this repo look and behave, and how to bring the same look to
**other projects**. Every agent (Claude Code, Cursor, Copilot, Codex…) must follow it when it
creates or changes UI.

> **Style in one line:** Linear-style minimal SaaS — neutral greyscale surfaces, 1px hairline
> borders instead of shadows, one blue accent, pastel status colours, Inter-like type, light and
> dark themes treated as equals. Reference look: shadcn/ui “New York” + Linear + the “Vetted”
> and “Axon” mock-ups this repo was built from.

---

## 1. Principles (apply in this order when unsure)

1. **Calm first.** Greyscale everywhere; colour only carries meaning (primary action, status, trend).
   One primary (blue) button per view at most.
2. **Lines, not shadows.** Separate surfaces with `1px` borders (`$border`). Shadows are reserved
   for floating layers (modal, drawer, toast, dropdown) and are very soft.
3. **Both themes are first-class.** Every colour comes from a token that has a light **and** a dark
   value. Never ship a screen checked in one theme only.
4. **Hierarchy through weight and grey, not size.** Titles 1.375rem/600, panel titles
   0.9375rem/600, body 0.875rem/400, meta 0.75–0.8125rem in `$fg-muted`/`$fg-faint`.
5. **Dense but airy.** Compact controls (32–38px), generous gaps (16px between blocks, 24px between
   sections). Content aligns to the sidebar — no centred narrow columns with dead gutters.
6. **Every action answers.** Each mutation shows a toast; destructive actions are red-outlined and
   confirmable; empty results show an `Empty` state with a way out.
7. **Mobile is a layout, not a shrink.** Phones get a top bar + drawer menu, single column,
   bottom-sheet dialogs, sideways-scrolling tables. Never just scale the desktop down.

---

## 2. Tokens

All colours are CSS custom properties defined per theme in `src/styles/globals.scss`
(`:root[data-theme='light'|'dark']`). SCSS aliases live in `src/styles/tokens.scss`
(`$card: var(--card)` etc.). **Components use the SCSS aliases only — never hex/rgb literals.**

### 2.1 Surfaces & text

| Token | Light | Dark | Use |
|---|---|---|---|
| `$backdrop` | `#e7e7e9` | `#3a3e45` | Page behind the app frame |
| `$frame` | `#ffffff` | `#1b1b1c` | App frame; also “inverse ink” on `$fg` fills |
| `$rail` | `#f9f9fa` | `#1f1f20` | Sidebar, phone top bar |
| `$panel` | `#fbfbfc` | `#222223` | Secondary column |
| `$main` | `#f4f4f5` | `#1a1a1b` | Page content area — one step below `$card` in both themes, so cards read as raised |
| `$card` | `#ffffff` | `#262627` | Panels, cards, inputs, modals |
| `$card-raised` | `#f1f1f3` | `#2e2e30` | Icon tiles, nested chips |
| `$well` | `#efeff1` | `#141415` | Inset areas (chart wells, read-only fields) |
| `$hover` | `rgba(0,0,0,.045)` | `rgba(255,255,255,.05)` | Hover fill |
| `$active` | `#e7e7ea` | `#3a3a3c` | Selected nav item, muted counters |
| `$border` | `rgba(0,0,0,.08)` | `rgba(255,255,255,.08)` | Default hairline |
| `$border-strong` | `rgba(0,0,0,.14)` | `rgba(255,255,255,.14)` | Inputs, buttons, hover borders |
| `$fg` | `#18181b` | `#f4f4f5` | Primary text |
| `$fg-soft` | `#3f3f46` | `#d4d4d8` | Labels, nav items |
| `$fg-muted` | `#6b6b73` | `#9b9ba1` | Descriptions, table headers |
| `$fg-faint` | `#a1a1aa` | `#6e6e74` | Placeholders, timestamps, counts |
| `$fg-muted-strong` | derived | derived | Muted text on tinted or inset surfaces (`$well`, callouts, segmented tracks), where `$fg-muted` falls under 4.5:1. `color-mix` of `$fg-muted` and `$fg`, no new literal |

Both themes use the same surface ladder, lowest to highest: `$well` → `$main` → `$rail` → `$panel` → `$card`. Cards are never the same colour as the page behind them.

### 2.2 Accent & semantic

| Token | Light | Dark | Use |
|---|---|---|---|
| `$accent` | `#1f8af0` | `#3d9bff` | Primary button, focus border, active selection |
| `$accent-hover` | `#1477d6` | `#5aabff` | Primary hover |
| `$accent-soft` | `#e8f2fd` | `rgba(61,155,255,.16)` | Focus ring, selected background, “AI” badge |
| `$link` / `$accent-text` | `#1a7fe6` / `#2f6fd1` | `#6cb4ff` / `#9cc8f7` | Text links, highlighted labels |
| `$success` / `$trend-up` | `#17803d` / `#15803d` | `#6fd39a` / `#a8e2c2` | Positive numbers |
| `$danger` / `$trend-down` | `#c2410c` | `#f07c78` | Negative numbers, destructive buttons |
| `$warning` | `#a16207` | `#f2c94c` | Warnings in text |
| `$tag-bg` | `#f2f2f4` | `#2c2c2f` | Neutral tag, pill-tab track, meter track |
| `$overlay` | `rgba(20,22,28,.35)` | `rgba(0,0,0,.55)` | Modal/drawer scrim |
| `$solar` `$battery` `$grid` `$load` `$ev` `$import-color` `$export-color` | see `globals.scss` | see `globals.scss` | Energy series on the BESS screen only (chart lines, flow branches, progress bars). Badges there still use the pastel tones |

### 2.3 Pastel tones (status, categories, charts)

`$lavender` `$peach` `$mint` `$lemon` `$rose` `$sky` — pastel fills with **dark ink text
(`$ink` `#18181a`) in both themes**. Fixed meanings:

| Meaning | Tone |
|---|---|
| Success / completed / paid / active | `mint` |
| Pending / open / invited / waiting | `lemon` |
| Failed / error / churned / overdue | `rose` |
| Info / refunded / neutral-positive | `sky` |
| Highlight / primary series / enterprise | `lavender` |
| Secondary series / warm category | `peach` |
| Unread / alert counter | `alert` (rose) |
| Neutral counter | `muted` |

Large soft backgrounds use `--tint-blue|peach|pink|mint|lavender` (≈5% tint in light, 10% alpha in dark).

### 2.4 Type, radius, spacing, motion

- **Font:** `$font-sans` = Inter → system UI stack. `letter-spacing: -0.01em` on body,
  `-0.02em` on titles. Numbers in tables/KPIs: `font-variant-numeric: tabular-nums`.
- **Sizes:** `$font-size-xs` 0.75rem · `sm` 0.8125rem · `base` 0.875rem · page title 1.375rem ·
  Overview hero 1.75rem. Do not invent other sizes.
- **Radius:** `xs` 6px (icon buttons) · `sm` 8px (badges, pills) · `md` 10px (inputs, buttons) ·
  `lg` 14px (panels) · `xl` 20px (app frame) · 16px (template cards) · `999px` (avatars, switches).
- **Spacing scale:** 4 · 8 · 12 · 16 · 24 · 32 px. Gap between panels 16px, page padding 28px
  desktop / 24px tablet / 16px phone.
- **Control heights:** 32px (`sm`), 38px (`md`, default), 44px tap targets on phones.
- **Motion:** `$t-fast` 120ms, `$t-base` 180ms, ease `cubic-bezier(.25,.1,.25,1)`. Overlays fade
  + rise 8px; drawers slide 24px. Nothing bounces, nothing lasts > 300ms.

---

## 3. Theming rules

- Theme lives on `<html data-theme="light|dark">`. Preference (`light|dark|system`) is stored in
  `localStorage` (`axon:theme`) and applied by an inline script in `index.html` **before** React
  mounts (no flash). Runtime switching goes through `useApp().setThemePref`.
- **Adding a colour:** add the CSS variable to **both** theme blocks in `globals.scss`, then add a
  `$alias: var(--alias);` line to `tokens.scss`. A token that exists in one theme only is a bug.
- Need a lighter/darker variant? Use `color-mix(in srgb, $token N%, transparent|white)` — never a
  new literal.
- Theme-specific tweaks inside a module: `:global([data-theme='dark']) & { … }`.
- Brand/third-party hues (e.g. integration monograms) are passed as `--hue` and lifted in dark mode
  with `color-mix(in srgb, var(--hue) 55%, white)`.

---

## 4. Layout

```
┌──────────── frame (radius 20, shadow) ────────────┐
│ rail 13.5rem │ [secondary panel 14.5rem] │ main     │
│ brand        │ (Overview only, ≥1181px)  │ Page     │
│ primary nav  │                           │  header  │
│ ── divider   │                           │  KPIs    │
│ secondary    │                           │  panels  │
│ footer: Log out · Help · Dark mode switch           │
└────────────────────────────────────────────────────┘
```

- The frame floats with 24px padding only at ≥1280px; below that it is full-bleed.
- **Page container** (`layout/Page.tsx`): left-aligned, full width, padding 1.5rem 1.75rem.
  Never centre content in a narrow max-width column next to the sidebar.
- **Page anatomy:** `PageHeader` (title + one-line lead + actions on the right) → optional KPI row
  (4 stat tiles) → `split` grid (1.6fr / 1fr) or single `Panel` → list/table panel (`Panel flush`).
- **Grids:** KPI 4 → 2 columns; split 2 → 1; card grids 4 → 3 (<1280) → 2 (<1024) → 1 (<640).
- Nav items: 36px tall (44px on phone), icon 17px `lucide-react`, label, optional `Count` badge
  right-aligned. Active item = `$active` fill + inset 1px `$border`.
- **Alignment in a row.** A badge, `Count` or chip next to a label, icon or title sits on the
  same vertical centre: the row uses `align-items: center` (with `flex-wrap: wrap` if the badge can
  be long), never `flex-start` with a taller badge. The browser matrix fails when a pill is more
  than 2px off its neighbour (`e2e/alignment.ts`).
- **Groups of controls match.** Buttons side by side share `size` and icon treatment — either all
  carry an icon or none do. A field label sits above its control with a 0.375rem gap (`FormField`
  or `Input label`), never touching the input or its focus ring.
- **Hover details follow the pointer.** Details revealed by hovering a diagram node open as a
  floating card next to the cursor (flipping at the viewport edge) and next to the node on keyboard
  focus — not in a panel elsewhere on the page.

---

## 5. Responsive (mandatory for every screen)

Breakpoints in `src/styles/_breakpoints.scss` — use the mixins, never ad-hoc widths:

| Mixin | Range | Shell behaviour |
|---|---|---|
| `@include bp.phone` | < 640px | Top bar (menu · title · theme). Sidebar = off-canvas drawer (86vw, scrim, Esc closes, closes on navigation). |
| `@include bp.tablet` | 640–1023px | Sidebar collapses to 68px icon rail; counters become corner dots. |
| `@include bp.from-tablet` | ≥ 640px | Same shell as tablet/desktop; use for “everything that is not a phone”. |
| `@include bp.below-desktop` | < 1024px | Split grids stack; card rows may become swipe carousels (`scroll-snap`). |
| `@include bp.desktop` | ≥ 1024px | Full sidebar (user-collapsible). |

Phone rules:
- One column. Page actions stretch to full width (`flex: 1`).
- Tables are wrapped in `TableWrap` (horizontal scroll) **and** hide secondary columns with
  `.hideSm` / `.hideMd`. Keep: identity column, status, amount, row action.
- Modals and drawers open as **bottom sheets** (radius on top only, max 92vh).
- Toolbars wrap: search full width, filters on the next line; segmented controls scroll sideways.
- Respect safe areas: `env(safe-area-inset-top|bottom)` on top bar, drawer, toasts, sticky bars.
- Main area must not scroll horizontally — verify `document.documentElement.scrollWidth === innerWidth`.

---

## 6. Components (use these; don’t re-invent)

Import from `src/components/ui.tsx` and `src/components/primitives.tsx`.

| Need | Component | Notes |
|---|---|---|
| Action | `Button variant="primary|secondary|ghost|danger" size="sm|md" icon={…}` | One `primary` per view. `danger` = red outline, only for destructive. Icon-only buttons need `aria-label`. |
| Status / tag | `Count value tone` (solid pastel chip) or `Badge tone` | `Count` for statuses & counters, `Badge` for categories, “AI”, “Default”, “In use”. |
| Page title | `PageHeader title lead actions` | Lead is one sentence, no trailing period needed for counts (“4 unread”). |
| Section box | `Panel title description actions flush?` | `flush` when the body is a table/list that touches the edges. |
| Table | `<TableWrap><table className={tableClass}>…` | Numbers right-aligned (`s.num`), rows hover `$hover`, last row no border. |
| Text input | `FormField label hint>{(id) => <Input id={id} …/>}` | Always via `FormField` so label↔input are linked. |
| Select | `Select` (native, styled) | Native for accessibility & mobile pickers. |
| Search | `SearchBox value onChange placeholder shortcut?` | Optional `/` shortcut hint. |
| 2–5 mutually exclusive filters | `Segmented` | Inline filter in a toolbar or panel header. |
| Category tabs with counts | `PillTabs items={[{value,label,count}]}` | Grey track, white active pill. |
| On/off setting | `Switch label hideLabel?` | Always pass a `label` (use `hideLabel` when the row already shows text). |
| Checkbox with hint | `Checkbox label hint` | |
| Dialog | `Modal width="sm|md|lg" footer` | Footer: secondary “Cancel” left, primary action right. Esc + scrim click close. |
| Detail / side panel | `Drawer` | Row click → drawer with `dl` details and actions in the footer. |
| Feedback | `useApp().toast({ title, description, tone })` | After **every** mutation. `tone: 'success'|'danger'`. |
| Nothing to show | `Empty icon title` + a reset button | Never leave a blank panel. |
| Progress / quota | `Meter value max tone` | `warning` > 70%, `danger` > 85%. |
| Trend | `Sparkline data up` | Inside KPI tiles. |
| Person | `Avatar initials` | Pastel by initials. |
| Integration logo | `AppChip app` | Neutral monogram tiles — **never redraw third-party logos**. |

Charts: simple CSS/SVG bars and donuts (see `FinancePage.tsx`, `BarChart.tsx`). Primary series
`lavender`, comparison series `$bar`, highlight the max bar; tooltip via `title` or a hover chip.

---

## 7. Interaction patterns

- **List page:** search + `Segmented` filter in the panel toolbar; checkbox column enables a
  bulk bar (`accent-soft` strip: “N selected · actions · Clear”); row click opens a `Drawer`.
- **Forms:** keep a `saved` copy; when the draft differs show a sticky **save bar**
  (“You have unsaved changes · Discard · Save changes”). Disable submit until valid; show
  validation as `hint` text under the field, not alerts.
- **Destructive:** `danger` button; for irreversible ones confirm in a `Modal width="sm"`.
- **Async:** button shows a spinning `Loader2` + “Generating…”, disabled while running; result
  arrives as a toast and the row updates in place.
- **Counters in the sidebar** reflect live state (unread notifications, pending orders) — derive
  them from shared state (`lib/app.tsx`), never hard-code.
- **Keyboard:** `/` focuses the main search on list pages; Esc closes overlays; all interactive
  elements reachable by Tab with the global focus ring (`2px $sky`).

---

## 8. Copy

- Sentence case everywhere (“Create workflow”, not “Create Workflow”).
- Buttons are verbs: “Use template”, “Export CSV”, “Mark all as read”.
- Leads ≤ 1 sentence. Meta uses “·” as separator: “8 orders · $13,539.74”.
- Dates `Jul 12, 2026`; relative times for < 24h (“18m ago”). Money with currency symbol and
  thousands separators; counts ≥ 1000 shortened in compact spots (`2.2k`).
- Empty states: what happened + what to do (“No templates match — Try another category”).

---

## 9. Accessibility (part of done)

- Real `<button>`/`<a>`; `role="switch|radio|tab"` with `aria-checked`/`aria-selected` on custom
  controls; `aria-label` on icon-only buttons; `aria-current="page"` on the active nav link.
- Text contrast ≥ 4.5:1 in **both** themes — pastel chips always use `$ink` text; dark-hued
  monograms are lifted in dark mode.
- Modals: `role="dialog" aria-modal`, Esc closes, body scroll locked.
- Don’t convey meaning by colour alone: status chips always include the word.

---

## 10. Do / Don’t

| Do | Don’t |
|---|---|
| Use tokens (`$card`, `$border`, `$fg-muted`) | Hex/rgb literals in component styles |
| 1px `$border` to separate | Heavy shadows or gradients on cards |
| One blue primary per view | Multiple accent colours for buttons |
| Pastel `Count` for status | Saturated red/green blocks |
| Left-aligned full-width content | Centred narrow column with empty side gutters |
| Breakpoint mixins | Raw `@media (max-width: 713px)` |
| `lucide-react` icons, 14–17px, `aria-hidden` | Mixed icon sets, emoji as icons |
| Toast after each mutation | Silent state changes |
| Monogram chips for third-party apps | Copying brand logos |
| Badges centred on their label's line | Badges hanging below a label (`align-items: flex-start`) |

---

## 11. Definition of done (every UI change)

1. `npm run verify` passes (typecheck, lint, design lint, unit tests, build, browser matrix) with no
   new suppressions and no new warnings. It checks items 2–4 below for every route as it loads;
   anything behind a click (dialogs, drawers, forms) is still checked by hand or by a spec in `e2e/`.
2. Checked in **light and dark**.
3. Checked at **390px, 820px, 1440px** (and ≥1920px for full-width layouts): no horizontal page
   scroll, nothing clipped, menu reachable.
4. No console errors; every button does something visible (navigation, state change or toast).
5. New colours exist in both themes; new screens are linked from the sidebar and appear in
   `ALL_ROUTES` (document title).

---

## 12. Using Acme UI in another project

Copy these files (paths relative to this repo) — they have no dependencies beyond React,
`lucide-react` and `sass`:

```
src/styles/tokens.scss        # SCSS aliases → CSS variables
src/styles/globals.scss       # light/dark palettes, base styles, .spin
src/styles/_breakpoints.scss  # phone / tablet / desktop mixins
src/components/ui.tsx + ui.module.scss              # Button, Badge, Panel, Modal, Drawer, inputs…
src/components/primitives.tsx + primitives.module.scss  # Switch, Segmented, Count, Avatar…
src/lib/app.tsx               # theme pref + toasts (strip demo state you don’t need)
src/layout/Shell.* + Page.*   # sidebar shell, phone drawer, page container (optional)
```

Then:
1. `npm i lucide-react react-router-dom && npm i -D sass`.
2. Paste the theme bootstrap `<script>` from `index.html` into the new `index.html` `<head>`.
3. Import `styles/globals.scss` once in the entry file; wrap the app in `<AppProvider>` and render
   `<Toaster />` (Shell already does).
4. In each SCSS module: `@use '<rel>/styles/tokens' as *; @use '<rel>/styles/breakpoints' as bp;`.
5. `AppChip`/`content/templates.ts` are demo-specific — drop them or replace `APPS` with your own.
6. Rebrand by changing only token values in `globals.scss` (accent, surfaces). Keep token names.

No React? Port the tokens (§2) as CSS variables and follow §§1, 4–10; component names map 1:1 to
shadcn/ui (Button, Badge, Card→Panel, Dialog→Modal, Sheet→Drawer, Tabs→PillTabs,
ToggleGroup→Segmented, Switch, Checkbox, Select, Input, Table, Sonner→Toaster).
