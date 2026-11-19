import { type AppId } from '../../content/templates';
import { type BadgeTone } from '../../components/ui';
import { type ActivityLevel } from '../../components/ActivityDots';
import { type Tone } from '../../data';

export type WorkspaceItem = {
  id: string;
  name: string;
  mono: string;
  tone: 'inverted' | Tone;
};

export type ThreadStatus = 'in-review' | 'approved' | 'in-progress';

export type ReactionKind = 'zap' | 'star' | 'thumbs-up' | 'heart' | 'check';

export type ThreadReaction = {
  kind: ReactionKind;
  count: number;
  reacted?: boolean;
};

export type ThreadAttachment = {
  id: string;
  app: AppId;
  title: string;
  subtitle: string;
  actionLabel: string;
  screens: Array<{ name: string; status: 'Ready' | 'In review' | 'Draft'; tone: Tone }>;
};

export type ThreadMsg = {
  id: string;
  author: string;
  initials: string;
  timestamp: string;
  paragraphs: string[];
  attachment?: ThreadAttachment;
  reactions: ThreadReaction[];
  pinned?: boolean;
};

export type ThreadMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  departmentTone: BadgeTone;
  offline?: boolean;
};

export type ThreadLink = {
  id: string;
  app: AppId;
  title: string;
  url: string;
  sharedBy: string;
};

export type ThreadFile = {
  id: string;
  app: AppId;
  title: string;
  meta: string;
};

export type ThreadData = {
  id: string;
  title: string;
  breadcrumbs: string[];
  creator: string;
  creatorInitials: string;
  createdAt: string;
  status: ThreadStatus;
  tags: string[];
  tasks: Array<{ id: string; title: string; done: boolean }>;
  linkedThreadIds: string[];
  activity: ActivityLevel[];
  messages: ThreadMsg[];
  files: ThreadFile[];
  links: ThreadLink[];
  defaultDraft?: string;
};

export type ChannelIconKind = 'zap' | 'mobile' | 'release' | 'roadmap' | 'events' | 'announcements' | 'hash';

export type ChannelNode = {
  id: string;
  label: string;
  icon: ChannelIconKind;
  tone?: Tone;
  count?: number;
  threadId?: string;
  children?: ChannelNode[];
};

export const WORKSPACES: WorkspaceItem[] = [
  { id: 'orbitly', name: 'Orbitly', mono: 'O', tone: 'inverted' },
  { id: 'lumen', name: 'Lumen', mono: 'L', tone: 'lemon' },
  { id: 'northstar', name: 'Northstar', mono: 'N', tone: 'mint' },
];

export const THREAD_STATUS_META: Record<ThreadStatus, { label: string; tone: Tone }> = {
  'in-review': { label: 'In review', tone: 'lavender' },
  approved: { label: 'Approved', tone: 'mint' },
  'in-progress': { label: 'In progress', tone: 'lemon' },
};

export const THREAD_MEMBERS: ThreadMember[] = [
  {
    id: 'leah',
    name: 'Leah Chen',
    initials: 'LC',
    role: 'Product lead',
    department: 'Management',
    departmentTone: 'lemon',
  },
  {
    id: 'ravi',
    name: 'Ravi Iyer',
    initials: 'RI',
    role: 'Product designer',
    department: 'Design',
    departmentTone: 'lavender',
  },
  {
    id: 'sofia',
    name: 'Sofia Kim',
    initials: 'SK',
    role: 'UX writer',
    department: 'Content',
    departmentTone: 'rose',
  },
  {
    id: 'marcus',
    name: 'Marcus Obi',
    initials: 'MO',
    role: 'Engineering lead',
    department: 'Development',
    departmentTone: 'sky',
  },
  {
    id: 'samuel',
    name: 'Samuel Park',
    initials: 'SP',
    role: 'QA engineer',
    department: 'QA',
    departmentTone: 'neutral',
    offline: true,
  },
];

export const FAVORITE_ITEMS: Array<{
  id: string;
  label: string;
  kind: 'dm' | 'channel';
  initials?: string;
  count?: number;
  threadId: string;
}> = [
  { id: 'fav-leah', label: 'Leah Chen', kind: 'dm', initials: 'LC', count: 2, threadId: 'dm-leah' },
  { id: 'fav-ds', label: 'Design-system', kind: 'channel', count: 4, threadId: 'design-system' },
];

