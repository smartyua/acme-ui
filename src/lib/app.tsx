import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { NOTIFICATIONS, TRANSACTIONS, type AppNotification, type Transaction } from '../data';

// ── Theme ────────────────────────────────────────────────────────────────
export type ThemePref = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

const THEME_KEY = 'axon:theme';

const readPref = (): ThemePref => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* storage unavailable */
  }
  return 'light';
};

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

// ── Toasts ───────────────────────────────────────────────────────────────
export type Toast = { id: number; title: string; description?: string; tone?: 'default' | 'success' | 'danger' };

type AppState = {
  themePref: ThemePref;
  theme: Theme;
  setThemePref: (p: ThemePref) => void;

  notifications: AppNotification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;

  transactions: Transaction[];
  updateTransactions: (ids: string[], patch: Partial<Transaction>) => void;

  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
};

const AppContext = createContext<AppState | null>(null);
const ToastContext = createContext<Toast[]>([]);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [themePref, setThemePrefState] = useState<ThemePref>(readPref);
  const [sysDark, setSysDark] = useState(systemDark);
  const theme: Theme = themePref === 'system' ? (sysDark ? 'dark' : 'light') : themePref;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSysDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setThemePref = useCallback((p: ThemePref) => {
    setThemePrefState(p);
    try {
      localStorage.setItem(THEME_KEY, p);
    } catch {
      /* storage unavailable — theme still applies for this visit */
    }
  }, []);

  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;
  const markRead = useCallback(
    (id: string) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))),
    []
  );
  const markAllRead = useCallback(() => setNotifications((list) => list.map((n) => ({ ...n, read: true }))), []);
  const removeNotification = useCallback((id: string) => setNotifications((list) => list.filter((n) => n.id !== id)), []);

  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const updateTransactions = useCallback(
    (ids: string[], patch: Partial<Transaction>) =>
      setTransactions((list) => list.map((t) => (ids.includes(t.id) ? { ...t, ...patch } : t))),
    []
  );

  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timersRef = useRef<Map<number, number>>(new Map());

  const dismissToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((l) => l.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = nextId.current++;
      setToasts((l) => [...l.slice(-2), { ...t, id }]);
      const timer = window.setTimeout(() => dismissToast(id), 3600);
      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    },
    []
  );

  const value = useMemo<AppState>(
    () => ({
      themePref,
      theme,
      setThemePref,
      notifications,
      unread,
      markRead,
      markAllRead,
      removeNotification,
      transactions,
      updateTransactions,
      toast,
      dismissToast,
    }),
    [themePref, theme, setThemePref, notifications, unread, markRead, markAllRead, removeNotification, transactions, updateTransactions, toast, dismissToast]
  );

  return (
    <AppContext.Provider value={value}>
      <ToastContext.Provider value={toasts}>{children}</ToastContext.Provider>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

export const useToasts = () => useContext(ToastContext);
