import { type ReactNode } from 'react';
import { Check } from 'lucide-react';

import { cx } from './ui';
import styles from './EventTimeline.module.scss';

export type TimelineTone = 'neutral' | 'danger' | 'success' | 'accent';

export type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  value?: string;
  valueTone?: TimelineTone;
  detail?: string;
  tone?: TimelineTone;
  segmentTone?: TimelineTone;
  completed?: boolean;
  icon?: ReactNode;
};

export type EventTimelineProps = {
  events: TimelineEvent[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
};

export const EventTimeline = ({
  events,
  activeId,
  onSelect,
  ariaLabel = 'Route events',
  className,
}: EventTimelineProps) => (
  <ol className={cx(styles.list, className)} aria-label={ariaLabel}>
    {events.map((ev, idx) => {
      const isActive = ev.id === activeId;
      const isLast = idx === events.length - 1;
      const tone = ev.tone ?? 'neutral';
      const segTone = ev.segmentTone ?? 'neutral';

      const body = (
        <>
          <span className={styles.rail} aria-hidden>
            <span
              className={cx(
                styles.node,
                styles[`node-${tone}`],
                isActive && styles.nodeActive,
                ev.completed && styles.nodeCompleted,
              )}
            >
              {ev.icon ? ev.icon : ev.completed ? <Check size={14} aria-hidden /> : null}
            </span>
            {!isLast ? <span className={cx(styles.line, styles[`line-${segTone}`])} /> : null}
          </span>

          <span className={styles.content}>
            <span className={styles.topRow}>
              <strong className={styles.title}>{ev.title}</strong>
              <span className={styles.time}>{ev.time}</span>
            </span>
            {ev.value || ev.detail ? (
              <span className={styles.subRow}>
                {ev.value ? (
                  <span
                    className={cx(
                      styles.val,
                      ev.valueTone && ev.valueTone !== 'neutral' && styles[`val-${ev.valueTone}`],
                    )}
                  >
                    {ev.value}
                  </span>
                ) : null}
                {ev.value && ev.detail ? <span className={styles.sep}>·</span> : null}
                {ev.detail ? <span className={styles.detail}>{ev.detail}</span> : null}
              </span>
            ) : null}
          </span>
        </>
      );

      return (
        <li key={ev.id} className={styles.item}>
          {onSelect ? (
            <button
              type="button"
              className={cx(styles.row, styles.rowInteractive, isActive && styles.rowActive)}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => onSelect(ev.id)}
            >
              {body}
            </button>
          ) : (
            <div className={cx(styles.row, isActive && styles.rowActive)}>{body}</div>
          )}
        </li>
      );
    })}
  </ol>
);
