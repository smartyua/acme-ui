// Content adapted from shacdn (dashboardData.ts, accountData.ts, Finance/financeData.ts, ReportsPage.tsx).

// ── Customers ────────────────────────────────────────────────────────────
export type Plan = 'free' | 'pro' | 'enterprise';
export type CustomerStatus = 'active' | 'invited' | 'churned';

export type Customer = {
  id: string;
  name: string;
  initials: string;
  email: string;
  company: string;
  plan: Plan;
  mrr: number;
  lastActive: string;
  status: CustomerStatus;
};

export const CUSTOMERS: Customer[] = [
  { id: 'CU-101', name: 'Sarah Chen', initials: 'SC', email: 'sarah@acme.io', company: 'Acme', plan: 'enterprise', mrr: 890, lastActive: '2 hours ago', status: 'active' },
  { id: 'CU-102', name: 'Marcus Webb', initials: 'MW', email: 'marcus@nova.dev', company: 'Nova', plan: 'pro', mrr: 49, lastActive: 'Today', status: 'active' },
  { id: 'CU-103', name: 'Elena Rossi', initials: 'ER', email: 'elena@studio.it', company: 'Studio IT', plan: 'pro', mrr: 49, lastActive: 'Yesterday', status: 'active' },
  { id: 'CU-104', name: 'James Park', initials: 'JP', email: 'james@labs.co', company: 'Labs Co', plan: 'free', mrr: 0, lastActive: '3 days ago', status: 'active' },
  { id: 'CU-105', name: 'Aisha Patel', initials: 'AP', email: 'aisha@flow.app', company: 'Flow', plan: 'enterprise', mrr: 1200, lastActive: '1 hour ago', status: 'active' },
  { id: 'CU-106', name: 'Tom Becker', initials: 'TB', email: 'tom@stack.dev', company: 'Stack', plan: 'pro', mrr: 49, lastActive: 'Jul 8', status: 'invited' },
  { id: 'CU-107', name: 'Nina Ortiz', initials: 'NO', email: 'nina@craft.co', company: 'Craft', plan: 'pro', mrr: 49, lastActive: 'Jul 5', status: 'churned' },
  { id: 'CU-108', name: 'Leo Fischer', initials: 'LF', email: 'leo@berlin.de', company: 'Berlin GmbH', plan: 'pro', mrr: 99, lastActive: 'Today', status: 'active' },
];

export const PLAN_LABEL: Record<Plan, string> = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' };

// ── Billing ──────────────────────────────────────────────────────────────
export type InvoiceStatus = 'paid' | 'open' | 'failed' | 'refunded';

export type Invoice = { id: string; date: string; description: string; amount: string; status: InvoiceStatus; method: string };

export const INVOICES: Invoice[] = [
  { id: 'INV-2048', date: 'Jul 1, 2026', description: 'Pro plan · July', amount: '$49.00', status: 'paid', method: 'Visa ···· 4242' },
  { id: 'INV-2041', date: 'Jun 1, 2026', description: 'Pro plan · June', amount: '$49.00', status: 'paid', method: 'Visa ···· 4242' },
  { id: 'INV-2033', date: 'May 1, 2026', description: 'Pro plan · May', amount: '$49.00', status: 'paid', method: 'Visa ···· 4242' },
  { id: 'INV-2028', date: 'Apr 18, 2026', description: 'Seat add-on ×2', amount: '$18.00', status: 'paid', method: 'Visa ···· 4242' },
  { id: 'INV-2019', date: 'Apr 1, 2026', description: 'Pro plan · April', amount: '$49.00', status: 'refunded', method: 'Visa ···· 4242' },
  { id: 'INV-2012', date: 'Mar 1, 2026', description: 'Pro plan · March', amount: '$49.00', status: 'failed', method: 'Mastercard ···· 4444' },
  { id: 'INV-2005', date: 'Feb 1, 2026', description: 'Pro plan · February', amount: '$49.00', status: 'open', method: 'Visa ···· 4242' },
];

export type PaymentMethod = { id: string; brand: string; last4: string; exp: string; isDefault: boolean };

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_1', brand: 'Visa', last4: '4242', exp: '08/28', isDefault: true },
  { id: 'pm_2', brand: 'Mastercard', last4: '4444', exp: '01/27', isDefault: false },
];

export type PlanOption = { id: 'starter' | 'pro' | 'business'; name: string; price: number; seats: number; perks: string[] };