export const CHANNEL_TREE: ChannelNode[] = [
  { id: 'ch-general', label: 'General', icon: 'zap', tone: 'peach', count: 1, threadId: 'general' },
  { id: 'ch-frontend', label: 'Front-end', icon: 'hash', count: 4, threadId: 'front-end' },
  {
    id: 'ch-mobile',
    label: 'Mobile app',
    icon: 'mobile',
    tone: 'lavender',
    children: [
      {
        id: 'ch-v4',
        label: 'v4.0',
        icon: 'release',
        tone: 'rose',
        children: [
          { id: 'th-research', label: 'Research', icon: 'hash', threadId: 'research' },
          { id: 'th-wireframes', label: 'Wireframes', icon: 'hash', threadId: 'wireframes' },
          { id: 'th-onboarding', label: 'Onboarding flow', icon: 'hash', threadId: 'onboarding-flow' },
        ],
      },
      { id: 'ch-v32', label: 'v3.2 - current release', icon: 'hash', threadId: 'v32-release' },
    ],
  },
  { id: 'ch-roadmap', label: 'Roadmap', icon: 'roadmap', tone: 'mint', threadId: 'roadmap' },
  { id: 'ch-events', label: 'Events', icon: 'events', tone: 'rose', threadId: 'events' },
  { id: 'ch-announcements', label: 'Announcements', icon: 'announcements', tone: 'lemon', threadId: 'announcements' },
  { id: 'ch-growth', label: 'Growth', icon: 'hash', count: 2, threadId: 'growth' },
];

