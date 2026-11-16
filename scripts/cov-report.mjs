#!/usr/bin/env node
// Where is coverage missing, biggest first? `npm run test:gaps` builds this from the Vitest
// json-summary, so a coverage conversation starts with the files that have the most uncovered
// statements instead of with a single percentage.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUMMARY = join(ROOT, 'coverage/coverage-summary.json');

if (!existsSync(SUMMARY)) {
  console.error('No coverage summary. Run `npm run test:gaps` (it runs Vitest itself).');
  process.exit(1);
}

const summary = JSON.parse(readFileSync(SUMMARY, 'utf8'));
const rows = Object.entries(summary)
  .filter(([file]) => file !== 'total' && file.includes('/src/'))
  .map(([file, v]) => ({
    file: file.split('/src/')[1],
    missing: v.statements.total - v.statements.covered,
    statements: v.statements.pct,
    branches: v.branches.pct,
    functions: v.functions.pct,
  }))
  .sort((a, b) => b.missing - a.missing);

const cell = (n, width) => `${n.toFixed(0)}%`.padStart(width + 1);
for (const r of rows.filter((r) => r.missing > 0)) {
  console.log(
    `${String(r.missing).padStart(4)} untested  ${cell(r.statements, 4)}stmts ${cell(r.branches, 4)}branch ${cell(r.functions, 4)}funcs  ${r.file}`,
  );
}

const clean = rows.filter((r) => r.missing === 0).length;
const total = rows.reduce((sum, r) => sum + r.missing, 0);
console.log(`\n${total} uncovered statements across ${rows.length - clean} files; ${clean} files are fully covered.`);
if (total === 0) console.log('Nothing left to cover.');
