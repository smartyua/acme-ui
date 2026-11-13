import { type ReactNode } from 'react';
import { Check } from 'lucide-react';

import { AVATAR_TONE, type Tone } from '../data';
import styles from './primitives.module.scss';

const cx = (...parts: Array<string | false | undefined | null>) => parts.filter(Boolean).join(' ');

export const Count = ({ value, tone }: { value: ReactNode; tone?: Tone | 'muted' | 'alert' }) => (
  <span className={cx(styles.count, tone && styles[`tone-${tone}`])}>{value}</span>
);

export const Avatar = ({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' }) => (
  <span className={cx(styles.avatar, styles[`avatar-${size}`], styles[`tone-${AVATAR_TONE[initials] ?? 'sky'}`])} aria-hidden>
    {initials}
  </span>
);

export const Switch = ({
  checked,
  onChange,
  label,
  id,
  hideLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id: string;
  hideLabel?: boolean;
}) => (
  <label className={styles.switchRow} htmlFor={id}>
    <span className={hideLabel ? styles.visuallyHidden : undefined}>{label}</span>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      className={cx(styles.switch, checked && styles.switchOn)}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switchThumb} />
    </button>
  </label>
);

export type SegmentedOption<T extends string> = { value: T; label: string; icon?: ReactNode };

export const Segmented = <T extends string>({
  value,
  options,
  onChange,
  label,
  size = 'md',
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (next: T) => void;
  label: string;
  size?: 'sm' | 'md';
}) => (
  <div className={cx(styles.segmented, styles[`segmented-${size}`])} role="radiogroup" aria-label={label}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        role="radio"
        aria-checked={opt.value === value}
        className={cx(styles.segment, opt.value === value && styles.segmentActive)}
        onClick={() => onChange(opt.value)}
      >
        {opt.icon}
        {opt.label}
      </button>
    ))}
  </div>
);

export const Checkbox = ({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) => (
  <label className={styles.checkRow}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className={styles.checkInput} />
    <span className={cx(styles.checkBox, checked && styles.checkBoxOn)} aria-hidden>
      {checked ? <Check size={13} strokeWidth={3} /> : null}
    </span>
    <span className={styles.checkText}>
      <span>{label}</span>
      {hint ? <span className={styles.checkHint}>{hint}</span> : null}
    </span>
  </label>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    <div className={styles.fieldWell}>{children}</div>
  </div>
);

export const SectionLabel = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <div className={styles.sectionLabel}>
    {icon}
    <span>{children}</span>
  </div>
);
