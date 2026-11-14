import { useMemo, useState, type ReactNode } from 'react';
import { Bell, Inbox, Pencil, Plus, Trash2, Users } from 'lucide-react';

import { BarChart } from '../../components/BarChart';
import { Avatar, Checkbox, Count, Segmented, Switch } from '../../components/primitives';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/primitives/Accordion';
import { Callout, CalloutDescription, CalloutTitle } from '../../components/primitives/Callout';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Spinner } from '../../components/primitives/Spinner';
import {
  AppChip,
  Badge,
  Button,
  Drawer,
  Empty,
  FormField,
  Input,
  Meter,
  Modal,
  PageHeader,
  Panel,
  PillTabs,
  SearchBox,
  Select,
  Sparkline,
  TableWrap,
  Textarea,
  tableClass,
} from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import s from '../pages.module.scss';
import { KPIS, MEMBERS, STATUS_TONE, WEEKLY, type Member, type MemberStatus } from './componentsData';
import c from './Components.module.scss';

type Section = 'catalog' | 'compositions';
type StatusFilter = MemberStatus | 'all';

const Demo = ({ title, source, description, code, children }: { title: string; source: string; description: string; code: string; children: ReactNode }) => (
  <Panel title={title} description={description} actions={<Badge tone="muted">{source}</Badge>}>
    <div className={c.stage}>{children}</div>
    <pre className={c.code}>
      <code>{code}</code>
    </pre>
  </Panel>
);

