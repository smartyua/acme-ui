import { type Tone } from '../../data';

export type ProjectTaskStatus = 'in-progress' | 'review' | 'backlog';
export type ProjectTaskPriority = 'urgent' | 'high' | 'medium';
export type ProjectViewMode = 'board' | 'list' | 'timeline' | 'calendar';

export type SubtaskItem = {
  id: string;
  title: string;
  done: boolean;
  running?: boolean;
  ownerInitials?: string;
};

export type TaskActivityItem = {
  id: string;
  author: string;
  initials?: string;
  action: string;
  time: string;
  comment?: string;
  dotTone?: 'accent' | 'muted';
};

export type ProjectTask = {
  id: string;
  code: string;
  title: string;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  assignee: string;
  assigneeInitials: string;
  labels: Array<{ text: string; tone: Tone | 'muted' }>;
  dueDate: string;
  dueRelative: string;
  blocksCode?: string;
  blocksTitle?: string;
  descriptionBeforeCode: string;
  descriptionCode: string;
  descriptionAfterCode: string;
  subtasks: SubtaskItem[];
  activity: TaskActivityItem[];
};

export const STATUS_GROUP_META: Record<
  ProjectTaskStatus,
  { label: string; totalCount: number }
> = {
  'in-progress': { label: 'In progress', totalCount: 4 },
  review: { label: 'Review', totalCount: 3 },
  backlog: { label: 'Backlog', totalCount: 6 },
};

export const PRIORITY_LABEL: Record<ProjectTaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
};

