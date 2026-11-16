// jsdom ships without a handful of APIs the app reads on mount. Installing them once keeps the
// specs about behaviour instead of about the environment; every stub is guarded, so a future
// jsdom that provides the real thing wins.
import { installMatchMedia } from './media';

/** Hands every observed entry back to the component, the way a real resize would. */
export type ResizeObserverStub = { trigger: (target?: Element) => void };

export const installDom = (): void => {
  installMatchMedia();

  // Diagrams measure themselves through ResizeObserver. A no-op keeps them mounted; specs that
  // care about geometry reach the callback through the instance they created.
  if (typeof globalThis.ResizeObserver === 'undefined') {
    class ResizeObserverStub {
      private readonly callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }
      observe = (): void => {};
      unobserve = (): void => {};
      disconnect = (): void => {};
      trigger = (target?: Element): void => {
        this.callback(
          target
            ? [
                {
                  target,
                  contentRect: target.getBoundingClientRect(),
                  borderBoxSize: [],
                  contentBoxSize: [],
                  devicePixelContentBoxSize: [],
                },
              ]
            : [],
          this as unknown as ResizeObserver,
        );
      };
    }
    globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
  }

  if (typeof globalThis.IntersectionObserver === 'undefined') {
    class IntersectionObserverStub {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds: number[] = [];
      constructor(_callback: IntersectionObserverCallback) {}
      observe = (): void => {};
      unobserve = (): void => {};
      disconnect = (): void => {};
      takeRecords = (): IntersectionObserverEntry[] => [];
    }
    globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
  }

  // The rail scrolls the current item into view on every navigation.
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = () => {};
  }

  // Floating primitives reach for pointer capture before dragging.
  if (typeof HTMLElement.prototype.hasPointerCapture !== 'function') {
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
  }

  if (typeof HTMLElement.prototype.animate !== 'function') {
    HTMLElement.prototype.animate = (() => ({
      cancel: () => {},
      finish: () => {},
      play: () => {},
      pause: () => {},
      onfinish: null,
      finished: Promise.resolve(),
    })) as unknown as typeof HTMLElement.prototype.animate;
  }

  // Products copies values to the clipboard; jsdom has nowhere to put them.
  if (typeof navigator.clipboard === 'undefined') {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.resolve() },
      configurable: true,
    });
  }
};
