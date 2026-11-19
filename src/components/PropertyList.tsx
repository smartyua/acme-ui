import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

import { Avatar } from './primitives';
import { Badge, type BadgeTone, cx } from './ui';
import styles from './PropertyList.module.scss';

export const PropertyList = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx(styles.list, className)}>{children}</div>
);

export type PropertyRowProps = {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  onClick?: () => void;
  actionLabel?: string;
  className?: string;
};

export const PropertyRow = ({ icon, label, value, onClick, actionLabel, className }: PropertyRowProps) => {
  if (onClick) {
    return (
      <button
        type="button"
        className={cx(styles.row, styles.rowInteractive, className)}
        onClick={onClick}
        aria-label={actionLabel}
      >
        <span className={styles.label}>
          {icon ? <span className={styles.icon}>{icon}</span> : null}
          <span>{label}</span>
        </span>
        <span className={styles.value}>
          {value}
          <ChevronRight size={14} className={styles.chevron} aria-hidden />
        </span>
      </button>
    );
  }

  return (
    <div className={cx(styles.row, className)}>
      <span className={styles.label}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <span>{label}</span>
      </span>
      <span className={styles.value}>{value}</span>
    </div>
  );
};

export type MemberRowProps = {
  initials: string;
  name: string;
  role: string;
  badge?: { label: string; tone: BadgeTone };
  offline?: boolean;
  onClick?: () => void;
  className?: string;
};

export const MemberRow = ({ initials, name, role, badge, offline, onClick, className }: MemberRowProps) => {
  const inner = (
    <>
      <Avatar initials={initials} size="md" tone={offline ? 'muted' : undefined} />
      <span className={styles.memberText}>
        <span className={cx(styles.memberName, offline && styles.memberOffline)}>{name}</span>
        <span className={styles.memberRole}>{role}</span>
      </span>
      {badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={cx(styles.member, styles.memberBtn, className)} onClick={onClick}>
        {inner}
      </button>
    );
  }

  return <div className={cx(styles.member, className)}>{inner}</div>;
};
