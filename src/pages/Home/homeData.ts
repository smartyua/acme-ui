import { Globe, Layers, Megaphone, Rocket, Smartphone, Sparkles, type LucideIcon } from 'lucide-react';

import { type Tone } from '../../data';

export type TaskPriority = 'urgent' | 'high' | 'normal';
export type TaskBucket = 'upcoming' | 'overdue';
export type TaskTab = 'upcoming' | 'overdue' | 'completed';

export type HomeTask = {
  id: string;
  title: string;
  project: string;
  projectTone: Tone;
  priority: TaskPriority;
  due: string;
  dueTone: 'warning' | 'danger' | 'muted';
  hasWarning?: boolean;
  completed: boolean;
  bucket: TaskBucket;
  assignee: string;
  assigneeInitials: string;
  notes: string;
};

export type ProjectStatus = 'in-progress' | 'planning' | 'at-risk';

export type HomeProject = {
  id: string;
  name: string;
  icon: LucideIcon;
  tileTone: 'lavender' | 'blue' | 'pink' | 'peach' | 'mint';
  dotTone: Tone;
  status: ProjectStatus;
  progress: number;
  due: string;
  team: string[];
  extraTeam: number;
  lead: string;
  summary: string;
};

export type DeadlineGroupKey = 'Today' | 'Tomorrow' | 'This week';

export type DeadlineItem = {
  id: string;
  title: string;
  group: DeadlineGroupKey;
  project: string;
  dotTone: Tone;
  dueDetail: string;
  owner: string;
  ownerInitials: string;
  extra?: boolean;
};

export type HomeActivityItem = {
  id: string;
  initials: string;
  actor: string;
  verb: string;
  target: string;
  project: string;
  time: string;
};

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; tone: Tone | 'muted' }> = {
  'in-progress': { label: 'In progress', tone: 'sky' },
  planning: { label: 'Planning', tone: 'muted' },
  'at-risk': { label: 'At risk', tone: 'rose' },
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
};

// Workspace-level baseline offsets so KPI totals match the workspace roll-up (39 open, 8 completed, 6 overdue)
// while adjusting dynamically as the signed-in user checks off or reopens their own tasks.
export const WORKSPACE_OPEN_OFFSET = 32;
export const WORKSPACE_COMPLETED_OFFSET = 6;
export const WORKSPACE_OVERDUE_OFFSET = 5;

export const INITIAL_TASKS: HomeTask[] = [
  {
    id: 'task-1',
    title: 'Weekly design sync notes',
    project: 'Website Redesign',
    projectTone: 'lavender',
    priority: 'normal',
    due: 'Today',
    dueTone: 'warning',
    completed: false,
    bucket: 'upcoming',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes:
      'Consolidate component review decisions, responsive header spacing, and dark-mode contrast sign-off.',
  },
  {
    id: 'task-2',
    title: 'Launch readiness checklist',
    project: 'Product Launch',
    projectTone: 'lemon',
    priority: 'urgent',
    due: 'Tomorrow',
    dueTone: 'warning',
    hasWarning: true,
    completed: false,
    bucket: 'upcoming',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes:
      'Verify rollback runbook, status page webhooks, and billing webhook load-test sign-off before freeze.',
  },
  {
    id: 'task-3',
    title: 'Prepare design system tokens',
    project: 'Website Redesign',
    projectTone: 'lavender',
    priority: 'normal',
    due: 'Thu',
    dueTone: 'muted',
    completed: false,
    bucket: 'upcoming',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes: 'Audit semantic surface ladder and verify light/dark parity across elevated cards and dialogs.',
  },
  {
    id: 'task-4',
    title: 'Triage beta tester feedback',
    project: 'Mobile App',
    projectTone: 'sky',
    priority: 'normal',
    due: 'Fri',
    dueTone: 'muted',
    completed: false,
    bucket: 'upcoming',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes: 'Group 24 TestFlight reports by biometric login, offline queue retries, and gesture navigation.',
  },
  {
    id: 'task-5',
    title: 'Go / no-go meeting',
    project: 'Product Launch',
    projectTone: 'lemon',
    priority: 'high',
    due: 'Oct 20',
    dueTone: 'muted',
    completed: false,
    bucket: 'upcoming',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes:
      'Final checkpoint with engineering, product marketing, and customer support leads ahead of Oct 21.',
  },
  {
    id: 'task-6',
    title: 'Launch webinar deck',
    project: 'Marketing Campaign',
    projectTone: 'rose',
    priority: 'normal',
    due: 'Oct 24',
    dueTone: 'muted',
    completed: false,
    bucket: 'upcoming',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes: 'Build live customer workflow walkthrough slides and Q&A talk track with Elena.',
  },
  {
    id: 'task-7',
    title: 'Resolve checkout token expiry',
    project: 'Product Launch',
    projectTone: 'lemon',
    priority: 'urgent',
    due: 'Oct 9',
    dueTone: 'danger',
    hasWarning: true,
    completed: false,
    bucket: 'overdue',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes: 'Session refresh races when payment confirmation takes longer than 90 seconds on 3DS flows.',
  },
  {
    id: 'task-8',
    title: 'Finalize Q4 roadmap',
    project: 'Website Redesign',
    projectTone: 'lavender',
    priority: 'high',
    due: 'Oct 10',
    dueTone: 'muted',
    completed: true,
    bucket: 'upcoming',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes:
      'Locked milestone sequencing and staffing allocations across web, mobile, and design system streams.',
  },
  {
    id: 'task-9',
    title: 'Audit onboarding emails',
    project: 'Marketing Campaign',
    projectTone: 'rose',
    priority: 'normal',
    due: 'Oct 8',
    dueTone: 'muted',
    completed: true,
    bucket: 'upcoming',
    assignee: 'Alex Morgan',
    assigneeInitials: 'AM',
    notes: 'Reviewed plain-text fallbacks, magic-link expiration copy, and workspace invite templates.',
  },
];

