// The pause control must survive reloads through localStorage.
import { beforeEach, describe, expect, it } from 'vitest';
import { persistPaused, readStoredPaused } from './topologyMotion';

describe('flow motion preference', () => {
  beforeEach(() => window.localStorage.clear());

  it('runs the flow by default', () => {
    expect(readStoredPaused()).toBe(false);
  });

  it('remembers a pause across visits', () => {
    persistPaused(true);
    expect(window.localStorage.getItem('topology-flow-motion')).toBe('off');
    expect(readStoredPaused()).toBe(true);
    persistPaused(false);
    expect(window.localStorage.getItem('topology-flow-motion')).toBe('on');
    expect(readStoredPaused()).toBe(false);
  });
});
