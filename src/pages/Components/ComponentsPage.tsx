import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  CircleCheck,
  Inbox,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Thermometer,
  Timer,
  Trash2,
  UserRound,
  Users,
  Warehouse,
  Zap,
} from 'lucide-react';

import { ActivityDots } from '../../components/ActivityDots';
import { BarChart } from '../../components/BarChart';
import { EstimateCard } from '../../components/EstimateCard';
import { EventTimeline } from '../../components/EventTimeline';
import { JourneyBar } from '../../components/JourneyBar';
import { MessageComposer } from '../../components/MessageComposer';
import { MetricStrip } from '../../components/MetricStrip';
import { AvatarStack, KanbanColumn, OnboardingCard } from '../../components/OnboardingBoard';
import { Avatar, Checkbox, Count, Segmented, Switch } from '../../components/primitives';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/primitives/Accordion';
import { Callout, CalloutDescription, CalloutTitle } from '../../components/primitives/Callout';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Spinner } from '../../components/primitives/Spinner';
import { MemberRow, PropertyList, PropertyRow } from '../../components/PropertyList';
import { RouteMap } from '../../components/RouteMap';
import { AttachmentCard, ThreadMessage } from '../../components/ThreadMessage';
import { ThresholdChart } from '../../components/ThresholdChart';
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
import { INITIAL_ESTIMATES } from '../Estimates/estimatesData';
import s from '../pages.module.scss';
import {
  EXCURSION_RANGE,
  ROUTE_LANDMARKS,
  ROUTE_SEGMENTS,
  ROUTE_TIMELINE_EVENTS,
  ROUTE_WAYPOINTS,
  TEMPERATURE_READINGS,
  TEMPERATURE_X_TICKS,
} from '../Shipments/shipmentsData';
import { INITIAL_VENDORS } from '../Vendors/vendorsData';
import { KPIS, MEMBERS, STATUS_TONE, WEEKLY, type Member, type MemberStatus } from './componentsData';
import c from './Components.module.scss';

type Section = 'catalog' | 'compositions';
type StatusFilter = MemberStatus | 'all';

const SAMPLE_ONBOARDING = INITIAL_VENDORS[0];
const SAMPLE_ESTIMATE = INITIAL_ESTIMATES[0];

