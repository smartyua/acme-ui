// The Overview sidebar: metric search, collapsible groups, status counters and the nav buttons.
// Everything asserted through roles and text — clicks are what a person actually does here.
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { KPIS, REPORTS, STATUS_META, TRANSACTIONS, type TimeRange, type TxStatus } from '../data';
import { ListPanel } from './Sidebar';
import { click, mount as harnessMount, press, typeText, type Screen } from '../test/harness';

const PanelHost = ({
  onRange = () => {},
  onSelectKpi = () => {},
  onStatus = () => {},
}: {
  onRange?: (r: TimeRange) => void;
  onSelectKpi?: (id: string) => void;
  onStatus?: (s: TxStatus | 'all') => void;
}) => {
  const [range, setRange] = useState<TimeRange>('7d');
  const [selectedKpi, setSelectedKpi] = useState(KPIS[0].id);
  const [status, setStatus] = useState<TxStatus | 'all'>('all');
  return (
    <>
      <ListPanel
        range={range}
        onRange={(r) => {
          setRange(r);
          onRange(r);
        }}
        selectedKpi={selectedKpi}
        onSelectKpi={(id) => {
          setSelectedKpi(id);
          onSelectKpi(id);
        }}
        status={status}
        onStatus={(s) => {
          setStatus(s);
          onStatus(s);
        }}
      />
      <span data-slot="path">{useLocation().pathname}</span>
    </>
  );
};

const mountPanel = (props: Partial<Parameters<typeof PanelHost>[0]> = {}): Screen =>
  harnessMount(<PanelHost {...props} />, { route: '/overview' });

describe('ListPanel', () => {
  it('moves the time range and tells the page', () => {
    const onRange = vi.fn();
    const screen = mountPanel({ onRange });
    const group = screen.find('[role="radiogroup"][aria-label="Time range"]');
    const radios = Array.from(group.querySelectorAll('button'));
    expect(radios.find((r) => r.getAttribute('aria-checked') === 'true')?.textContent).toBe('7d');

    click(radios[2]);
    expect(onRange).toHaveBeenCalledWith('30d');
    expect(radios.find((r) => r.getAttribute('aria-checked') === 'true')?.textContent).toBe('30d');
  });

  it('filters the metric tree as you type and says so when nothing matches', () => {
    const screen = mountPanel();
    const search = screen.find<HTMLInputElement>('input');
    // Only the “Key metrics” group holds the KPI rows; the other groups have their own li buttons.
    const metricsGroup = screen.findByText('button', 'Key metrics').parentElement as HTMLElement;
    const names = () => Array.from(metricsGroup.querySelectorAll('li button'));
    const before = names().length;
    expect(before).toBe(KPIS.length);

    typeText(search, KPIS[1].title.toLowerCase());
    expect(names()).toHaveLength(1);
    expect(names()[0].textContent).toContain(KPIS[1].title);

    typeText(search, 'zzzz-nothing');
    expect(names()).toEqual([]);
    expect(screen.text).toContain('No metrics match');
  });

  it('jumps to the metric search on the ⌘K shortcut', () => {
    const screen = mountPanel();
    const search = screen.find<HTMLInputElement>('input');
    expect(document.activeElement).not.toBe(search);

    press('k', document, { metaKey: true });
    expect(document.activeElement).toBe(search);

    // While a dialog is open the shortcut must not steal focus from it.
    const blocker = document.createElement('div');
    blocker.setAttribute('role', 'dialog');
    document.body.append(blocker);
    search.blur();
    press('k', document, { metaKey: true });
    expect(document.activeElement).not.toBe(search);
    blocker.remove();
  });

  it('selects a metric and swaps its counter for the change tag', () => {
    const onSelectKpi = vi.fn();
    const screen = mountPanel({ onSelectKpi });
    const [first, second] = screen.findAll('[aria-label="Overview sections"] li button');
    click(second);
    expect(onSelectKpi).toHaveBeenCalledWith(KPIS[1].id);

    const selected = screen.findByText('li button', KPIS[1].title);
    expect(selected.textContent).toContain(KPIS[1].change);
    expect(first.textContent).not.toContain(KPIS[0].change);
  });

  it('counts transactions per status and reports the picked one', () => {
    const onStatus = vi.fn();
    const screen = mountPanel({ onStatus });

    const all = screen.findByText('button', 'All transactions');
    expect(all.textContent).toContain(String(TRANSACTIONS.length));
    click(all);
    expect(onStatus).toHaveBeenCalledWith('all');

    (Object.keys(STATUS_META) as TxStatus[]).forEach((s) => {
      const expected = TRANSACTIONS.filter((t) => t.status === s).length;
      const row = screen.findByText('li button', STATUS_META[s].label);
      expect(row.textContent).toContain(String(expected));
      click(row);
      expect(onStatus).toHaveBeenCalledWith(s);
    });
  });

  it('collapses and reopens a group from its header', () => {
    const screen = mountPanel();
    const header = screen.findByText('button', 'Key metrics');
    const group = header.parentElement as HTMLElement;
    const rows = () => Array.from(group.querySelectorAll('li button'));
    expect(rows().length).toBe(KPIS.length);

    expect(header.getAttribute('aria-expanded')).toBe('true');
    click(header);
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(rows()).toEqual([]);

    click(header);
    expect(rows()).toHaveLength(KPIS.length);
  });

  it('navigates to reports from both report rows and the new-report button', () => {
    const screen = mountPanel();
    const path = () => screen.find('[data-slot="path"]').textContent;
    expect(path()).toBe('/overview');

    click(screen.findByText('li button', REPORTS[0].label));
    expect(path()).toBe('/reports');
  });

  it('navigates to customers from the flat row', () => {
    const screen = mountPanel();
    click(screen.findByText('button', 'Customers'));
    expect(screen.find('[data-slot="path"]').textContent).toBe('/customers');
  });
});
