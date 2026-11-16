// A small render harness on react-dom/client + act, in the shape this repo already uses (see
// src/lib/app.test.tsx). No testing-library: the app pulls in no UI libraries, and the helpers
// below are all a spec needs — mount, query, interact, and a console watchdog.
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, vi } from 'vitest';

import { AppProvider } from '../lib/app';
import { setMedia as applyMedia } from './media';

/** Flips a media feature and lets React react to the change inside act(). */
export const setMedia = (query: string, matches: boolean): void => {
  actIn(active, () => {
    applyMedia(query, matches);
  });
};

type Mount = { root: Root; container: HTMLElement; portals: Set<Element> };
const mounted: Mount[] = [];
// The screen whose act() ran last — global events (document keys, timers) are attributed to it,
// and so are body-level portal nodes that no mount owns yet.
let active: Mount | null = null;

const ownedBy = (target: EventTarget | null): Mount | null => {
  if (!(target instanceof Node)) return null;
  const inPortals = (m: Mount): boolean =>
    Array.from(m.portals).some((p) => p === target || p.contains(target));
  return mounted.find((m) => m.container === target || m.container.contains(target) || inPortals(m)) ?? null;
};

// React portals (modal, drawer, toaster, popovers) append straight to body. Anything a body child
// nobody claimed yet appeared for belongs to the screen that just ran act().
const claimPortals = (m: Mount): void => {
  Array.from(document.body.children).forEach((el) => {
    if (m.portals.has(el)) return;
    if (mounted.some((o) => o.container === el || o.portals.has(el))) return;
    m.portals.add(el);
  });
};

const actIn = (m: Mount | null, run: () => void): void => {
  if (m) active = m;
  act(run);
  if (m) claimPortals(m);
};

const actInAsync = async (m: Mount | null, run: () => Promise<void>): Promise<void> => {
  if (m) active = m;
  await act(run);
  if (m) claimPortals(m);
};

afterEach(() => {
  while (mounted.length) {
    const m = mounted.pop();
    if (m) act(() => m.root.unmount());
  }
  active = null;
  document.body.innerHTML = '';
});

export type Options = {
  /** Mount inside <MemoryRouter> at this path. */
  route?: string;
  /** Mount inside <AppProvider> (default true, it is what every screen expects). */
  app?: boolean;
};

export type Screen = {
  /** Everything the app rendered, including portalled overlays. */
  readonly body: HTMLElement;
  /** The node the tree was mounted into — overlays live in `body` instead. */
  readonly container: HTMLElement;
  readonly text: string;
  find: <T extends Element = HTMLElement>(selector: string) => T;
  findAll: <T extends Element = HTMLElement>(selector: string) => T[];
  /** First `selector` match whose text contains `text` — the readable way to find a row or button. */
  findByText: <T extends Element = HTMLElement>(selector: string, text: string) => T;
  rerender: (node: ReactNode) => void;
  unmount: () => void;
};

const wrap = (node: ReactNode, { route, app = true }: Options): ReactNode => {
  const withApp = app ? <AppProvider>{node}</AppProvider> : node;
  return route === undefined ? withApp : <MemoryRouter initialEntries={[route]}>{withApp}</MemoryRouter>;
};

/**
 * Renders into a live document.body, so portals (modal, drawer, toaster) land where they really do.
 * Every query is scoped to this screen: its own container plus the body-level portal nodes that
 * appeared while it was the one rendering — two mounts in one spec never see each other's DOM.
 */
export const mount = (node: ReactNode, options: Options = {}): Screen => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const entry: Mount = { root, container, portals: new Set() };
  mounted.push(entry);
  active = entry;

  actIn(entry, () => {
    root.render(wrap(node, options));
  });

  // A portal node can also be re-created by a later render; sweep right before any query so a
  // spec that clicks and then queries without another helper call in between still sees its overlay.
  const scopes = (): Element[] => {
    claimPortals(active ?? entry);
    return [entry.container, ...Array.from(entry.portals)].filter((el) => el.isConnected);
  };

  const findAll = <T extends Element = HTMLElement,>(selector: string): T[] =>
    scopes().flatMap<T>((scope) => {
      // A portal's own root node can carry the thing a spec asks for (aria-live, data-slot, …).
      const self = scope.matches(selector) ? [scope as unknown as T] : [];
      return [...self, ...Array.from(scope.querySelectorAll<T>(selector))];
    });

  const find = <T extends Element = HTMLElement,>(selector: string): T => {
    const el = findAll<T>(selector)[0];
    if (!el) throw new Error(`Nothing matched "${selector}" in\n${document.body.innerHTML.slice(0, 600)}`);
    return el;
  };

  return {
    body: document.body,
    container,
    get text() {
      return scopes().map((el) => el.textContent ?? '').join(' ');
    },
    find,
    findAll,
    findByText: <T extends Element = HTMLElement,>(selector: string, text: string): T => {
      const matches = findAll<T>(selector);
      // "Refund" should find the Refund button, not the Refunded tile that happens to contain it.
      const exact = matches.find((el) => (el.textContent ?? '').trim() === text);
      const hit = exact ?? matches.find((el) => (el.textContent ?? '').includes(text));
      if (!hit) throw new Error(`No "${selector}" containing "${text}" in\n${document.body.innerHTML.slice(0, 600)}`);
      return hit;
    },
    rerender: (next: ReactNode) => {
      actIn(entry, () => {
        root.render(wrap(next, options));
      });
    },
    unmount: () => {
      const index = mounted.indexOf(entry);
      if (index >= 0) mounted.splice(index, 1);
      if (active === entry) active = mounted[mounted.length - 1] ?? null;
      actIn(null, () => root.unmount());
      entry.portals.clear();
    },
  };
};

