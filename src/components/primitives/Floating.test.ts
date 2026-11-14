// Popover positioning math runs against DOMRect-like shapes; keep the geometry honest.
import { describe, expect, it, vi } from 'vitest';
import {
  anchorRectIntersectsViewport,
  composeRefs,
  computeFloatingPosition,
  createPointAnchorRect,
  getFloatingDir,
} from './Floating';

const rect = (x: number, y: number, width: number, height: number) =>
  ({
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  }) as DOMRectReadOnly;

describe('floating placement math', () => {
  it('builds a zero-size anchor rect around a point', () => {
    const point = createPointAnchorRect(3, 4);
    expect(point.width).toBe(0);
    expect(point.height).toBe(0);
    expect(point.top).toBe(4);
    expect(point.left).toBe(3);
  });

  it('treats fully off-screen anchors as not intersecting', () => {
    expect(anchorRectIntersectsViewport(rect(10, -100, 40, 80), 1024, 768)).toBe(false);
    expect(anchorRectIntersectsViewport(rect(10, 100, 40, 80), 1024, 768)).toBe(true);
  });

  it('places below the anchor while there is room', () => {
    const result = computeFloatingPosition({
      anchorRect: rect(100, 100, 120, 40),
      floatingRect: rect(0, 0, 200, 80),
      side: 'bottom',
      align: 'center',
      sideOffset: 8,
      viewportPadding: 0,
    });
    expect(result.side).toBe('bottom');
    expect(result.top).toBe(148);
    expect(result.left).toBe(60);
  });

  it('keeps the preferred side inside the viewport and copies the anchor width on request', () => {
    const result = computeFloatingPosition({
      anchorRect: rect(100, 100, 120, 40),
      floatingRect: rect(0, 0, 200, 80),
      side: 'right',
      align: 'center',
      sideOffset: 8,
      sameWidth: true,
      viewportPadding: 0,
    });
    expect(result.side).toBe('right');
    expect(result.left).toBe(228);
    expect(result.width).toBe(120);
  });

  it('positions point anchors without non-finite coordinates', () => {
    const result = computeFloatingPosition({
      anchorRect: createPointAnchorRect(500, 300),
      floatingRect: rect(0, 0, 200, 80),
      side: 'right',
      align: 'center',
      anchorMode: 'point',
    });
    expect(Number.isFinite(result.top)).toBe(true);
    expect(Number.isFinite(result.left)).toBe(true);
    expect(['top', 'bottom', 'left', 'right']).toContain(result.side);
  });

  it('fans a node out to every ref', () => {
    const div = document.createElement('div');
    const spy = vi.fn();
    const objectRef = { current: null as HTMLDivElement | null };
    composeRefs(spy, objectRef, undefined)(div);
    expect(spy).toHaveBeenCalledWith(div);
    expect(objectRef.current).toBe(div);
    composeRefs(objectRef)(null);
    expect(objectRef.current).toBeNull();
  });

  it('follows the nearest dir attribute', () => {
    const container = document.createElement('div');
    container.setAttribute('dir', 'rtl');
    const inner = document.createElement('span');
    container.append(inner);
    expect(getFloatingDir(inner)).toBe('rtl');
    expect(getFloatingDir(null)).toBe('ltr');
    document.documentElement.setAttribute('dir', 'nl');
    expect(getFloatingDir(null)).toBe('nl');
    expect(getFloatingDir(inner)).toBe('rtl');
    document.documentElement.removeAttribute('dir');
  });
});