const Catalog = () => {
  const { toast } = useApp();
  const [name, setName] = useState('Acme Inc.');
  const [region, setRegion] = useState('eu');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [tab, setTab] = useState<'all' | 'open' | 'closed'>('all');
  const [alerts, setAlerts] = useState(true);
  const [digest, setDigest] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={c.grid}>
      <Demo
        title="Button"
        source="ui.tsx"
        description="Verbs in sentence case. One primary per view, danger only for destructive actions."
        code={`<Button variant="primary" icon={<Plus size={15} aria-hidden />}>Create</Button>\n<Button variant="ghost" size="icon" aria-label="Edit"><Pencil size={15} aria-hidden /></Button>`}
      >
        <Button variant="primary" icon={<Plus size={15} aria-hidden />} onClick={() => toast({ title: 'Primary clicked', tone: 'success' })}>
          Create
        </Button>
        <Button onClick={() => toast({ title: 'Secondary clicked' })}>Secondary</Button>
        <Button variant="ghost" onClick={() => toast({ title: 'Ghost clicked' })}>
          Ghost
        </Button>
        <Button variant="danger" icon={<Trash2 size={15} aria-hidden />} onClick={() => toast({ title: 'Danger clicked', tone: 'danger' })}>
          Delete
        </Button>
        <Button size="sm" onClick={() => toast({ title: 'Small clicked' })}>
          Small
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => toast({ title: 'Icon button clicked' })}>
          <Pencil size={15} aria-hidden />
        </Button>
        <Button disabled>Disabled</Button>
      </Demo>

      <Demo
        title="Count and Badge"
        source="primitives.tsx · ui.tsx"
        description="Count for statuses and counters (always with a word), Badge for categories."
        code={`<Count tone="mint" value="Paid" />\n<Badge tone="lavender">AI</Badge>`}
      >
        <Count tone="mint" value="Paid" />
        <Count tone="lemon" value="Pending" />
        <Count tone="rose" value="Failed" />
        <Count tone="sky" value="Info" />
        <Count tone="lavender" value="Highlight" />
        <Count tone="muted" value="12" />
        <Badge>Default</Badge>
        <Badge tone="accent">In use</Badge>
        <Badge tone="lavender">AI</Badge>
        <Badge tone="peach">Beta</Badge>
      </Demo>

      <Demo
        title="Avatar and AppChip"
        source="primitives.tsx · ui.tsx"
        description="Pastel avatars by initials; integrations as neutral monograms, never vendor logos."
        code={`<Avatar initials="AM" />\n<AppChip app="stripe" size="lg" />`}
      >
        <Avatar initials="AM" />
        <Avatar initials="ER" />
        <Avatar initials="JP" size="sm" />
        <AppChip app="stripe" size="sm" />
        <AppChip app="slack" />
        <AppChip app="jira" size="lg" />
        <AppChip app="ai" size="lg" />
      </Demo>

      <Demo
        title="Form fields"
        source="ui.tsx"
        description="FormField links the label to its control; hints go under the field, not in alerts."
        code={`<FormField label="Workspace name" hint="Shown on invoices.">\n  {(id) => <Input id={id} value={name} onChange={…} />}\n</FormField>`}
      >
        <div className={c.formStack}>
          <FormField label="Workspace name" hint={name.trim() ? 'Shown on invoices.' : 'Name is required.'}>
            {(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}
          </FormField>
          <FormField label="Region">
            {(id) => (
              <Select id={id} value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="eu">Europe (Frankfurt)</option>
                <option value="us">United States (Virginia)</option>
                <option value="ap">Asia Pacific (Singapore)</option>
              </Select>
            )}
          </FormField>
          <FormField label="Notes">{(id) => <Textarea id={id} rows={2} placeholder="Optional" />}</FormField>
        </div>
      </Demo>

      <Demo
        title="SearchBox, Segmented and PillTabs"
        source="ui.tsx · primitives.tsx"
        description="Search plus an inline filter in toolbars; pill tabs for categories with counts."
        code={`<SearchBox value={q} onChange={setQ} placeholder="Search" shortcut="/" />\n<Segmented label="Range" value={range} onChange={setRange} options={[…]} />\n<PillTabs label="Status" value={tab} onChange={setTab} items={[…]} />`}
      >
        <div className={c.formStack}>
          <SearchBox value={query} onChange={setQuery} placeholder="Search members" shortcut="/" />
          <Segmented
            label="Range"
            value={range}
            onChange={setRange}
            options={[
              { value: '24h', label: '24h' },
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
            ]}
          />
          <PillTabs
            label="Status"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'all', label: 'All', count: 24 },
              { value: 'open', label: 'Open', count: 9 },
              { value: 'closed', label: 'Closed', count: 15 },
            ]}
          />
        </div>
      </Demo>

      <Demo
        title="Switch and Checkbox"
        source="primitives.tsx"
        description="Switch for settings that apply at once, Checkbox for choices confirmed later."
        code={`<Switch id="alerts" label="Email alerts" checked={on} onChange={setOn} />\n<Checkbox label="Weekly digest" hint="Every Monday" checked={d} onChange={setD} />`}
      >
        <div className={c.formStack}>
          <Switch
            id="demo-alerts"
            label="Email alerts"
            checked={alerts}
            onChange={(next) => {
              setAlerts(next);
              toast({ title: next ? 'Alerts on' : 'Alerts off', tone: 'success' });
            }}
          />
          <Checkbox label="Weekly digest" hint="Summary every Monday at 9:00" checked={digest} onChange={setDigest} />
        </div>
      </Demo>

      <Demo
        title="Meter and Sparkline"
        source="ui.tsx"
        description="Meter for quotas (warning above 70%, danger above 85%); Sparkline inside stat tiles."
        code={`<Meter label="Seats used" value={7} max={10} tone="warning" />\n<Sparkline data={[4, 6, 5, 8, 9]} up />`}
      >
        <div className={c.formStack}>
          <div className={c.meterRow}>
            <span>Seats · 4 of 10</span>
            <Meter label="Seats used" value={4} max={10} />
          </div>
          <div className={c.meterRow}>
            <span>Storage · 76%</span>
            <Meter label="Storage used" value={76} max={100} tone="warning" />
          </div>
          <div className={c.meterRow}>
            <span>API calls · 92%</span>
            <Meter label="API calls used" value={92} max={100} tone="danger" />
          </div>
          <div className={c.sparkRow}>
            <Sparkline data={[4, 6, 5, 8, 7, 9, 11]} />
            <Sparkline data={[11, 9, 10, 7, 8, 5, 4]} up={false} />
          </div>
        </div>
      </Demo>

      <Demo
        title="Callout"
        source="primitives/Callout"
        description="Lasting page status. One-off results of an action go to a toast instead."
        code={`<Callout variant="warning">\n  <div><CalloutTitle>…</CalloutTitle><CalloutDescription>…</CalloutDescription></div>\n</Callout>`}
      >
        <div className={c.formStack}>
          <Callout variant="info">
            <div>
              <CalloutTitle>Maintenance on Jul 14</CalloutTitle>
              <CalloutDescription>Exports pause for about 10 minutes.</CalloutDescription>
            </div>
          </Callout>
          <Callout variant="warning">
            <div>
              <CalloutTitle>Billing email unverified</CalloutTitle>
              <CalloutDescription>Verify it to avoid failed renewals.</CalloutDescription>
            </div>
          </Callout>
        </div>
      </Demo>

      <Demo
        title="Loading and empty states"
        source="primitives · ui.tsx"
        description="Skeletons hold the layout while loading; an empty state says what happened and what to do."
        code={`<Skeleton style={{ height: '1rem', width: '60%' }} />\n<Empty icon={<Inbox size={18} aria-hidden />} title="No requests yet">…</Empty>`}
      >
        <div className={c.formStack}>
          <div className={c.loadingRow}>
            <Spinner size="sm" aria-label="Loading members" />
            <div className={c.skeletons} aria-hidden>
              <Skeleton style={{ height: '0.75rem', width: '60%' }} />
              <Skeleton style={{ height: '0.75rem', width: '85%' }} />
            </div>
          </div>
          <Empty icon={<Inbox size={18} aria-hidden />} title="No requests yet">
            <Button size="sm" onClick={() => toast({ title: 'Request created', tone: 'success' })}>
              Create request
            </Button>
          </Empty>
        </div>
      </Demo>

      <Demo
        title="Accordion"
        source="primitives/Accordion"
        description="Progressive disclosure for FAQs and long settings groups."
        code={`<Accordion type="single" defaultValue="a">\n  <AccordionItem value="a">\n    <AccordionTrigger>Question</AccordionTrigger>\n    <AccordionContent>Answer</AccordionContent>\n  </AccordionItem>\n</Accordion>`}
      >
        <Accordion type="single" defaultValue="tokens" className={c.full}>
          <AccordionItem value="tokens">
            <AccordionTrigger>Where do colours come from?</AccordionTrigger>
            <AccordionContent>Only from tokens in tokens.scss, defined for both themes.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="breakpoints">
            <AccordionTrigger>How do layouts adapt?</AccordionTrigger>
            <AccordionContent>Through the phone, tablet and below-desktop mixins.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Demo>

      <Demo
        title="Modal, Drawer and toast"
        source="ui.tsx · useApp()"
        description="Modal for confirmations, Drawer for details; a toast after every mutation."
        code={`<Modal open={open} onClose={close} title="…" width="sm" footer={…}>…</Modal>\n<Drawer open={open} onClose={close} title="…">…</Drawer>\ntoast({ title: 'Saved', tone: 'success' })`}
      >
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
        <Button variant="ghost" onClick={() => toast({ title: 'Changes saved', description: 'Toasts close by themselves.', tone: 'success' })}>
          Show toast
        </Button>
      </Demo>

      <Demo
        title="Bar chart"
        source="components/BarChart"
        description="Simple SVG/CSS bars; the peak bar is highlighted and labelled."
        code={`<BarChart label="Weekly signups" data={[{ label: 'Mon', value: 120 }, …]} />`}
      >
        <div className={c.full}>
          <BarChart label="Weekly revenue" data={WEEKLY} />
        </div>
      </Demo>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Archive project?"
        description="It disappears from lists but can be restored for 30 days."
        width="sm"
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalOpen(false);
                toast({ title: 'Project archived', tone: 'success' });
              }}
            >
              Archive
            </Button>
          </>
        }
      >
        <p className={c.modalText}>Members keep read access until the project is deleted.</p>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Project details"
        footer={
          <Button
            onClick={() => {
              setDrawerOpen(false);
              toast({ title: 'Link copied', tone: 'success' });
            }}
          >
            Copy link
          </Button>
        }
      >
        <dl className={s.dl}>
          <dt>Owner</dt>
          <dd>Alex Morgan</dd>
          <dt>Status</dt>
          <dd>
            <Count tone="mint" value="Active" />
          </dd>
          <dt>Created</dt>
          <dd>Jul 2, 2026</dd>
        </dl>
      </Drawer>
    </div>
  );
};

