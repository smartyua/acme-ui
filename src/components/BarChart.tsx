import { type Point } from '../data';
import styles from './Cards.module.scss';

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;

export const BarChart = ({ data, label }: { data: Point[]; label: string }) => {
  const max = Math.max(0, ...data.map((d) => d.value));
  const safeMax = max > 0 ? max : 1;
  const peak = max > 0 ? data.find((d) => d.value === max) : undefined;

  return (
    <figure className={styles.chart} aria-label={label}>
      <div className={styles.chartBars}>
        {data.map((d) => (
          <div key={d.label} className={styles.chartCol}>
            <div className={styles.chartTrack}>
              <div
                className={`${styles.chartBar} ${d === peak ? styles.chartBarPeak : ''}`}
                style={{ height: `${Math.max(6, (d.value / safeMax) * 100)}%` }}
                title={`${d.label}: ${fmt(d.value)}`}
              >
                <span className={styles.chartTip}>{fmt(d.value)}</span>
              </div>
            </div>
            <span className={styles.chartLabel}>{d.label}</span>
          </div>
        ))}
      </div>
      {peak ? (
        <figcaption className={styles.chartCaption}>
          Peak {peak.label} · {fmt(peak.value)}
        </figcaption>
      ) : null}
    </figure>
  );
};
