// axe rules that already failed when the gate was introduced (2026-11-14), per route.
// They are switched off for those routes only, so the gate stays green and every other
// route × rule stays strict. This list must only shrink: fix the screen, delete the entry.
// New screens never get an entry.
export const A11Y_KNOWN_DEBT: Record<string, string[]> = {
  // color-contrast: DESIGN.md §9 asks for ≥ 4.5:1 in both themes (mostly $fg-faint / $fg-muted text).
  '/overview': ['color-contrast'],
  '/templates': ['color-contrast', 'label-content-name-mismatch'],
  '/orders': ['color-contrast'],
  '/customers': ['color-contrast'],
  '/payments': ['color-contrast'],
  '/notifications': ['color-contrast', 'aria-prohibited-attr'],
};