const KpiRow = () => (
  <div className={s.kpis}>
    {KPIS.map((kpi) => (
      <div key={kpi.label} className={s.stat}>
        <span className={s.statLabel}>{kpi.label}</span>
        <span className={s.statValue}>{kpi.value}</span>
        <span className={c.statFoot}>
          <span className={kpi.up ? s.up : s.down}>{kpi.delta}</span>
          <span className={c.spark}>
            <Sparkline data={kpi.trend} up={kpi.up} />
          </span>
        </span>
      </div>
    ))}
  </div>
);

const MemberList = () => {
  const { toast } = useApp();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [open, setOpen] = useState<Member | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEMBERS.filter((m) => status === 'all' || m.status === status).filter((m) => !q || `${m.name} ${m.email}`.toLowerCase().includes(q));
  }, [query, status]);

  const reset = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <Panel flush title="List panel" description="Panel flush → toolbar (SearchBox + Segmented) → table in TableWrap → row click opens a Drawer">
      <div className={s.toolbar}>
        <SearchBox value={query} onChange={setQuery} placeholder="Search name or email" className={s.toolbarSearch} />
        <Segmented
          label="Filter by status"
          size="sm"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'invited', label: 'Invited' },
            { value: 'suspended', label: 'Suspended' },
          ]}
        />
      </div>
      {rows.length === 0 ? (
        <Empty icon={<Users size={18} aria-hidden />} title="No members match">
          <Button size="sm" onClick={reset}>
            Clear filters
          </Button>
        </Empty>
      ) : (
        <TableWrap>
          <table className={tableClass}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th className={s.hideSm}>Role</th>
                <th className={`${s.num} ${s.hideSm}`}>Seats</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.email} className={s.rowBtn} onClick={() => setOpen(m)}>
                  <td>
                    <div className={s.person}>
                      <Avatar initials={m.initials} />
                      <div className={c.personText}>
                        <span>{m.name}</span>
                        <span>{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Count tone={STATUS_TONE[m.status]} value={m.status[0].toUpperCase() + m.status.slice(1)} />
                  </td>
                  <td className={s.hideSm}>{m.role}</td>
                  <td className={`${s.num} ${s.hideSm}`}>{m.seats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open ? open.name : ''}
        footer={
          open ? (
            <Button
              icon={<Bell size={15} aria-hidden />}
              onClick={() => {
                toast({ title: 'Reminder sent', description: open.email, tone: 'success' });
                setOpen(null);
              }}
            >
              Send reminder
            </Button>
          ) : undefined
        }
      >
        {open ? (
          <dl className={s.dl}>
            <dt>Email</dt>
            <dd>{open.email}</dd>
            <dt>Status</dt>
            <dd>
              <Count tone={STATUS_TONE[open.status]} value={open.status[0].toUpperCase() + open.status.slice(1)} />
            </dd>
            <dt>Role</dt>
            <dd>{open.role}</dd>
            <dt>Seats</dt>
            <dd>{open.seats}</dd>
          </dl>
        ) : null}
      </Drawer>
    </Panel>
  );
};

