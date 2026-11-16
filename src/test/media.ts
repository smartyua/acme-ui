// The app asks the platform about dark mode and reduced motion. This registry answers those
// queries and lets a spec flip a feature so it can watch the app react to the change event.
type Listener = () => void;

const state: Record<string, boolean> = {};
const listeners = new Map<string, Set<Listener>>();

const subscribe = (query: string, listener: Listener) => {
  const set = listeners.get(query) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(query, set);
};

const mediaFor = (query: string) => ({
  media: query,
  get matches() {
    return state[query] ?? false;
  },
  onchange: null,
  addEventListener: (_type: string, listener: Listener) => subscribe(query, listener),
  removeEventListener: (_type: string, listener: Listener) => {
    listeners.get(query)?.delete(listener);
  },
  addListener: (listener: Listener) => subscribe(query, listener),
  removeListener: (listener: Listener) => {
    listeners.get(query)?.delete(listener);
  },
  dispatchEvent: (event: { type?: string }) => {
    if (event?.type === 'change') listeners.get(query)?.forEach((l) => l());
    return true;
  },
});

export type MediaQueryListStub = ReturnType<typeof mediaFor>;

/** Flips a media feature (`'(prefers-color-scheme: dark)'`) and notifies whoever is listening. */
export const setMedia = (query: string, matches: boolean): void => {
  state[query] = matches;
  listeners.get(query)?.forEach((l) => l());
};

export const installMatchMedia = (): void => {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'function') return;
  window.matchMedia = ((query: string) => mediaFor(query)) as unknown as typeof window.matchMedia;
};
