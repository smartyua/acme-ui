import { useState } from 'react';
import { ChevronRight, Download, Hourglass, Loader2, Radio, RefreshCw } from 'lucide-react';

import { InsightsCard } from '../components/InsightsCard';
import { MetricsCard } from '../components/MetricsCard';
import { Segmented, Switch } from '../components/primitives';
import { ListPanel } from '../components/Sidebar';
import { RANGE_LABEL, type TimeRange, type TxStatus } from '../data';
import { useApp } from '../lib/app';
import styles from './Overview.module.scss';

const stamp = () =>
  new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const OverviewPage = () => {
  const { toast } = useApp();
  const [range, setRange] = useState<TimeRange>('7d');
  const [status, setStatus] = useState<TxStatus | 'all'>('all');
  const [selectedKpi, setSelectedKpi] = useState('revenue');
  const [live, setLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [synced, setSynced] = useState('Jul 13, 2026, 10:16 AM');

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setSynced(stamp());
      toast({ title: 'Data refreshed', description: 'Dashboard metrics updated successfully.', tone: 'success' });
    }, 1200);
  };

  return (
    <>
        <ListPanel
          range={range}
          onRange={setRange}
          selectedKpi={selectedKpi}
          onSelectKpi={setSelectedKpi}
          status={status}
          onStatus={setStatus}
        />

        <main className={styles.main}>
          <div className={styles.topbar}>
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <span>Dashboard</span>
              <ChevronRight size={14} aria-hidden />
              <span className={styles.crumbCurrent} aria-current="page">
                Overview
              </span>
            </nav>
            <span className={styles.synced}>
              <span className={`${styles.dot} ${live ? styles.dotLive : ''}`} aria-hidden />
              Last synced {synced}
            </span>
          </div>

          <h1 className={styles.title}>Overview</h1>

          <div className={styles.actions}>
            <span className={styles.statusPill}>
              <Hourglass size={14} aria-hidden />
              {RANGE_LABEL[range]} window
            </span>
            <span className={styles.rangeCompact}>
              <Segmented
                label="Time range"
                size="sm"
                value={range}
                onChange={setRange}
                options={[
                  { value: '24h', label: '24h' },
                  { value: '7d', label: '7d' },
                  { value: '30d', label: '30d' },
                ]}
              />
            </span>
            <span className={styles.vsep} aria-hidden />
            <span className={styles.liveToggle}>
              <Radio size={16} aria-hidden />
              <Switch id="live-updates" label="Stream live updates" checked={live} onChange={setLive} />
            </span>
            <span className={styles.spacer} />
            <button type="button" className={styles.ghostBtn} onClick={() => toast({ title: 'Export started', description: 'CSV download will begin shortly.' })}>
              <Download size={14} aria-hidden />
              Export
            </button>
            <button type="button" className={styles.primaryBtn} onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 size={14} aria-hidden className="spin" />
              ) : (
                <RefreshCw size={14} aria-hidden />
              )}
              {refreshing ? 'Refreshing…' : 'Refresh data'}
            </button>
          </div>

          <div className={styles.grid}>
            <MetricsCard
              range={range}
              status={status}
              onStatus={setStatus}
              selectedKpi={selectedKpi}
              onSelectKpi={setSelectedKpi}
            />
            <InsightsCard range={range} selectedKpi={selectedKpi} onSelectKpi={setSelectedKpi} />
          </div>
        </main>
    </>
  );
};
