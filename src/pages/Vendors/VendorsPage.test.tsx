// The vendor onboarding board: saved views, filters, a kanban board that doubles as a list,
// a detail drawer with real actions, and two modals. The page owns all of this state, so the
// spec drives it like a person would and asserts what a person would see.
import { describe, expect, it } from 'vitest';

import {
  BUSINESS_UNIT_META,
  INITIAL_VENDORS,
  VIEW_TITLES,
} from './vendorsData';
import { VendorsPage } from './VendorsPage';
import { Toaster } from '../../components/ui';
import { click, flush, mount, press, selectOption, typeText } from '../../test/harness';

const onboardings = () => INITIAL_VENDORS.filter((v) => v.lifecycle === 'onboarding');
const approved = () => INITIAL_VENDORS.filter((v) => v.lifecycle === 'approved');
const archived = () => INITIAL_VENDORS.filter((v) => v.lifecycle === 'archived');

const open = () =>
  mount(
    <>
      <VendorsPage />
      <Toaster />
    </>,
  );

const h1 = (screen: ReturnType<typeof open>) => screen.find('h1').textContent;
const drawer = (screen: ReturnType<typeof open>) => screen.find('[role="dialog"][aria-modal="true"]');
const toastText = (screen: ReturnType<typeof open>) =>
  screen.findAll('[role="status"]').map((t) => t.textContent ?? '').join('\n');
const cardFor = (screen: ReturnType<typeof open>, vendor: string) =>
  screen.findAll('article').find((a) => (a.textContent ?? '').includes(vendor));
// The KPI tile is the only button with a bare label span (sidebar rows read “# Blocked”).
const kpiTile = (screen: ReturnType<typeof open>, label: string) => {
  const tile = screen
    .findAll('button')
    .find((b) => Array.from(b.querySelectorAll('span')).some((s) => (s.textContent ?? '').trim() === label));
  if (!tile) throw new Error(`no KPI tile for ${label}`);
  return tile as HTMLElement;
};

describe('the board', () => {
  it('opens on Needs attention with one column per onboarding stage', () => {
    const screen = open();
    expect(h1(screen)).toBe(VIEW_TITLES['needs-attention']);
    expect(screen.find('[aria-current="page"]').textContent).toBe(VIEW_TITLES['needs-attention']);
    for (const title of ['Blocked', 'Waiting on reviewers', 'Waiting on vendors']) {
      const column = screen.find(`section[aria-label="${title}"]`);
      expect(column).toBeTruthy();
      // Columns start collapsed to a limit; expand them to see every card.
      Array.from(column.querySelectorAll('button[aria-expanded="false"]')).forEach((b) => click(b));
    }
    // Every onboarding vendor has a card on the board.
    for (const v of onboardings()) {
      expect(cardFor(screen, v.vendor)).toBeTruthy();
    }
    // Approved vendors are not on the board.
    for (const v of approved()) {
      expect(cardFor(screen, v.vendor)).toBeFalsy();
    }
  });

  it('collapses and reopens the saved-views group', () => {
    const screen = open();
    const header = screen.findByText('button', 'Saved views');
    const group = header.parentElement as HTMLElement;
    const rows = () => Array.from(group.querySelectorAll('li button'));
    expect(rows()).toHaveLength(5);

    click(header);
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(rows()).toEqual([]);
    click(header);
    expect(rows()).toHaveLength(5);
  });

  it('switches views: approved and archived render as tables, not boards', () => {
    const screen = open();

    click(screen.findByText('button', 'Approved vendors'));
    expect(h1(screen)).toBe(VIEW_TITLES.approved);
    expect(screen.find('table')).toBeTruthy();
    for (const v of approved()) {
      expect(screen.findByText('strong', v.vendor)).toBeTruthy();
    }

    click(screen.findByText('button', 'Archived vendors'));
    expect(h1(screen)).toBe(VIEW_TITLES.archived);
    for (const v of archived()) {
      expect(screen.findByText('strong', v.vendor)).toBeTruthy();
    }
  });

  it('forces the list layout from the toolbar select', () => {
    const screen = open();
    expect(screen.findAll('table')).toEqual([]);

    selectOption(screen.find<HTMLSelectElement>('select[aria-label="Layout view"]'), 'list');
    expect(screen.find('table')).toBeTruthy();
    expect(screen.find('table').textContent).toContain('Business unit');
  });
});