export const INITIAL_PROJECTS: HomeProject[] = [
  {
    id: 'proj-web',
    name: 'Website Redesign',
    icon: Globe,
    tileTone: 'lavender',
    dotTone: 'lavender',
    status: 'in-progress',
    progress: 22,
    due: 'Nov 2',
    team: ['AM', 'SC', 'ER'],
    extraTeam: 4,
    lead: 'Sarah Chen',
    summary: 'Marketing site refresh, pricing comparison tables, and unified token architecture.',
  },
  {
    id: 'proj-mobile',
    name: 'Mobile App',
    icon: Smartphone,
    tileTone: 'blue',
    dotTone: 'sky',
    status: 'in-progress',
    progress: 20,
    due: 'Nov 30',
    team: ['AM', 'MW', 'ER'],
    extraTeam: 2,
    lead: 'Marcus Webb',
    summary: 'iOS & Android companion app with biometric sign-in, push alerts, and offline sync.',
  },
  {
    id: 'proj-marketing',
    name: 'Marketing Campaign',
    icon: Megaphone,
    tileTone: 'pink',
    dotTone: 'rose',
    status: 'planning',
    progress: 14,
    due: 'Nov 18',
    team: ['AM', 'ER', 'AP'],
    extraTeam: 2,
    lead: 'Elena Rossi',
    summary: 'Autumn product announcement, customer case studies, paid social creatives, and live webinar.',
  },
  {
    id: 'proj-launch',
    name: 'Product Launch',
    icon: Rocket,
    tileTone: 'peach',
    dotTone: 'lemon',
    status: 'at-risk',
    progress: 0,
    due: 'Oct 21',
    team: ['AM', 'SC', 'JP'],
    extraTeam: 2,
    lead: 'James Park',
    summary: 'GA release gated on checkout token fix and final production load verification.',
  },
  {
    id: 'proj-ds',
    name: 'Design System',
    icon: Sparkles,
    tileTone: 'lavender',
    dotTone: 'sky',
    status: 'in-progress',
    progress: 17,
    due: 'Dec 18',
    team: ['SC', 'JP', 'ER'],
    extraTeam: 0,
    lead: 'Sarah Chen',
    summary: 'Core UI primitives, WCAG AA contrast tokens, and automated visual regression coverage.',
  },
];

export const NEW_PROJECT_ICON = Layers;

