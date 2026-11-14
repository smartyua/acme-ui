import { useEffect, useId, type ButtonHTMLAttributes, type Ref, type CSSProperties, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { Search, Sparkles, X } from 'lucide-react';

import { APPS, type AppId } from '../content/templates';
import { useApp } from '../lib/app';
import styles from './ui.module.scss';

export const cx = (...parts: Array<string | false | undefined | null>) => parts.filter(Boolean).join(' ');

// ── Button ───────────────────────────────────────────────────────────────
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
  icon?: ReactNode;
  block?: boolean;
};

export const Button = ({ variant = 'secondary', size = 'md', icon, block, className, children, type = 'button', ...rest }: ButtonProps) => (
  <button
    type={type}
    className={cx(styles.btn, styles[`btn-${variant}`], styles[`btn-${size}`], block && styles.btnBlock, className)}
    {...rest}
  >
    {icon}
    {children}
  </button>
);

// ── Badge ────────────────────────────────────────────────────────────────
export type BadgeTone = 'neutral' | 'accent' | 'mint' | 'lemon' | 'rose' | 'sky' | 'lavender' | 'peach' | 'muted';

export const Badge = ({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) => (
  <span className={cx(styles.badge, styles[`badge-${tone}`], className)}>{children}</span>
);

// ── Page header ──────────────────────────────────────────────────────────
export const PageHeader = ({ title, lead, actions }: { title: string; lead?: ReactNode; actions?: ReactNode }) => (
  <header className={styles.pageHeader}>
    <div className={styles.pageHeading}>
      <h1>{title}</h1>
      {lead ? <p>{lead}</p> : null}
    </div>
    {actions ? <div className={styles.pageActions}>{actions}</div> : null}
  </header>
);

// ── Surfaces ─────────────────────────────────────────────────────────────
export const Panel = ({
  title,
  description,
  actions,
  children,
  className,
  flush,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) => (
  <section className={cx(styles.panel, flush && styles.panelFlush, className)}>
    {title || actions ? (
      <header className={styles.panelHeader}>
        <div>
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className={styles.panelActions}>{actions}</div> : null}
      </header>
    ) : null}
    {children}
  </section>
);

// Horizontal-scroll wrapper so wide tables never break the layout on phones.
// Pass `label` when the table has no focusable cells, so keyboard users can still scroll it.
export const TableWrap = ({ children, label }: { children: ReactNode; label?: string }) =>
  label ? (
    <div className={styles.tableWrap} role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  ) : (
    <div className={styles.tableWrap}>{children}</div>
  );

export const tableClass = styles.table;

// ── Form controls ────────────────────────────────────────────────────────
export const Input = ({ className, label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) =>
  label ? (
    <label className={styles.fieldLabel}>{label}<input className={cx(styles.input, className)} {...rest} /></label>
  ) : (
    <input className={cx(styles.input, className)} {...rest} />
  );

export const Textarea = ({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cx(styles.input, styles.textarea, className)} {...rest} />
);

export const Select = ({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <span className={cx(styles.selectWrap, className)}>
    <select className={styles.select} {...rest}>
      {children}
    </select>
  </span>
);

export const FormField = ({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) => {
  const id = useId();
  return (
    <div className={styles.formField}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint ? <span className={styles.formHint}>{hint}</span> : null}
    </div>
  );
};

export const SearchBox = ({
  value,
  onChange,
  placeholder,
  shortcut,
  inputRef,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  shortcut?: string;
  inputRef?: Ref<HTMLInputElement>;
  label?: string;
  className?: string;
}) => (
  <label className={cx(styles.search, className)}>
    <Search size={15} aria-hidden />
    <input ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label ?? placeholder} />
    {shortcut ? <kbd className={styles.kbd}>{shortcut}</kbd> : null}
  </label>
);

// ── Pill tabs (with counts) ──────────────────────────────────────────────
export const PillTabs = <T extends string>({
  value,
  onChange,
  items,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  items: Array<{ value: T; label: string; count?: number | string }>;
  label: string;
}) => (
  <div className={styles.pills} role="tablist" aria-label={label}>
    {items.map((it) => (
      <button
        key={it.value}
        type="button"
        role="tab"
        aria-selected={value === it.value}
        className={cx(styles.pill, value === it.value && styles.pillActive)}
        onClick={() => onChange(it.value)}
      >
        {it.label}
        {it.count !== undefined ? <span className={styles.pillCount}>{it.count}</span> : null}
      </button>
    ))}
  </div>
);

// ── App chip (integration monogram) ──────────────────────────────────────
export const AppChip = ({ app, size = 'md' }: { app: AppId; size?: 'sm' | 'md' | 'lg' }) => {
  const meta = APPS[app];
  if (app === 'ai') {
    return (
      <span className={cx(styles.appChip, styles[`appChip-${size}`], styles.appChipAi)} title={meta.name}>
        <Sparkles size="55%" strokeWidth={1.8} aria-hidden />
        <span className={styles.srOnly}>{meta.name}</span>
      </span>
    );
  }
  return (
    <span className={cx(styles.appChip, styles[`appChip-${size}`])} style={{ '--hue': meta.hue } as CSSProperties} title={meta.name}>
      {meta.mono}
      <span className={styles.srOnly}>{meta.name}</span>
    </span>
  );
};

// ── Overlays ─────────────────────────────────────────────────────────────
const useEscape = (open: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
};

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}) => {
  useEscape(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx(styles.modal, styles[`modal-${width}`])} role="dialog" aria-modal="true" aria-label={title}>
        <header className={styles.modalHeader}>
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
            <X size={16} aria-hidden />
          </button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        {footer ? <footer className={styles.modalFooter}>{footer}</footer> : null}
      </div>
    </div>,
    document.body
  );
};

export const Drawer = ({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  useEscape(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={title}>
        <header className={styles.modalHeader}>
          <h2>{title}</h2>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
            <X size={16} aria-hidden />
          </button>
        </header>
        <div className={styles.drawerBody}>{children}</div>
        {footer ? <footer className={styles.modalFooter}>{footer}</footer> : null}
      </aside>
    </div>,
    document.body
  );
};

// ── Toasts ───────────────────────────────────────────────────────────────
export const Toaster = () => {
  const { toasts, dismissToast } = useApp();
  return createPortal(
    <div className={styles.toaster} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx(styles.toast, t.tone && styles[`toast-${t.tone}`])} role="status">
          <div>
            <strong>{t.title}</strong>
            {t.description ? <span>{t.description}</span> : null}
          </div>
          <button type="button" className={styles.iconBtn} onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            <X size={14} aria-hidden />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

// ── Misc ─────────────────────────────────────────────────────────────────
export const Empty = ({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) => (
  <div className={styles.empty}>
    {icon ? <span className={styles.emptyIcon}>{icon}</span> : null}
    <strong>{title}</strong>
    {children ? <span>{children}</span> : null}
  </div>
);

export const Meter = ({ value, max, tone = 'accent', label }: { value: number; max: number; tone?: 'accent' | 'warning' | 'danger'; label?: string }) => (
  <div className={styles.meter} role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
    <span className={cx(styles.meterFill, styles[`meter-${tone}`])} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
  </div>
);

export const Sparkline = ({ data, up = true }: { data: number[]; up?: boolean }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26 - 2}`).join(' ');
  return (
    <svg className={cx(styles.spark, up ? styles.sparkUp : styles.sparkDown)} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const srOnly = styles.srOnly;
