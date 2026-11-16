// The shell is the one component every screen inherits: the rail, the phone drawer, the theme,
// the unread counts and the logout flow. If it breaks, every route in the matrix breaks with it.
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { NOTIFICATIONS, RAIL_PRIMARY, RAIL_SECONDARY, TRANSACTIONS } from '../data';
import { Shell } from './Shell';
import { click, focus, mount, mouseDown, press, setMedia } from '../test/harness';

const RAIL = 'nav[aria-label="Workspace navigation"]';
const THEME_KEY = 'axon:theme';
const COLLAPSE_KEY = 'axon:rail-collapsed';

const Marker = () => <main data-slot="marker">screen</main>;
const SignedOut = () => <main data-slot="signed-out">signed out</main>;

const openShell = (path = '/overview') =>
  mount(
    <Routes>
      <Route element={<Shell />}>
        <Route path="/overview" element={<Marker />} />
        <Route path="/help" element={<Marker />} />
      </Route>
      <Route path="/signed-out" element={<SignedOut />} />
    </Routes>,
    { route: path },
  );

const railLink = (path: string) => {
  const link = Array.from(document.querySelectorAll(`${RAIL} a`)).find((a) => a.getAttribute('href') === path);
  if (!link) throw new Error(`no rail link for ${path}`);
  return link as HTMLElement;
};

const menuButton = () => document.querySelector<HTMLButtonElement>('[aria-label="Open menu"]') as HTMLButtonElement;
const isOpen = () => menuButton().getAttribute('aria-expanded') === 'true';

describe('the rail', () => {
  it('lists every screen from the data', () => {
    openShell();
    const links = Array.from(document.querySelectorAll(`${RAIL} a[href^="/"]`)).map((a) => a.getAttribute('href'));
    for (const item of [...RAIL_PRIMARY, ...RAIL_SECONDARY]) expect(links).toContain(item.path);
    expect(links).toContain('/help');
  });

  it('marks where the user is', () => {
    openShell('/help');
    expect(railLink('/help').getAttribute('aria-current')).toBe('page');
    expect(railLink('/overview').hasAttribute('aria-current')).toBe(false);
  });

  it('titles the document after the current screen', () => {
    openShell('/overview');
    expect(document.title).toBe('Overview · Acme');
  });

  it('counts what needs attention and stays quiet about the rest', () => {
    openShell();
    const unread = NOTIFICATIONS.filter((n) => !n.read).length;
    const pending = TRANSACTIONS.filter((t) => t.status === 'pending').length;
    expect(unread).toBeGreaterThan(0);
    expect(railLink('/notifications').textContent).toContain(String(unread));
    expect(railLink('/orders').textContent).toContain(String(pending));
    expect(railLink('/activity').textContent).toBe('Activity');
  });

  it('collapses for this visit and remembers it for the next one', () => {
    window.localStorage.removeItem(COLLAPSE_KEY);
    const screen = openShell();
    const before = screen.find(RAIL).className;

    click(screen.find<HTMLButtonElement>('[aria-label="Collapse sidebar"]'));
    const collapsed = screen.find(RAIL).className;
    expect(collapsed).not.toBe(before);
    expect(window.localStorage.getItem(COLLAPSE_KEY)).toBe('1');
    expect(screen.find('[aria-label="Expand sidebar"]')).toBeTruthy();

    screen.unmount();
    const again = openShell();
    expect(again.find(RAIL).className).toBe(collapsed);
    click(again.find<HTMLButtonElement>('[aria-label="Expand sidebar"]'));
    expect(again.find(RAIL).className).toBe(before);
    expect(window.localStorage.getItem(COLLAPSE_KEY)).toBe('0');
  });

  it('works with a browser that blocks storage', () => {
    const blocked = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    const written = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    const screen = openShell();
    expect(screen.findAll(RAIL)).toHaveLength(1);
    click(screen.find<HTMLButtonElement>('[aria-label="Collapse sidebar"]'));
    expect(screen.findAll(RAIL)).toHaveLength(1);
    blocked.mockRestore();
    written.mockRestore();
  });
});

