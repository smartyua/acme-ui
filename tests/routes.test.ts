// @vitest-environment node
// Guards AGENTS.md rule 7 / DESIGN.md §11.5: every screen is routed, in the sidebar and in ALL_ROUTES.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { ALL_ROUTES, RAIL_PRIMARY, RAIL_SECONDARY } from '../src/data';

const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');

// Routes declared inside the <Shell> layout in main.tsx (the catch-all is not a screen).
const shellRoutes = [...main.slice(main.indexOf('<Route element={<Shell />}>')).matchAll(/<Route path="(\/[^"*]*)"/g)]
  .map((m) => m[1])
  .sort();

describe('route wiring', () => {
  const listed = ALL_ROUTES.map((r) => r.path).sort();

  it('lists every Shell route in ALL_ROUTES and nothing else', () => {
    expect(shellRoutes.length).toBeGreaterThan(0);
    expect(listed).toEqual(shellRoutes);
  });

  it('includes every sidebar item in ALL_ROUTES', () => {
    const rail = [...RAIL_PRIMARY, ...RAIL_SECONDARY].map((r) => r.path);
    expect(rail.filter((p) => !listed.includes(p))).toEqual([]);
  });

  it('has unique paths and non-empty labels', () => {
    expect(new Set(listed).size).toBe(listed.length);
    expect(ALL_ROUTES.filter((r) => !r.label.trim())).toEqual([]);
  });
});
