import { type ReactNode } from 'react';

import { cx } from './ui';
import styles from './JourneyBar.module.scss';

export type JourneySegment = {
  id: string;
  weight: number;
  tone: 'success' | 'danger' | 'neutral' | 'accent';
  label: string;
  pill?: { icon?: ReactNode; text: string };
  markerPct?: number;
  onClick?: () => void;
};

export type JourneyEndpoint = {
  title: string;
  detail: ReactNode;
  icon: ReactNode;
  tone?: 'neutral' | 'success' | 'danger';
};

export type JourneyBarProps = {
  origin: JourneyEndpoint;
  destination: JourneyEndpoint;
  segments: JourneySegment[];
  className?: string;
};

export const JourneyBar = ({ origin, destination, segments, className }: JourneyBarProps) => (
  <div className={cx(styles.wrap, className)}>
    <div className={styles.trackRow}>
      <span
        className={cx(styles.endpointBadge, origin.tone && styles[`badge-${origin.tone}`])}
        aria-hidden
      >
        {origin.icon}
      </span>

      <div className={styles.segments} role="group" aria-label="Journey timeline progress">
        {segments.map((seg) => {
          const inner = (
            <>
              <span className={cx(styles.bar, styles[`bar-${seg.tone}`])} />
              {seg.pill ? (
                <span className={cx(styles.pill, styles[`pill-${seg.tone}`])}>
                  {seg.pill.icon}
                  <span>{seg.pill.text}</span>
                </span>
              ) : null}
              {seg.markerPct !== undefined && !seg.pill ? (
                <span
                  className={cx(styles.marker, styles[`marker-${seg.tone}`])}
                  style={{ left: `${seg.markerPct}%` }}
                  aria-hidden
                />
              ) : null}
            </>
          );

          if (seg.onClick) {
            return (
              <button
                key={seg.id}
                type="button"
                className={cx(styles.segSlot, styles.segBtn)}
                style={{ flexGrow: seg.weight }}
                aria-label={seg.label}
                onClick={seg.onClick}
              >
                {inner}
              </button>
            );
          }

          return (
            <div
              key={seg.id}
              className={styles.segSlot}
              style={{ flexGrow: seg.weight }}
              title={seg.label}
            >
              {inner}
            </div>
          );
        })}
      </div>

      <span
        className={cx(styles.endpointBadge, destination.tone && styles[`badge-${destination.tone}`])}
        aria-hidden
      >
        {destination.icon}
      </span>
    </div>

    <div className={styles.endpointsRow}>
      <div className={styles.endpointMeta}>
        <strong>{origin.title}</strong>
        <span>{origin.detail}</span>
      </div>
      <div className={cx(styles.endpointMeta, styles.endpointMetaRight)}>
        <strong>{destination.title}</strong>
        <span>{destination.detail}</span>
      </div>
    </div>
  </div>
);
