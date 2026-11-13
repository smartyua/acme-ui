// Workflow templates catalog — content follows the Axon “Templates” reference screen.

export type AppId =
  | 'gmail'
  | 'netsuite'
  | 'zendesk'
  | 'stripe'
  | 'hubspot'
  | 'salesforce'
  | 'slack'
  | 'sheets'
  | 'quickbooks'
  | 'shopify'
  | 'jira'
  | 'notion'
  | 'docusign'
  | 'ai';

// Integration chips are drawn as neutral monograms, not vendor marks.
export const APPS: Record<AppId, { name: string; mono: string; hue: string }> = {
  gmail: { name: 'Gmail', mono: 'Gm', hue: '#e5483b' },
  netsuite: { name: 'NetSuite', mono: 'NS', hue: '#2d4a8a' },
  zendesk: { name: 'Zendesk', mono: 'Zd', hue: '#1f6b5a' },
  stripe: { name: 'Stripe', mono: 'St', hue: '#6457e8' },
  hubspot: { name: 'HubSpot', mono: 'Hs', hue: '#f06b35' },
  salesforce: { name: 'Salesforce', mono: 'Sf', hue: '#1c96d8' },
  slack: { name: 'Slack', mono: 'Sl', hue: '#7b3f86' },
  sheets: { name: 'Google Sheets', mono: 'Gs', hue: '#1e9a55' },
  quickbooks: { name: 'QuickBooks', mono: 'Qb', hue: '#2c9f3c' },
  shopify: { name: 'Shopify', mono: 'Sh', hue: '#5e9a3a' },
  jira: { name: 'Jira', mono: 'Ji', hue: '#2b6fd6' },
  notion: { name: 'Notion', mono: 'No', hue: '#55555b' },
  docusign: { name: 'DocuSign', mono: 'Ds', hue: '#d29b1c' },
  ai: { name: 'AI step', mono: 'AI', hue: '#1f8af0' },
};

export type Category = 'Finance' | 'Sales' | 'Support' | 'Operations' | 'HR' | 'IT';

// Catalog totals as published (the grid below shows the most-used slice).
export const CATEGORY_TOTALS: Record<'All' | Category, number> = {
  All: 180,
  Finance: 46,
  Sales: 38,
  Support: 33,
  Operations: 29,
  HR: 18,
  IT: 16,
};

export type Template = {
  id: string;
  title: string;
  description: string;
  category: Category;
  apps: AppId[];
  teams: number;
  hoursPerWeek: number;
  addedDays: number; // days since published — drives the "Newest" sort
  ai?: boolean;
};

export const FEATURED: Template[] = [
  {
    id: 'invoice-capture',
    title: 'Invoice capture to NetSuite',
    description: 'Read PDFs from an inbox, match the PO and post the bill. Exceptions go to review.',
    category: 'Finance',
    apps: ['gmail', 'ai', 'netsuite'],
    teams: 2431,
    hoursPerWeek: 11,
    addedDays: 6,
    ai: true,
  },
  {
    id: 'refund-guardrails',
    title: 'Refund approvals with guardrails',
    description: 'Classify refund tickets, auto-approve under $200, escalate the rest with context.',
    category: 'Support',
    apps: ['zendesk', 'ai', 'stripe'],
    teams: 1208,
    hoursPerWeek: 7,
    addedDays: 4,
    ai: true,
  },
  {
    id: 'lead-scoring',
    title: 'Lead scoring & routing',
    description: 'Score new contacts on fit and intent, then route hot leads to the right rep.',
    category: 'Sales',
    apps: ['hubspot', 'ai', 'salesforce'],
    teams: 1876,
    hoursPerWeek: 9,
    addedDays: 2,
    ai: true,
  },
  {
    id: 'contract-intake',
    title: 'Contract intake & redlines',
    description: 'Pull clauses from signed PDFs, flag risky terms and file a summary in Notion.',
    category: 'Operations',
    apps: ['docusign', 'ai', 'notion'],
    teams: 744,
    hoursPerWeek: 6,
    addedDays: 5,
    ai: true,
  },
  {
    id: 'onboarding-it',
    title: 'New hire IT provisioning',
    description: 'Open Jira tasks for laptops and accounts the moment HR marks an offer as signed.',
    category: 'HR',
    apps: ['notion', 'ai', 'jira'],
    teams: 655,
    hoursPerWeek: 5,
    addedDays: 3,
    ai: true,
  },
  {
    id: 'dunning',
    title: 'Smart dunning sequences',
    description: 'Draft tailored reminders for failed payments and stop as soon as the card is updated.',
    category: 'Finance',
    apps: ['stripe', 'ai', 'gmail'],
    teams: 1032,
    hoursPerWeek: 4,
    addedDays: 1,
    ai: true,
  },
];