type Prefs = { name: string; email: string; alerts: boolean };
const SAVED_PREFS: Prefs = { name: 'Acme Inc.', email: 'billing@acme.io', alerts: true };

const SettingsForm = () => {
  const { toast } = useApp();
  const [saved, setSaved] = useState(SAVED_PREFS);
  const [draft, setDraft] = useState(SAVED_PREFS);
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const valid = draft.name.trim() !== '' && draft.email.includes('@');

  return (
    <Panel title="Settings form" description="FormField grid + Switch row; a save bar appears only when the draft differs">
      <div className={s.formGrid}>
        <FormField label="Company name" hint={draft.name.trim() ? undefined : 'Name is required.'}>
          {(id) => <Input id={id} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />}
        </FormField>
        <FormField label="Billing email" hint={draft.email.includes('@') ? undefined : 'Enter a valid email.'}>
          {(id) => <Input id={id} type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />}
        </FormField>
      </div>
      <Switch id="compose-alerts" label="Send failed-payment alerts" checked={draft.alerts} onChange={(alerts) => setDraft({ ...draft, alerts })} />
      {dirty ? (
        <div className={s.saveBar}>
          <span>You have unsaved changes</span>
          <div>
            <Button size="sm" variant="ghost" onClick={() => setDraft(saved)}>
              Discard
            </Button>
            <Button
              size="sm"
              disabled={!valid}
              onClick={() => {
                setSaved(draft);
                toast({ title: 'Settings saved', tone: 'success' });
              }}
            >
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
};

const Compositions = () => (
  <>
    <p className={c.lead}>Page anatomy from DESIGN.md §4: PageHeader → KPI row → split grid of panels → list panel.</p>
    <KpiRow />
    <div className={s.split}>
      <MemberList />
      <SettingsForm />
    </div>
  </>
);

export const ComponentsPage = () => {
  const [section, setSection] = useState<Section>('catalog');

  return (
    <Page>
      <PageHeader
        title="Components"
        lead="Every Acme UI component with a live example, and how they compose into a screen."
        actions={
          <PillTabs
            label="Section"
            value={section}
            onChange={setSection}
            items={[
              { value: 'catalog', label: 'Catalog' },
              { value: 'compositions', label: 'Compositions' },
            ]}
          />
        }
      />
      {section === 'catalog' ? <Catalog /> : <Compositions />}
    </Page>
  );
};