export const INITIAL_THREADS: Record<string, ThreadData> = {
  'onboarding-flow': {
    id: 'onboarding-flow',
    title: 'Onboarding flow',
    breadcrumbs: ['Mobile app', 'v4.0'],
    creator: 'Leah C.',
    creatorInitials: 'LC',
    createdAt: '14 Oct',
    status: 'in-review',
    tags: [
      'v4.0',
      'onboarding',
      'mobile',
      'tokens',
      'copy-review',
      'motion',
      'permissions',
      'paywall',
      'handoff',
    ],
    tasks: [
      { id: 'tk-1', title: 'Map all 5 onboarding frames to design tokens', done: true },
      { id: 'tk-2', title: 'Review permission prompt copy on screens 2 and 4', done: false },
      { id: 'tk-3', title: 'Finalize paywall variant layout', done: false },
      { id: 'tk-4', title: 'Export Lottie welcome animation JSON', done: false },
      { id: 'tk-5', title: 'Name Figma frames by screen number for QA', done: true },
      { id: 'tk-6', title: 'Set up engineering handoff board', done: true },
    ],
    linkedThreadIds: ['design-system', 'qa-checklist'],
    activity: [0, 0, 1, 1, 0, 2, 1, 0, 1, 2, 3, 2, 3, 2, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2],
    defaultDraft:
      "Looks great! Once the copy is final we'll hand off to engineering on Friday. This is shaping up to be our smoothest sprint yet.\n@S",
    messages: [
      {
        id: 'm-1',
        author: 'Leah C.',
        initials: 'LC',
        timestamp: '2d ago',
        pinned: true,
        paragraphs: [
          "Hey team, we need to lock the onboarding flow for v4.0 this week. Let's agree on permission prompts, the progress indicator and empty states before engineering picks it up — copy, motion and edge cases included.",
          '@Product @Marcus',
        ],
        reactions: [{ kind: 'zap', count: 3, reacted: true }],
      },
      {
        id: 'm-2',
        author: 'Ravi I.',
        initials: 'RI',
        timestamp: '4h ago',
        pinned: true,
        paragraphs: [
          "I've mapped all five screens against the new design tokens, so the flow is about 85% done. What's left is the paywall variant and the Lottie files for the welcome animation.",
          '@Sofia K., could you review the copy on screens 2 and 4 when you get a chance?',
        ],
        attachment: {
          id: 'att-figma',
          app: 'figma',
          title: 'Orbitly onboarding · v4.0',
          subtitle: 'figma.com',
          actionLabel: 'Quick view',
          screens: [
            { name: '01 · Welcome & value prop', status: 'Ready', tone: 'mint' },
            { name: '02 · Notification permissions', status: 'In review', tone: 'lavender' },
            { name: '03 · Workspace setup', status: 'Ready', tone: 'mint' },
            { name: '04 · Empty state prompts', status: 'In review', tone: 'lavender' },
            { name: '05 · Trial paywall variant', status: 'Draft', tone: 'lemon' },
          ],
        },
        reactions: [{ kind: 'star', count: 4 }],
      },
      {
        id: 'm-3',
        author: 'Marcus O.',
        initials: 'MO',
        timestamp: '1h ago',
        paragraphs: [
          'Nice, keep me posted. Lets also name the frames by screen number so QA can follow along when we test on device.',
          "@Ravi I. — I'll set up the handoff board this afternoon.",
        ],
        reactions: [],
      },
    ],
    files: [
      { id: 'f-1', app: 'figma', title: 'Orbitly onboarding · v4.0', meta: 'Figma · Updated 4h ago' },
      { id: 'f-2', app: 'notion', title: 'Onboarding copy deck v4', meta: 'Notion · 12 KB' },
      { id: 'f-3', app: 'jira', title: 'MOB-412 handoff checklist', meta: 'Jira · 6 subtasks' },
    ],
    links: [
      { id: 'l-1', app: 'figma', title: 'Orbitly onboarding · v4.0', url: 'figma.com/file/orbitly-v4-onboarding', sharedBy: 'Ravi I.' },
      { id: 'l-2', app: 'notion', title: 'v4.0 permission copy guidelines', url: 'notion.so/orbitly/permissions-v4', sharedBy: 'Sofia K.' },
      { id: 'l-3', app: 'jira', title: 'Mobile v4.0 sprint handoff board', url: 'jira.acme.io/boards/mob-v4', sharedBy: 'Marcus O.' },
    ],
  },
  'design-system': {
    id: 'design-system',
    title: 'Design-system',
    breadcrumbs: ['Favorites'],
    creator: 'Ravi I.',
    creatorInitials: 'RI',
    createdAt: '09 Oct',
    status: 'approved',
    tags: ['tokens', 'typography', 'dark-mode', 'components'],
    tasks: [
      { id: 'ds-1', title: 'Verify 4.5:1 contrast on tinted surfaces', done: true },
      { id: 'ds-2', title: 'Publish v4 token JSON for iOS and Android', done: true },
    ],
    linkedThreadIds: ['onboarding-flow', 'qa-checklist'],
    activity: [1, 2, 2, 1, 0, 1, 2, 3, 2, 1, 1, 2, 2, 3, 2, 1, 0, 1, 2, 2, 3, 1, 2, 2],
    messages: [
      {
        id: 'ds-m1',
        author: 'Ravi I.',
        initials: 'RI',
        timestamp: '1d ago',
        pinned: true,
        paragraphs: [
          'Surface ladder and pastel status tokens are locked for both light and dark themes. All mobile v4.0 frames now reference semantic variables.',
          '@Leah C. @Marcus',
        ],
        reactions: [{ kind: 'check', count: 5, reacted: true }],
      },
      {
        id: 'ds-m2',
        author: 'Sofia K.',
        initials: 'SK',
        timestamp: '6h ago',
        paragraphs: [
          'Updated microcopy rules for empty states and permission sheets so labels stay in sentence case across web and mobile.',
        ],
        reactions: [{ kind: 'star', count: 2 }],
      },
    ],
    files: [{ id: 'ds-f1', app: 'figma', title: 'Acme token library v4', meta: 'Figma · Published' }],
    links: [{ id: 'ds-l1', app: 'notion', title: 'Token naming reference', url: 'notion.so/orbitly/tokens', sharedBy: 'Ravi I.' }],
  },
  'qa-checklist': {
    id: 'qa-checklist',
    title: 'QA checklist',
    breadcrumbs: ['Mobile app', 'v4.0'],
    creator: 'Samuel P.',
    creatorInitials: 'SP',
    createdAt: '15 Oct',
    status: 'in-progress',
    tags: ['qa', 'ios', 'android', 'device-matrix'],
    tasks: [
      { id: 'qa-1', title: 'Test VoiceOver focus order on onboarding', done: false },
      { id: 'qa-2', title: 'Verify dark mode contrast on iPhone SE', done: true },
    ],
    linkedThreadIds: ['onboarding-flow', 'design-system'],
    activity: [0, 0, 0, 1, 1, 0, 1, 1, 2, 1, 0, 1, 2, 2, 1, 1, 2, 1, 0, 1, 2, 2, 1, 1],
    messages: [
      {
        id: 'qa-m1',
        author: 'Samuel P.',
        initials: 'SP',
        timestamp: '5h ago',
        pinned: true,
        paragraphs: [
          'Device test matrix is ready for Friday handoff: iOS 18, Android 15, dynamic type XL, and dark mode parity.',
          '@Marcus @Ravi I.',
        ],
        reactions: [{ kind: 'thumbs-up', count: 3 }],
      },
    ],
    files: [{ id: 'qa-f1', app: 'sheets', title: 'v4.0 device matrix', meta: 'Google Sheets · 24 cases' }],
    links: [{ id: 'qa-l1', app: 'jira', title: 'QA test plan MOB-420', url: 'jira.acme.io/issues/mob-420', sharedBy: 'Samuel P.' }],
  },
  research: {
    id: 'research',
    title: 'Research',
    breadcrumbs: ['Mobile app', 'v4.0'],
    creator: 'Leah C.',
    creatorInitials: 'LC',
    createdAt: '04 Oct',
    status: 'approved',
    tags: ['interviews', 'funnel', 'activation'],
    tasks: [{ id: 'rs-1', title: 'Synthesize 12 user onboarding recordings', done: true }],
    linkedThreadIds: ['onboarding-flow', 'wireframes'],
    activity: [1, 2, 3, 2, 2, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    messages: [
      {
        id: 'rs-m1',
        author: 'Leah C.',
        initials: 'LC',
        timestamp: '5d ago',
        pinned: true,
        paragraphs: [
          'Key takeaway from 12 customer interviews: asking for push permissions before showing the workspace preview dropped completion by 19%.',
        ],
        reactions: [{ kind: 'zap', count: 6 }],
      },
    ],
    files: [{ id: 'rs-f1', app: 'notion', title: 'Onboarding usability synthesis', meta: 'Notion · 12 sessions' }],
    links: [],
  },
  wireframes: {
    id: 'wireframes',
    title: 'Wireframes',
    breadcrumbs: ['Mobile app', 'v4.0'],
    creator: 'Ravi I.',
    creatorInitials: 'RI',
    createdAt: '08 Oct',
    status: 'approved',
    tags: ['wireframes', 'flows'],
    tasks: [{ id: 'wf-1', title: 'Sign off 5-step flow structure', done: true }],
    linkedThreadIds: ['onboarding-flow', 'research'],
    activity: [0, 1, 2, 3, 3, 2, 1, 1, 0, 1, 2, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1],
    messages: [
      {
        id: 'wf-m1',
        author: 'Ravi I.',
        initials: 'RI',
        timestamp: '3d ago',
        paragraphs: [
          'Consolidated the 7-screen draft down to 5 focused steps with a persistent progress bar and skip option on permissions.',
        ],
        reactions: [{ kind: 'star', count: 4 }],
      },
    ],
    files: [{ id: 'wf-f1', app: 'figma', title: 'v4.0 low-fi wireframes', meta: 'Figma · Approved' }],
    links: [],
  },
  'dm-leah': {
    id: 'dm-leah',
    title: 'Leah Chen',
    breadcrumbs: ['Direct messages'],
    creator: 'Leah C.',
    creatorInitials: 'LC',
    createdAt: '16 Oct',
    status: 'in-progress',
    tags: ['1:1', 'sprint-planning'],
    tasks: [{ id: 'dm-1', title: 'Align on Friday handoff checklist', done: false }],
    linkedThreadIds: ['onboarding-flow'],
    activity: [0, 1, 0, 1, 1, 2, 1, 0, 1, 1, 2, 1, 1, 0, 1, 2, 2, 1, 0, 1, 2, 1, 2, 3],
    messages: [
      {
        id: 'dm-m1',
        author: 'Leah C.',
        initials: 'LC',
        timestamp: '35m ago',
        paragraphs: [
          'Thanks for turning around the token mapping so fast! Once @Sofia K. signs off the copy, we are clear for Friday handoff.',
        ],
        reactions: [{ kind: 'heart', count: 1, reacted: true }],
      },
    ],
    files: [],
    links: [],
  },
  general: {
    id: 'general',
    title: 'General',
    breadcrumbs: ['Channels'],
    creator: 'Leah C.',
    creatorInitials: 'LC',
    createdAt: '01 Oct',
    status: 'approved',
    tags: ['announcements', 'team'],
    tasks: [{ id: 'gn-1', title: 'Share v4.0 release demo invite', done: true }],
    linkedThreadIds: ['onboarding-flow', 'design-system'],
    activity: [2, 1, 2, 2, 1, 1, 3, 2, 1, 2, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
    messages: [
      {
        id: 'gn-m1',
        author: 'Marcus O.',
        initials: 'MO',
        timestamp: '3h ago',
        paragraphs: [
          'Reminder: Mobile app v4.0 design review happens Thursday at 14:00 CET. Drop open questions in #Onboarding flow beforehand.',
        ],
        reactions: [{ kind: 'thumbs-up', count: 5 }],
      },
    ],
    files: [],
    links: [],
  },
};

export const getThreadById = (threads: Record<string, ThreadData>, id: string): ThreadData =>
  threads[id] ?? threads['onboarding-flow'];
