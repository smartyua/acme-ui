import { test as base, expect } from '@playwright/test';

import { ALL_ROUTES } from '../src/data';

export { expect };
export const ROUTES = ALL_ROUTES.map(({ path, label }) => ({ path, label }));

type Fixtures = {
  /** Theme of the current project (`light` | `dark`), already applied before the app boots. */
  theme: 'light' | 'dark';
  /** Console errors, uncaught exceptions and failed requests seen so far. Must stay empty. */
  problems: string[];
};

type Options = {
  /**
   * Start live simulations paused (the app's own remembered "Pause"), so a screenshot shows the
   * same frame on every run. Off by default: the other specs exercise the running screen.
   */
  freezeLive: boolean;
};

export const test = base.extend<Fixtures & Options>({
  freezeLive: [false, { option: true }],

  theme: async ({ colorScheme }, use) => {
    await use(colorScheme === 'dark' ? 'dark' : 'light');
  },

  // Auto fixture: pins theme and time so every run renders the same pixels.
  page: async ({ page, theme, freezeLive }, use) => {
    await page.addInitScript((value) => localStorage.setItem('axon:theme', value), theme);
    if (freezeLive) await page.addInitScript(() => localStorage.setItem('topology-flow-motion', 'off'));
    await page.clock.setFixedTime(new Date('2026-07-12T10:00:00Z'));
    await use(page);
  },

  problems: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') problems.push(`console: ${message.text()}`);
      });
      page.on('pageerror', (error) => problems.push(`exception: ${error.message}`));
      page.on('requestfailed', (request) => problems.push(`request failed: ${request.url()}`));
      page.on('response', (response) => {
        if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
      });
      await use(problems);
    },
    { auto: true },
  ],
});
