// Visual regression: one viewport screenshot per route in every theme × viewport project.
// An unexpected diff is a design bug. An intended one is reviewed (see test-results/), then the
// baseline is refreshed with `npm run e2e:update` and the changed files are listed in the handoff.
import { ALL_ROUTES } from '../src/data';
import { expect, test } from './fixtures';

// Moving packets and ticking counters never repeat; the baseline is the paused picture.
test.use({ freezeLive: true });

for (const route of ALL_ROUTES) {
  test(`${route.path} matches its baseline`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot(`${route.path.slice(1)}.png`, { animations: 'disabled' });
  });
}