export const INITIAL_PROJECT_TASKS: ProjectTask[] = [
  {
    id: 't-118',
    code: 'DAT-118',
    title: 'Rebuild churn dashboard with cohorts',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    labels: [
      { text: 'Metrics', tone: 'lavender' },
      { text: 'BI', tone: 'muted' },
    ],
    dueDate: 'Nov 14',
    dueRelative: 'in 11 days',
    blocksCode: 'DAT-131',
    blocksTitle: 'Weekly exec digest workflow',
    descriptionBeforeCode:
      'Replace legacy rolling retention SQL with monthly cohort rollups reading from ',
    descriptionCode: 'analytics_prod.cohort_retention',
    descriptionAfterCode:
      ' so Finance and Product see identical logo and net-dollar churn numbers.',
    subtasks: [
      { id: 's-118-1', title: 'Define monthly cohort grain in dbt', done: true, ownerInitials: 'AM' },
      { id: 's-118-2', title: 'Backfill 24 months of Stripe subscription events', done: true, ownerInitials: 'ST' },
      { id: 's-118-3', title: 'Validate NRR against Q3 board deck', done: false, running: true, ownerInitials: 'AM' },
    ],
    activity: [
      {
        id: 'a-118-1',
        author: 'Alex Morgan',
        initials: 'AM',
        action: 'commented',
        time: '1h',
        comment: 'Cohort numbers match Finance within 0.1% for Q2 and Q3.',
      },
    ],
  },
  {
    id: 't-131',
    code: 'DAT-131',
    title: 'Weekly exec digest workflow',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Dana Walker',
    assigneeInitials: 'DW',
    labels: [{ text: 'Automation', tone: 'sky' }],
    dueDate: 'Nov 16',
    dueRelative: 'in 13 days',
    descriptionBeforeCode:
      'Compile Monday 07:00 executive KPI snapshot from ',
    descriptionCode: 'analytics_prod.exec_weekly_summary',
    descriptionAfterCode:
      ' and deliver formatted blocks to Slack and email.',
    subtasks: [
      { id: 's-131-1', title: 'Configure Monday 06:30 warehouse refresh trigger', done: true, ownerInitials: 'DW' },
      { id: 's-131-2', title: 'Add variance annotations for >10% swings', done: false, ownerInitials: 'DW' },
    ],
    activity: [
      {
        id: 'a-131-1',
        author: 'Dana Walker',
        action: 'moved task to In progress',
        time: 'Yesterday',
        dotTone: 'accent',
      },
    ],
  },
  {
    id: 't-127',
    code: 'DAT-127',
    title: 'Model trial to paid funnel',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Sam Turner',
    assigneeInitials: 'ST',
    labels: [{ text: 'Pipeline', tone: 'mint' }],
    dueDate: 'Nov 19',
    dueRelative: 'in 16 days',
    descriptionBeforeCode:
      'Attribute workspace activation steps from signup through first invoice in ',
    descriptionCode: 'analytics_prod.funnel_stages',
    descriptionAfterCode:
      ' with 30-day conversion windows.',
    subtasks: [
      { id: 's-127-1', title: 'Join Segment identify calls to workspace IDs', done: true, ownerInitials: 'ST' },
      { id: 's-127-2', title: 'Add PQL milestone flags', done: false, ownerInitials: 'AM' },
    ],
    activity: [
      {
        id: 'a-127-1',
        author: 'Sam Turner',
        action: 'linked PR #412',
        time: '2d ago',
        dotTone: 'muted',
      },
    ],
  },
  {
    id: 't-140',
    code: 'DAT-140',
    title: 'BigQuery cost alert over $500/day',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'Sam Turner',
    assigneeInitials: 'ST',
    labels: [
      { text: 'Infra', tone: 'peach' },
      { text: 'FinOps', tone: 'muted' },
    ],
    dueDate: 'Nov 12',
    dueRelative: 'in 9 days',
    descriptionBeforeCode:
      'Enforce bytes-billed guardrails and alert on ad-hoc queries scanning ',
    descriptionCode: 'INFORMATION_SCHEMA.JOBS_BY_PROJECT',
    descriptionAfterCode:
      ' when daily slot spend exceeds $500.',
    subtasks: [
      { id: 's-140-1', title: 'Set per-query 100 GB maximum bytes billed', done: true, ownerInitials: 'ST' },
      { id: 's-140-2', title: 'Route threshold alerts to #data-ops', done: false, running: true, ownerInitials: 'ST' },
    ],
    activity: [
      {
        id: 'a-140-1',
        author: 'Sam Turner',
        action: 'set priority to Urgent',
        time: 'Yesterday',
        dotTone: 'accent',
      },
    ],
  },
  {
    id: 't-109',
    code: 'DAT-109',
    title: 'Revenue by region report for Finance',
    status: 'review',
    priority: 'high',
    assignee: 'Elena Rossi',
    assigneeInitials: 'ER',
    labels: [{ text: 'Finance', tone: 'lavender' }],
    dueDate: 'Nov 10',
    dueRelative: 'in 7 days',
    descriptionBeforeCode:
      'Reconcile EMEA, NA and APAC multi-currency settlements in ',
    descriptionCode: 'analytics_prod.revenue_by_region',
    descriptionAfterCode:
      ' using daily ECB spot rates.',
    subtasks: [
      { id: 's-109-1', title: 'Verify FX conversion table completeness', done: true, ownerInitials: 'ER' },
      { id: 's-109-2', title: 'Sign off with Controller on VAT exclusions', done: true, ownerInitials: 'AM' },
    ],
    activity: [
      {
        id: 'a-109-1',
        author: 'Elena Rossi',
        action: 'requested review from Alex Morgan',
        time: '4h',
        dotTone: 'accent',
      },
    ],
  },
  {
    id: 't-122',
    code: 'DAT-122',
    title: 'Freshness checks for dbt models',
    status: 'review',
    priority: 'medium',
    assignee: 'Dana Walker',
    assigneeInitials: 'DW',
    labels: [{ text: 'Pipeline', tone: 'mint' }],
    dueDate: 'Nov 15',
    dueRelative: 'in 12 days',
    descriptionBeforeCode:
      'Add SLA freshness assertions on all tier-1 marts feeding ',
    descriptionCode: 'analytics_prod.marts_core',
    descriptionAfterCode:
      ' before 06:00 UTC.',
    subtasks: [
      { id: 's-122-1', title: 'Add warn_after: 6 hours, error_after: 12 hours', done: true, ownerInitials: 'DW' },
    ],
    activity: [
      {
        id: 'a-122-1',
        author: 'Dana Walker',
        action: 'opened pull request #419',
        time: 'Yesterday',
        dotTone: 'muted',
      },
    ],
  },
  {
    id: 't-136',
    code: 'DAT-136',
    title: 'Document net revenue edge cases',
    status: 'review',
    priority: 'medium',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    labels: [{ text: 'Docs', tone: 'sky' }],
    dueDate: 'Nov 17',
    dueRelative: 'in 14 days',
    descriptionBeforeCode:
      'Catalogue mid-cycle downgrades, dispute reversals and annual credit memos in ',
    descriptionCode: 'docs/metrics/net_revenue.md',
    descriptionAfterCode:
      ' for audit readiness.',
    subtasks: [
      { id: 's-136-1', title: 'Document chargeback clawback timing', done: true, ownerInitials: 'AM' },
    ],
    activity: [
      {
        id: 'a-136-1',
        author: 'Alex Morgan',
        action: 'updated specification',
        time: '2d ago',
        dotTone: 'muted',
      },
    ],
  },
  {
    id: 't-142',
    code: 'DAT-142',
    title: 'Define net revenue metric',
    status: 'backlog',
    priority: 'high',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    labels: [{ text: 'Metrics', tone: 'lavender' }],
    dueDate: 'Nov 21',
    dueRelative: 'in 18 days',
    descriptionBeforeCode:
      'Lock canonical semantic-layer measure in ',
    descriptionCode: 'analytics_prod.semantic_net_revenue',
    descriptionAfterCode:
      ' once Q3 Snowflake event backfill finishes.',
    subtasks: [
      { id: 's-142-1', title: 'Align refund window logic with Stripe payouts', done: true, ownerInitials: 'AM' },
      { id: 's-142-2', title: 'Switch executive Looker studio tiles to semantic view', done: false, ownerInitials: 'ER' },
    ],
    activity: [
      {
        id: 'a-142-1',
        author: 'Alex Morgan',
        action: 'marked blocked by DAT-145',
        time: 'Oct 30',
        dotTone: 'muted',
      },
    ],
  },
  {
    id: 't-145',
    code: 'DAT-145',
    title: 'Backfill Snowflake events for Q3',
    status: 'backlog',
    priority: 'urgent',
    assignee: 'Sam Turner',
    assigneeInitials: 'ST',
    labels: [
      { text: 'Pipeline', tone: 'mint' },
      { text: 'Backfill', tone: 'muted' },
    ],
    dueDate: 'Nov 18',
    dueRelative: 'in 15 days',
    blocksCode: 'DAT-142',
    blocksTitle: 'Define net revenue metric',
    descriptionBeforeCode:
      'Replay raw events from the S3 archive into ',
    descriptionCode: 'analytics_prod.events',
    descriptionAfterCode:
      ' for Jul 1 to Sep 30. The metrics layer reads Q3 revenue from this table, so net revenue stays blocked until row counts match the source.',
    subtasks: [
      {
        id: 's-145-1',
        title: 'Export Jul to Sep partitions from S3',
        done: true,
        ownerInitials: 'ST',
      },
      {
        id: 's-145-2',
        title: 'Create staging table with the new schema',
        done: true,
        ownerInitials: 'AM',
      },
      {
        id: 's-145-3',
        title: 'Replay events in daily batches',
        done: false,
        running: true,
        ownerInitials: 'ST',
      },
      {
        id: 's-145-4',
        title: 'Reconcile row counts against the source',
        done: false,
        ownerInitials: 'DW',
      },
      {
        id: 's-145-5',
        title: 'Swap staging into analytics_prod.events',
        done: false,
      },
    ],
    activity: [
      {
        id: 'a-145-1',
        author: 'Alex Morgan',
        initials: 'AM',
        action: 'commented',
        time: '2h',
        comment:
          'September is 4% short after the first pass. Looks like late events from the mobile SDK, I will rerun with a 72 hour window.',
      },
      {
        id: 'a-145-2',
        author: 'Sam Turner',
        action: 'set priority to Urgent',
        time: 'Yesterday',
        dotTone: 'accent',
      },
      {
        id: 'a-145-3',
        author: 'Dana Walker',
        action: 'created the task from Q3 revenue gaps',
        time: 'Oct 29',
        dotTone: 'muted',
      },
    ],
  },
  {
    id: 't-147',
    code: 'DAT-147',
    title: 'Audit PII columns in Postgres',
    status: 'backlog',
    priority: 'high',
    assignee: 'Dana Walker',
    assigneeInitials: 'DW',
    labels: [{ text: 'Security', tone: 'rose' }],
    dueDate: 'Nov 24',
    dueRelative: 'in 21 days',
    descriptionBeforeCode:
      'Tag and hash customer email, phone and IP columns across ',
    descriptionCode: 'postgres_replica.public.*',
    descriptionAfterCode:
      ' before ingesting into the warehouse staging schema.',
    subtasks: [
      { id: 's-147-1', title: 'Scan column catalog for unmasked PII', done: false, ownerInitials: 'DW' },
      { id: 's-147-2', title: 'Apply SHA-256 salt policy in Airbyte sync', done: false, ownerInitials: 'ST' },
    ],
    activity: [
      {
        id: 'a-147-1',
        author: 'Dana Walker',
        action: 'scheduled security review',
        time: 'Oct 28',
        dotTone: 'muted',
      },
    ],
  },
];
