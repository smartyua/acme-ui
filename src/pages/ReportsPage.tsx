import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Download, FileText, Loader2, Paperclip, Trash2, X } from 'lucide-react';

import { Switch } from '../components/primitives';
import { Badge, Button, Empty, FormField, PageHeader, Panel, Select } from '../components/ui';
import { REPORTS, SCHEDULES, type Report } from '../content/business';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import i from './Insights.module.scss';
import s from './pages.module.scss';

const TYPES = ['Revenue summary', 'Transaction export', 'Customer growth', 'Failed payments', 'Template usage'];
const RANGES = { '7d': 'Last 7 days', '30d': 'Last 30 days', q: 'This quarter', ytd: 'Year to date' } as const;

type Attachment = { id: string; name: string; meta: string; uploading: boolean };

const INITIAL_ATTACHMENTS: Attachment[] = [
  { id: 'a1', name: 'q2-revenue-summary.pdf', meta: 'PDF · 1.2 MB', uploading: false },
  { id: 'a2', name: 'june-transactions.csv', meta: 'CSV · 340 KB', uploading: false },
];

const fileName = (name: string, format: Report['format']) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.${format.toLowerCase()}`;

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const ReportsPage = () => {
  const { toast } = useApp();
  const [reports, setReports] = useState<Report[]>(REPORTS);
  const [schedules, setSchedules] = useState(SCHEDULES);
  const [attachments, setAttachments] = useState<Attachment[]>(INITIAL_ATTACHMENTS);
  const [type, setType] = useState(TYPES[0]);
  const [range, setRange] = useState<keyof typeof RANGES>('30d');
  const [format, setFormat] = useState<Report['format']>('PDF');
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const generating = reports.some((r) => r.status === 'Generating');

  const generate = () => {
    const id = `r${Date.now()}`;
    const report: Report = { id, name: `${type} · ${RANGES[range]}`, status: 'Generating', date: today(), format, size: '—' };
    const size = format === 'CSV' ? '212 KB' : '864 KB';
    setReports((list) => [report, ...list]);
    setAttachments((list) => [{ id, name: fileName(report.name, format), meta: `${format} · uploading…`, uploading: true }, ...list]);
    timers.current.push(
      window.setTimeout(() => {
        setReports((list) => list.map((r) => (r.id === id ? { ...r, status: 'Ready', size } : r)));
        setAttachments((list) => list.map((a) => (a.id === id ? { ...a, meta: `${format} · ${size}`, uploading: false } : a)));
        toast({ title: 'Report ready', description: report.name, tone: 'success' });
      }, 1800)
    );
  };

  return (
    <Page>
      <PageHeader title="Reports" lead="Generate exports on demand and schedule recurring digests." />

      <div className={s.split}>
        <Panel title="New report" description="Pick what to include, then generate.">
          <div className={s.formGrid}>
            <FormField label="Report">
              {(id) => (
                <Select id={id} value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Period">
              {(id) => (
                <Select id={id} value={range} onChange={(e) => setRange(e.target.value as keyof typeof RANGES)}>
                  {Object.entries(RANGES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Format">
              {(id) => (
                <Select id={id} value={format} onChange={(e) => setFormat(e.target.value as Report['format'])}>
                  <option>PDF</option>
                  <option>CSV</option>
                  <option>XLSX</option>
                </Select>
              )}
            </FormField>
            <div className={s.formGrid} style={{ alignItems: 'end', display: 'flex' }}>
              <Button variant="primary" block onClick={generate} disabled={generating} icon={generating ? <Loader2 size={15} className="spin" aria-hidden /> : <FileText size={15} aria-hidden />}>
                {generating ? 'Generating…' : 'Generate report'}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Scheduled" description="Delivered by email automatically.">
          {schedules.map((sc) => (
            <div key={sc.id} className={s.settingRow}>
              <div>
                <strong>{sc.name}</strong>
                <span>
                  {sc.cadence} · {sc.recipients}
                </span>
              </div>
              <Switch
                id={`sched-${sc.id}`}
                label={sc.name}
                hideLabel
                checked={sc.enabled}
                onChange={(v) => {
                  setSchedules((list) => list.map((x) => (x.id === sc.id ? { ...x, enabled: v } : x)));
                  toast({ title: v ? 'Schedule enabled' : 'Schedule paused', description: sc.name });
                }}
              />
            </div>
          ))}
        </Panel>
      </div>

      <Panel flush title="Attachments" description="Files included with the latest report runs" className={i.block}>
        {attachments.length === 0 ? (
          <Empty icon={<Paperclip size={18} aria-hidden />} title="No attachments">
            Generate a report and its file appears here.
          </Empty>
        ) : (
          <ul className={s.list}>
            {attachments.map((a) => (
              <li key={a.id} className={s.row}>
                <span className={s.iconTile}>{a.uploading ? <Loader2 size={16} className="spin" aria-hidden /> : <FileText size={16} aria-hidden />}</span>
                <div className={s.rowMain}>
                  <strong>{a.name}</strong>
                  <span>{a.meta}</span>
                </div>
                <div className={s.rowEnd}>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={a.uploading}
                    aria-label={`Download ${a.name}`}
                    icon={<Download size={14} aria-hidden />}
                    onClick={() => toast({ title: 'Download started', description: a.name })}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Remove ${a.name}`}
                    icon={<X size={14} aria-hidden />}
                    onClick={() => {
                      setAttachments((list) => list.filter((x) => x.id !== a.id));
                      toast({ title: 'Attachment removed', description: a.name });
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel flush title="Generated reports" description={`${reports.length} files`}>
        {reports.length === 0 ? (
          <Empty icon={<FileText size={18} aria-hidden />} title="No reports yet">
            Generate a revenue or transaction summary to see download links here.
            <Button size="sm" onClick={generate}>
              Create report
            </Button>
          </Empty>
        ) : (
        <ul className={s.list}>
          {reports.map((r) => (
            <li key={r.id} className={s.row}>
              <span className={s.iconTile}>{r.status === 'Ready' ? <FileText size={16} aria-hidden /> : <CalendarClock size={16} aria-hidden />}</span>
              <div className={s.rowMain}>
                <strong>{r.name}</strong>
                <span>
                  {r.date} · {r.format} · {r.size}
                </span>
              </div>
              <div className={s.rowEnd}>
                <Badge tone={r.status === 'Ready' ? 'mint' : r.status === 'Generating' ? 'sky' : 'lemon'}>
                  {r.status === 'Generating' ? <Loader2 size={12} className="spin" aria-hidden /> : null}
                  {r.status}
                </Badge>
                <Button size="sm" disabled={r.status !== 'Ready'} icon={<Download size={14} aria-hidden />} onClick={() => toast({ title: 'Download started', description: `${r.name}.${r.format.toLowerCase()}` })}>
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${r.name}`}
                  icon={<Trash2 size={14} aria-hidden />}
                  onClick={() => {
                    setReports((list) => list.filter((x) => x.id !== r.id));
                    toast({ title: 'Report deleted', description: r.name, tone: 'danger' });
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
        )}
      </Panel>
    </Page>
  );
};
