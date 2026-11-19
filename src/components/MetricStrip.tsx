import { type ReactNode } from 'react';

import { cx } from './ui';
import styles from './MetricStrip.module.scss';

export type MetricTone = 'default' | 'danger' | 'success' | 'warning';

export type MetricItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  value: string;
  detail?: string;
  tone?: MetricTone;
};

export type MetricStripProps = {
  items: MetricItem[];
  className?: string;
};

export const MetricStrip = ({ items, className }: MetricStripProps) => (
  <div className={cx(styles.strip, className)}>
    {items.map((item) => (
      <div key={item.id} className={styles.cell}>
        <div className={styles.labelRow}>
          {item.icon ? <span className={styles.icon}>{item.icon}</span> : null}
          <span>{item.label}</span>
        </div>
        <strong className={cx(styles.value, item.tone && item.tone !== 'default' && styles[`tone-${item.tone}`])}>
          {item.value}
        </strong>
        {item.detail ? <span className={styles.detail}>{item.detail}</span> : null}
      </div>
    ))}
  </div>
);
