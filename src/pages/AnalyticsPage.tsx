import { useState } from 'react';
import { Copy, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Segmented } from '../components/primitives';
import { Progress } from '../components/primitives/Progress';
import { Button, PageHeader, Panel } from '../components/ui';
import { CONVERSION, ENGAGEMENT, FUNNEL, TRAFFIC_QUALITY } from '../content/insights';
import { RANGE_LABEL, RANGE_PREV, type TimeRange } from '../data';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import i from './Insights.module.scss';
import s from './pages.module.scss';

export const AnalyticsPage = () => {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [range, setRange] = useState<TimeRange>('7d');

  const bars = CONVERSION[range];
  const max = Math.max(...bars.map((b) => b.value));
  const peak = bars.find((b) => b.value === max);

  return (
    <Page>
      <PageHeader
        title="Analytics"
        lead={`Engagement, funnel performance and traffic quality for the ${RANGE_LABEL[range]} window.`}
        actions={
          <Segmented
            label="Reporting window"
            value={range}
            onChange={setRange}
            options={[
              { value: '24h', label: '24h' },
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
            ]}
          />
        }
      />

      <div className={s.kpis}>
        {ENGAGEMENT[range].map((m) => (
          <div key={m.label} className={s.stat}>
            <span className={s.statLabel}>{m.label}</span>
            <span className={s.statValue}>{m.value}</span>
            <span className={i.hint}>
              <span className={m.trend === 'up' ? s.up : s.down}>{m.change}</span> vs previous {RANGE_PREV[range]}
            </span>
          </div>
        ))}
      </div>

      <div className={s.split}>
        <Panel title="Conversion rate" description="Checkout completions as a share of visits">
          <figure className={i.chartWell} aria-label={`Conversion rate, ${RANGE_LABEL[range]} window`}>
            <div className={s.bars}>
              {bars.map((b) => (
                <div key={b.label} className={s.barCol} title={`${b.label}: ${b.value}%`}>
                  <span className={i.barValue}>{b.value}%</span>
                  <div className={i.barTrack}>
                    <div className={`${i.barFill} ${b === peak ? i.barPeak : ''}`} style={{ height: `${b.value}%` }} />
                  </div>
                  <span className={i.barName}>{b.label}</span>
                </div>
              ))}
            </div>
            {peak ? (
              <figcaption className={i.chartCaption}>
                Peak {peak.label} · {peak.value}%
              </figcaption>
            ) : null}
          </figure>
        </Panel>

        <Panel title="Traffic quality" description="Share of sessions that meet each target">
          <ul className={i.meterList}>
            {TRAFFIC_QUALITY.map((q) => (
              <li key={q.label} className={i.meterItem}>
                <div className={i.meterHead}>
                  <strong>{q.label}</strong>
                  <span className={i.meterValue}>{q.value}%</span>
                </div>
                <Progress value={q.value} aria-label={`${q.label} ${q.value}%`} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Purchase funnel"
        description="Drop-off between store visit and completed purchase"
        actions={
          <>
            <Button
              size="sm"
              icon={<Copy size={14} aria-hidden />}
              onClick={() => toast({ title: 'Funnel data copied', description: `${FUNNEL.length} steps copied to the clipboard.`, tone: 'success' })}
            >
              Copy data
            </Button>
            <Button size="sm" icon={<FileText size={14} aria-hidden />} onClick={() => navigate('/reports')}>
              Open reports
            </Button>
          </>
        }
      >
        <ol className={i.funnel}>
          {FUNNEL.map((step, index) => {
            const next = FUNNEL[index + 1];
            return (
              <li key={step.label} className={i.funnelStep}>
                <span className={i.funnelLabel}>{step.label}</span>
                <span className={i.funnelValue}>{step.value}%</span>
                <Progress value={step.value} aria-label={`${step.label} ${step.value}%`} />
                <span className={i.funnelDrop}>{next ? `−${step.value - next.value}% to next step` : 'End of funnel'}</span>
              </li>
            );
          })}
        </ol>
      </Panel>
    </Page>
  );
};
