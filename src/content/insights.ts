// Demo content for the Analytics, Traffic and Activity screens.
// Lifted from shacdn/src/screens/Dashboard/dashboardData.ts and regrouped for the Acme layout.
import { Activity, Gauge, Network, TriangleAlert, type LucideIcon } from 'lucide-react';

import { type TimeRange, type Tone } from '../data';

// ── Analytics ────────────────────────────────────────────────────────────
export type Point = { label: string; value: number };

export const CONVERSION: Record<TimeRange, Point[]> = {
  '24h': [
    { label: '00h', value: 18 },
    { label: '04h', value: 12 },
    { label: '08h', value: 44 },
    { label: '12h', value: 69 },
    { label: '16h', value: 61 },
    { label: '20h', value: 37 },
  ],
  '7d': [
    { label: 'Mon', value: 42 },
    { label: 'Tue', value: 58 },
    { label: 'Wed', value: 51 },
    { label: 'Thu', value: 67 },
    { label: 'Fri', value: 73 },
    { label: 'Sat', value: 38 },
    { label: 'Sun', value: 29 },
  ],
  '30d': [
    { label: 'Wk 1', value: 48 },
    { label: 'Wk 2', value: 55 },
    { label: 'Wk 3', value: 62 },
    { label: 'Wk 4', value: 57 },
  ],
};

export type EngagementMetric = { label: string; value: string; change: string; trend: 'up' | 'down' };

export const ENGAGEMENT: Record<TimeRange, EngagementMetric[]> = {
  '24h': [
    { label: 'Sessions', value: '2,714', change: '+3.1%', trend: 'up' },
    { label: 'Pages / session', value: '4.0', change: '-0.1', trend: 'down' },
    { label: 'Returning users', value: '58%', change: '+0.6%', trend: 'up' },
    { label: 'Avg. session', value: '3m 28s', change: '+4s', trend: 'up' },
  ],
  '7d': [
    { label: 'Sessions', value: '18,420', change: '+6.3%', trend: 'up' },
    { label: 'Pages / session', value: '4.2', change: '+0.4', trend: 'up' },
    { label: 'Returning users', value: '61%', change: '+2.1%', trend: 'up' },
    { label: 'Avg. session', value: '3m 42s', change: '+12s', trend: 'up' },
  ],
  '30d': [
    { label: 'Sessions', value: '76,905', change: '+9.8%', trend: 'up' },
    { label: 'Pages / session', value: '4.1', change: '+0.2', trend: 'up' },
    { label: 'Returning users', value: '63%', change: '+3.4%', trend: 'up' },
    { label: 'Avg. session', value: '3m 51s', change: '+19s', trend: 'up' },
  ],
};

export const TRAFFIC_QUALITY: Point[] = [
  { label: 'Page views', value: 82 },
  { label: 'Session duration', value: 64 },
  { label: 'Bounce rate', value: 28 },
];

export const FUNNEL: Point[] = [
  { label: 'Store visits', value: 100 },
  { label: 'Product views', value: 72 },
  { label: 'Add to cart', value: 38 },
  { label: 'Checkout started', value: 22 },
  { label: 'Completed purchase', value: 12 },
];

// ── Traffic ──────────────────────────────────────────────────────────────
export type TrafficHealth = 'healthy' | 'degraded' | 'incident';

export const HEALTH_META: Record<TrafficHealth, { label: string; tone: Tone }> = {
  healthy: { label: 'Healthy', tone: 'mint' },
  degraded: { label: 'Degraded', tone: 'lemon' },
  incident: { label: 'Incident', tone: 'rose' },
};

export type TrafficMetric = {
  title: string;
  value: string;
  change: string;
  /** Whether the change is good news (a latency drop is, an error-rate rise is not). */
  good: boolean;
  icon: LucideIcon;
  target: string;
};

export const TRAFFIC_METRICS: TrafficMetric[] = [
  { title: 'Total requests', value: '4.82M', change: '+14.2%', good: true, icon: Activity, target: 'Peak 18.4k req/s at 14:32 UTC' },
  { title: 'Throughput', value: '12.4 Gbps', change: '+6.8%', good: true, icon: Network, target: '84% of the 15 Gbps ceiling' },
  { title: 'P95 latency', value: '142 ms', change: '-8 ms', good: true, icon: Gauge, target: 'SLA target under 200 ms' },
  { title: 'Error rate', value: '0.18%', change: '+0.03%', good: false, icon: TriangleAlert, target: 'Budget 0.25% per month' },
];

export type FlowNodeId = 'users' | 'edge' | 'lb' | 'services' | 'cache' | 'database';

export type TrafficFlowNode = {
  id: FlowNodeId;
  label: string;
  subtitle: string;
  throughput: string;
  latency: string;
  status: TrafficHealth;
};

export const TRAFFIC_FLOW_NODES: TrafficFlowNode[] = [
  { id: 'users', label: 'Users & regions', subtitle: '4 active PoPs', throughput: '4.82M req', latency: '—', status: 'healthy' },
  { id: 'edge', label: 'Edge / CDN', subtitle: 'Two CDN providers', throughput: '4.71M req', latency: '18 ms', status: 'healthy' },
  { id: 'lb', label: 'Load balancer', subtitle: 'API gateway', throughput: '3.94M req', latency: '34 ms', status: 'healthy' },
  { id: 'services', label: 'App services', subtitle: '12 pods · us-east-1', throughput: '2.18M req', latency: '56 ms', status: 'healthy' },
  { id: 'cache', label: 'Cache', subtitle: 'Session + object', throughput: '1.42M hits', latency: '2 ms', status: 'healthy' },
  { id: 'database', label: 'Database', subtitle: 'Primary + 2 replicas', throughput: '284k queries', latency: '12 ms', status: 'degraded' },
];

