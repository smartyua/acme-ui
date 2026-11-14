// Demo content for the Audit log and Requests screens.
// Lifted from shacdn/src/screens/Dashboard/accountData.ts; shadcn badge variants became Acme tones.
import { type BadgeTone } from '../components/ui';
import { type Tone } from '../data';

// ── Audit log ────────────────────────────────────────────────────────────
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'export' | 'invite';

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  initials: string;
  action: AuditAction;
  target: string;
  ip: string;
  detail: string;
};

export const AUDIT_ACTION_META: Record<AuditAction, { label: string; tone: BadgeTone }> = {
  create: { label: 'Create', tone: 'mint' },
  update: { label: 'Update', tone: 'sky' },
  delete: { label: 'Delete', tone: 'rose' },
  login: { label: 'Login', tone: 'neutral' },
  export: { label: 'Export', tone: 'lavender' },
  invite: { label: 'Invite', tone: 'peach' },
};

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'AUD-901', at: 'Jul 12, 2026 · 09:42', actor: 'Alex Morgan', initials: 'AM', action: 'update', target: 'Workspace settings', ip: '89.12.44.10', detail: 'Changed billing email' },
  { id: 'AUD-900', at: 'Jul 12, 2026 · 08:05', actor: 'Alex Morgan', initials: 'AM', action: 'export', target: 'Orders CSV', ip: '89.12.44.10', detail: 'Exported 128 rows' },
  { id: 'AUD-899', at: 'Jul 11, 2026 · 19:21', actor: 'Sarah Chen', initials: 'SC', action: 'invite', target: 'marcus@nova.dev', ip: '54.1.22.9', detail: 'Invited as Editor' },
  { id: 'AUD-898', at: 'Jul 11, 2026 · 16:03', actor: 'System', initials: 'SY', action: 'create', target: 'Invoice INV-2048', ip: '—', detail: 'Auto-generated renewal' },
  { id: 'AUD-897', at: 'Jul 10, 2026 · 09:48', actor: 'Alex Morgan', initials: 'AM', action: 'login', target: 'Dashboard', ip: '89.12.44.10', detail: 'Single sign-on' },
  { id: 'AUD-896', at: 'Jul 9, 2026 · 22:10', actor: 'Elena Rossi', initials: 'ER', action: 'delete', target: 'Report draft #44', ip: '91.200.1.4', detail: 'Removed unused draft' },
  { id: 'AUD-895', at: 'Jul 9, 2026 · 14:33', actor: 'Alex Morgan', initials: 'AM', action: 'update', target: 'API token', ip: '89.12.44.10', detail: 'Rotated production key' },
  { id: 'AUD-894', at: 'Jul 8, 2026 · 08:01', actor: 'Marcus Webb', initials: 'MW', action: 'create', target: 'Request REQ-312', ip: '18.44.2.11', detail: 'Submitted refund request' },
];

// ── Requests ─────────────────────────────────────────────────────────────
export type RequestStatus = 'open' | 'in_review' | 'approved' | 'rejected' | 'done';
export type RequestType = 'access' | 'refund' | 'limit' | 'feature' | 'support';
export type RequestPriority = 'low' | 'medium' | 'high';

export type UserRequest = {
  id: string;
  title: string;
  type: RequestType;
  status: RequestStatus;
  priority: RequestPriority;
  submittedAt: string;
  updatedAt: string;
  requester: string;
  assignee: string;
  summary: string;
};

// DESIGN.md §2.3: pending → lemon, info → sky, success → mint, failed → rose, neutral → muted.
export const REQUEST_STATUS_META: Record<RequestStatus, { label: string; tone: Tone | 'muted' }> = {
  open: { label: 'Open', tone: 'lemon' },
  in_review: { label: 'In review', tone: 'sky' },
  approved: { label: 'Approved', tone: 'mint' },
  rejected: { label: 'Rejected', tone: 'rose' },
  done: { label: 'Done', tone: 'muted' },
};

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  access: 'Access',
  refund: 'Refund',
  limit: 'Limit',
  feature: 'Feature',
  support: 'Support',
};

export const PRIORITY_LABEL: Record<RequestPriority, string> = { low: 'Low', medium: 'Medium', high: 'High' };

export const USER_REQUESTS: UserRequest[] = [
  {
    id: 'REQ-318',
    title: 'Increase export limit to 50k rows',
    type: 'limit',
    status: 'in_review',
    priority: 'high',
    submittedAt: 'Jul 12, 2026',
    updatedAt: '2h ago',
    requester: 'Alex Morgan',
    assignee: 'Support',
    summary: 'Need larger CSV exports for quarterly finance reconciliation.',
  },
  {
    id: 'REQ-312',
    title: 'Refund failed charge INV-2012',
    type: 'refund',
    status: 'open',
    priority: 'medium',
    submittedAt: 'Jul 8, 2026',
    updatedAt: 'Yesterday',
    requester: 'Marcus Webb',
    assignee: 'Billing',
    summary: 'Card declined but the seat was still provisioned for 3 days.',
  },
  {
    id: 'REQ-301',
    title: 'SSO for contractors domain',
    type: 'access',
    status: 'approved',
    priority: 'medium',
    submittedAt: 'Jul 2, 2026',
    updatedAt: 'Jul 4, 2026',
    requester: 'Sarah Chen',
    assignee: 'Security',
    summary: 'Allow @contractors.acme.io through the identity provider.',
  },
  {
    id: 'REQ-288',
    title: 'Dark mode for reports PDF',
    type: 'feature',
    status: 'done',
    priority: 'low',
    submittedAt: 'Jun 22, 2026',
    updatedAt: 'Jul 2, 2026',
    requester: 'Elena Rossi',
    assignee: 'Product',
    summary: 'Optional dark theme when exporting brand kits.',
  },
  {
    id: 'REQ-275',
    title: 'Cannot access Topology page',
    type: 'support',
    status: 'rejected',
    priority: 'high',
    submittedAt: 'Jun 12, 2026',
    updatedAt: 'Jun 13, 2026',
    requester: 'James Park',
    assignee: 'Support',
    summary: 'Free plan does not include topology — an upgrade is required.',
  },
];
