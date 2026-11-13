import { type Point } from '../data';
import styles from './Cards.module.scss';

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;

export const BarChart = ({ data, label }: { data: Point[]; label: string }) => {
  const max = Math.max(...data.map((d) => d.value));
  const peak = data.find((d) => d.value === max);

  return (
    <figure className={styles.chart} aria-label={label}>
      <div className={styles.chartBars}>
        {data.map((d) => (
          <div key={d.label} className={styles.chartCol}>
            <div className={styles.chartTrack}>
              <div
                className={`${styles.chartBar} ${d === peak ? styles.chartBarPeak : ''}`}
                style={{ height: `${Math.max(6, (d.value / max) * 100)}%` }}
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
