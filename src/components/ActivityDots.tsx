import { cx } from './ui';
import styles from './ActivityDots.module.scss';

export type ActivityLevel = 0 | 1 | 2 | 3;

export type ActivityDotItem = {
  level: ActivityLevel;
  label?: string;
};

export type ActivityDotsProps = {
  items: Array<ActivityLevel | ActivityDotItem>;
  label: string;
  className?: string;
};

export const ActivityDots = ({ items, label, className }: ActivityDotsProps) => (
  <div className={cx(styles.strip, className)} role="img" aria-label={label}>
    {items.map((item, idx) => {
      const level = typeof item === 'number' ? item : item.level;
      const title = typeof item === 'number' ? undefined : item.label;
      return (
        <span
          key={idx}
          className={cx(styles.dot, styles[`level-${level}`])}
          title={title}
          aria-hidden
        />
      );
    })}
  </div>
);