describe('filters', () => {
  it('narrows to my vendors and clears everything with feedback', async () => {
    const screen = open();
    expect(onboardings().filter((v) => v.mine).length).toBeGreaterThan(0);

    click(screen.findByText('[role="radio"]', 'Mine'));
    expect(screen.text).toContain('Assigned to me');

    click(screen.findByText('button', 'Clear filters'));
    await flush();
    expect(toastText(screen)).toContain('Filters cleared');
    expect(screen.text).not.toContain('Assigned to me');
    // Back to every onboarding.
    expect(cardFor(screen, onboardings()[0].vendor)).toBeTruthy();
  });

  it('search narrows cards live and admits when nothing matches', () => {
    const screen = open();
    const first = onboardings()[0];
    const search = screen.find<HTMLInputElement>('input[aria-label="Search vendors"]');

    typeText(search, first.vendor);
    expect(cardFor(screen, first.vendor)).toBeTruthy();
    const others = onboardings().filter((v) => v.id !== first.id && !v.vendor.includes(first.vendor));
    for (const v of others) expect(cardFor(screen, v.vendor)).toBeFalsy();

    typeText(search, 'zzzz nothing');
    expect(screen.text).toContain('No vendors match your filters');
  });

  it('takes ⌘K to the vendor search but yields to open dialogs', () => {
    const screen = open();
    const search = screen.find<HTMLInputElement>('input[aria-label="Search vendors"]');
    press('k', document, { metaKey: true });
    expect(document.activeElement).toBe(search);
  });

  it('cycles the priority filter through High, Medium, Low and back', async () => {
    const screen = open();
    const btn = screen.find('[aria-label="Cycle priority filter"]');
    const highOnly = onboardings().filter((v) => v.priority === 'High');

    click(btn);
    await flush();
    expect(screen.text).toContain('Priority: High');
    for (const v of onboardings().filter((x) => x.priority !== 'High' && x.lifecycle === 'onboarding')) {
      expect(cardFor(screen, v.vendor)).toBeFalsy();
    }
    for (const v of highOnly) expect(cardFor(screen, v.vendor)).toBeTruthy();

    click(btn);
    expect(screen.text).toContain('Priority: Medium');
    click(btn);
    expect(screen.text).toContain('Priority: Low');
    click(btn);
    expect(screen.text).not.toContain('Priority:');
    expect(toastText(screen)).toContain('Priority filter: All');
  });

  it('flips the due-soon window from the calendar button', () => {
    const screen = open();
    const btn = screen.find('[aria-label="Filter due window"]');
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.text).toContain('Due window');
    const shown = onboardings().filter((v) => v.dueSoon);
    expect(shown.length).toBeGreaterThan(0);
    for (const v of onboardings().filter((x) => !x.dueSoon)) {
      expect(cardFor(screen, v.vendor)).toBeFalsy();
    }
  });

  it('pins and stars the current view with the toolbar switches', async () => {
    const screen = open();
    const follow = screen.find('#vendor-auto-followups');
    expect(follow.getAttribute('aria-checked')).toBe('true');
    click(follow);
    await flush();
    expect(toastText(screen)).toContain('Auto follow-ups paused');
    click(follow);
    await flush();
    expect(toastText(screen)).toContain('Auto follow-ups enabled');

    const star = screen.find('[aria-label="Star view"]');
    expect(star.getAttribute('aria-pressed')).toBe('false');
    click(star);
    await flush();
    expect(star.getAttribute('aria-pressed')).toBe('true');
    expect(toastText(screen)).toContain('View starred');
  });

  it('picks a business unit and gives it back on a second click', () => {
    const screen = open();
    const unit = BUSINESS_UNIT_META[0];
    click(screen.findByText('li button', unit.unit));
    expect(h1(screen)).toBe(`${unit.unit} vendors`);
    click(screen.findByText('li button', unit.unit));
    expect(h1(screen)).toBe(VIEW_TITLES['needs-attention']);
  });

  it('filters from the KPI tiles and un-filters on the second press', () => {
    const screen = open();
    const blocked = onboardings().filter((v) => v.stage === 'blocked');
    const tile = kpiTile(screen, 'Blocked');

    click(tile);
    expect(tile.getAttribute('aria-pressed')).toBe('true');
    expect(screen.text).toContain('Blocked');
    for (const v of onboardings().filter((x) => x.stage !== 'blocked' && x.lifecycle === 'onboarding')) {
      expect(cardFor(screen, v.vendor)).toBeFalsy();
    }
    for (const v of blocked) expect(cardFor(screen, v.vendor)).toBeTruthy();

    click(tile);
    expect(cardFor(screen, onboardings().find((v) => v.stage !== 'blocked')?.vendor ?? '')).toBeTruthy();
  });
});

