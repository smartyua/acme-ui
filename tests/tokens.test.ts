// @vitest-environment node
// Guards DESIGN.md §3: every colour token exists in both themes and has an SCSS alias.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../src/styles/${path}`, import.meta.url), 'utf8');
const globals = read('globals.scss');
const tokens = read('tokens.scss');

const themeVars = (theme: 'light' | 'dark') => {
  const start = globals.indexOf(`:root[data-theme='${theme}']`);
  if (start < 0) throw new Error(`No ${theme} theme block in globals.scss`);
  const body = globals.slice(globals.indexOf('{', start) + 1, globals.indexOf('}', start));
  return [...body.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]).sort();
};

const aliases = [...tokens.matchAll(/^\$[\w-]+:\s*var\((--[\w-]+)\)/gm)].map((m) => m[1]).sort();

describe('theme tokens', () => {
  const light = themeVars('light');
  const dark = themeVars('dark');

  it('defines the same variables in the light and dark themes', () => {
    expect(light.length).toBeGreaterThan(0);
    expect(light).toEqual(dark);
  });

  it('has an SCSS alias in tokens.scss for every theme variable', () => {
    expect(light.filter((v) => !aliases.includes(v))).toEqual([]);
  });

  it('has no SCSS alias pointing at an undefined variable', () => {
    expect(aliases.filter((v) => !light.includes(v))).toEqual([]);
  });
});
