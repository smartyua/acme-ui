// Data lifted from shacdn/src/screens/Dashboard/dashboardData.ts (Overview page)
// and regrouped into the Vetted layout: rail → list panel → details card → "what we check" card.
import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  Receipt,
  Settings,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type Tone = 'lavender' | 'peach' | 'mint' | 'lemon' | 'rose' | 'sky';

export type RailItem = { id: string; label: string; icon: LucideIcon; path: string };

export const RAIL_PRIMARY: RailItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/overview' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, path: '/templates' },
  { id: 'orders', label: 'Orders', icon: CreditCard, path: '/orders' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/customers' },
  { id: 'finance', label: 'Finance', icon: Wallet, path: '/finance' },
  { id: 'payments', label: 'Payments', icon: Receipt, path: '/payments' },
  { id: 'reports', label: 'Reports', icon: LineChart, path: '/reports' },
];

export const RAIL_SECONDARY: RailItem[] = [
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'profile', label: 'Profile', icon: UserRound, path: '/profile' },
];

export const ALL_ROUTES: Array<{ path: string; label: string }> = [
  ...RAIL_PRIMARY,
  ...RAIL_SECONDARY,
  { path: '/help', label: 'Help' },
];

export type TimeRange = '24h' | '7d' | '30d';

export const RANGE_LABEL: Record<TimeRange, string> = { '24h': '24-hour', '7d': '7-day', '30d': '30-day' };
export const RANGE_PREV: Record<TimeRange, string> = { '24h': 'day', '7d': 'week', '30d': 'month' };

export type Kpi = {
  id: string;
  title: string;
  short: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  progress: number;
  icon: LucideIcon;
  description: string;
  target: string;
  tone: Tone;
  owner: string;
  action: string;
};

export const KPIS: Kpi[] = [
  {
    id: 'revenue',
    title: 'Total revenue',
    short: 'Revenue',
    value: '$48,352',
    change: '+12.5%',
    trend: 'up',
    progress: 78,
    icon: CreditCard,
    description: 'Gross sales from completed orders, net of refunds',
    target: '78% of $62k monthly goal',
    tone: 'lavender',
    owner: 'SC',
    action: 'Revenue target',
  },
  {
    id: 'users',
    title: 'Active users',
    short: 'Users',
    value: '2,847',
    change: '+8.2%',
    trend: 'up',
    progress: 65,
    icon: Users,
    description: 'Unique accounts with at least one session',
    target: '142 new signups this week',
    tone: 'peach',
    owner: 'MW',
    action: 'User growth',
  },
  {
    id: 'conversion',
    title: 'Conversion rate',
    short: 'Conversion',
    value: '3.24%',
    change: '-0.4%',
    trend: 'down',
    progress: 42,
    icon: TrendingUp,
    description: 'Checkout completions ÷ unique store visits',
    target: 'Below the 3.5% quarterly target',
    tone: 'mint',
    owner: 'ER',
    action: 'Checkout funnel review',
  },
  {
    id: 'aov',
    title: 'Avg. order value',
    short: 'AOV',
    value: '$186',
    change: '+2.1%',
    trend: 'up',
    progress: 55,
    icon: BarChart3,
    description: 'Mean amount across completed orders',
    target: 'Up from $182 last period',
    tone: 'lemon',
    owner: 'AP',
    action: 'Order value',
  },
];

export type Point = { label: string; value: number };

// 30d keeps shacdn's monthly REVENUE_DATA; 7d reuses the CONVERSION_DATA weekday shape.
export const REVENUE_BY_RANGE: Record<TimeRange, Point[]> = {
  '24h': [
    { label: '00', value: 180 },
    { label: '04', value: 120 },
    { label: '08', value: 640 },
    { label: '12', value: 1120 },
    { label: '16', value: 980 },
    { label: '20', value: 720 },
  ],
  '7d': [
    { label: 'Mon', value: 1420 },
    { label: 'Tue', value: 1980 },
    { label: 'Wed', value: 1730 },
    { label: 'Thu', value: 2270 },
    { label: 'Fri', value: 2480 },
    { label: 'Sat', value: 1290 },
    { label: 'Sun', value: 980 },
  ],
  '30d': [
    { label: 'Jan', value: 4200 },
    { label: 'Feb', value: 5100 },
    { label: 'Mar', value: 4800 },
    { label: 'Apr', value: 6200 },
    { label: 'May', value: 5800 },
    { label: 'Jun', value: 7100 },
    { label: 'Jul', value: 6450 },
  ],
};

