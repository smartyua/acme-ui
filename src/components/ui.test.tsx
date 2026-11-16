// src/components/ui.tsx is the kit every screen is built from, so it is tested as a kit: the
// optional parts stay optional, the accessible name survives, and the interactive parts answer to
// a real event. CSS-modules hashes class names in tests, so specs assert structure (roles,
// attributes, text) and distinctness instead of literal class names.
import { describe, expect, it, vi } from 'vitest';
import { Search } from 'lucide-react';

import {
  AppChip,
  Badge,
  Button,
  Drawer,
  Empty,
  FormField,
  Input,
  Meter,
  Modal,
  PageHeader,
  Panel,
  PillTabs,
  SearchBox,
  Select,
  Sparkline,
  TableWrap,
  Textarea,
  Toaster,
  cx,
  tableClass,
} from './ui';
import { click, flush, mount, mouseDown, press, typeText, type Screen } from '../test/harness';
import { useApp } from '../lib/app';

const bare = { app: false } as const;
const classesOf = (selector: string) => Array.from(document.querySelectorAll(selector)).map((el) => el.className);

describe('cx', () => {
  it('joins the parts that are there', () => {
    expect(cx('a', 'b')).toBe('a b');
    expect(cx('a', false, null, undefined)).toBe('a');
    expect(cx()).toBe('');
  });
});

describe('tableClass', () => {
  it('is a single shared table style', () => {
    expect(typeof tableClass).toBe('string');
    expect(tableClass.length).toBeGreaterThan(0);
  });
});

