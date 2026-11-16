// The route table is declared in src/main.tsx. Specs read it from that source instead of keeping
// a copy, so a new screen is covered the day it gets routed and a stale list cannot pass quietly.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ComponentType } from 'react';

const modules = import.meta.glob('../src/pages/**/*.tsx');

export type Screen = {
  path: string;
  /** The component name as it appears in main.tsx. */
  name: string;
  module: string;
  exportName: string;
};

const source = readFileSync(resolve(process.cwd(), 'src/main.tsx'), 'utf8');

const lazyByName = new Map<string, { module: string; exportName: string }>(
  [...source.matchAll(/const (\w+) = lazy\(\(\) =>\s*\n?\s*import\('([^']+)'\)\.then\(\(m\) => \(\{ default: m\.(\w+) \}\)\)/g)].map(
    (match) => [match[1], { module: match[2], exportName: match[3] }],
  ),
);

const routesIn = (block: string): Screen[] =>
  [...block.matchAll(/<Route path="(\/[^"]*)" element=\{<(\w+) \/>\}/g)].flatMap((match) => {
    const target = lazyByName.get(match[2]);
    return target ? [{ path: match[1], name: match[2], ...target }] : [];
  });

const SHELL_OPEN = '<Route element={<Shell />}>';

/** Routes rendered inside the app shell (sidebar, toaster, logout modal). */
export const shellScreens: Screen[] = routesIn(source.slice(source.indexOf(SHELL_OPEN)));

/** Routes outside the shell — the signed-out card. */
export const standaloneScreens: Screen[] = routesIn(source.slice(0, source.indexOf(SHELL_OPEN)));

/** Every screen main.tsx lazy-loads, including the 404 behind the catch-all. */
export const allScreens: Screen[] = [...standaloneScreens, ...shellScreens].concat(
  [...lazyByName.entries()]
    .filter(([name]) => ![...standaloneScreens, ...shellScreens].some((s) => s.name === name))
    .map(([name, target]) => ({ path: '*', name, ...target })),
);

const loadModule = async (specifier: string): Promise<Record<string, unknown>> => {
  const key = `../src/${specifier.replace(/^\.\//, '')}.tsx`;
  const loader = modules[key];
  if (!loader) throw new Error(`src/main.tsx points at ${key}, which does not exist`);
  return (await loader()) as Record<string, unknown>;
};

/** Imports the page exactly as the router would, so a renamed export fails here, not in the browser. */
export const loadComponent = async (screen: Screen): Promise<ComponentType> => {
  const module = await loadModule(screen.module);
  const component = module[screen.exportName];
  if (typeof component !== 'function') throw new Error(`${screen.module} has no ${screen.exportName}`);
  return component as ComponentType;
};