// ── interaction ──────────────────────────────────────────────────────────
// An interaction belongs to the screen that owns its target element; document/window events
// (keyboard shortcuts, timers) belong to whichever screen acted last. Either way the acting
// screen gets the portal nodes the interaction creates.
const actFor = (target: EventTarget | null, run: () => void): void => actIn(ownedBy(target) ?? active, run);
const actForAsync = async (target: EventTarget | null, run: () => Promise<void>): Promise<void> =>
  actInAsync(ownedBy(target) ?? active, run);

const dispatch = (el: Element | Document | Window, event: Event): void => {
  actFor(el, () => {
    (el as Element).dispatchEvent(event);
  });
};

export const click = (target: Element): void => {
  if (target instanceof HTMLElement) {
    actFor(target, () => {
      target.click();
    });
    return;
  }
  dispatch(target, new MouseEvent('click', { bubbles: true, cancelable: true }));
};

/** Pointer-style press, for the surfaces that close on a backdrop mousedown. */
export const mouseDown = (target: Element): void => {
  dispatch(target, new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
};

/** React registers mouseenter as mouseover/mouseout pairs on the root; use these for tooltips. */
export const pointerEnter = (target: Element): void => {
  dispatch(target, new PointerEvent('pointerenter', { bubbles: false }));
  dispatch(target, new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
  dispatch(target, new MouseEvent('mouseenter', { bubbles: false, cancelable: true }));
};

export const pointerLeave = (target: Element): void => {
  dispatch(target, new PointerEvent('pointerleave', { bubbles: false }));
  dispatch(target, new MouseEvent('mouseout', { bubbles: true, cancelable: true }));
  dispatch(target, new MouseEvent('mouseleave', { bubbles: false, cancelable: true }));
};

export const focus = (target: HTMLElement): void => {
  actFor(target, () => {
    target.focus();
  });
};

export const blur = (target: HTMLElement): void => {
  actFor(target, () => {
    target.blur();
  });
};

export const press = (key: string, target: Element | Document = document, init: KeyboardEventInit = {}): void => {
  dispatch(target, new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
};

export const keyUp = (key: string, target: Element | Document = document): void => {
  dispatch(target, new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
};

const nativeSetter = (proto: object, key: string): ((value: string) => void) | undefined => {
  const descriptor = Object.getOwnPropertyDescriptor(proto, key);
  return descriptor?.set as ((value: string) => void) | undefined;
};

/** Types the way a user does: native setter first, then an input event React can see. */
export const typeText = (el: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  nativeSetter(proto, 'value')?.call(el, value);
  dispatch(el, new Event('input', { bubbles: true }));
};

export const selectOption = (el: HTMLSelectElement, value: string): void => {
  nativeSetter(HTMLSelectElement.prototype, 'value')?.call(el, value);
  dispatch(el, new Event('change', { bubbles: true }));
};

export const toggleCheckbox = (el: HTMLInputElement): void => {
  dispatch(el, new MouseEvent('click', { bubbles: true, cancelable: true }));
};

/** Lets pending effects, microtasks and lazy chunks land inside act(). */
export const flush = async (work?: () => void | Promise<void>): Promise<void> => {
  await actForAsync(null, async () => {
    if (work) await work();
    await Promise.resolve();
  });
};

/** Advances fake timers inside act(), so a spec can watch a timeout fire. */
export const tick = async (ms: number): Promise<void> => {
  await actForAsync(null, async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
  });
};

// ── console watchdog ─────────────────────────────────────────────────────
export type ConsoleWatch = {
  errors: () => string[];
  warnings: () => string[];
  restore: () => void;
};

/** Collects what the platform logged, so a spec can fail on React warnings instead of hiding them. */
export const watchConsole = (): ConsoleWatch => {
  const originals = { error: console.error, warn: console.warn };
  const errors: string[] = [];
  const warnings: string[] = [];
  console.error = ((...args: unknown[]) => {
    errors.push(args.map(String).join(' '));
  }) as typeof console.error;
  console.warn = ((...args: unknown[]) => {
    warnings.push(args.map(String).join(' '));
  }) as typeof console.warn;
  return {
    errors: () => [...errors],
    warnings: () => [...warnings],
    restore: () => {
      console.error = originals.error;
      console.warn = originals.warn;
    },
  };
};

/** Mounts `node` and asserts the platform stayed quiet while doing it. */
export const mountCleanly = (node: ReactNode, options: Options = {}): Screen => {
  const watch = watchConsole();
  const screen = mount(node, options);
  const problems = [...watch.errors(), ...watch.warnings()];
  watch.restore();
  expect(problems, `the platform complained while rendering:\n${problems.join('\n')}`).toEqual([]);
  return screen;
};