describe('the phone drawer', () => {
  it('opens from the top bar and closes from the scrim, the button and Escape', () => {
    const screen = openShell();
    expect(isOpen()).toBe(false);

    click(menuButton());
    expect(isOpen()).toBe(true);
    // The scrim is the only body-level div that is hidden from assistive tech.
    click(screen.container.querySelector('[class*="scrim"]') as HTMLElement);
    expect(isOpen()).toBe(false);

    click(menuButton());
    click(screen.find('[aria-label="Close menu"]'));
    expect(isOpen()).toBe(false);

    click(menuButton());
    press('Escape');
    expect(isOpen()).toBe(false);
  });

  it('names the current screen in the top bar', () => {
    openShell('/help');
    expect(document.querySelector('header')?.textContent).toContain('Help');
  });

  it('closes when the user picks another screen', () => {
    openShell();
    click(menuButton());
    expect(isOpen()).toBe(true);
    click(railLink('/help'));
    expect(isOpen()).toBe(false);
    expect(document.title).toBe('Help · Acme');
  });
});

describe('the theme', () => {
  it('follows the switch and the two toggle buttons', () => {
    window.localStorage.removeItem(THEME_KEY);
    const screen = openShell();
    expect(document.documentElement.dataset.theme).toBe('light');

    click(screen.find<HTMLButtonElement>('#dark-mode'));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark');

    click(screen.find<HTMLButtonElement>('#dark-mode'));
    expect(document.documentElement.dataset.theme).toBe('light');

    click(screen.find('[aria-label="Switch to dark theme"]'));
    expect(document.documentElement.dataset.theme).toBe('dark');
    click(screen.find('[aria-label="Switch to light theme"]'));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('follows the OS when the user chose system', () => {
    window.localStorage.setItem(THEME_KEY, 'system');
    setMedia('(prefers-color-scheme: dark)', true);
    openShell();
    expect(document.documentElement.dataset.theme).toBe('dark');
    setMedia('(prefers-color-scheme: dark)', false);
    expect(document.documentElement.dataset.theme).toBe('light');
    window.localStorage.removeItem(THEME_KEY);
  });
});

describe('logging out', () => {
  const askToLogOut = () => {
    const trigger = Array.from(document.querySelectorAll(`${RAIL} button`)).find((b) => b.textContent === 'Log out') as HTMLElement;
    click(trigger);
    return trigger;
  };

  const dialogButton = (label: string) => {
    const button = Array.from(document.querySelectorAll('[role="dialog"] button')).find((b) => b.textContent === label);
    if (!button) throw new Error(`no "${label}" button in the dialog`);
    return button as HTMLElement;
  };

  it('asks first, then leaves the workspace', () => {
    const screen = openShell();
    expect(screen.findAll('[role="dialog"]')).toEqual([]);

    askToLogOut();
    expect(screen.find('[role="dialog"]').getAttribute('aria-label')).toBe('Log out of Acme?');

    click(dialogButton('Cancel'));
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(screen.find('[data-slot="marker"]')).toBeTruthy();

    askToLogOut();
    click(dialogButton('Log out'));
    expect(screen.find('[data-slot="signed-out"]')).toBeTruthy();
  });

  it('closes when the press lands on the backdrop', () => {
    const screen = openShell();
    askToLogOut();
    mouseDown(screen.find('[role="dialog"]').parentElement as HTMLElement);
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(screen.find('[data-slot="marker"]')).toBeTruthy();
  });

  it('gives the focus back to the rail', () => {
    openShell();
    const trigger = askToLogOut();
    focus(trigger);
    click(trigger);
    press('Escape');
    expect(document.activeElement).toBe(trigger);
  });

  it('the brand takes the user home', () => {
    const screen = openShell('/help');
    click(screen.find('a[href="/overview"]'));
    expect(document.title).toBe('Overview · Acme');
    expect(screen.findAll('[data-slot="marker"]')).toHaveLength(1);
  });
});
