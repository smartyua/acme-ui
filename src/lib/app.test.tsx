// App context contract: theme resolution from storage and the seeded inbox.
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { NOTIFICATIONS } from '../data';
import { AppProvider, useApp, useToasts } from './app';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof window.matchMedia !== 'function') {
  (window as unknown as { matchMedia: unknown }).matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
}

const Probe = () => {
  const app = useApp();
  return <span data-theme={app.theme} data-pref={app.themePref} data-unread={app.unread} />;
};

const render = () =>
  renderToStaticMarkup(
    <AppProvider>
      <Probe />
    </AppProvider>,
  );

describe('app provider', () => {
  it('defaults to light and exposes the seeded inbox', () => {
    window.localStorage.removeItem('axon:theme');
    const html = render();
    expect(html).toContain('data-theme="light"');
    expect(html).toContain(`data-unread="${NOTIFICATIONS.filter((n) => !n.read).length}"`);
  });

  it('reads the saved theme, ignoring garbage', () => {
    window.localStorage.setItem('axon:theme', 'dark');
    expect(render()).toContain('data-theme="dark"');
    window.localStorage.setItem('axon:theme', 'sepia');
    expect(render()).toContain('data-pref="light"');
    window.localStorage.removeItem('axon:theme');
  });

  it('refuses useApp outside the provider', () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow('useApp must be used inside <AppProvider>');
  });

  it('mutates notifications, transactions, and toasts cleanly', () => {
    const Inspector = () => {
      const app = useApp();
      const toasts = useToasts();
      return (
        <div
          id="state"
          data-unread={app.unread}
          data-count={app.notifications.length}
          data-tx={app.transactions[0].status}
          data-toasts={toasts.length}
          data-toast-title={toasts[0]?.title ?? ''}
        >
          <button id="mark-one" type="button" onClick={() => app.markRead('n1')} />
          <button id="mark-all" type="button" onClick={() => app.markAllRead()} />
          <button id="remove-one" type="button" onClick={() => app.removeNotification('n1')} />
          <button id="refund-first" type="button" onClick={() => app.updateTransactions([app.transactions[0].id], { status: 'refunded' })} />
          <button id="add-toast" type="button" onClick={() => app.toast({ title: 'Saved', tone: 'success' })} />
          <button id="dismiss-toast" type="button" onClick={() => toasts[0] && app.dismissToast(toasts[0].id)} />
        </div>
      );
    };

    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => {
      root.render(
        <AppProvider>
          <Inspector />
        </AppProvider>,
      );
    });

    const getState = () => container.querySelector('#state')!;
    const click = (sel: string) => {
      act(() => {
        container.querySelector<HTMLButtonElement>(sel)!.click();
      });
    };

    const initialUnread = Number(getState().getAttribute('data-unread'));
    const initialCount = Number(getState().getAttribute('data-count'));
    expect(initialUnread).toBeGreaterThan(0);

    click('#mark-one');
    expect(Number(getState().getAttribute('data-unread'))).toBe(initialUnread - 1);

    click('#mark-all');
    expect(Number(getState().getAttribute('data-unread'))).toBe(0);

    click('#remove-one');
    expect(Number(getState().getAttribute('data-count'))).toBe(initialCount - 1);

    click('#refund-first');
    expect(getState().getAttribute('data-tx')).toBe('refunded');

    click('#add-toast');
    expect(getState().getAttribute('data-toasts')).toBe('1');
    expect(getState().getAttribute('data-toast-title')).toBe('Saved');

    click('#dismiss-toast');
    expect(getState().getAttribute('data-toasts')).toBe('0');

    act(() => {
      root.unmount();
    });
  });
});