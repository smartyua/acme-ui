// The browser matrix (e2e/) proves pixels; this proves the same routes mount at all. Every screen
// main.tsx routes is rendered inside the real shell in jsdom and has to arrive without React
// complaining once — no key warnings, no invalid nesting, no act() leaks.
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ALL_ROUTES } from '../src/data';
import { Shell } from '../src/layout/Shell';
import { flush, mountCleanly, watchConsole } from '../src/test/harness';
import { loadComponent, shellScreens, standaloneScreens } from './route-table';

const labelFor = (path: string) => ALL_ROUTES.find((r) => r.path === path)?.label;

const allRouted = [...shellScreens, ...standaloneScreens];

const screenOf = (path: string) => {
  const found = allRouted.find((s) => s.path === path);
  if (!found) throw new Error(`${path} is not in the route table`);
  return found;
};

/** Mounts one screen the way the router does, with the shell around it. */
const openScreen = async (path: string, { withShell = true } = {}) => {
  const Page = await loadComponent(screenOf(path));
  const tree = withShell ? (
    <Routes>
      <Route element={<Shell />}>
        <Route path={path} element={<Page />} />
      </Route>
    </Routes>
  ) : (
    <Page />
  );
  const screen = mountCleanly(tree, { route: path });
  await flush();
  return screen;
};

const RAIL = 'nav[aria-label="Workspace navigation"]';

describe('every routed screen', () => {
  it.each(shellScreens)('mounts $path inside the shell', async ({ path }) => {
    const screen = await openScreen(path);

    const headings = screen.findAll('h1');
    expect(headings, `${path} renders exactly one title`).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBeTruthy();
    expect(screen.text.length).toBeGreaterThan(200);
    expect(screen.findAll(RAIL)).toHaveLength(1);
    expect(document.title).toBe(`${labelFor(path)} · Acme`);
  });

  it.each(standaloneScreens)('keeps $path outside the shell', async ({ path }) => {
    document.title = '';
    const screen = await openScreen(path, { withShell: false });
    expect(screen.findAll(RAIL)).toEqual([]);
    expect(screen.text).toContain('signed out');
    expect(document.title).toBe('');
  });

  it('routes every screen in the sidebar', () => {
    // A screen in ALL_ROUTES that main.tsx stopped routing would silently drop out of the matrix.
    expect(shellScreens.map((s) => s.path).sort()).toEqual(ALL_ROUTES.map((r) => r.path).sort());
  });
});

describe('the shell around them', () => {
  it('unmounts without leaving work behind', async () => {
    const screen = await openScreen('/overview');
    const watch = watchConsole();
    screen.unmount();
    expect([...watch.errors(), ...watch.warnings()]).toEqual([]);
    watch.restore();
  });
});