describe('the vendor drawer', () => {
  const openDrawerFor = (vendor: string) => {
    const screen = open();
    const card = cardFor(screen, vendor) as HTMLElement;
    // The card's main surface is a pressable button; the header's “More actions” stays clear.
    click(card.querySelector('button[aria-pressed]') as Element);
    return { screen, vendor };
  };

  it('opens on a card click with the vendor dossier inside', () => {
    const { screen } = openDrawerFor('Lanternfish');
    const panel = drawer(screen);
    expect(panel.getAttribute('aria-label')).toBe('Lanternfish');
    expect(panel.textContent).toContain('Legal review overdue');
    const terms = Array.from(panel.querySelectorAll('dt')).map((dt) => dt.textContent);
    for (const term of ['Stage', 'Priority', 'Business unit', 'Contract value', 'Progress', 'Reviewers']) {
      expect(terms).toContain(term);
    }
  });

  it('sends a follow-up and keeps the drawer open for review', async () => {
    const { screen } = openDrawerFor('Lanternfish');
    click(screen.findByText('button', 'Send follow-up'));
    await flush();
    expect(toastText(screen)).toContain('Follow-up sent');
    expect(drawer(screen).textContent).toContain('Follow-up reminder dispatched');
  });

  it('approves a vendor: toast, drawer closes, vendor leaves the board', async () => {
    const { screen } = openDrawerFor('Lanternfish');
    click(screen.findByText('button', 'Approve vendor'));
    await flush();
    expect(toastText(screen)).toContain('Vendor approved');
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(cardFor(screen, 'Lanternfish')).toBeFalsy();
    // And it shows up in the approved view now.
    click(screen.findByText('button', 'Approved vendors'));
    expect(screen.findByText('strong', 'Lanternfish')).toBeTruthy();
  });
});

describe('the modals', () => {
  it('renames the current view and keeps the new name', async () => {
    const screen = open();
    click(screen.find('[aria-label="Rename view"]'));
    const dialog = drawer(screen);
    expect(dialog.getAttribute('aria-label')).toBe('Rename saved view');

    const input = dialog.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe(VIEW_TITLES['needs-attention']);

    typeText(input, 'Fire drills');
    click(screen.findByText('button', 'Save name'));
    await flush();
    expect(h1(screen)).toBe('Fire drills');
    expect(toastText(screen)).toContain('View renamed');
  });

  it('refuses an empty name on a disabled button and cancels out', () => {
    const screen = open();
    click(screen.find('[aria-label="Rename view"]'));
    const input = drawer(screen).querySelector('input') as HTMLInputElement;

    typeText(input, '   ');
    expect((screen.findByText('button', 'Save name') as HTMLButtonElement).disabled).toBe(true);

    click(screen.findByText('button', 'Cancel'));
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(h1(screen)).toBe(VIEW_TITLES['needs-attention']);
  });

  it('creates a vendor from the form and lands it on the board', async () => {
    const screen = open();
    click(screen.findByText('button', 'New vendor'));
    const dialog = drawer(screen);
    expect((screen.findByText('button', 'Add vendor') as HTMLButtonElement).disabled).toBe(true);

    const name = dialog.querySelector('input') as HTMLInputElement;
    const summary = dialog.querySelector('textarea') as HTMLTextAreaElement;
    typeText(name, 'Corvane Systems');
    typeText(summary, 'Security questionnaire awaits external counsel review.');
    expect((screen.findByText('button', 'Add vendor') as HTMLButtonElement).disabled).toBe(false);

    click(screen.findByText('button', 'Add vendor'));
    await flush();
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(toastText(screen)).toContain('Vendor added');
    expect(cardFor(screen, 'Corvane Systems')).toBeTruthy();
  });
});

describe('the kanban columns', () => {
  it('sorts a column by priority from its options button', async () => {
    const screen = open();
    const column = screen.find('section[aria-label="Blocked"]');
    const options = column.querySelector('button[aria-label="Blocked column options"]') as Element;

    click(options);
    await flush();
    expect(toastText(screen)).toContain('Blocked sorted');
    click(options);
    await flush();
    expect(toastText(screen)).toContain('Blocked sorted');
  });
});
