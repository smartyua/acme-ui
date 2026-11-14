#!/usr/bin/env node
// Stop hook for coding agents (wired in .claude/settings.json, which Cursor, Claude Code and
// Empryo all read). When an agent ends a turn with uncommitted code changes, this runs the
// quality gate (`npm run check` → `build` → `e2e`). If a stage fails, the agent is sent back to
// fix it instead of reporting the work as done.
//
// - Skips when nothing relevant changed since the last green run (fingerprint of the changes).
// - Sends the agent back at most MAX_ROUNDS times in a row, then lets it stop and says so.
// - AGENT_GATE=off disables it. Last result: node_modules/.cache/agent-gate.json
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATE_FILE = join(ROOT, 'node_modules/.cache/agent-gate.json');
const STAGES = ['check', 'build', 'e2e'];
const MAX_ROUNDS = 3;
const ROUNDS_EXPIRE_MS = 15 * 60 * 1000;
// Changes outside these paths (docs, agent prompts) cannot break the gate.
const WATCHED = [
  'src', 'e2e', 'tests', 'scripts', 'index.html', 'package.json', 'package-lock.json',
  '*.config.js', '*.config.ts', 'tsconfig*.json', '*-suppressions.json',
];

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const list = (...args) => git(...args, '-z', '--', ...WATCHED).split('\0').filter(Boolean);

const readJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

/** Hash of HEAD plus every uncommitted file under WATCHED; null when the tree is clean there. */
const fingerprint = () => {
  const changed = new Set([
    ...list('ls-files', '--modified', '--deleted', '--others', '--exclude-standard'),
    ...list('diff', '--cached', '--name-only', 'HEAD'),
  ]);
  if (changed.size === 0) return null;
  const hash = createHash('sha256').update(git('rev-parse', 'HEAD'));
  for (const path of [...changed].sort()) {
    const file = join(ROOT, path);
    hash.update(path).update(existsSync(file) ? readFileSync(file) : 'deleted');
  }
  return hash.digest('hex');
};

const run = (stage) => {
  // Playwright forces colour in its workers; with NO_COLOR also set, node floods stderr with warnings.
  const { NO_COLOR: _noColor, ...env } = process.env;
  const result = spawnSync('npm', ['run', '--silent', stage], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...env, PATH: `${dirname(process.execPath)}:${process.env.PATH}` },
  });
  // stdout last: that is where the tools print their failure summary.
  const output = `${result.error?.message ?? ''}\n${result.stderr ?? ''}\n${result.stdout ?? ''}`;
  return { ok: result.status === 0, output: stripVTControlCharacters(output) };
};

const main = () => {
  if (process.env.AGENT_GATE === 'off') return;
  const input = readJson(readFileSync(0, 'utf8'));
  if (input.status === 'aborted' || input.status === 'error') return;

  const current = fingerprint();
  const state = existsSync(STATE_FILE) ? readJson(readFileSync(STATE_FILE, 'utf8')) : {};
  if (current === null) return;

  const started = Date.now();
  let failure = null;
  // A tree identical to the last green run is green; anything else runs the stages.
  if (current !== state.passed) {
    for (const stage of STAGES) {
      const { ok, output } = run(stage);
      if (!ok) {
        failure = { stage, output: output.trim().split('\n').slice(-60).join('\n') };
        break;
      }
    }
  }

  const stale = Date.now() - (state.at ?? 0) > ROUNDS_EXPIRE_MS;
  const rounds = failure ? (stale ? 0 : (state.rounds ?? 0)) + 1 : 0;
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(
    STATE_FILE,
    JSON.stringify(
      {
        passed: failure ? state.passed : current,
        result: failure ? `failed: npm run ${failure.stage}` : 'passed',
        rounds,
        at: Date.now(),
        seconds: Math.round((Date.now() - started) / 1000),
      },
      null,
      2,
    ),
  );
  if (!failure) return;

  const headline = `Quality gate failed at \`npm run ${failure.stage}\``;
  if (rounds > MAX_ROUNDS) {
    // Stop looping, but make sure neither the agent nor the user mistakes this for a pass.
    const note = `${headline} ${rounds} times in a row — the gate is still RED. Run \`npm run verify\`.`;
    process.stdout.write(JSON.stringify({ systemMessage: note }));
    process.stderr.write(`${note}\n`);
    return;
  }
  const reason = [
    `${headline} (round ${rounds}/${MAX_ROUNDS}). The work is not done until \`npm run verify\` passes.`,
    'Fix the cause. Do not weaken the gate: no new lint suppressions, no skipped or deleted tests, no new',
    'entries in e2e/a11y-debt.ts, and no `npm run e2e:update` to hide a visual diff you did not intend.',
    'If a visual diff is intended, review it in test-results/, then update the baselines and say which changed.',
    '',
    failure.output,
  ].join('\n');
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
};

main();
