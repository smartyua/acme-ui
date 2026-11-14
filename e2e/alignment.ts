import type { Page } from '@playwright/test';

/**
 * DESIGN.md §4: a badge, count or chip that shares a flex row with a label sits on the same
 * vertical centre. Returns one line per pill whose centre is more than `tolerance` px off a
 * single-line sibling (text or icon) on the same line. Large graphics (lines, charts) are ignored.
 */
export const findMisalignedPills = (page: Page, tolerance = 2) =>
  page.evaluate((tol) => {
    const SKIP = 'button, a, input, select, textarea, [role="switch"], [role="tab"], [role="radio"], svg';
    const isTransparent = (color: string) => color === 'transparent' || /rgba\(.*,\s*0\)$/.test(color);
    const isPill = (el: Element) => {
      if (el.matches(SKIP) || el.closest('button, a, svg')) return false;
      const cs = getComputedStyle(el);
      if (isTransparent(cs.backgroundColor) || parseFloat(cs.borderTopLeftRadius) < 3) return false;
      const r = el.getBoundingClientRect();
      return r.height >= 14 && r.height <= 32 && r.width > 0 && r.width < 280 && !!el.textContent?.trim();
    };
    const out = new Set<string>();
    for (const el of document.querySelectorAll('main *, [role="dialog"] *')) {
      if (!isPill(el) || !el.parentElement) continue;
      const pcs = getComputedStyle(el.parentElement);
      if (!pcs.display.includes('flex') || pcs.flexDirection !== 'row') continue;
      const r = el.getBoundingClientRect();
      const cy = r.top + r.height / 2;
      for (const sib of el.parentElement.children) {
        if (sib === el) continue;
        const isSvg = sib.tagName.toLowerCase() === 'svg';
        if (!sib.textContent?.trim() && !sib.querySelector('svg') && !isSvg) continue;
        const sr = sib.getBoundingClientRect();
        if (!sr.width || !sr.height || sr.height > r.height * 1.8) continue;
        if (isSvg && (sr.width > 28 || sr.height > 28)) continue;
        if (sr.bottom <= r.top || sr.top >= r.bottom) continue;
        const d = Math.abs(sr.top + sr.height / 2 - cy);
        if (d > tol) out.add(`${d.toFixed(1)}px off: "${el.textContent?.trim().slice(0, 30)}" beside "${sib.textContent?.trim().slice(0, 30)}"`);
      }
    }
    return [...out];
  }, tolerance);
