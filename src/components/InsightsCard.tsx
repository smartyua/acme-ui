import { ChevronRight, Sparkles } from 'lucide-react';

import { KPIS, RANGE_LABEL, type Kpi, type TimeRange } from '../data';
import { Avatar, Count } from './primitives';
import { useApp } from '../lib/app';
import styles from './Cards.module.scss';

// Corner positions for the four hub nodes (percent of the diagram box)
const SLOTS = [
  { x: 16, y: 24, side: 'left', label: 'top' },
  { x: 84, y: 24, side: 'right', label: 'top' },
  { x: 16, y: 76, side: 'left', label: 'bottom' },
  { x: 84, y: 76, side: 'right', label: 'bottom' },
] as const;

const HubNode = ({ kpi, slot, active, onSelect }: { kpi: Kpi; slot: (typeof SLOTS)[number]; active: boolean; onSelect: () => void }) => {
  const Icon = kpi.icon;
  return (
    <div
      className={`${styles.hubNode} ${styles[`hubNode-${slot.side}`]} ${styles[`hubNode-${slot.label}`]}`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      <span className={styles.hubCaption}>
        {kpi.short}
        <Count value={kpi.change} tone={kpi.tone} />
      </span>
      <button
        type="button"
        className={`${styles.diamond} ${active ? styles.diamondActive : ''}`}
        onClick={onSelect}
        aria-pressed={active}
        aria-label={`${kpi.title}: ${kpi.value}`}
      >
        <Icon size={16} aria-hidden />
      </button>
      <span className={styles.hubAvatar}>
        <Avatar initials={kpi.owner} />
      </span>
    </div>
  );
};

export const InsightsCard = ({
  range,
  selectedKpi,
  onSelectKpi,
}: {
  range: TimeRange;
  selectedKpi: string;
  onSelectKpi: (id: string) => void;
}) => {
  const { transactions } = useApp();
  const completed = transactions.filter((t) => t.status === 'completed').length;

  return (
    <aside className={`${styles.card} ${styles.insights}`} aria-labelledby="insights-title">
      <header className={styles.insightsHeader}>
        <h2 id="insights-title">
          <Sparkles size={14} aria-hidden />
          What Acme is tracking
        </h2>
        <span>Live · {RANGE_LABEL[range]}</span>
      </header>
      <p className={styles.insightsLead}>
        The workspace reads the numbers on the left and flags only the metrics that need attention.
      </p>

      <div className={styles.hub}>
        <svg className={styles.hubLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <line x1="16" y1="24" x2="16" y2="76" />
          <line x1="84" y1="24" x2="84" y2="76" />
          <line x1="16" y1="50" x2="84" y2="50" />
        </svg>
        <div className={styles.hubCenter}>
          <span className={styles.hubMark}>A</span>
          Acme
        </div>
        {KPIS.map((k, i) => (
          <HubNode key={k.id} kpi={k} slot={SLOTS[i]} active={selectedKpi === k.id} onSelect={() => onSelectKpi(k.id)} />
        ))}
      </div>

      <p className={styles.whyLabel}>Why each metric matters</p>
      <ul className={styles.whyList}>
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <li key={k.id}>
              <button
                type="button"
                className={`${styles.whyRow} ${selectedKpi === k.id ? styles.whyRowActive : ''}`}
                onClick={() => onSelectKpi(k.id)}
              >
                <span className={styles.whyIcon} aria-hidden>
                  <Icon size={15} />
                </span>
                <span className={styles.whyText}>
                  <span className={styles.whyReason}>{k.target}</span>
                  <span className={styles.whyAction}>
                    <ChevronRight size={14} aria-hidden />
                    {k.action}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <footer className={styles.insightsFoot}>
        <strong>
          {transactions.length} transactions · {completed} completed · about $13.5k settled
        </strong>
        <span>Sarah Chen signed a $24k ARR enterprise renewal</span>
      </footer>
    </aside>
  );
};
