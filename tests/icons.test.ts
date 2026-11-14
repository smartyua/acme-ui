// @vitest-environment node
// Guards DESIGN.md §10 icon rules: lucide-react only, 14–18px, decorative icons hidden from AT.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = new URL('../src/', import.meta.url).pathname;
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.tsx') ? [path] : [];
  });

const files = walk(SRC).map((path) => ({ path: path.slice(SRC.length), text: readFileSync(path, 'utf8') }));

// Icon tags: everything imported from lucide-react plus the `const Icon = item.icon` alias pattern.
const iconTags = (text: string) => {
  const names = new Set(['Icon', 'Trend']);
  for (const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name && !name.startsWith('type ')) names.add(name);
    }
  }
  return [...text.matchAll(/<([A-Z]\w*)(\s[^<>]*?)?\/>/g)]
    .filter((m) => names.has(m[1]))
    .map((m) => ({ tag: m[0], attrs: m[2] ?? '', line: text.slice(0, m.index).split('\n').length }));
};

describe('icons', () => {
  it('uses lucide sizes from the 14–18px scale', () => {
    const bad = files.flatMap(({ path, text }) =>
      iconTags(text)
        .filter(({ attrs }) => {
          const size = attrs.match(/size=\{(\d+)\}/)?.[1];
          return size !== undefined && (Number(size) < 14 || Number(size) > 18);
        })
        .map(({ tag, line }) => `${path}:${line} ${tag}`),
    );
    expect(bad).toEqual([]);
  });

  it('hides decorative icons from assistive tech', () => {
    const bad = files.flatMap(({ path, text }) =>
      iconTags(text)
        .filter(({ attrs }) => !/aria-hidden|aria-label/.test(attrs))
        .map(({ tag, line }) => `${path}:${line} ${tag}`),
    );
    expect(bad).toEqual([]);
  });

  it('never hand-draws an icon or spinner in svg', () => {
    // Inline <svg> is for charts and diagrams only; glyphs come from lucide-react.
    const bad = files
      .filter(({ text }) => /<svg[^>]*viewBox="0 0 (24 24|15 15)"/.test(text))
      .map(({ path }) => path);
    expect(bad).toEqual([]);
  });

  it('spins loaders with the global .spin class only', () => {
    const bad = files
      .filter(({ text }) => /styles\.spin\b/.test(text))
      .map(({ path }) => path);
    expect(bad).toEqual([]);
  });
});
