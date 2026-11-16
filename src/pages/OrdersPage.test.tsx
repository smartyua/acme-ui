// The pattern for screen-level specs: drive the page through the app context exactly like a user
// does — filter, search, select, act — and assert what the user gets back (rows, a drawer, a
// toast). Every screen in the matrix already mounts (tests/screens-render.test.tsx); this is what
// happens after the first click.
import { describe, expect, it } from 'vitest';

import { STATUS_META, TRANSACTIONS } from '../data';
import { OrdersPage } from './OrdersPage';
import { Toaster } from '../components/ui';
import { click, flush, mount, typeText } from '../test/harness';

// The shell mounts the Toaster for every screen, so a screen spec mounts the same pair.
const open = () => mount(
  <>
    <OrdersPage />
    <Toaster />
  </>,
);
const rows = () => Array.from(document.querySelectorAll('tbody tr'));
const rowFor = (id: string) => {
  const row = rows().find((r) => r.textContent?.includes(id));
  if (!row) throw new Error(`no row for ${id}`);
  return row as HTMLElement;
};
const checkboxIn = (scope: Element) => scope.querySelector('input[type="checkbox"]') as HTMLInputElement;
const searchInput = () => document.querySelector('input[aria-label]') as HTMLInputElement;
const checkedRadio = () => document.querySelector('[role="radiogroup"] [aria-checked="true"]') as HTMLElement;
const statButton = (label: string) => {
  const button = Array.from(document.querySelectorAll('thead ~ * button, .kpis button, button')).find(
    (b) => b.querySelector('span')?.textContent === label,
  );
  if (!button) throw new Error(`no stat button for ${label}`);
  return button as HTMLElement;
};
const toaster = () => Array.from(document.querySelectorAll('[role="status"]')).map((t) => t.textContent ?? '');

const pending = () => TRANSACTIONS.filter((t) => t.status === 'pending');
const firstPending = () => pending()[0];

