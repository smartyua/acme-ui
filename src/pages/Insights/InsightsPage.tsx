import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Clock,
  FileText,
  Lightbulb,
  MessageSquare,
  Percent,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';

import { Count } from '../../components/primitives';
import {
  Badge,
  Button,
  Drawer,
  Empty,
  FormField,
  Input,
  Modal,
  SearchBox,
  Select,
  cx,
} from '../../components/ui';
import { type Tone } from '../../data';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import s from '../pages.module.scss';
import {
  FOCUS_METRICS,
  HEATMAP_MATRIX,
  INITIAL_ALERTS,
  INITIAL_INSIGHTS,
  WHAT_CHANGED,
  type AlertRule,
  type InsightFilter,
  type InsightItem,
  type InsightKind,
  type InsightPeriod,
  type InsightSort,
} from './insightsData';
import styles from './InsightsPage.module.scss';

const KIND_LABEL: Record<InsightKind, string> = {
  risk: 'Risk',
  opportunity: 'Opportunity',
  trend: 'Trend',
};

const KindIcon = ({ kind }: { kind: InsightKind }) => {
  if (kind === 'risk') return <AlertTriangle size={16} aria-hidden />;
  if (kind === 'opportunity') return <Lightbulb size={16} aria-hidden />;
  return <Clock size={16} aria-hidden />;
};

const PrimaryCtaIcon = ({ id }: { id: string }) => {
  if (id === 'ins-1') return <MessageSquare size={14} aria-hidden />;
  if (id === 'ins-2') return <Users size={14} aria-hidden />;
  if (id === 'ins-3') return <Bell size={14} aria-hidden />;
  if (id === 'ins-4') return <RefreshCw size={14} aria-hidden />;
  return <Clock size={14} aria-hidden />;
};

const WhatChangedIcon = ({ id }: { id: string }) => {
  if (id === 'wc-1') return <UserPlus size={14} aria-hidden />;
  if (id === 'wc-2') return <TrendingUp size={14} aria-hidden />;
  if (id === 'wc-3') return <Percent size={14} aria-hidden />;
  if (id === 'wc-4') return <FileText size={14} aria-hidden />;
  return <Users size={14} aria-hidden />;
};

