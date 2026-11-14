import { existsSync } from 'node:fs';
import { createServer, type AddressInfo } from 'node:net';
import { defineConfig } from '@playwright/test';

// DESIGN.md §11 matrix: both themes × three viewports. Every spec runs in all six projects.
const THEMES = ['light', 'dark'] as const;
const VIEWPORTS = { 390: 844, 820: 1180, 1440: 900 } as const;

// Each run serves this checkout on its own free port, so parallel agents and git worktrees
// never test each other's code (and never the dev server on :5180).
const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => resolve(port));
    });
  });
process.env.E2E_PORT ??= String(await freePort());
const baseURL = `http://127.0.0.1:${process.env.E2E_PORT}`;

// Screenshot baselines are per platform (fonts and anti-aliasing differ). CI compares them only
// when baselines for its platform are committed. A missing baseline fails every run until someone
// reviews the screen and writes it with `npm run e2e:update` — it is never recorded silently.
const SNAPSHOTS = 'e2e/__screenshots__';
const ignoreSnapshots = Boolean(process.env.CI) && !existsSync(`${SNAPSHOTS}/${process.platform}`);

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  snapshotPathTemplate: `${SNAPSHOTS}/{platform}/{projectName}/{arg}{ext}`,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  ignoreSnapshots,
  updateSnapshots: 'none',
  use: {
    baseURL,
    locale: 'en-US',
    timezoneId: 'UTC',
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: THEMES.flatMap((theme) =>
    Object.entries(VIEWPORTS).map(([width, height]) => ({
      name: `${theme}-${width}`,
      use: { colorScheme: theme, viewport: { width: Number(width), height } },
    })),
  ),
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${process.env.E2E_PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    env: { BROWSER: 'none' },
  },
});