describe('the orders table', () => {
  it('shows every transaction with its status', () => {
    const screen = open();
    expect(screen.find('h1').textContent).toBe('Orders');
    expect(rows()).toHaveLength(TRANSACTIONS.length);
    expect(screen.text).toContain(firstPending().customer);
    expect(screen.findByText('td', STATUS_META[firstPending().status].label)).toBeTruthy();
  });

  it('filters by the status tiles and says which one is on', () => {
    const screen = open();
    const button = statButton(STATUS_META.pending.label);
    expect(button.getAttribute('aria-pressed')).toBe('false');

    click(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(rows()).toHaveLength(pending().length);
    expect(rows().every((r) => r.textContent?.includes(STATUS_META.pending.label))).toBe(true);
    expect(screen.findByText('p', `${pending().length} orders`).textContent).toContain(`${pending().length} orders`);
  });

  it('filters by the segmented control too', () => {
    const screen = open();
    const refunded = TRANSACTIONS.filter((t) => t.status === 'refunded');
    click(screen.findByText('[role="radio"]', 'Refunded'));
    expect(checkedRadio().textContent).toContain('Refunded');
    expect(rows()).toHaveLength(refunded.length);
  });

  it('searches across customer, email and order id', () => {
    const screen = open();
    const target = TRANSACTIONS[0];
    typeText(searchInput(), target.email);
    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toContain(target.customer);

    typeText(searchInput(), target.id);
    expect(rows()).toHaveLength(1);

    typeText(searchInput(), 'no-such-customer');
    expect(screen.text).toContain('No orders found');
    expect(rows()).toEqual([]);

    typeText(searchInput(), '');
    expect(rows()).toHaveLength(TRANSACTIONS.length);
  });
});

describe('selecting orders', () => {
  it('opens the order when the row is clicked, without selecting it', () => {
    const screen = open();
    click(rowFor(firstPending().id));
    expect(screen.find('[role="dialog"]').getAttribute('aria-label')).toBe(`Order ${firstPending().id}`);
    expect(checkboxIn(rowFor(firstPending().id)).checked).toBe(false);
  });

  it('selects without opening the order', () => {
    const screen = open();
    click(checkboxIn(rowFor(firstPending().id)));
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(screen.text).toContain('1 selected');
  });

  it('selects and clears every visible row at once', () => {
    const screen = open();
    const selectAll = checkboxIn(screen.find('thead'));
    click(selectAll);
    expect(screen.text).toContain(`${TRANSACTIONS.length} selected`);
    expect(rows().every((r) => (r.querySelector('input') as HTMLInputElement).checked)).toBe(true);

    click(checkboxIn(screen.find('thead')));
    expect(screen.findAll('tbody input:checked')).toEqual([]);
    expect(screen.text).not.toContain('selected');
  });

  it('drops the selection when the filter changes', () => {
    const screen = open();
    click(checkboxIn(screen.find('thead')));
    expect(screen.text).toContain(`${TRANSACTIONS.length} selected`);

    click(statButton(STATUS_META.pending.label));
    expect(screen.findAll('.bulkBar, [class*="bulkBar"]')).toEqual([]);
    expect(rows()).toHaveLength(pending().length);
  });
});

describe('acting on orders', () => {
  it('refunds a selection and tells the user what happened', async () => {
    const screen = open();
    click(checkboxIn(screen.find('thead')));
    click(screen.findByText('button', 'Refund'));
    await flush();

    const refundedBefore = TRANSACTIONS.filter((t) => t.status === 'refunded').length;
    expect(toaster().join(' ')).toContain('Refund issued');
    expect(toaster().join(' ')).toContain(`${TRANSACTIONS.length} orders updated`);
    expect(screen.findAll('[class*="bulkBar"]')).toEqual([]);

    click(statButton(STATUS_META.refunded.label));
    await flush();
    expect(rows()).toHaveLength(refundedBefore + TRANSACTIONS.length);
  });

  it('marks a selection completed', async () => {
    const screen = open();
    click(checkboxIn(rowFor(firstPending().id)));
    click(screen.findByText('button', 'Mark completed'));
    await flush();
    expect(toaster().join(' ')).toContain('Marked as completed');
    expect(rowFor(firstPending().id).textContent).toContain(STATUS_META.completed.label);
  });

  it('clears the selection without touching the orders', () => {
    const screen = open();
    click(checkboxIn(rowFor(firstPending().id)));
    click(screen.findByText('button', 'Clear'));
    expect(screen.text).not.toContain('selected');
    expect(rows()).toHaveLength(TRANSACTIONS.length);
    expect(toaster()).toEqual([]);
  });

  it('refunds from the drawer and closes it', async () => {
    const screen = open();
    const order = firstPending();
    click(rowFor(order.id));
    click(screen.findByText('button', 'Refund'));
    await flush();

    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(toaster().join(' ')).toContain('Refund issued');
    expect(toaster().join(' ')).toContain(order.customer);
    expect(rowFor(order.id).textContent).toContain(STATUS_META.refunded.label);
  });

  it('marks one order completed from the drawer', async () => {
    const screen = open();
    const order = firstPending();
    click(rowFor(order.id));
    click(screen.findByText('button', 'Mark completed'));
    await flush();
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(rowFor(order.id).textContent).toContain(STATUS_META.completed.label);
  });

  it('offers no money actions on an order that is already refunded', () => {
    const screen = open();
    const refunded = TRANSACTIONS.find((t) => t.status === 'refunded');
    if (!refunded) return;
    click(rowFor(refunded.id));
    expect(screen.findAll('[role="dialog"] footer button')).toEqual([]);
  });

  it('exports whatever is on screen', async () => {
    const screen = open();
    click(screen.findByText('button', 'Export CSV'));
    await flush();
    expect(toaster().join(' ')).toContain(`${TRANSACTIONS.length} orders will download as CSV`);

    click(statButton(STATUS_META.failed.label));
    const failed = TRANSACTIONS.filter((t) => t.status === 'failed').length;
    click(screen.findByText('button', 'Export CSV'));
    await flush();
    expect(toaster().join(' ')).toContain(`${failed} orders will download as CSV`);
  });
});