export const DEADLINES: DeadlineItem[] = [
  {
    id: 'dl-1',
    title: 'Biometric sign-in',
    group: 'Today',
    project: 'Mobile App',
    dotTone: 'sky',
    dueDetail: 'Today, 2:00 PM',
    owner: 'Marcus Webb',
    ownerInitials: 'MW',
  },
  {
    id: 'dl-2',
    title: 'Dark mode palette',
    group: 'Today',
    project: 'Website Redesign',
    dotTone: 'lavender',
    dueDetail: 'Today, 4:00 PM',
    owner: 'Sarah Chen',
    ownerInitials: 'SC',
  },
  {
    id: 'dl-3',
    title: 'Image optimization pipeline',
    group: 'Today',
    project: 'Website Redesign',
    dotTone: 'lavender',
    dueDetail: 'Today, 5:30 PM',
    owner: 'Elena Rossi',
    ownerInitials: 'ER',
  },
  {
    id: 'dl-4',
    title: 'Weekly design sync notes',
    group: 'Today',
    project: 'Website Redesign',
    dotTone: 'lavender',
    dueDetail: 'Today, 6:00 PM',
    owner: 'Alex Morgan',
    ownerInitials: 'AM',
  },
  {
    id: 'dl-5',
    title: 'Launch readiness checklist',
    group: 'Tomorrow',
    project: 'Product Launch',
    dotTone: 'lemon',
    dueDetail: 'Tomorrow, 10:00 AM',
    owner: 'Alex Morgan',
    ownerInitials: 'AM',
  },
  {
    id: 'dl-6',
    title: 'Design responsive navigation',
    group: 'Tomorrow',
    project: 'Product Launch',
    dotTone: 'lemon',
    dueDetail: 'Tomorrow, 3:00 PM',
    owner: 'Sarah Chen',
    ownerInitials: 'SC',
  },
  {
    id: 'dl-7',
    title: 'Offline mode sync',
    group: 'This week',
    project: 'Mobile App',
    dotTone: 'sky',
    dueDetail: 'Wed, Oct 14',
    owner: 'Marcus Webb',
    ownerInitials: 'MW',
  },
  {
    id: 'dl-8',
    title: 'Onboarding flow prototype',
    group: 'This week',
    project: 'Mobile App',
    dotTone: 'sky',
    dueDetail: 'Thu, Oct 15',
    owner: 'Elena Rossi',
    ownerInitials: 'ER',
  },
  {
    id: 'dl-9',
    title: 'Push notification service',
    group: 'This week',
    project: 'Mobile App',
    dotTone: 'mint',
    dueDetail: 'Fri, Oct 16',
    owner: 'Marcus Webb',
    ownerInitials: 'MW',
  },
  {
    id: 'dl-10',
    title: 'Paid social creatives',
    group: 'This week',
    project: 'Marketing Campaign',
    dotTone: 'rose',
    dueDetail: 'Sat, Oct 17',
    owner: 'Aisha Patel',
    ownerInitials: 'AP',
  },
  {
    id: 'dl-11',
    title: 'Pricing table accessibility pass',
    group: 'This week',
    project: 'Website Redesign',
    dotTone: 'lavender',
    dueDetail: 'Wed, Oct 14',
    owner: 'Sarah Chen',
    ownerInitials: 'SC',
    extra: true,
  },
  {
    id: 'dl-12',
    title: 'Telemetry schema review',
    group: 'This week',
    project: 'Product Launch',
    dotTone: 'lemon',
    dueDetail: 'Wed, Oct 14',
    owner: 'James Park',
    ownerInitials: 'JP',
    extra: true,
  },
  {
    id: 'dl-13',
    title: 'Customer quote approvals',
    group: 'This week',
    project: 'Marketing Campaign',
    dotTone: 'rose',
    dueDetail: 'Thu, Oct 15',
    owner: 'Aisha Patel',
    ownerInitials: 'AP',
    extra: true,
  },
  {
    id: 'dl-14',
    title: 'Focus ring contrast audit',
    group: 'This week',
    project: 'Design System',
    dotTone: 'sky',
    dueDetail: 'Thu, Oct 15',
    owner: 'Elena Rossi',
    ownerInitials: 'ER',
    extra: true,
  },
  {
    id: 'dl-15',
    title: 'Crash reporting integration',
    group: 'This week',
    project: 'Mobile App',
    dotTone: 'sky',
    dueDetail: 'Fri, Oct 16',
    owner: 'Marcus Webb',
    ownerInitials: 'MW',
    extra: true,
  },
  {
    id: 'dl-16',
    title: 'Release blog draft',
    group: 'This week',
    project: 'Marketing Campaign',
    dotTone: 'rose',
    dueDetail: 'Fri, Oct 16',
    owner: 'Elena Rossi',
    ownerInitials: 'ER',
    extra: true,
  },
  {
    id: 'dl-17',
    title: 'Drawer keyboard trap specs',
    group: 'This week',
    project: 'Design System',
    dotTone: 'sky',
    dueDetail: 'Fri, Oct 16',
    owner: 'James Park',
    ownerInitials: 'JP',
    extra: true,
  },
  {
    id: 'dl-18',
    title: 'CDN cache warm-up script',
    group: 'This week',
    project: 'Website Redesign',
    dotTone: 'lavender',
    dueDetail: 'Sat, Oct 17',
    owner: 'James Park',
    ownerInitials: 'JP',
    extra: true,
  },
  {
    id: 'dl-19',
    title: 'Support macro updates',
    group: 'This week',
    project: 'Product Launch',
    dotTone: 'lemon',
    dueDetail: 'Sun, Oct 18',
    owner: 'Alex Morgan',
    ownerInitials: 'AM',
    extra: true,
  },
];

export const INITIAL_ACTIVITY: HomeActivityItem[] = [
  {
    id: 'act-1',
    initials: 'AM',
    actor: 'You',
    verb: 'created',
    target: 'Triage beta tester feedback',
    project: 'Mobile App',
    time: '14m ago',
  },
  {
    id: 'act-2',
    initials: 'AM',
    actor: 'You',
    verb: 'completed',
    target: 'Finalize Q4 roadmap',
    project: 'Website Redesign',
    time: '1h ago',
  },
  {
    id: 'act-3',
    initials: 'SC',
    actor: 'Sarah Chen',
    verb: 'commented on',
    target: 'Launch readiness checklist',
    project: 'Product Launch',
    time: '3h ago',
  },
  {
    id: 'act-4',
    initials: 'ER',
    actor: 'Elena Rossi',
    verb: 'published tokens for',
    target: 'Dark mode palette',
    project: 'Design System',
    time: 'Yesterday',
  },
];
