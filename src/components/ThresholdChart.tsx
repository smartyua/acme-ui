import { useState } from 'react';

import { cx } from './ui';
import styles from './ThresholdChart.module.scss';

export type ThresholdReading = {
  id: string;
  time: string;
  value: number;
};

export type ThresholdCallout = {
  rangeLabel: string;
  durationLabel: string;
  peakLabel: string;
};

export type ThresholdTick = {
  index: number;
  label: string;
  alert?: boolean;
};

export type ThresholdChartProps = {
  readings: ThresholdReading[];
  threshold: number;
  min: number;
  max: number;
  unit?: string;
  yTicks: number[];
  xTicks: ThresholdTick[];
  excursionRange?: [number, number];
  excursionCallout?: ThresholdCallout;
  legend?: {
    inRange: string;
    aboveRange: string;
    limit: string;
    caption?: string;
  };
  selectedIndex?: number | null;
  onSelectReading?: (index: number) => void;
  ariaLabel: string;
  className?: string;
};

const clampPct = (val: number, min: number, max: number) =>
  Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));

export const ThresholdChart = ({
  readings,
  threshold,
  min,
  max,
  unit = '°C',
  yTicks,
  xTicks,
  excursionRange,
  excursionCallout,
  legend,
  selectedIndex,
  onSelectReading,
  ariaLabel,
  className,
}: ThresholdChartProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const thresholdPct = clampPct(threshold, min, max);
  const activeIdx = hoveredIdx ?? selectedIndex ?? null;
  const activeReading = activeIdx !== null ? readings[activeIdx] : null;

  // Position the callout above the excursion peak by default, or above the hovered reading.
  const excursionMidPct = excursionRange
    ? (((excursionRange[0] + excursionRange[1]) / 2) / Math.max(1, readings.length - 1)) * 100
    : 50;
  const calloutLeftPct =
    activeIdx !== null
      ? Math.min(82, Math.max(18, (activeIdx / Math.max(1, readings.length - 1)) * 100))
      : Math.min(82, Math.max(18, excursionMidPct));

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.plotGrid}>
        {/* Y-axis */}
        <div className={styles.yAxis} aria-hidden>
          {yTicks.map((tick) => {
            const bottomPct = clampPct(tick, min, max);
            const isLimit = tick === threshold;
            return (
              <span
                key={tick}
                className={cx(styles.yTick, isLimit && styles.yTickLimit)}
                style={{ bottom: `${bottomPct}%` }}
              >
                {tick}°
              </span>
            );
          })}
        </div>

        {/* Plot canvas */}
        <div className={styles.canvas} role="group" aria-label={ariaLabel}>
          {/* Subtle horizontal guide lines */}
          {yTicks.map((tick) => (
            <span
              key={tick}
              className={cx(styles.guideLine, tick === threshold && styles.thresholdLine)}
              style={{ bottom: `${clampPct(tick, min, max)}%` }}
              aria-hidden
            />
          ))}

          {/* Floating callout */}
          {activeReading ? (
            <div
              className={cx(styles.callout, calloutLeftPct >= 55 && styles.calloutRight)}
              style={{ left: `${calloutLeftPct}%` }}
            >
              <span className={styles.calloutTime}>{activeReading.time}</span>
              <span className={styles.calloutBody}>
                <span
                  className={cx(
                    styles.calloutDot,
                    activeReading.value > threshold ? styles.calloutDotDanger : styles.calloutDotSuccess,
                  )}
                  aria-hidden
                />
                <strong>
                  {activeReading.value.toFixed(1)} {unit}
                </strong>
                <span
                  className={
                    activeReading.value > threshold ? styles.calloutAlert : styles.calloutMuted
                  }
                >
                  {activeReading.value > threshold
                    ? `+${(activeReading.value - threshold).toFixed(1)} ${unit} over limit`
                    : 'in range'}
                </span>
              </span>
            </div>
          ) : excursionCallout ? (
            <div
              className={cx(styles.callout, calloutLeftPct >= 55 && styles.calloutRight)}
              style={{ left: `${calloutLeftPct}%` }}
            >
              <span className={styles.calloutTime}>{excursionCallout.rangeLabel}</span>
              <span className={styles.calloutBody}>
                <span className={cx(styles.calloutDot, styles.calloutDotDanger)} aria-hidden />
                <strong>{excursionCallout.durationLabel}</strong>
                <span className={styles.calloutAlert}>{excursionCallout.peakLabel}</span>
              </span>
            </div>
          ) : null}

          {/* Reading columns */}
          <div className={styles.columns}>
            {readings.map((reading, idx) => {
              const valuePct = clampPct(reading.value, min, max);
              const isAbove = reading.value > threshold;
              const inExcursion =
                excursionRange !== undefined && idx >= excursionRange[0] && idx <= excursionRange[1];
              const isFocused = idx === activeIdx;

              const baseHeight = isAbove ? Math.max(0, thresholdPct - 1.5) : valuePct;
              const overBottom = thresholdPct + 1.5;
              const overHeight = isAbove ? Math.max(2, valuePct - overBottom) : 0;

              return (
                <button
                  key={reading.id}
                  type="button"
                  className={cx(
                    styles.colBtn,
                    inExcursion && styles.colExcursion,
                    isFocused && styles.colFocused,
                  )}
                  aria-label={`${reading.time}: ${reading.value.toFixed(1)} ${unit}`}
                  aria-pressed={selectedIndex === idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onFocus={() => setHoveredIdx(idx)}
                  onBlur={() => setHoveredIdx(null)}
                  onClick={() => onSelectReading?.(idx)}
                >
                  <span
                    className={cx(
                      styles.barBase,
                      inExcursion ? styles.barBaseHot : styles.barBaseDotted,
                    )}
                    style={{ height: `${baseHeight}%` }}
                  />
                  {isAbove ? (
                    <span
                      className={styles.barOver}
                      style={{ bottom: `${overBottom}%`, height: `${overHeight}%` }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-axis time rail */}
      <div className={styles.xRail} aria-hidden>
        {xTicks.map((tick) => {
          const pct = (tick.index / Math.max(1, readings.length - 1)) * 100;
          const edgeClass =
            pct <= 4 ? styles.xTickStart : pct >= 96 ? styles.xTickEnd : styles.xTickMid;
          return (
            <span
              key={`${tick.index}-${tick.label}`}
              className={cx(styles.xTick, edgeClass, tick.alert && styles.xTickAlert)}
              style={{ left: `${pct}%` }}
            >
              {tick.label}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      {legend ? (
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={cx(styles.legendSwatch, styles.swatchSuccess)} aria-hidden />
            {legend.inRange}
          </span>
          <span className={styles.legendItem}>
            <span className={cx(styles.legendSwatch, styles.swatchDanger)} aria-hidden />
            {legend.aboveRange}
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendLine} aria-hidden />
            {legend.limit}
          </span>
          {legend.caption ? <span className={styles.legendCaption}>{legend.caption}</span> : null}
        </div>
      ) : null}
    </div>
  );
};