describe('Button', () => {
  it('is type=button by default and keeps its label and icon', () => {
    const screen = mount(<Button icon={<Search data-testid="icon" aria-hidden />}>Save</Button>, bare);
    const button = screen.find<HTMLButtonElement>('button');
    expect(button.type).toBe('button');
    expect(button.textContent).toContain('Save');
    expect(button.querySelector('[data-testid="icon"]')).toBeTruthy();
  });

  it('spreads the button attributes it is handed', () => {
    const onPress = vi.fn();
    const screen = mount(
      <Button type="submit" onClick={onPress}>
        Go
      </Button>,
      bare,
    );
    const button = screen.find<HTMLButtonElement>('button');
    expect(button.type).toBe('submit');
    click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('adds a className instead of replacing its own, and styles each variant differently', () => {
    mount(
      <>
        <Button className="extra">a</Button>
        <Button variant="primary">b</Button>
        <Button variant="ghost">c</Button>
        <Button variant="danger">d</Button>
        <Button size="sm">e</Button>
        <Button size="icon">f</Button>
        <Button block>g</Button>
      </>,
      bare,
    );
    const [base, primary, ghost, danger, small, icon, block] = classesOf('button');
    expect(base).toContain('extra');
    expect(new Set([base, primary, ghost, danger, small, icon, block]).size).toBe(7);
  });
});

describe('Badge', () => {
  it('is neutral unless told otherwise, and every tone looks different', () => {
    mount(
      <>
        <Badge>plain</Badge>
        <Badge tone="mint">mint</Badge>
        <Badge tone="rose">rose</Badge>
      </>,
      bare,
    );
    const [plain, mint, rose] = classesOf('span');
    expect(new Set([plain, mint, rose]).size).toBe(3);
  });
});

describe('PageHeader', () => {
  it('renders the lead and the actions only when they are given', () => {
    const plain = mount(<PageHeader title="Orders" />, bare);
    expect(plain.find('h1').textContent).toBe('Orders');
    expect(plain.findAll('p')).toEqual([]);
    expect(plain.findAll('button')).toEqual([]);

    const full = mount(<PageHeader title="Orders" lead="Everything in flight" actions={<Button>New</Button>} />, bare);
    expect(full.find('p').textContent).toBe('Everything in flight');
    expect(full.text).toContain('New');
  });
});

describe('Panel', () => {
  it('only builds a header when there is something to put in it', () => {
    const plain = mount(<Panel>body</Panel>, bare);
    expect(plain.findAll('header')).toEqual([]);
    expect(plain.text).toBe('body');

    mount(
      <Panel title="Coverage" description="last 24 hours" actions={<button type="button">Fix</button>}>
        body
      </Panel>,
      bare,
    );
    expect(document.querySelector('header h2')?.textContent).toBe('Coverage');
    expect(document.querySelector('header p')?.textContent).toBe('last 24 hours');
    expect(document.querySelectorAll('header button')).toHaveLength(1);
  });

  it('distinguishes a flush panel from a padded one', () => {
    mount(
      <>
        <Panel>a</Panel>
        <Panel flush>b</Panel>
      </>,
      bare,
    );
    const [padded, flushPanel] = classesOf('section');
    expect(padded).not.toBe(flushPanel);
  });
});

describe('TableWrap', () => {
  it('is a labelled scroll region only when asked, so tables never break the layout', () => {
    const screen = mount(
      <>
        <TableWrap label="Invoices">
          <table />
        </TableWrap>
        <TableWrap>
          <table />
        </TableWrap>
      </>,
      bare,
    );
    const regions = screen.findAll('[role="region"]');
    expect(regions).toHaveLength(1);
    expect(regions[0].getAttribute('aria-label')).toBe('Invoices');
    expect((regions[0] as HTMLElement).tabIndex).toBe(0);
    expect(screen.findAll('table')).toHaveLength(2);
  });
});

describe('form controls', () => {
  it('wraps an input in its label only when one is asked for', () => {
    const screen = mount(
      <>
        <Input label="Email" value="a@b.co" readOnly />
        <Input placeholder="Search orders" />
      </>,
      bare,
    );
    expect(screen.find('label').textContent).toContain('Email');
    const inputs = screen.findAll('input');
    expect(inputs).toHaveLength(2);
    expect(inputs[1].getAttribute('placeholder')).toBe('Search orders');
    expect(inputs[0].parentElement?.tagName).toBe('LABEL');
    expect(inputs[1].parentElement?.tagName).not.toBe('LABEL');
  });

  it('reports what the user types', () => {
    const onType = vi.fn();
    const screen = mount(<Input label="Name" defaultValue="" onChange={(e) => onType(e.target.value)} />, bare);
    typeText(screen.find<HTMLInputElement>('input'), 'Ada');
    expect(onType).toHaveBeenCalledWith('Ada');
  });

  it('renders textarea and select with their props', () => {
    const screen = mount(
      <>
        <Textarea rows={4} defaultValue="notes" />
        <Select defaultValue="b" aria-label="Tier">
          <option value="a">A</option>
          <option value="b">B</option>
        </Select>
      </>,
      bare,
    );
    expect(screen.find<HTMLTextAreaElement>('textarea').value).toBe('notes');
    const select = screen.find<HTMLSelectElement>('select');
    expect(select.value).toBe('b');
    expect(select.getAttribute('aria-label')).toBe('Tier');
    expect(select.parentElement?.tagName).toBe('SPAN');
  });

  it('ties a FormField label to its control and shows the hint on request', () => {
    const screen = mount(
      <>
        <FormField label="Workspace" hint="Shown in the sidebar">
          {(id) => <input id={id} />}
        </FormField>
        <FormField label="Region">
          {(id) => <input id={id} />}
        </FormField>
      </>,
      bare,
    );
    const labels = screen.findAll('label');
    const inputs = screen.findAll('input');
    expect(labels[0].getAttribute('for')).toBe(inputs[0].id);
    expect(labels[1].getAttribute('for')).toBe(inputs[1].id);
    expect(inputs[0].id).toBeTruthy();
    expect(inputs[0].id).not.toBe(inputs[1].id);
    expect(screen.text).toContain('Shown in the sidebar');
    expect(screen.findAll('label')).toHaveLength(2);
  });
});

describe('SearchBox', () => {
  it('reports what the user types and labels itself by its placeholder', () => {
    const onType = vi.fn();
    const screen = mount(<SearchBox value="" onChange={onType} placeholder="Search templates" shortcut="/" />, bare);
    expect(screen.find('input').getAttribute('aria-label')).toBe('Search templates');
    expect(screen.find('kbd').textContent).toBe('/');
    typeText(screen.find<HTMLInputElement>('input'), 'pay');
    expect(onType).toHaveBeenCalledWith('pay');
  });

  it('prefers an explicit accessible name', () => {
    const screen = mount(<SearchBox value="" onChange={() => {}} placeholder="Search" label="Filter the list" />, bare);
    expect(screen.find('input').getAttribute('aria-label')).toBe('Filter the list');
    expect(screen.findAll('kbd')).toEqual([]);
  });

  it('takes focus on / the way a power user expects', () => {
    const screen = mount(<SearchBox value="" onChange={() => {}} placeholder="Search" />, bare);
    press('/');
    expect(document.activeElement).toBe(screen.find('input'));
  });

  it('leaves / alone while the user is typing, holding a modifier, or inside a dialog', () => {
    const screen = mount(<SearchBox value="" onChange={() => {}} placeholder="Search" />, bare);
    const input = screen.find<HTMLInputElement>('input');

    press('/', input);
    expect(document.activeElement).not.toBe(input);

    press('/', document, { metaKey: true });
    press('/', document, { ctrlKey: true });
    press('/', document, { altKey: true });
    expect(document.activeElement).not.toBe(input);

    const blocking = document.createElement('div');
    blocking.setAttribute('role', 'dialog');
    document.body.append(blocking);
    press('/');
    expect(document.activeElement).not.toBe(input);
    blocking.remove();
  });

  it('stands down when another handler already took the key', () => {
    const screen = mount(<SearchBox value="" onChange={() => {}} placeholder="Search" />, bare);
    const input = screen.find<HTMLInputElement>('input');
    const swallow = (event: KeyboardEvent) => event.preventDefault();
    document.addEventListener('keydown', swallow, true);
    press('/', document.body);
    document.removeEventListener('keydown', swallow, true);
    expect(document.activeElement).not.toBe(input);
  });
});

describe('PillTabs', () => {
  it('marks the selected tab, shows counts, and reports the one that was clicked', () => {
    const onPick = vi.fn();
    const screen = mount(
      <PillTabs
        label="Status"
        value="open"
        onChange={onPick}
        items={[
          { value: 'open', label: 'Open', count: 12 },
          { value: 'done', label: 'Done' },
        ]}
      />,
      bare,
    );
    const tabs = screen.findAll('[role="tab"]');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(screen.text).toContain('12');
    expect(screen.findAll('span').filter((s) => s.textContent === '12')).toHaveLength(1);

    click(tabs[1]);
    expect(onPick).toHaveBeenCalledWith('done');
  });

  it('is labelled for screen readers', () => {
    const screen = mount(
      <PillTabs label="Range" value="7d" onChange={() => {}} items={[{ value: '7d', label: '7 days' }]} />,
      bare,
    );
    expect(screen.find('[role="tablist"]').getAttribute('aria-label')).toBe('Range');
  });
});

describe('AppChip', () => {
  it('draws a monogram for a product (rule 8: never a vendor logo)', () => {
    const screen = mount(<AppChip app="stripe" />, bare);
    const chip = screen.find('[title]');
    expect(chip.getAttribute('title')).toBe('Stripe');
    expect(screen.text).toContain('St');
    expect(screen.findAll('svg')).toEqual([]);
  });

  it('draws the sparkle, not a letter, for the AI step', () => {
    const screen = mount(<AppChip app="ai" size="lg" />, bare);
    expect(screen.find('[title]').getAttribute('title')).toBe('AI step');
    expect(screen.findAll('svg')).toHaveLength(1);
    expect(screen.text).toContain('AI step');
  });
});

describe('Modal', () => {
  it('renders nothing until it is open and portals into the body when it is', () => {
    const closed = mount(
      <Modal open={false} onClose={() => {}} title="Nope">
        body
      </Modal>,
      bare,
    );
    expect(closed.findAll('[role="dialog"]')).toEqual([]);

    const screen = mount(
      <Modal open onClose={() => {}} title="Log out?" description="See you soon" footer={<button type="button">Bye</button>}>
        body
      </Modal>,
      bare,
    );
    const dialog = screen.find('[role="dialog"]');
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Log out?');
    expect(screen.text).toContain('See you soon');
    expect(screen.text).toContain('Bye');
  });

  it.each([
    ['the close button', (screen: Screen) => click(screen.find('[aria-label="Close"]'))],
    ['the backdrop', (screen: Screen) => mouseDown(screen.find('[role="dialog"]').parentElement as HTMLElement)],
    ['Escape', () => press('Escape')],
  ])('closes from %s', async (_name, act) => {
    const onClose = vi.fn();
    const screen = mount(
      <Modal open onClose={onClose} title="Settings">
        <input placeholder="inside" />
      </Modal>,
      bare,
    );
    await act(screen);
    expect(onClose).toHaveBeenCalledTimes(1);
    screen.unmount();
  });

  it('does not close when the press starts inside the content', () => {
    const onClose = vi.fn();
    const screen = mount(
      <Modal open onClose={onClose} title="Settings">
        <input placeholder="inside" />
      </Modal>,
      bare,
    );
    mouseDown(screen.find('input'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks the page behind it and gives it back on close', () => {
    const screen = mount(
      <Modal open onClose={() => {}} title="Settings">
        body
      </Modal>,
      bare,
    );
    expect(document.body.style.overflow).toBe('hidden');
    screen.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('Drawer', () => {
  it('is an aside dialog with an optional footer, and closes on request', () => {
    const onClose = vi.fn();
    const screen = mount(
      <Drawer open onClose={onClose} title="Order 4821">
        details
      </Drawer>,
      bare,
    );
    const dialog = screen.find('[role="dialog"]');
    expect(dialog.tagName).toBe('ASIDE');
    expect(dialog.getAttribute('aria-label')).toBe('Order 4821');
    expect(screen.findAll('footer')).toEqual([]);
    click(screen.find('[aria-label="Close"]'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Toaster', () => {
  const Push = () => {
    const { toast } = useApp();
    return (
      <button type="button" onClick={() => toast({ title: 'Saved', description: 'Two rows', tone: 'success' })}>
        push
      </button>
    );
  };

  it('announces a new toast and dismisses it', async () => {
    const screen = mount(
      <>
        <Push />
        <Toaster />
      </>,
    );
    expect(screen.findAll('[role="status"]')).toEqual([]);
    expect(screen.find('[aria-live]').getAttribute('aria-live')).toBe('polite');

    click(screen.findByText('button', 'push'));
    await flush();

    const toast = screen.find('[role="status"]');
    expect(toast.textContent).toContain('Saved');
    expect(toast.textContent).toContain('Two rows');

    click(toast.querySelector('button') as HTMLElement);
    await flush();
    expect(screen.findAll('[role="status"]')).toEqual([]);
  });
});

describe('Empty', () => {
  it('shows the icon and the guidance only when they exist', () => {
    const plain = mount(<Empty title="Nothing here" />, bare);
    expect(plain.find('strong').textContent).toBe('Nothing here');
    expect(plain.findAll('svg')).toEqual([]);
    expect(plain.findAll('span')).toEqual([]);

    mount(
      <Empty title="Nothing here" icon={<Search aria-hidden />}>
        Try another filter
      </Empty>,
      bare,
    );
    expect(document.querySelectorAll('svg')).toHaveLength(1);
    expect(document.body.textContent).toContain('Try another filter');
  });
});

describe('Meter', () => {
  it('is a real meter, clamps an over-full value, and tones the fill', () => {
    const screen = mount(
      <>
        <Meter value={25} max={100} label="Used" />
        <Meter value={140} max={100} tone="danger" />
      </>,
      bare,
    );
    const meters = screen.findAll('[role="meter"]');
    expect(meters[0].getAttribute('aria-valuenow')).toBe('25');
    expect(meters[0].getAttribute('aria-valuemin')).toBe('0');
    expect(meters[0].getAttribute('aria-valuemax')).toBe('100');
    expect(meters[0].getAttribute('aria-label')).toBe('Used');
    const fills = screen.findAll('[role="meter"] > span');
    expect((fills[0] as HTMLElement).style.width).toBe('25%');
    expect((fills[1] as HTMLElement).style.width).toBe('100%');
    expect(fills[0].className).not.toBe(fills[1].className);
  });
});

describe('Sparkline', () => {
  it('draws nothing without data', () => {
    const screen = mount(<Sparkline data={[]} />, bare);
    expect(screen.findAll('svg')).toEqual([]);
  });

  it('draws one point per sample and flattens a single value', () => {
    const screen = mount(
      <>
        <Sparkline data={[1, 4, 2, 9]} />
        <Sparkline data={[5]} up={false} />
      </>,
      bare,
    );
    const lines = screen.findAll('polyline');
    expect(lines[0].getAttribute('points')?.trim().split(' ')).toHaveLength(4);
    expect(lines[1].getAttribute('points')).toContain('50,');
    const svgs = screen.findAll('svg');
    expect(svgs[0].className).not.toBe(svgs[1].className);
  });
});
