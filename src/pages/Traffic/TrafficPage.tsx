import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, RefreshCw, TriangleAlert } from 'lucide-react';

import { Count, Segmented } from '../../components/primitives';
import { Callout, CalloutDescription, CalloutTitle } from '../../components/primitives/Callout';
import { MotionPauseButton } from '../../components/primitives/MotionPause';
import { Progress } from '../../components/primitives/Progress';
import { Button, Empty, PageHeader, Panel, Select, TableWrap, tableClass } from '../../components/ui';
import {
  HEALTH_META,
  REGION_OPTIONS,
  SEVERITY_META,
  TRAFFIC_ENDPOINTS,
  TRAFFIC_INCIDENTS,
  TRAFFIC_METRICS,
  TRAFFIC_REGIONS,
  TRAFFIC_SOURCES,
} from '../../content/insights';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import i from '../Insights.module.scss';
import s from '../pages.module.scss';
import { TrafficFlowDiagram } from './TrafficFlowDiagram';

type ProtocolFilter = 'all' | 'HTTPS' | 'gRPC';

export const TrafficPage = () => {
  const { toast } = useApp();
  const [region, setRegion] = useState('all');
  const [protocol, setProtocol] = useState<ProtocolFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [flowPaused, setFlowPaused] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const regions = useMemo(() => (region === 'all' ? TRAFFIC_REGIONS : TRAFFIC_REGIONS.filter((r) => r.code === region)), [region]);
  const sources = useMemo(() => (protocol === 'all' ? TRAFFIC_SOURCES : TRAFFIC_SOURCES.filter((x) => x.protocol === protocol)), [protocol]);
  const active = TRAFFIC_INCIDENTS.filter((incident) => incident.status === 'active');

  const refresh = () => {
    setRefreshing(true);
    timer.current = window.setTimeout(() => {
      setRefreshing(false);
      toast({ title: 'Traffic data refreshed', description: `${TRAFFIC_REGIONS.length} regions · ${active.length} active incidents.`, tone: 'success' });
    }, 900);
  };

  return (
    <Page>
      <PageHeader
        title="Traffic"
        lead="Request flow from edge regions through load balancers to services, cache and database."
        actions={
          <Button icon={refreshing ? <Loader2 size={15} className="spin" aria-hidden /> : <RefreshCw size={15} aria-hidden />} onClick={refresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      {active.length > 0 ? (
        <Callout variant="warning" className={i.block}>
          <TriangleAlert aria-hidden />
          <div>
            <CalloutTitle>
              {active.length} active traffic incident{active.length === 1 ? '' : 's'}
            </CalloutTitle>
            <CalloutDescription>{active.map((incident) => incident.title).join(' · ')}</CalloutDescription>
          </div>
        </Callout>
      ) : null}

      <div className={s.kpis}>
        {TRAFFIC_METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className={s.stat}>
              <span className={i.statHead}>
                {metric.title}
                <Icon size={15} aria-hidden />
              </span>
              <span className={s.statValue}>{metric.value}</span>
              <span className={i.hint}>
                <span className={metric.good ? s.up : s.down}>{metric.change}</span> vs previous week
              </span>
              <span className={i.statNote}>{metric.target}</span>
            </div>
          );
        })}
      </div>

      <Panel
        title="Request flow"
        description="Latency on each hop between layers, with the health of every node"
        className={i.block}
        actions={
          <MotionPauseButton paused={flowPaused} pauseLabel="Pause flow" playLabel="Resume flow" onClick={() => setFlowPaused((prev) => !prev)} />
        }
      >
        <TrafficFlowDiagram paused={flowPaused} />
      </Panel>

      <div className={`${s.split} ${s.splitEven}`}>
        <Panel
          title="Regions"
          description="Request share and P95 latency by edge region"
          actions={
            <Select aria-label="Filter by region" value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          }
        >
          <ul className={i.meterList}>
            {regions.map((r) => (
              <li key={r.code} className={i.meterItem}>
                <div className={i.meterHead}>
                  <strong>{r.region}</strong>
                  <Count value={HEALTH_META[r.status].label} tone={HEALTH_META[r.status].tone} />
                </div>
                <Progress value={r.share} aria-label={`${r.region} traffic share ${r.share}%`} />
                <span className={i.meterMeta}>
                  {r.share}% of traffic · {r.requests} requests · {r.latency} P95
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Traffic sources"
          description="Protocol mix and error rates by client type"
          actions={
            <Segmented
              label="Protocol"
              size="sm"
              value={protocol}
              onChange={setProtocol}
              options={[
                { value: 'all', label: 'All' },
                { value: 'HTTPS', label: 'HTTPS' },
                { value: 'gRPC', label: 'gRPC' },
              ]}
            />
          }
        >
          {sources.length === 0 ? (
            <Empty title="No sources for this protocol">
              <Button size="sm" onClick={() => setProtocol('all')}>
                Show all protocols
              </Button>
            </Empty>
          ) : (
            <ul className={i.rows}>
              {sources.map((source) => (
                <li key={source.source}>
                  <div className={i.rowText}>
                    <strong>{source.source}</strong>
                    <span>{source.protocol}</span>
                  </div>
                  <div className={i.rowStats}>
                    {source.requests}
                    <span>
                      {source.share}% · {source.errorRate} errors
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className={s.split}>
        <Panel flush title="Top endpoints" description="Highest-volume API routes with P95 latency and error rate">
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Status</th>
                  <th className={s.num}>Throughput</th>
                  <th className={`${s.num} ${s.hideSm}`}>P95</th>
                  <th className={`${s.num} ${s.hideSm}`}>Errors</th>
                </tr>
              </thead>
              <tbody>
                {TRAFFIC_ENDPOINTS.map((endpoint) => (
                  <tr key={`${endpoint.method}-${endpoint.path}`}>
                    <td className={`${i.mono} ${i.route}`}>
                      <span className={i.method}>{endpoint.method}</span>
                      {endpoint.path}
                    </td>
                    <td>
                      <Count value={HEALTH_META[endpoint.status].label} tone={HEALTH_META[endpoint.status].tone} />
                    </td>
                    <td className={s.num}>{endpoint.rps} rps</td>
                    <td className={`${s.num} ${s.hideSm}`}>{endpoint.p95}</td>
                    <td className={`${s.num} ${s.hideSm}`}>{endpoint.errors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </Panel>

        <Panel title="Health & incidents" description="Active and recently resolved events">
          <ul className={i.rows}>
            {TRAFFIC_INCIDENTS.map((incident) => (
              <li key={incident.id} className={i.incident}>
                <div className={i.chips}>
                  <Count value={SEVERITY_META[incident.severity].label} tone={SEVERITY_META[incident.severity].tone} />
                  <Count value={incident.status === 'active' ? 'Active' : 'Resolved'} tone={incident.status === 'active' ? 'lemon' : 'muted'} />
                </div>
                <div className={i.rowText}>
                  <strong>{incident.title}</strong>
                  <span>
                    {incident.region} · started {incident.started}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </Page>
  );
};
