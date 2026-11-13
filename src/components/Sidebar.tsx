import { useState, type ReactNode } from 'react';
import {
  ChevronUp,
  Circle,
  Clock3,
  FolderOpen,
  Gem,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/app';

import {
  KPIS,
  REPORTS,
  STATUS_META,
  type TimeRange,
  type TxStatus,
} from '../data';
import { Count, Segmented } from './primitives';
import styles from './Sidebar.module.scss';

type ListPanelProps = {
  range: TimeRange;
  onRange: (r: TimeRange) => void;
  selectedKpi: string;
  onSelectKpi: (id: string) => void;
  status: TxStatus | 'all';
  onStatus: (s: TxStatus | 'all') => void;
};

const Group = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.group}>
      <button type="button" className={styles.groupHeader} aria-expanded={open} onClick={() => setOpen(!open)}>
        {icon}
        <span>{label}</span>
        <ChevronUp size={14} aria-hidden className={`${styles.chevron} ${open ? '' : styles.chevronClosed}`} />
      </button>
      {open ? <ul className={styles.tree}>{children}</ul> : null}
    </div>
  );
};

const TREE_TONES = ['peach', 'lavender', 'mint', 'lavender'] as const;

export const ListPanel = ({ range, onRange, selectedKpi, onSelectKpi, status, onStatus }: ListPanelProps) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { transactions } = useApp();
  const q = query.trim().toLowerCase();
  const kpis = KPIS.filter((k) => k.title.toLowerCase().includes(q));
  const counts = (Object.keys(STATUS_META) as TxStatus[]).map((s) => ({
    status: s,
    count: transactions.filter((t) => t.status === s).length,
  }));

  return (
    <aside className={styles.panel} aria-label="Overview sections">
      <h2 className={styles.panelTitle}>Overview</h2>

      <Segmented
        label="Time range"
        value={range}
        onChange={onRange}
        options={[
          { value: '24h', label: '24h' },
          { value: '7d', label: '7d' },
          { value: '30d', label: '30d' },
        ]}
      />

      <label className={styles.search}>
        <Search size={15} aria-hidden />
        <input
          placeholder="Search metrics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search metrics"
        />
        <kbd className={styles.kbd}>⌘ K</kbd>
      </label>

      <div className={styles.panelScroll}>
        <Group icon={<Clock3 size={15} aria-hidden />} label="Key metrics">
          {kpis.map((k, i) => (
            <li key={k.id}>
              <button
                type="button"
                className={`${styles.treeItem} ${selectedKpi === k.id ? styles.treeItemActive : ''}`}
                onClick={() => onSelectKpi(k.id)}
              >
                <span className={styles.treeName}># {k.title}</span>
                {selectedKpi === k.id ? (
                  <span className={styles.treeTag}>{k.change}</span>
                ) : (
                  <Count value={k.progress} tone={TREE_TONES[i % TREE_TONES.length]} />
                )}
              </button>
            </li>
          ))}
          {kpis.length === 0 ? <li className={styles.treeEmpty}>No metrics match “{query}”</li> : null}
        </Group>

        <button
          type="button"
          className={`${styles.flatItem} ${status === 'all' ? styles.flatItemActive : ''}`}
          onClick={() => onStatus('all')}
        >
          <FolderOpen size={15} aria-hidden />
          <span>All transactions</span>
          <Count value={transactions.length} />
        </button>

        <Group icon={<Circle size={15} aria-hidden />} label="Payment status">
          {counts.map(({ status: s, count }) => (
            <li key={s}>
              <button
                type="button"
                className={`${styles.treeItem} ${status === s ? styles.treeItemActive : ''}`}
                onClick={() => onStatus(s)}
              >
                <span className={styles.treeName}># {STATUS_META[s].label}</span>
                <Count value={count} tone={STATUS_META[s].tone} />
              </button>
            </li>
          ))}
        </Group>

        <Group icon={<Gem size={15} aria-hidden />} label="Reports">
          {REPORTS.map((r) => (
            <li key={r.id}>
              <button type="button" className={styles.treeItem} onClick={() => navigate('/reports')}>
                <span className={styles.treeName}># {r.label}</span>
                <Count value={r.count} tone={r.tone} />
              </button>
            </li>
          ))}
        </Group>

        <button type="button" className={styles.flatItem} onClick={() => navigate('/customers')}>
          <Users size={15} aria-hidden />
          <span>Customers</span>
          <Count value={7} />
        </button>
      </div>

      <button type="button" className={styles.newBtn} onClick={() => navigate('/reports')}>
        <Plus size={15} aria-hidden />
        New report
      </button>
    </aside>
  );
};