export const REGION_OPTIONS = [
  { value: 'all', label: 'All regions' },
  { value: 'us-east', label: 'US East' },
  { value: 'eu-central', label: 'EU Central' },
  { value: 'us-west', label: 'US West' },
  { value: 'ap-south', label: 'AP South' },
  { value: 'sa-east', label: 'SA East' },
] as const;

export type TrafficRegion = { region: string; code: string; requests: string; share: number; latency: string; status: TrafficHealth };

export const TRAFFIC_REGIONS: TrafficRegion[] = [
  { region: 'US East', code: 'us-east', requests: '1.84M', share: 38, latency: '118 ms', status: 'healthy' },
  { region: 'EU Central', code: 'eu-central', requests: '1.21M', share: 25, latency: '134 ms', status: 'healthy' },
  { region: 'US West', code: 'us-west', requests: '980k', share: 20, latency: '126 ms', status: 'healthy' },
  { region: 'AP South', code: 'ap-south', requests: '620k', share: 13, latency: '198 ms', status: 'degraded' },
  { region: 'SA East', code: 'sa-east', requests: '196k', share: 4, latency: '212 ms', status: 'healthy' },
];

export type Protocol = 'HTTPS' | 'gRPC';
export type TrafficSource = { source: string; protocol: Protocol; requests: string; share: number; errorRate: string };

export const TRAFFIC_SOURCES: TrafficSource[] = [
  { source: 'Web app', protocol: 'HTTPS', requests: '2.41M', share: 50, errorRate: '0.12%' },
  { source: 'Mobile API', protocol: 'HTTPS', requests: '1.38M', share: 29, errorRate: '0.21%' },
  { source: 'Partner webhooks', protocol: 'HTTPS', requests: '620k', share: 13, errorRate: '0.08%' },
  { source: 'Internal jobs', protocol: 'gRPC', requests: '410k', share: 8, errorRate: '0.31%' },
];

export type TrafficEndpoint = { path: string; method: 'GET' | 'POST'; rps: string; p95: string; errors: string; status: TrafficHealth };

export const TRAFFIC_ENDPOINTS: TrafficEndpoint[] = [
  { path: '/api/v1/orders', method: 'GET', rps: '1,240', p95: '89 ms', errors: '0.04%', status: 'healthy' },
  { path: '/api/v1/checkout', method: 'POST', rps: '680', p95: '142 ms', errors: '0.18%', status: 'healthy' },
  { path: '/api/v1/search', method: 'GET', rps: '2,100', p95: '210 ms', errors: '0.42%', status: 'degraded' },
  { path: '/api/v1/auth/token', method: 'POST', rps: '420', p95: '64 ms', errors: '0.02%', status: 'healthy' },
  { path: '/health', method: 'GET', rps: '180', p95: '8 ms', errors: '0.00%', status: 'healthy' },
];

export type TrafficIncident = {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  region: string;
  started: string;
  status: 'active' | 'resolved';
};

export const SEVERITY_META: Record<TrafficIncident['severity'], { label: string; tone: Tone }> = {
  info: { label: 'Info', tone: 'sky' },
  warning: { label: 'Warning', tone: 'lemon' },
  critical: { label: 'Critical', tone: 'rose' },
};

export const TRAFFIC_INCIDENTS: TrafficIncident[] = [
  { id: 'inc-1', title: 'Elevated search latency in AP South', severity: 'warning', region: 'ap-south', started: 'Jul 12, 09:42 UTC', status: 'active' },
  { id: 'inc-2', title: 'Database replica lag above 2s', severity: 'warning', region: 'us-east', started: 'Jul 12, 08:15 UTC', status: 'active' },
  { id: 'inc-3', title: 'CDN cache purge completed', severity: 'info', region: 'global', started: 'Jul 11, 22:00 UTC', status: 'resolved' },
];

// ── Activity ─────────────────────────────────────────────────────────────
export type ActivityMessage = { id: string; author: string; initials: string; body: string; time: string; kind: 'system' | 'team' | 'you' };

export const ACTIVITY_MESSAGES: ActivityMessage[] = [
  { id: 'a1', author: 'System', initials: 'SY', body: 'Backup completed successfully.', time: '10:02 AM', kind: 'system' },
  { id: 'a2', author: 'You', initials: 'AM', body: 'Exported Q2 analytics report.', time: '10:15 AM', kind: 'you' },
  { id: 'a3', author: 'Alex Kim', initials: 'AK', body: 'New team member invited — review pending.', time: '10:28 AM', kind: 'team' },
  { id: 'a4', author: 'You', initials: 'AM', body: 'Updated billing threshold to $5,000.', time: '10:41 AM', kind: 'you' },
  { id: 'a5', author: 'System', initials: 'SY', body: 'SSL certificate renewed automatically.', time: '11:00 AM', kind: 'system' },
  { id: 'a6', author: 'Sarah Chen', initials: 'SC', body: 'Enterprise renewal signed — $24k ARR added.', time: '11:18 AM', kind: 'team' },
];

export const ACTIVITY_FAQ = [
  { q: 'How is activity logged?', a: 'System events, user actions and integrations are recorded in real time and kept for 90 days on Pro plans.' },
  { q: 'Can I mute notifications?', a: 'Yes. Configure per-channel alerts in Settings under Notifications.' },
  { q: 'What triggers alerts?', a: 'Threshold alerts fire when API usage, error rates or revenue anomalies exceed the limits configured in Settings.' },
];