const InsightMiniChart = ({ item }: { item: InsightItem }) => (
  <div className={styles.chartWell}>
    <div className={styles.chartTopRow}>
      <span>{item.chartLabel}</span>
      <span className={styles.chartMetricGroup}>
        <strong>{item.chartValue}</strong>
        {item.chartDelta ? (
          <span
            className={
              item.chartDeltaTone === 'up' ? styles.deltaUp : styles.deltaDown
            }
          >
            {item.chartDelta}
          </span>
        ) : null}
      </span>
    </div>

    {item.chartType === 'rolling-line' ? (
      <>
        <svg
          className={styles.lineSvg}
          viewBox="0 0 180 44"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--rose)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--rose)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M2,8 L45,10 L95,15 L140,26 L178,40 L178,43 L2,43 Z"
            fill="url(#riskFill)"
          />
          <polyline
            points="2,8 45,10 95,15 140,26 178,40"
            fill="none"
            stroke="var(--rose)"
            strokeWidth="2"
          />
        </svg>
        <div className={styles.chartFootLabels} aria-hidden>
          <span>W23</span>
          <span>W27 · 25.7</span>
          <span>W31</span>
        </div>
      </>
    ) : null}

    {item.chartType === 'source-bars' ? (
      <div className={styles.sourceBarsGrid} aria-hidden>
        {[
          { label: 'Walk-in', h: 52, peak: false },
          { label: 'Referral', h: 86, peak: true },
          { label: 'Campaign', h: 60, peak: false },
          { label: 'Other', h: 38, peak: false },
        ].map((bar) => (
          <div key={bar.label} className={styles.sourceBarCol}>
            <span
              className={cx(
                styles.sourceCapsule,
                bar.peak && styles.sourceCapsulePeak,
              )}
              style={{ height: `${bar.h}%` }}
            />
            <span>{bar.label}</span>
          </div>
        ))}
      </div>
    ) : null}

    {item.chartType === 'report-split' ? (
      <div className={styles.splitReportWrap} aria-hidden>
        <div className={styles.splitReportLabels}>
          <span>31 reported</span>
          <span>27 missing</span>
        </div>
        <div className={styles.splitReportTrack}>
          <span className={styles.splitReported} />
          <span className={styles.splitMissing} />
        </div>
      </div>
    ) : null}

    {item.chartType === 'weekly-bars' ? (
      <>
        <div className={styles.weeklyBarsRow} aria-hidden>
          {[45, 52, 48, 56, 78, 86, 82, 96].map((h, idx) => (
            <span
              key={idx}
              className={cx(
                styles.weeklyBar,
                idx >= 4 && styles.weeklyBarHighlight,
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className={styles.chartFootLabels} aria-hidden>
          <span>W24</span>
          <span>W28</span>
          <span>W31</span>
        </div>
      </>
    ) : null}

    {item.chartType === 'hour-heatmap' ? (
      <div className={styles.heatmapGrid} aria-hidden>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, dIdx) => (
          <div key={day} className={styles.heatmapRow}>
            <span>{day}</span>
            {HEATMAP_MATRIX[dIdx].map((level, hIdx) => (
              <span
                key={hIdx}
                className={cx(styles.heatCell, styles[`heatCell-${level}`])}
              />
            ))}
          </div>
        ))}
      </div>
    ) : null}
  </div>
);

export const InsightsPage = () => {
  const { toast } = useApp();

  const [period, setPeriod] = useState<InsightPeriod>('this-week');
  const [filter, setFilter] = useState<InsightFilter>('all');
  const [sort, setSort] = useState<InsightSort>('impact');
  const [query, setQuery] = useState('');

  const [alerts, setAlerts] = useState<AlertRule[]>(INITIAL_ALERTS);
  const [activeInsight, setActiveInsight] = useState<InsightItem | null>(null);
  const [createAlertOpen, setCreateAlertOpen] = useState(false);
  const [manageAlertsOpen, setManageAlertsOpen] = useState(false);

  const [alertDraft, setAlertDraft] = useState<{
    title: string;
    subtitle: string;
    badge: string;
    tone: Tone;
  }>({
    title: '',
    subtitle: 'Network · checked daily at 06:00',
    badge: 'ACTIVE',
    tone: 'lavender',
  });

  const visibleInsights = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INITIAL_INSIGHTS.filter((it) => filter === 'all' || it.kind === filter)
      .filter(
        (it) =>
          !q ||
          `${it.title} ${it.body} ${it.source}`.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (sort === 'recency') return a.recencyRank - b.recencyRank;
        if (sort === 'confidence') return b.confidenceScore - a.confidenceScore;
        return b.impactScore - a.impactScore;
      });
  }, [filter, sort, query]);

  const handleCreateAlert = () => {
    if (!alertDraft.title.trim()) return;
    const created: AlertRule = {
      id: `al-${alerts.length + 1}`,
      title: alertDraft.title.trim(),
      subtitle: alertDraft.subtitle.trim() || 'Network · daily check',
      badge: alertDraft.badge.trim() || 'ACTIVE',
      tone: alertDraft.tone,
    };
    setAlerts((prev) => [created, ...prev]);
    setCreateAlertOpen(false);
    setAlertDraft({
      title: '',
      subtitle: 'Network · checked daily at 06:00',
      badge: 'ACTIVE',
      tone: 'lavender',
    });
    toast({
      title: 'Alert rule created',
      description: `“${created.title}” added to daily 06:00 checks.`,
      tone: 'success',
    });
  };

  return (
    <Page>
      <div className={styles.topMeta}>
        <div className={styles.breadcrumbs}>
          <span>Dashboard</span>
          <ChevronRight size={14} aria-hidden />
          <strong>Insights</strong>
        </div>
        <span>08:10 AST</span>
      </div>

      <header className={styles.headerRow}>
        <div className={styles.headingBlock}>
          <h1>Insights</h1>
          <p>
            Auto-generated from weekly reports, Stripe and CRM · Jul 4 – Jul 31, 2026 · updated 06:00 AST
          </p>
        </div>

        <div className={styles.headerActions}>
          <Select
            aria-label="Insight time window"
            value={period}
            onChange={(e) => setPeriod(e.target.value as InsightPeriod)}
          >
            <option value="this-week">This week</option>
            <option value="last-4-weeks">Last 4 weeks</option>
            <option value="qtd">Quarter to date</option>
          </Select>

          <Button
            icon={<Bell size={15} aria-hidden />}
            onClick={() => setManageAlertsOpen(true)}
          >
            Alerts ({alerts.length})
          </Button>

          <Button
            variant="primary"
            icon={<Plus size={15} aria-hidden />}
            onClick={() => setCreateAlertOpen(true)}
          >
            Create alert
          </Button>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.tabPills} role="tablist" aria-label="Insight categories">
          {(
            [
              { id: 'all', label: 'All', count: 12, icon: Sparkles },
              { id: 'opportunity', label: 'Opportunities', count: 5, icon: Lightbulb },
              { id: 'risk', label: 'Risks', count: 4, icon: AlertTriangle },
              { id: 'trend', label: 'Trends', count: 3, icon: TrendingUp },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                className={cx(
                  styles.tabBtn,
                  filter === tab.id && styles.tabBtnActive,
                )}
                onClick={() => setFilter(tab.id)}
              >
                <Icon size={14} aria-hidden />
                <span>{tab.label}</span>
                <span className={styles.tabCount}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.filterRight}>
          <Select
            aria-label="Sort insights"
            value={sort}
            onChange={(e) => setSort(e.target.value as InsightSort)}
          >
            <option value="impact">Sort: Impact</option>
            <option value="recency">Sort: Recency</option>
            <option value="confidence">Sort: Confidence</option>
          </Select>

          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search insights"
            shortcut="/"
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* ── Left Column: Insights Feed ─────────────────────────────── */}
        <div className={styles.feedCol}>
          {visibleInsights.length === 0 ? (
            <Empty icon={<Sparkles size={18} aria-hidden />} title="No insights match these filters">
              <Button
                size="sm"
                onClick={() => {
                  setFilter('all');
                  setQuery('');
                }}
              >
                Reset filters
              </Button>
            </Empty>
          ) : (
            visibleInsights.map((item) => (
              <article key={item.id} className={styles.insightCard}>
                <span
                  className={cx(styles.kindTile, styles[`kindTile-${item.kind}`])}
                  aria-hidden
                >
                  <KindIcon kind={item.kind} />
                </span>

                <div className={styles.cardContent}>
                  <div className={styles.cardMetaRow}>
                    <span className={cx(styles.kindPill, styles[`kindPill-${item.kind}`])}>
                      {KIND_LABEL[item.kind]}
                    </span>
                    <span>{item.source}</span>
                    <span aria-hidden>·</span>
                    <span>{item.time}</span>
                  </div>

                  <h2 className={styles.cardTitle}>{item.title}</h2>
                  <p className={styles.cardBody}>{item.body}</p>

                  <div className={styles.cardActions}>
                    <Button
                      size="sm"
                      icon={<PrimaryCtaIcon id={item.id} />}
                      onClick={() =>
                        toast({
                          title: item.primaryToastTitle,
                          description: item.primaryToastDesc,
                          tone: 'success',
                        })
                      }
                    >
                      {item.primaryCta}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<ArrowUpRight size={14} aria-hidden />}
                      onClick={() => setActiveInsight(item)}
                    >
                      Details
                    </Button>
                  </div>
                </div>

                <InsightMiniChart item={item} />
              </article>
            ))
          )}
        </div>

        {/* ── Right Column: Focus score, What changed, Alerts ────────── */}
        <aside className={styles.sideCol} aria-label="Workspace focus and alerts">
          <section className={styles.sideCard} aria-label="Focus score">
            <div className={styles.sideHeader}>
              <h2 className={styles.sideTitle}>Focus score</h2>
              <Badge tone="muted">W31 · TO DATE</Badge>
            </div>
            <p className={styles.sideSub}>
              Share of effort going to the work that converts best
            </p>

            <div className={styles.gaugeWrap}>
              <svg
                className={styles.gaugeSvg}
                viewBox="0 0 200 115"
                role="img"
                aria-label="Focus score 72 out of 100"
              >
                <path
                  d="M 22 100 A 78 78 0 0 1 178 100"
                  fill="none"
                  stroke="var(--bar)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M 36 100 A 64 64 0 0 1 164 100"
                  fill="none"
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                />
                <path
                  d="M 22 100 A 78 78 0 0 1 149 39"
                  fill="none"
                  stroke="var(--lavender)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <circle
                  cx="149"
                  cy="39"
                  r="6"
                  fill="var(--card)"
                  stroke="var(--lavender)"
                  strokeWidth="3"
                />
              </svg>

              <div className={styles.gaugeCenter}>
                <span className={styles.gaugeOf}>of 100</span>
                <span className={styles.gaugeScore}>72</span>
                <span className={styles.gaugeDelta}>
                  <strong>+4</strong>
                  <span>vs W30 · 68</span>
                </span>
              </div>
            </div>

            <div className={styles.focusSubGrid}>
              {FOCUS_METRICS.map((m) => (
                <div key={m.id} className={styles.focusSubItem}>
                  <div className={styles.focusSubHeader}>
                    <span>{m.label}</span>
                    <strong>{m.score}</strong>
                  </div>
                  <div className={styles.focusBarTrack} aria-hidden>
                    <span
                      className={styles[`focusBarFill-${m.tone}`]}
                      style={{ width: `${m.score}%` }}
                    />
                  </div>
                  <span className={styles.focusSubNote}>{m.sub}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sideCard} aria-label="What changed">
            <div className={styles.sideHeader}>
              <h2 className={styles.sideTitle}>What changed</h2>
            </div>
            <p className={styles.sideSub}>Last 4 weeks vs the 4 weeks before</p>

            <ul className={styles.deltaList}>
              {WHAT_CHANGED.map((row) => (
                <li key={row.id} className={styles.deltaRow}>
                  <span className={styles.deltaLabel}>
                    <WhatChangedIcon id={row.id} />
                    {row.label}
                  </span>
                  <span className={styles.deltaValues}>
                    <strong>{row.value}</strong>
                    <span className={row.up ? styles.deltaUp : styles.deltaDown}>
                      {row.delta}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.sideCard} aria-label="Active alerts">
            <div className={styles.sideHeader}>
              <h2 className={styles.sideTitle}>Alerts</h2>
            </div>
            <p className={styles.sideSub}>
              {alerts.length} active · checked every morning at 06:00
            </p>

            <ul className={styles.alertList}>
              {alerts.map((al) => (
                <li key={al.id} className={styles.alertRow}>
                  <div className={styles.alertLeft}>
                    <Activity size={15} aria-hidden />
                    <div className={styles.alertText}>
                      <strong>{al.title}</strong>
                      <span>{al.subtitle}</span>
                    </div>
                  </div>
                  <Count tone={al.tone} value={al.badge} />
                </li>
              ))}
            </ul>

            <div className={styles.alertFooter}>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setManageAlertsOpen(true)}
              >
                Manage alerts
                <ChevronRight size={14} aria-hidden />
              </button>
              <span>Next run Sat Aug 1 · 06:00 AST</span>
            </div>
          </section>
        </aside>
      </div>

      {/* Insight detail drawer */}
      <Drawer
        open={Boolean(activeInsight)}
        onClose={() => setActiveInsight(null)}
        title={activeInsight ? activeInsight.title : 'Insight details'}
        footer={
          activeInsight ? (
            <Button
              variant="primary"
              icon={<Send size={15} aria-hidden />}
              onClick={() => {
                toast({
                  title: activeInsight.primaryToastTitle,
                  description: activeInsight.primaryToastDesc,
                  tone: 'success',
                });
                setActiveInsight(null);
              }}
            >
              {activeInsight.primaryCta}
            </Button>
          ) : undefined
        }
      >
        {activeInsight ? (
          <div className={styles.drawerStack}>
            <dl className={s.dl}>
              <dt>Category</dt>
              <dd>{KIND_LABEL[activeInsight.kind]}</dd>
              <dt>Source</dt>
              <dd>{activeInsight.source}</dd>
              <dt>Detected</dt>
              <dd>{activeInsight.time}</dd>
              <dt>Headline metric</dt>
              <dd>
                {activeInsight.chartValue} {activeInsight.chartDelta}
              </dd>
              <dt>Confidence</dt>
              <dd>{activeInsight.confidenceScore}%</dd>
            </dl>

            <div>
              <h3>Root-cause breakdown</h3>
              <p>{activeInsight.detailsSummary}</p>
            </div>

            <div>
              <h3>Recommended next steps</h3>
              <ul className={styles.recList}>
                {activeInsight.recommendations.map((rec) => (
                  <li key={rec}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Create alert modal */}
      <Modal
        open={createAlertOpen}
        onClose={() => setCreateAlertOpen(false)}
        width="sm"
        title="Create alert rule"
        description="Evaluate a workspace metric every morning at 06:00 AST."
        footer={
          <>
            <Button onClick={() => setCreateAlertOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!alertDraft.title.trim()}
              onClick={handleCreateAlert}
            >
              Create alert
            </Button>
          </>
        }
      >
        <div className={styles.drawerStack}>
          <FormField label="Alert condition">
            {(id) => (
              <Input
                id={id}
                value={alertDraft.title}
                onChange={(e) =>
                  setAlertDraft({ ...alertDraft, title: e.target.value })
                }
                placeholder="e.g. Referral MG1 rate drops below 35%"
              />
            )}
          </FormField>

          <FormField label="Scope & cadence">
            {(id) => (
              <Input
                id={id}
                value={alertDraft.subtitle}
                onChange={(e) =>
                  setAlertDraft({ ...alertDraft, subtitle: e.target.value })
                }
              />
            )}
          </FormField>

          <FormField label="Severity tone">
            {(id) => (
              <Select
                id={id}
                value={alertDraft.tone}
                onChange={(e) =>
                  setAlertDraft({ ...alertDraft, tone: e.target.value as Tone })
                }
              >
                <option value="lavender">Highlight (Lavender)</option>
                <option value="rose">Critical (Rose)</option>
                <option value="lemon">Warning (Lemon)</option>
                <option value="mint">Healthy (Mint)</option>
              </Select>
            )}
          </FormField>
        </div>
      </Modal>

      {/* Manage alerts modal */}
      <Modal
        open={manageAlertsOpen}
        onClose={() => setManageAlertsOpen(false)}
        title="Manage automated alerts"
        description="Rules evaluated daily against Stripe, CRM and weekly leg reports."
        footer={
          <Button
            variant="primary"
            onClick={() => {
              setManageAlertsOpen(false);
              toast({
                title: 'Alert schedule verified',
                description: `${alerts.length} rules active for 06:00 AST evaluation.`,
                tone: 'success',
              });
            }}
          >
            Done
          </Button>
        }
      >
        <ul className={styles.alertList}>
          {alerts.map((al) => (
            <li key={al.id} className={styles.alertRow}>
              <div className={styles.alertLeft}>
                <Bell size={15} aria-hidden />
                <div className={styles.alertText}>
                  <strong>{al.title}</strong>
                  <span>{al.subtitle}</span>
                </div>
              </div>
              <Count tone={al.tone} value={al.badge} />
            </li>
          ))}
        </ul>
      </Modal>
    </Page>
  );
};
