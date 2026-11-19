import { Check, Warehouse } from 'lucide-react';

import { cx } from './ui';
import styles from './RouteMap.module.scss';

export type MapLandmark = {
  label: string;
  x: number;
  y: number;
  region?: boolean;
};

export type RoutePathSegment = {
  id: string;
  d: string;
  tone: 'success' | 'danger' | 'neutral';
};

export type MapWaypoint = {
  id: string;
  label: string;
  /** Position in percentage of the 520x300 map canvas (0..100). */
  xPct: number;
  yPct: number;
  kind: 'origin' | 'destination' | 'alert' | 'neutral';
  pinLabel?: string;
  callout?: { value: string; time: string; alert?: boolean };
};

export type RouteMapProps = {
  segments: RoutePathSegment[];
  waypoints: MapWaypoint[];
  landmarks?: MapLandmark[];
  activeWaypointId?: string | null;
  onSelectWaypoint?: (id: string) => void;
  scaleLabel?: string;
  attribution?: string;
  ariaLabel: string;
  className?: string;
};

export const RouteMap = ({
  segments,
  waypoints,
  landmarks = [],
  activeWaypointId,
  onSelectWaypoint,
  scaleLabel = '25 km',
  attribution = 'Schematic telemetry map',
  ariaLabel,
  className,
}: RouteMapProps) => {
  const activeWaypoint = waypoints.find((w) => w.id === activeWaypointId);

  return (
    <div className={cx(styles.map, className)} role="region" aria-label={ariaLabel}>
      <svg
        className={styles.svg}
        viewBox="0 0 520 300"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Subtle regional road & border lines */}
        <path
          className={styles.borderPath}
          d="M 10 170 Q 120 155 215 178 T 410 198 L 510 218"
          fill="none"
        />
        <path
          className={styles.borderPath}
          d="M 435 12 Q 452 105 462 195 L 448 292"
          fill="none"
        />
        <path
          className={styles.roadPath}
          d="M 85 20 Q 145 125 182 285 M 290 10 Q 305 135 280 290 M 15 98 Q 220 112 505 88"
          fill="none"
        />

        {/* Landmarks & region captions */}
        {landmarks.map((lm) => (
          <g key={lm.label}>
            {!lm.region ? (
              <circle cx={lm.x} cy={lm.y} r="2.5" className={styles.cityDot} />
            ) : null}
            <text
              x={lm.region ? lm.x : lm.x + 7}
              y={lm.region ? lm.y : lm.y + 3}
              className={lm.region ? styles.regionText : styles.cityText}
            >
              {lm.label}
            </text>
          </g>
        ))}

        {/* Route casing glow + strokes */}
        {segments.map((seg) => (
          <g key={seg.id}>
            <path
              d={seg.d}
              fill="none"
              className={cx(styles.routeHalo, styles[`halo-${seg.tone}`])}
            />
            <path
              d={seg.d}
              fill="none"
              className={cx(styles.routeStroke, styles[`stroke-${seg.tone}`])}
            />
          </g>
        ))}
      </svg>

      {/* Active waypoint floating callout */}
      {activeWaypoint?.callout ? (
        <div
          className={styles.callout}
          style={{ left: `${activeWaypoint.xPct}%`, top: `${activeWaypoint.yPct}%` }}
        >
          <strong className={activeWaypoint.callout.alert ? styles.calloutAlert : undefined}>
            {activeWaypoint.callout.value}
          </strong>
          <span>{activeWaypoint.callout.time}</span>
        </div>
      ) : null}

      {/* Interactive waypoints */}
      {waypoints.map((wp) => {
        const isActive = wp.id === activeWaypointId;
        return (
          <div
            key={wp.id}
            className={styles.pinAnchor}
            style={{ left: `${wp.xPct}%`, top: `${wp.yPct}%` }}
          >
            {wp.pinLabel ? <span className={styles.pinLabel}>{wp.pinLabel}</span> : null}
            <button
              type="button"
              className={cx(
                styles.pinBtn,
                styles[`pin-${wp.kind}`],
                isActive && styles.pinActive,
              )}
              aria-label={wp.label}
              aria-pressed={isActive}
              onClick={() => onSelectWaypoint?.(wp.id)}
            >
              {wp.kind === 'origin' ? (
                <Warehouse size={14} aria-hidden />
              ) : wp.kind === 'destination' ? (
                <Check size={14} aria-hidden />
              ) : null}
            </button>
          </div>
        );
      })}

      {/* Scale & attribution */}
      <div className={styles.footer}>
        <span className={styles.scale}>
          <span>{scaleLabel}</span>
          <span className={styles.scaleBar} aria-hidden />
        </span>
        <span className={styles.attribution}>{attribution}</span>
      </div>
    </div>
  );
};
