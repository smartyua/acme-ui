// App context contract: theme resolution from storage and the seeded inbox.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NOTIFICATIONS } from '../data';
import { AppProvider, useApp } from './app';

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
});