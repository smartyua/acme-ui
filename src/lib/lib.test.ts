// Pure helpers every page composes through.
import { afterEach, describe, expect, it } from 'vitest';
import { cn } from './cn';
import { prefersReducedMotion } from './prefersReducedMotion';

describe('cn', () => {
  it('joins truthy parts with single spaces', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('a', false, null, undefined, ' ')).toBe('a');
    expect(cn(false, null, undefined)).toBe('');
    expect(cn('')).toBe('');
  });
});

describe('prefersReducedMotion', () => {
  const win = window as unknown as { matchMedia: unknown };
  const original = win.matchMedia;

  afterEach(() => {
    win.matchMedia = original;
  });

  it('is false while the platform has no matchMedia', () => {
    win.matchMedia = undefined;
    expect(prefersReducedMotion()).toBe(false);
  });

  it('follows the OS reduce-motion flag', () => {
    win.matchMedia = () => ({ matches: true });
    expect(prefersReducedMotion()).toBe(true);
    win.matchMedia = () => ({ matches: false });
    expect(prefersReducedMotion()).toBe(false);
  });
});