export const PLANS: PlanOption[] = [
  { id: 'starter', name: 'Starter', price: 19, seats: 3, perks: ['3 seats', '1k workflow runs', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 49, seats: 10, perks: ['10 seats', '25k workflow runs', 'AI steps', 'Priority support'] },
  { id: 'business', name: 'Business', price: 129, seats: 50, perks: ['50 seats', 'Unlimited runs', 'SSO & audit log', 'Dedicated CSM'] },
];

export const INVOICE_TONE: Record<InvoiceStatus, 'mint' | 'lemon' | 'rose' | 'muted'> = {
  paid: 'mint',
  open: 'lemon',
  failed: 'rose',
  refunded: 'muted',
};

// ── Finance ──────────────────────────────────────────────────────────────
export type FinanceKpi = { id: string; label: string; value: string; change: string; up: boolean; hint: string; spark: number[] };

export const FINANCE_KPIS: FinanceKpi[] = [
  { id: 'balance', label: 'Balance', value: '$125,430', change: '+12.5%', up: true, hint: 'vs last month', spark: [42, 48, 45, 52, 49, 61, 58, 64, 70, 68, 76, 82] },
  { id: 'profit', label: 'Net profit', value: '$38,700', change: '+8.5%', up: true, hint: 'vs last month', spark: [20, 22, 25, 24, 28, 27, 31, 30, 33, 35, 36, 38] },
  { id: 'expenses', label: 'Expenses', value: '$26,450', change: '+5.5%', up: false, hint: 'vs last month', spark: [18, 19, 21, 20, 23, 22, 24, 25, 24, 26, 25, 26] },
  { id: 'invoices', label: 'Pending invoices', value: '$3,200', change: '3 overdue', up: false, hint: 'needs follow-up', spark: [6, 5, 7, 6, 5, 4, 5, 4, 3, 4, 3, 3] },
];

export const INCOME_SOURCES = [
  { label: 'Subscriptions', value: 35000, tone: 'lavender' as const },
  { label: 'Services', value: 28000, tone: 'sky' as const },
  { label: 'Marketplace', value: 18000, tone: 'mint' as const },
  { label: 'Other', value: 11000, tone: 'peach' as const },
];

export const EXPENSE_MONTHS = [
  { label: 'Jan', payroll: 4200, tools: 1600 },
  { label: 'Feb', payroll: 3800, tools: 2100 },
  { label: 'Mar', payroll: 5100, tools: 1800 },
  { label: 'Apr', payroll: 4600, tools: 2400 },
  { label: 'May', payroll: 3900, tools: 1700 },
  { label: 'Jun', payroll: 5400, tools: 2200 },
];

export type FinanceTx = { id: string; name: string; initials: string; date: string; type: 'Income' | 'Expense'; amount: number };

export const FINANCE_TX: FinanceTx[] = [
  { id: 'ft1', name: 'Aisha Patel', initials: 'AP', date: 'Sep 18', type: 'Income', amount: 5670.25 },
  { id: 'ft2', name: 'Cloud hosting', initials: 'CH', date: 'Sep 17', type: 'Expense', amount: 1240 },
  { id: 'ft3', name: 'Sarah Chen', initials: 'SC', date: 'Sep 16', type: 'Income', amount: 2450 },
  { id: 'ft4', name: 'Office lease', initials: 'OL', date: 'Sep 15', type: 'Expense', amount: 3800 },
  { id: 'ft5', name: 'Nina Ortiz', initials: 'NO', date: 'Sep 14', type: 'Income', amount: 2100 },
  { id: 'ft6', name: 'Design tools', initials: 'DT', date: 'Sep 12', type: 'Expense', amount: 320 },
];

// ── Reports ──────────────────────────────────────────────────────────────
export type ReportStatus = 'Ready' | 'Queued' | 'Generating';
export type Report = { id: string; name: string; status: ReportStatus; date: string; format: 'CSV' | 'PDF' | 'XLSX'; size: string };

export const REPORTS: Report[] = [
  { id: 'r1', name: 'Q2 Revenue Summary', status: 'Ready', date: 'Jul 13, 2026', format: 'PDF', size: '1.2 MB' },
  { id: 'r2', name: 'June Transaction Export', status: 'Ready', date: 'Jul 1, 2026', format: 'CSV', size: '340 KB' },
  { id: 'r3', name: 'Weekly Conversion Digest', status: 'Queued', date: 'Jul 13, 2026', format: 'PDF', size: '—' },
];

export type Schedule = { id: string; name: string; cadence: string; recipients: string; enabled: boolean };

export const SCHEDULES: Schedule[] = [
  { id: 's1', name: 'Weekly revenue digest', cadence: 'Mondays · 09:00', recipients: 'finance@acme.io', enabled: true },
  { id: 's2', name: 'Monthly churn report', cadence: '1st of month · 08:00', recipients: 'growth@acme.io', enabled: true },
  { id: 's3', name: 'Daily failed payments', cadence: 'Every day · 18:00', recipients: 'billing@acme.io', enabled: false },
];

// ── Profile ──────────────────────────────────────────────────────────────
export const PROFILE_USER = {
  name: 'Alex Morgan',
  email: 'alex@acme.io',
  role: 'Workspace admin',
  initials: 'AM',
  title: 'Head of Product',
  timezone: 'Europe/Berlin',
  joined: 'Mar 12, 2024',
  phone: '+49 30 1234 5678',
};

export const SESSIONS = [
  { id: 'se1', device: 'MacBook Pro · Chrome', place: 'Berlin, DE', last: 'Active now', current: true, kind: 'laptop' as const },
  { id: 'se2', device: 'iPhone 16 · Safari', place: 'Berlin, DE', last: '2 hours ago', current: false, kind: 'phone' as const },
  { id: 'se3', device: 'Windows · Edge', place: 'Warsaw, PL', last: 'Jul 9', current: false, kind: 'desktop' as const },
];

// ── Help ─────────────────────────────────────────────────────────────────
export const FAQ = [
  { q: 'How do I install a workflow template?', a: 'Open Templates, pick a card and press “Use template”. Choose a name, confirm the connected apps and the workflow is created as a draft you can switch on.' },
  { q: 'Can I change the theme?', a: 'Yes — use the Dark mode switch at the bottom of the sidebar, or pick Light, Dark or System in Settings → Appearance.' },
  { q: 'Where do I download invoices?', a: 'Payments lists every invoice. Use the download button on a row, or filter by status first.' },
  { q: 'How are refunds handled?', a: 'Select orders on the Orders page and choose “Refund”. Completed orders move to Refunded and the customer is notified.' },
  { q: 'Who can see the audit trail?', a: 'Workspace admins. Profile → Security shows your own active sessions and lets you sign out other devices.' },
];
