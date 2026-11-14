import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CircleHelp, LogOut, Menu, Moon, PanelLeft, Sun, X } from 'lucide-react';

import { Button, Modal, Toaster, cx, srOnly } from '../components/ui';
import { Count, Switch } from '../components/primitives';
import { ALL_ROUTES, RAIL_PRIMARY, RAIL_SECONDARY, type RailItem } from '../data';
import { CATEGORY_TOTALS } from '../content/templates';
import { useApp } from '../lib/app';
import styles from './Shell.module.scss';

const COLLAPSE_KEY = 'axon:rail-collapsed';

const RailLink = ({ item, count, tone }: { item: RailItem; count?: number; tone?: 'muted' | 'alert' }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => cx(styles.railItem, isActive && styles.railItemActive)}
      title={item.label}
    >
      <Icon size={17} aria-hidden />
      <span className={styles.railLabel}>{item.label}</span>
      {count ? (
        <span className={styles.railCount}>
          <Count value={count} tone={tone} />
        </span>
      ) : null}
    </NavLink>
  );
};

export const Shell = () => {
  const { theme, setThemePref, unread, transactions } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      } catch {
        /* ignore */
      }
      return !c;
    });
  };

  // Close the phone drawer on navigation
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // The rail scrolls on short screens — keep the current item in view after navigation and when the drawer opens.
  useEffect(() => {
    document.querySelector('nav[aria-label="Workspace navigation"] a[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
  }, [location.pathname, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const current = ALL_ROUTES.find((r) => location.pathname.startsWith(r.path));
  useEffect(() => {
    document.title = current ? `${current.label} · Acme` : 'Acme';
  }, [current]);

  const pendingOrders = transactions.filter((t) => t.status === 'pending').length;
  const counts: Record<string, { count?: number; tone?: 'muted' | 'alert' }> = {
    templates: { count: CATEGORY_TOTALS.All, tone: 'muted' },
    orders: { count: pendingOrders, tone: 'muted' },
    notifications: { count: unread, tone: 'alert' },
  };

  const dark = theme === 'dark';

  return (
    <div className={styles.stage}>
      {/* Phone top bar */}
      <header className={styles.mobileBar}>
        <button type="button" className={styles.mobileMenuBtn} onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen}>
          <Menu size={20} />
        </button>
        <span className={styles.mobileTitle}>{current?.label ?? 'Acme'}</span>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setThemePref(dark ? 'light' : 'dark')}
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className={styles.frame}>
        {mobileOpen ? <div className={styles.scrim} onClick={() => setMobileOpen(false)} aria-hidden /> : null}

        <nav
          className={cx(styles.rail, collapsed && styles.railCollapsed, mobileOpen && styles.railOpen)}
          aria-label="Workspace navigation"
        >
          <div className={styles.brand}>
            {/* The name comes from the content, so it always contains the visible text (axe
                label-content-name-mismatch) and still exists when the rail hides "Acme". */}
            <Link to="/overview" className={styles.brandLink}>
              <span className={styles.brandMark} aria-hidden>
                A
              </span>
              <span className={styles.brandName}>Acme</span>
              <span className={srOnly}>Go to overview</span>
            </Link>
            <button type="button" className={cx(styles.iconBtn, styles.collapseBtn)} onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <PanelLeft size={15} aria-hidden />
            </button>
            <button type="button" className={cx(styles.iconBtn, styles.closeBtn)} onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className={styles.railScroll}>
            <div className={styles.railGroup}>
              {RAIL_PRIMARY.map((item) => (
                <RailLink key={item.id} item={item} {...counts[item.id]} />
              ))}
            </div>
            <hr className={styles.railDivider} />
            <div className={styles.railGroup}>
              {RAIL_SECONDARY.map((item) => (
                <RailLink key={item.id} item={item} {...counts[item.id]} />
              ))}
            </div>
          </div>

          <div className={styles.railFooter}>
            <button type="button" className={styles.railItem} onClick={() => setLogoutOpen(true)} title="Log out">
              <LogOut size={17} aria-hidden />
              <span className={styles.railLabel}>Log out</span>
            </button>
            <NavLink to="/help" className={({ isActive }) => cx(styles.railItem, isActive && styles.railItemActive)} title="Help">
              <CircleHelp size={17} aria-hidden />
              <span className={styles.railLabel}>Help</span>
            </NavLink>
            <div className={styles.themeRow}>
              <button
                type="button"
                className={styles.themeIcon}
                onClick={() => setThemePref(dark ? 'light' : 'dark')}
                aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
                title="Toggle theme"
              >
                {dark ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
              </button>
              <span className={styles.themeSwitch}>
                <Switch id="dark-mode" label="Dark mode" checked={dark} onChange={(v) => setThemePref(v ? 'dark' : 'light')} />
              </span>
            </div>
          </div>
        </nav>

        <Outlet />
      </div>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out of Acme?"
        description="You will need to sign in again to open the workspace."
        width="sm"
        footer={
          <>
            <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setLogoutOpen(false);
                navigate('/signed-out');
              }}
            >
              Log out
            </Button>
          </>
        }
      >
        <span />
      </Modal>
      <Toaster />
    </div>
  );
};
