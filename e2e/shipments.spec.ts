import AxeBuilder from '@axe-core/playwright';

import { findMisalignedPills } from './alignment';
import { expect, test } from './fixtures';

test.describe('/shipments route view', () => {
  test('switches to Route map & timeline cleanly with no a11y or layout issues', async ({
    page,
    problems,
  }) => {
    await page.goto('/shipments');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('VEN-26-1946');

    await page.getByRole('radio', { name: 'Route' }).click();
    await expect(page.getByText('136 km')).toBeVisible();
    await expect(
      page
        .getByRole('list', { name: 'Shipment route milestones' })
        .getByRole('button', { name: /Peak reading/ }),
    ).toHaveAttribute('aria-current', 'step');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(await findMisalignedPills(page)).toEqual([]);
    expect(problems).toEqual([]);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`),
    ).toEqual([]);

    await expect(page).toHaveScreenshot('shipments-route.png', { animations: 'disabled' });
  });
});
