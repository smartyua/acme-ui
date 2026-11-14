// The flow carries the direction and liveness of the pipeline, so it runs even when the OS asks
// for reduced motion. One control pauses everything that moves or updates (WCAG 2.2.2), and the
// choice is remembered for the next visit.
const STORAGE_KEY = 'topology-flow-motion';

export const readStoredPaused = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'off';
};

export const persistPaused = (paused: boolean): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, paused ? 'off' : 'on');
};
