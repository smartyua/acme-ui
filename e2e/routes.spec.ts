// DESIGN.md §11 for every route, in every theme × viewport project:
// renders, right title and theme, no errors, no sideways scroll, badges aligned, navigation reachable, no a11y violations.
import AxeBuilder from '@axe-core/playwright';

import { A11Y_KNOWN_DEBT } from './a11y-debt';
import { findMisalignedPills } from './alignment';
import { ROUTES, expect, test } from './fixtures';

for (const route of ROUTES) {
  test.describe(route.path, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('renders in the project theme with no errors', async ({ page, theme, problems }) => {
      await expect(page).toHaveTitle(`${route.label} · Acme`);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect(problems).toEqual([]);
    });

    test('does not scroll sideways', async ({ page }) => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'horizontal overflow in px (DESIGN.md §5)').toBeLessThanOrEqual(0);
    });

    test('keeps badges on the centre line of their row', async ({ page }) => {
      expect(await findMisalignedPills(page), 'badge vs label vertical centre (DESIGN.md §4)').toEqual([]);
    });

    test('keeps navigation reachable and marks the current page', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Workspace navigation' });
      const openMenu = page.getByRole('button', { name: 'Open menu' });
      if (await openMenu.isVisible()) await openMenu.click();
      const current = nav.locator('a[aria-current="page"]');
      await expect(current).toBeVisible();
      await expect(current).toContainText(route.label);
    });

    test('has no WCAG A/AA violations', async ({ page }) => {
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(A11Y_KNOWN_DEBT[route.path] ?? [])
        .analyze();
      const summary = violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`);
      expect(summary, 'axe violations (DESIGN.md §9)').toEqual([]);
    });
  });
}