export const TEMPLATES: Template[] = [
  { id: 'expense-audit', title: 'Expense report audit', description: 'Flag out-of-policy expenses from Slack submissions and log them to a sheet.', category: 'Finance', apps: ['slack', 'sheets'], teams: 940, hoursPerWeek: 4, addedDays: 40 },
  { id: 'vendor-onboarding', title: 'Vendor onboarding', description: 'Collect W-9s, verify bank details and create the vendor record.', category: 'Finance', apps: ['sheets', 'netsuite', 'gmail'], teams: 612, hoursPerWeek: 6, addedDays: 22 },
  { id: 'churn-digest', title: 'Churn risk digest', description: 'Every Monday, summarise at-risk accounts with usage drops and open tickets.', category: 'Sales', apps: ['salesforce', 'slack'], teams: 1100, hoursPerWeek: 3, addedDays: 18 },
  { id: 'renewal-reminders', title: 'Contract renewal reminders', description: 'Remind owners 60/30/7 days before renewal with a drafted email.', category: 'Sales', apps: ['salesforce', 'gmail'], teams: 870, hoursPerWeek: 2, addedDays: 33 },
  { id: 'ticket-triage', title: 'Support ticket triage', description: 'Tag, prioritise and route tickets; urgent ones ping on-call in Slack.', category: 'Support', apps: ['zendesk', 'slack'], teams: 2200, hoursPerWeek: 9, addedDays: 61 },
  { id: 'payroll-recon', title: 'Payroll reconciliation', description: 'Match payroll runs against bank feeds and highlight mismatches.', category: 'Finance', apps: ['quickbooks', 'sheets'], teams: 410, hoursPerWeek: 5, addedDays: 12 },
  { id: 'shopify-refunds', title: 'Shopify refund sync', description: 'Mirror Shopify refunds into Stripe and notify finance on large ones.', category: 'Operations', apps: ['shopify', 'stripe'], teams: 730, hoursPerWeek: 3, addedDays: 9 },
  { id: 'bug-intake', title: 'Bug intake from support', description: 'Turn escalated tickets into Jira bugs with logs and customer impact.', category: 'IT', apps: ['jira', 'slack'], teams: 980, hoursPerWeek: 4, addedDays: 27 },
  { id: 'deal-desk', title: 'Deal desk approvals', description: 'Route discounts above 20% to finance and post the decision back to the deal.', category: 'Sales', apps: ['salesforce', 'slack'], teams: 530, hoursPerWeek: 3, addedDays: 7 },
  { id: 'csat-followup', title: 'CSAT follow-up', description: 'Email customers who rated support 1–2 and open a callback task for the lead.', category: 'Support', apps: ['zendesk', 'gmail'], teams: 690, hoursPerWeek: 2, addedDays: 15 },
  { id: 'pto-sync', title: 'PTO calendar sync', description: 'Approve time-off requests in Slack and keep the team calendar in Notion current.', category: 'HR', apps: ['slack', 'notion'], teams: 820, hoursPerWeek: 2, addedDays: 44 },
  { id: 'offboarding', title: 'Employee offboarding', description: 'Revoke app access, reassign tickets and archive files on the last working day.', category: 'IT', apps: ['jira', 'slack'], teams: 470, hoursPerWeek: 3, addedDays: 11 },
  { id: 'inventory-alerts', title: 'Low inventory alerts', description: 'Watch stock levels and post reorder suggestions with supplier lead times.', category: 'Operations', apps: ['shopify', 'slack'], teams: 560, hoursPerWeek: 2, addedDays: 20 },
  { id: 'candidate-screen', title: 'Candidate screening notes', description: 'Summarise interview feedback into one scorecard and share it with the panel.', category: 'HR', apps: ['notion', 'slack'], teams: 380, hoursPerWeek: 4, addedDays: 5 },
  { id: 'month-end-close', title: 'Month-end close checklist', description: 'Open close tasks, chase owners in Slack and track sign-off in a shared sheet.', category: 'Finance', apps: ['sheets', 'slack'], teams: 650, hoursPerWeek: 5, addedDays: 30 },
  { id: 'sla-breach', title: 'SLA breach escalation', description: 'Escalate tickets 30 minutes before SLA breach and page the duty manager.', category: 'Support', apps: ['zendesk', 'slack'], teams: 1300, hoursPerWeek: 3, addedDays: 50 },
];

export const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n));
