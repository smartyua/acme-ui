// The estimate card the Estimates screen stacks: a client button, a status pill, an optional
// billing grid, a breakdown bar and one CTA — every click routed to the parent.
import { describe, expect, it, vi } from 'vitest';

import {
  ESTIMATE_STATUS_LABEL,
  EstimateCard,
  formatEstimateCurrency,
  type Estimate,
} from './EstimateCard';
import { click, mount } from '../test/harness';

const bare = { app: false } as const;

const estimate = (over: Partial<Estimate> = {}): Estimate => ({
  id: 'e-1',
  client: 'Northwind Labs',
  project: 'Atlas rollout',
  code: 'EST-204',
  date: '12 Oct 2026',
  period: 'sep-oct',
  status: 'accepted',
  total: 48200,
  invoiced: 24000,
  toBeInvoiced: 12000,
  paid: 18000,
  due: 6000,
  items: [
    { id: 'i1', label: 'Discovery workshop', amount: 9800, status: 'paid' },
    { id: 'i2', label: 'Design system', amount: 22000, status: 'pending' },
    { id: 'i3', label: 'On-call buffer', amount: 6400, status: 'unbilled' },
  ],
  ctaLabel: 'Create invoice',
  ...over,
});

describe('formatEstimateCurrency', () => {
  it('prints zero plainly and everything else in dollars and cents', () => {
    expect(formatEstimateCurrency(0)).toBe('$0');
    expect(formatEstimateCurrency(1234.5)).toBe('$1,234.50');
    expect(formatEstimateCurrency(48200)).toBe('$48,200.00');
  });
});

describe('EstimateCard', () => {
  it('routes the client, the CTA and the overflow button to the parent', () => {
    const onSelect = vi.fn();
    const onAction = vi.fn();
    const onMore = vi.fn();
    const est = estimate();
    const screen = mount(<EstimateCard estimate={est} onSelect={onSelect} onAction={onAction} onMore={onMore} />, bare);

    click(screen.findByText('button', 'Northwind Labs'));
    expect(onSelect).toHaveBeenCalledWith(est);

    click(screen.findByText('button', 'Create invoice'));
    expect(onAction).toHaveBeenCalledWith(est);

    const more = screen.find('[aria-label="Options for Northwind Labs EST-204"]');
    click(more);
    expect(onMore).toHaveBeenCalledWith(est);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('falls the overflow button back onto select when no handler was given', () => {
    const onSelect = vi.fn();
    const onAction = vi.fn();
    const est = estimate();
    const screen = mount(<EstimateCard estimate={est} onSelect={onSelect} onAction={onAction} />, bare);
    click(screen.find('[aria-label="Options for Northwind Labs EST-204"]'));
    expect(onSelect).toHaveBeenCalledWith(est);
  });

  it('shows the billing grid only once money started moving', () => {
    const withBilling = mount(
      <EstimateCard estimate={estimate()} onSelect={() => {}} onAction={() => {}} />,
      bare,
    );
    expect(withBilling.text).toContain('Total invoiced');
    expect(withBilling.text).toContain('To be invoiced');
    expect(withBilling.text).toContain('$24,000.00');
    expect(withBilling.text).toContain('$6,000.00');

    const draft = mount(
      <EstimateCard estimate={estimate({ status: 'draft', invoiced: 0 })} onSelect={() => {}} onAction={() => {}} />,
      bare,
    );
    expect(draft.text).not.toContain('Total invoiced');

    // The draft is barred from the grid even when the flag asks for it;
    // a non-draft with nothing invoiced yet gets it from the flag.
    const forced = mount(
      <EstimateCard
        estimate={estimate({ status: 'draft', invoiced: 0, showBillingGrid: true })}
        onSelect={() => {}}
        onAction={() => {}}
      />,
      bare,
    );
    expect(forced.text).not.toContain('Total invoiced');

    const flagged = mount(
      <EstimateCard
        estimate={estimate({ invoiced: 0, showBillingGrid: true })}
        onSelect={() => {}}
        onAction={() => {}}
      />,
      bare,
    );
    expect(flagged.text).toContain('Total invoiced');
  });

  it('names each status pill with its own label and icon', () => {
    const seen: string[][] = [];
    (Object.keys(ESTIMATE_STATUS_LABEL) as Array<keyof typeof ESTIMATE_STATUS_LABEL>).forEach((status) => {
      const screen = mount(
        <EstimateCard estimate={estimate({ status })} onSelect={() => {}} onAction={() => {}} />,
        bare,
      );
      const pill = screen.findByText('span', ESTIMATE_STATUS_LABEL[status]);
      expect(pill.querySelector('svg')).toBeTruthy();
      seen.push(Array.from(pill.classList));
    });
    // Every status looks different.
    expect(new Set(seen.map((classes) => classes.join(' '))).size).toBe(seen.length);
  });

  it('breaks the estimate down into one row per item with its money and badge', () => {
    const screen = mount(
      <EstimateCard estimate={estimate()} onSelect={() => {}} onAction={() => {}} />,
      bare,
    );
    const rows = screen.findAll('li');
    expect(rows).toHaveLength(3);
    expect(screen.text).toContain('Discovery workshop');
    expect(screen.text).toContain('$9,800.00');
    // Paid and pending items carry a badge; the unbilled one stays quiet.
    expect(screen.text).toContain('Paid');
    expect(screen.text).toContain('Pending');
    const unbilled = rows[2];
    expect(unbilled.textContent).toContain('On-call buffer');
    expect(unbilled.textContent).not.toContain('Paid');
    // The segmented bar is one inline-sized stretch per item, hidden from readers.
    const segments = screen.findAll('[style]');
    expect(segments).toHaveLength(3);
    expect(segments.every((s) => s.getAttribute('style')?.includes('flex-grow'))).toBe(true);
  });

  it('skips the breakdown entirely when there is nothing in it', () => {
    const screen = mount(
      <EstimateCard estimate={estimate({ items: [] })} onSelect={() => {}} onAction={() => {}} />,
      bare,
    );
    expect(screen.text).not.toContain('Estimate breakdown');
    expect(screen.findAll('li')).toEqual([]);
  });
});