export type TxStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export type Transaction = {
  id: string;
  region?: string;
  customer: string;
  initials: string;
  email: string;
  amount: string;
  status: TxStatus;
  date: string;
};

export const TRANSACTIONS: Transaction[] = [
  { id: 'TX-4821', customer: 'Sarah Chen', initials: 'SC', email: 'sarah@acme.io', amount: '$2,450.00', status: 'completed', date: 'Jul 12' },
  { id: 'TX-4820', customer: 'Marcus Webb', initials: 'MW', email: 'marcus@nova.dev', amount: '$890.50', status: 'pending', date: 'Jul 12' },
  { id: 'TX-4819', customer: 'Elena Rossi', initials: 'ER', email: 'elena@studio.it', amount: '$1,200.00', status: 'completed', date: 'Jul 11' },
  { id: 'TX-4818', customer: 'James Park', initials: 'JP', email: 'james@labs.co', amount: '$340.00', status: 'failed', date: 'Jul 11' },
  { id: 'TX-4817', customer: 'Aisha Patel', initials: 'AP', email: 'aisha@flow.app', amount: '$5,670.25', status: 'completed', date: 'Jul 10' },
  { id: 'TX-4816', customer: 'Tom Becker', initials: 'TB', email: 'tom@stack.dev', amount: '$128.99', status: 'pending', date: 'Jul 10' },
  { id: 'TX-4815', customer: 'Nina Ortiz', initials: 'NO', email: 'nina@craft.co', amount: '$2,100.00', status: 'completed', date: 'Jul 9' },
  { id: 'TX-4814', customer: 'Leo Fischer', initials: 'LF', email: 'leo@berlin.de', amount: '$760.00', status: 'completed', date: 'Jul 9' },
];

export const STATUS_META: Record<TxStatus, { label: string; tone: Tone }> = {
  completed: { label: 'Completed', tone: 'mint' },
  pending: { label: 'Pending', tone: 'lemon' },
  failed: { label: 'Failed', tone: 'rose' },
  refunded: { label: 'Refunded', tone: 'sky' },
};

export const REPORTS = [
  { id: 'q2', label: 'Q2 analytics', count: 1, tone: 'peach' as Tone },
  { id: 'renewals', label: 'Enterprise renewals', count: 2, tone: 'lavender' as Tone },
  { id: 'refunds', label: 'Refund audit', count: 1, tone: 'mint' as Tone },
];

export const AVATAR_TONE: Record<string, Tone> = {
  SC: 'lavender',
  MW: 'peach',
  ER: 'mint',
  AP: 'lemon',
  JP: 'rose',
  TB: 'sky',
  NO: 'peach',
  LF: 'mint',
};

export const DOC_ICON = FileText;

export type NotificationKind = 'payment' | 'team' | 'system' | 'report' | 'workflow';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  time: string;
  group: 'Today' | 'Yesterday' | 'Earlier';
  read: boolean;
};

// Base set from shacdn dashboardData.NOTIFICATIONS, extended for the workflow screens
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', kind: 'payment', title: 'Payment received', description: 'Invoice #4821 paid by Sarah Chen — $2,450.00', time: '2m ago', group: 'Today', read: false },
  { id: 'n2', kind: 'team', title: 'New signup', description: 'Marcus Webb joined your workspace from nova.dev', time: '18m ago', group: 'Today', read: false },
  { id: 'n3', kind: 'workflow', title: 'Template installed', description: 'Elena Rossi set up “Invoice capture to NetSuite” for Finance', time: '42m ago', group: 'Today', read: false },
  { id: 'n4', kind: 'system', title: 'Alert threshold', description: 'API usage reached 80% of the 500k monthly quota', time: '1h ago', group: 'Today', read: true },
  { id: 'n5', kind: 'report', title: 'Report ready', description: 'Q2 Revenue Summary is available for download', time: '3h ago', group: 'Today', read: true },
  { id: 'n6', kind: 'payment', title: 'Payment failed', description: 'Card ending 4444 was declined for invoice INV-2012', time: 'Yesterday, 16:40', group: 'Yesterday', read: false },
  { id: 'n7', kind: 'workflow', title: 'Workflow paused', description: '“Refund approvals with guardrails” hit 3 errors in a row', time: 'Yesterday, 11:02', group: 'Yesterday', read: true },
  { id: 'n8', kind: 'team', title: 'Role changed', description: 'Aisha Patel is now an Admin of the Acme workspace', time: 'Jul 10', group: 'Earlier', read: true },
  { id: 'n9', kind: 'system', title: 'SSL certificate renewed', description: 'acme.io certificate renewed automatically for 12 months', time: 'Jul 9', group: 'Earlier', read: true },
];