const Demo = ({
  title,
  source,
  description,
  code,
  children,
}: {
  title: string;
  source: string;
  description: string;
  code: string;
  children: ReactNode;
}) => (
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
  const [composerDraft, setComposerDraft] = useState('Looks great! Ready for review ');
  const [demoEventId, setDemoEventId] = useState('peak');
  const [demoReactions, setDemoReactions] = useState([
    { id: 'zap', label: 'Energy', icon: <Zap size={14} aria-hidden />, count: 3, reacted: true },
    { id: 'star', label: 'Star', icon: <Star size={14} aria-hidden />, count: 4, reacted: false },
  ]);

  return (
    <div className={c.grid}>
      <Demo
        title="Button"
        source="ui.tsx"
        description="Verbs in sentence case. One primary per view, danger only for destructive actions."
        code={`<Button variant="primary" icon={<Plus size={15} aria-hidden />}>Create</Button>\n<Button variant="ghost" size="icon" aria-label="Edit"><Pencil size={15} aria-hidden /></Button>`}
      >
        <Button
          variant="primary"
          icon={<Plus size={15} aria-hidden />}
          onClick={() => toast({ title: 'Primary clicked', tone: 'success' })}
        >
          Create
        </Button>
        <Button onClick={() => toast({ title: 'Secondary clicked' })}>Secondary</Button>
        <Button variant="ghost" onClick={() => toast({ title: 'Ghost clicked' })}>
          Ghost
        </Button>
        <Button
          variant="danger"
          icon={<Trash2 size={15} aria-hidden />}
          onClick={() => toast({ title: 'Danger clicked', tone: 'danger' })}
        >
          Delete
        </Button>
        <Button size="sm" onClick={() => toast({ title: 'Small clicked' })}>
          Small
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit"
          onClick={() => toast({ title: 'Icon button clicked' })}
        >
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
          <Checkbox
            label="Weekly digest"
            hint="Summary every Monday at 9:00"
            checked={digest}
            onChange={setDigest}
          />
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
        <Button
          variant="ghost"
          onClick={() =>
            toast({ title: 'Changes saved', description: 'Toasts close by themselves.', tone: 'success' })
          }
        >
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

      <Demo
        title="Kanban column and OnboardingCard"
        source="components/OnboardingBoard"
        description="Stage header with Count, vendor monogram, priority, progress bar, AvatarStack and activity counters."
        code={`<KanbanColumn title="Blocked" count={3} tone="rose">\n  <OnboardingCard card={card} onSelect={…} />\n</KanbanColumn>`}
      >
        <div className={c.formStack}>
          <AvatarStack initials={['AM', 'SC', 'MW', 'ER']} extra={3} />
          <KanbanColumn
            title="Blocked"
            count={3}
            tone="rose"
            onMoreAction={() => toast({ title: 'Column sorted' })}
          >
            <OnboardingCard
              card={SAMPLE_ONBOARDING}
              selected
              onSelect={() => toast({ title: 'Opened Lanternfish', tone: 'success' })}
              onMenu={() => toast({ title: 'Vendor menu opened' })}
            />
          </KanbanColumn>
        </div>
      </Demo>

      <Demo
        title="EstimateCard"
        source="components/EstimateCard"
        description="Financial summary band, multi-segment breakdown bar, itemized draw rows and action button."
        code={`<EstimateCard estimate={estimate} onSelect={…} onAction={…} />`}
      >
        <div className={c.full}>
          <EstimateCard
            estimate={SAMPLE_ESTIMATE}
            onSelect={(est) => toast({ title: `Opened ${est.code}`, description: est.client })}
            onAction={(est) =>
              toast({ title: 'Invoice draw started', description: est.client, tone: 'success' })
            }
            onMore={(est) => toast({ title: `Options for ${est.code}` })}
          />
        </div>
      </Demo>

      <Demo
        title="ThreadMessage, AttachmentCard and ReactionBar"
        source="components/ThreadMessage"
        description="Conversation message with inline @mentions, embedded link preview card and toggleable reaction pills."
        code={`<ThreadMessage author="Ravi I." initials="RI" timestamp="4h ago" paragraphs={[…]} attachment={<AttachmentCard … />} reactions={[…]} />`}
      >
        <div className={c.full}>
          <ThreadMessage
            author="Ravi I."
            initials="RI"
            timestamp="4h ago"
            paragraphs={[
              'Mapped all five screens against the new design tokens. @Sofia K., could you review screens 2 and 4?',
            ]}
            onMentionClick={(mention) => toast({ title: mention })}
            attachment={
              <AttachmentCard
                app="figma"
                title="Orbitly onboarding · v4.0"
                subtitle="figma.com"
                actionLabel="Quick view"
                onAction={() => toast({ title: 'Opened attachment preview' })}
              />
            }
            reactions={demoReactions}
            onToggleReaction={(id) =>
              setDemoReactions((prev) =>
                prev.map((r) =>
                  r.id === id ? { ...r, reacted: !r.reacted, count: r.reacted ? r.count - 1 : r.count + 1 } : r,
                ),
              )
            }
          />
        </div>
      </Demo>

      <Demo
        title="MessageComposer"
        source="components/MessageComposer"
        description="Reply box with @mention autocomplete suggestions, toolbar actions and expand toggle."
        code={`<MessageComposer value={draft} onChange={setDraft} onSend={send} mentions={[…]} />`}
      >
        <div className={c.full}>
          <MessageComposer
            value={composerDraft}
            onChange={setComposerDraft}
            onSend={() => {
              toast({ title: 'Reply sent', tone: 'success' });
              setComposerDraft('');
            }}
            onDiscard={() => setComposerDraft('')}
            mentions={[
              { id: 'sk', name: 'Sofia Kim', initials: 'SK' },
              { id: 'sp', name: 'Samuel Park', initials: 'SP', offline: true },
            ]}
            onToolbarAction={(action) => toast({ title: `Composer action: ${action}` })}
          />
        </div>
      </Demo>

      <Demo
        title="PropertyList, MemberRow and ActivityDots"
        source="components/PropertyList · ActivityDots"
        description="Inspector key-value rows, person directory rows with role badges and 1D activity intensity strips."
        code={`<PropertyList><PropertyRow icon={…} label="Status" value={<Count tone="lavender" value="In review" />} /></PropertyList>\n<ActivityDots items={[0, 1, 2, 3, …]} label="Thread activity" />`}
      >
        <div className={c.formStack}>
          <PropertyList>
            <PropertyRow
              icon={<UserRound size={14} aria-hidden />}
              label="Creator"
              value="Leah C."
            />
            <PropertyRow
              icon={<Calendar size={14} aria-hidden />}
              label="Created"
              value="14 Oct"
            />
            <PropertyRow
              icon={<Sparkles size={14} aria-hidden />}
              label="Status"
              value={<Count tone="lavender" value="In review" />}
            />
          </PropertyList>
          <ActivityDots
            items={[0, 0, 1, 2, 1, 3, 2, 1, 2, 3, 2, 1, 0, 1, 2, 1]}
            label="Sample thread activity"
          />
          <MemberRow
            initials="LC"
            name="Leah Chen"
            role="Product lead"
            badge={{ label: 'Management', tone: 'lemon' }}
          />
          <MemberRow initials="SP" name="Samuel Park" role="QA engineer" offline />
        </div>
      </Demo>

      <Demo
        title="MetricStrip and JourneyBar"
        source="components/MetricStrip · JourneyBar"
        description="Divided KPI strip and multi-segment trip bar with inline excursion badge."
        code={`<MetricStrip items={[…]} />\n<JourneyBar origin={…} destination={…} segments={[…]} />`}
      >
        <div className={c.formStack}>
          <MetricStrip
            items={[
              {
                id: 'peak',
                label: 'Peak',
                icon: <Thermometer size={14} aria-hidden />,
                value: '10.2 °C',
                detail: 'at 11:00',
                tone: 'danger',
              },
              {
                id: 'over',
                label: 'Over limit',
                icon: <ArrowUpRight size={14} aria-hidden />,
                value: '+2.2 °C',
                detail: 'limit 8 °C',
                tone: 'danger',
              },
              {
                id: 'dur',
                label: 'Out of range',
                icon: <Timer size={14} aria-hidden />,
                value: '1 h 10 min',
                detail: '10:25–11:35',
              },
              {
                id: 'del',
                label: 'At delivery',
                icon: <CircleCheck size={14} aria-hidden />,
                value: '5.6 °C',
                detail: 'back in range',
              },
            ]}
          />
          <JourneyBar
            origin={{
              title: 'Venlo DC',
              detail: 'Departed 07:05',
              icon: <Warehouse size={14} aria-hidden />,
            }}
            destination={{
              title: 'Antwerp',
              detail: 'Delivered 12:10',
              icon: <Check size={14} aria-hidden />,
              tone: 'success',
            }}
            segments={[
              { id: 'b', weight: 66, tone: 'success', label: 'In range' },
              {
                id: 'e',
                weight: 23,
                tone: 'danger',
                label: '1 h 10 min above 8 °C',
                pill: { icon: <Thermometer size={14} aria-hidden />, text: '1 h 10 min' },
                onClick: () => toast({ title: 'Excursion: 1 h 10 min', description: 'Peak 10.2 °C at 11:00.' }),
              },
              { id: 'a', weight: 11, tone: 'success', label: 'Recovered' },
            ]}
          />
        </div>
      </Demo>

      <Demo
        title="ThresholdChart"
        source="components/ThresholdChart"
        description="Reading matrix chart with threshold line, highlighted excursion columns and hover callout."
        code={`<ThresholdChart readings={…} threshold={8} min={3.5} max={11} yTicks={[4, 6, 8, 10]} xTicks={…} />`}
      >
        <div className={c.full}>
          <ThresholdChart
            readings={TEMPERATURE_READINGS}
            threshold={8}
            min={3.5}
            max={11}
            yTicks={[4, 6, 8, 10]}
            xTicks={TEMPERATURE_X_TICKS}
            excursionRange={EXCURSION_RANGE}
            excursionCallout={{
              rangeLabel: '10:25–11:35',
              durationLabel: '1 h 10 min',
              peakLabel: 'peak 10.2 °C',
            }}
            legend={{ inRange: 'In range', aboveRange: 'Above range', limit: 'Limit 8 °C' }}
            ariaLabel="Sample temperature threshold chart"
          />
        </div>
      </Demo>

      <Demo
        title="RouteMap and EventTimeline"
        source="components/RouteMap · EventTimeline"
        description="Stylized telemetry route map synced with an interactive vertical milestone timeline."
        code={`<RouteMap segments={…} waypoints={…} activeWaypointId={id} onSelectWaypoint={setId} />\n<EventTimeline events={…} activeId={id} onSelect={setId} />`}
      >
        <div className={c.formStack}>
          <RouteMap
            segments={ROUTE_SEGMENTS}
            waypoints={ROUTE_WAYPOINTS}
            landmarks={ROUTE_LANDMARKS}
            activeWaypointId={demoEventId}
            onSelectWaypoint={setDemoEventId}
            ariaLabel="Sample shipment route map"
          />
          <EventTimeline
            events={ROUTE_TIMELINE_EVENTS}
            activeId={demoEventId}
            onSelect={setDemoEventId}
            ariaLabel="Sample shipment milestones"
          />
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
    return MEMBERS.filter((m) => status === 'all' || m.status === status).filter(
      (m) => !q || `${m.name} ${m.email}`.toLowerCase().includes(q),
    );
  }, [query, status]);

  const reset = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <Panel
      flush
      title="List panel"
      description="Panel flush → toolbar (SearchBox + Segmented) → table in TableWrap → row click opens a Drawer"
    >
      <div className={s.toolbar}>
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search name or email"
          className={s.toolbarSearch}
        />
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
                    <Count
                      tone={STATUS_TONE[m.status]}
                      value={m.status[0].toUpperCase() + m.status.slice(1)}
                    />
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
              <Count
                tone={STATUS_TONE[open.status]}
                value={open.status[0].toUpperCase() + open.status.slice(1)}
              />
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
    <Panel
      title="Settings form"
      description="FormField grid + Switch row; a save bar appears only when the draft differs"
    >
      <div className={s.formGrid}>
        <FormField label="Company name" hint={draft.name.trim() ? undefined : 'Name is required.'}>
          {(id) => (
            <Input
              id={id}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          )}
        </FormField>
        <FormField
          label="Billing email"
          hint={draft.email.includes('@') ? undefined : 'Enter a valid email.'}
        >
          {(id) => (
            <Input
              id={id}
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          )}
        </FormField>
      </div>
      <Switch
        id="compose-alerts"
        label="Send failed-payment alerts"
        checked={draft.alerts}
        onChange={(alerts) => setDraft({ ...draft, alerts })}
      />
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
    <p className={c.lead}>
      Page anatomy from DESIGN.md §4: PageHeader → KPI row → split grid of panels → list panel.
    </p>
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
