import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Banknote,
  Info,
  LayoutGrid,
  ListChecks,
  ReceiptText,
} from 'lucide-react';

import {
  KPIS,
  RANGE_LABEL,
  RANGE_PREV,
  REVENUE_BY_RANGE,
  STATUS_META,
  type TimeRange,
  type TxStatus,
} from '../data';
import { BarChart } from './BarChart';
import { Avatar, Checkbox, Count, Field, SectionLabel, Segmented } from './primitives';
import { useApp } from '../lib/app';
import styles from './Cards.module.scss';

type Props = {
  range: TimeRange;
  status: TxStatus | 'all';
  onStatus: (s: TxStatus | 'all') => void;
  selectedKpi: string;
  onSelectKpi: (id: string) => void;
};

export const MetricsCard = ({ range, status, onStatus, selectedKpi, onSelectKpi }: Props) => {
  const [hideFailed, setHideFailed] = useState(false);
  const { transactions } = useApp();

  const rows = useMemo(
    () =>
      transactions.filter((t) => (status === 'all' ? true : t.status === status)).filter(
        (t) => !(hideFailed && t.status === 'failed')
      ),
    [status, hideFailed, transactions]
  );

  return (
    <section className={styles.card} aria-labelledby="metrics-title">
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden>
          <LayoutGrid size={17} />
        </span>
        <div className={styles.cardHeading}>
          <h2 id="metrics-title">Key metrics</h2>
          <p>Headline numbers for the selected {RANGE_LABEL[range]} period.</p>
        </div>
        <span className={styles.chip}>Synced Jul 13</span>
      </header>

      <div className={styles.section}>
        <SectionLabel icon={<Banknote size={15} aria-hidden />}>Revenue &amp; growth</SectionLabel>
        <div className={styles.kpiGrid}>
          {KPIS.map((k) => {
            const Icon = k.icon;
            const Trend = k.trend === 'up' ? ArrowUpRight : ArrowDownRight;
            return (
              <button
                key={k.id}
                type="button"
                className={`${styles.kpiButton} ${selectedKpi === k.id ? styles.kpiButtonActive : ''}`}
                onClick={() => onSelectKpi(k.id)}
                aria-pressed={selectedKpi === k.id}
              >
                <Field label={k.title}>
                  <Icon size={15} aria-hidden />
                  <span className={styles.kpiValue}>{k.value}</span>
                  <span className={`${styles.trend} ${k.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                    <Trend size={12} aria-hidden />
                    {k.change}
                  </span>
                </Field>
              </button>
            );
          })}
        </div>
        <p className={styles.note}>Compared with the previous {RANGE_PREV[range]}.</p>
      </div>

      <div className={styles.section}>
        <SectionLabel icon={<BarChart3 size={15} aria-hidden />}>Revenue overview</SectionLabel>
        <BarChart data={REVENUE_BY_RANGE[range]} label={`Revenue, ${RANGE_LABEL[range]} window`} />
      </div>

      <div className={styles.section}>
        <SectionLabel icon={<ReceiptText size={15} aria-hidden />}>Recent transactions</SectionLabel>
        <span className={styles.subLabel}>Payment status</span>
        <Segmented
          label="Payment status"
          value={status}
          onChange={onStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'completed', label: 'Completed', icon: <ListChecks size={14} aria-hidden /> },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
          ]}
        />
        <Checkbox
          checked={hideFailed}
          onChange={setHideFailed}
          label="Hide failed payments"
          hint="Declined cards and expired payment links"
        />
        <ul className={styles.txList}>
          {rows.slice(0, 4).map((t) => (
            <li key={t.id} className={styles.txRow}>
              <Avatar initials={t.initials} />
              <div className={styles.txWho}>
                <span>{t.customer}</span>
                <span className={styles.txMeta}>
                  {t.id} · {t.date}
                </span>
              </div>
              <Count value={STATUS_META[t.status].label} tone={STATUS_META[t.status].tone} />
              <span className={styles.txAmount}>{t.amount}</span>
            </li>
          ))}
          {rows.length === 0 ? <li className={styles.txEmpty}>No transactions for this filter.</li> : null}
        </ul>
        {rows.length > 4 ? <span className={styles.note}>+{rows.length - 4} more in Orders</span> : null}
      </div>

      <footer className={styles.cardFoot}>
        <Info size={14} aria-hidden />
        Change the time range and the checks on the right update instantly.
      </footer>
    </section>
  );
};
