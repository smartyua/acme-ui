import { type Tone } from '../../data';

export type GuideArticle = {
  id: string;
  title: string;
  category: string;
  readTime: string;
  views?: string;
  tone?: Tone;
  summary: string;
  steps: string[];
};

export type GuideCategory = {
  id: string;
  title: string;
  subtitle: string;
  totalGuides: number;
  tone: Tone;
  guides: GuideArticle[];
};

export const POPULAR_TOPICS = [
  { id: 'funds', label: 'Add funds', query: 'funds' },
  { id: 'payouts', label: 'Payouts', query: 'payout' },
  { id: 'contacts', label: 'Import contacts', query: 'import' },
  { id: 'dns', label: 'DNS setup', query: 'domain' },
  { id: 'refunds', label: 'Refunds', query: 'refund' },
];

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    subtitle: '14 guides · set up in an afternoon',
    totalGuides: 14,
    tone: 'peach',
    guides: [
      {
        id: 'g-1',
        title: 'Set up your Harbor & Co. workspace',
        category: 'Getting started',
        readTime: '4 min read',
        summary:
          'Configure your workspace branding, default currency, payout bank account and tax nexus in four steps.',
        steps: [
          'Verify your legal business name and EIN under Workspace settings → Entity.',
          'Connect a primary checking account via instant bank verification.',
          'Set default invoice reply-to address and timezone.',
        ],
      },
      {
        id: 'g-2',
        title: 'Import contacts from Shopify',
        category: 'Getting started',
        readTime: '3 min read',
        summary:
          'Sync historical customers, tags and order history directly from your Shopify storefront.',
        steps: [
          'Open Integrations → Shopify and authorize read_customers and read_orders.',
          'Map customer consent states to your active marketing segments.',
          'Run the initial backfill and verify contact counts.',
        ],
      },
      {
        id: 'g-3',
        title: 'Verify your sending domain (DNS)',
        category: 'Getting started',
        readTime: '6 min read',
        summary:
          'Add DKIM, SPF and DMARC records so transactional and campaign emails land in the primary inbox.',
        steps: [
          'Copy the two CNAME records and one TXT record generated for your domain.',
          'Paste them into Cloudflare, Route53 or your DNS registrar with default TTL.',
          'Click Verify DNS records — propagation typically finishes within 5 minutes.',
        ],
      },
      {
        id: 'g-4',
        title: 'Invite your team and set roles',
        category: 'Getting started',
        readTime: '2 min read',
        summary:
          'Grant role-based permissions for Finance, Support, Marketing and Read-only auditors.',
        steps: [
          'Navigate to Workspace settings → Members and click Invite member.',
          'Choose Admin, Finance manager, Support agent or Analyst.',
          'Require passkey or authenticator 2FA for roles with payout access.',
        ],
      },
    ],
  },
  {
    id: 'payments-payouts',
    title: 'Payments & payouts',
    subtitle: '18 guides · money in, money out',
    totalGuides: 18,
    tone: 'lavender',
    guides: [
      {
        id: 'g-5',
        title: 'How payouts work',
        category: 'Payments & payouts',
        readTime: '4 min read',
        summary:
          'Understand rolling T+2 settlement windows, instant payout cutoff times and bank holiday schedules.',
        steps: [
          'Standard ACH payouts initiate daily at 17:00 UTC and settle in 1–2 business days.',
          'Instant payouts settle to eligible debit cards and FedNow accounts within 30 minutes.',
          'Reconcile batch fees automatically using the monthly payout CSV export.',
        ],
      },
      {
        id: 'g-6',
        title: 'Add funds to your Loopo balance',
        category: 'Payments & payouts',
        readTime: '2 min read',
        summary:
          'Top up your operating reserve to cover refunds, dispute holds or scheduled vendor payouts.',
        steps: [
          'Open Finance → Reserve balance and select Add funds.',
          'Choose linked ACH debit (free) or wire transfer for same-day credit.',
          'Set an optional low-balance threshold alert.',
        ],
      },
      {
        id: 'g-7',
        title: 'Issue a full or partial refund',
        category: 'Payments & payouts',
        readTime: '3 min read',
        summary:
          'Return funds to a customer card or bank account while keeping line-item tax accounting accurate.',
        steps: [
          'Locate the charge in Orders or Payments and open the detail drawer.',
          'Select Refund charge and enter either the full amount or a partial line-item amount.',
          'Choose a reason code and send an automatic refund receipt.',
        ],
      },
      {
        id: 'g-8',
        title: 'Take in-store payments with Square POS',
        category: 'Payments & payouts',
        readTime: '5 min read',
        summary:
          'Unify terminal card-present transactions with your online subscriber and order ledger.',
        steps: [
          'Pair your Square terminal location under Integrations → Point of sale.',
          'Enable automatic receipt matching by customer email or phone number.',
          'Verify daily settlement batch grouping in Reports.',
        ],
      },
    ],
  },
  {
    id: 'email-automations',
    title: 'Email & automations',
    subtitle: '22 guides · campaigns, flows, forms',
    totalGuides: 22,
    tone: 'mint',
    guides: [
      {
        id: 'g-9',
        title: 'Build an abandoned cart flow',
        category: 'Email & automations',
        readTime: '6 min read',
        summary:
          'Recover high-intent checkouts with a timed 3-step sequence and dynamic cart line items.',
        steps: [
          'Start from the Abandoned Checkout template in Templates.',
          'Set the first reminder delay to 2 hours and exclude customers who completed purchase.',
          'Enable smart quiet hours so messages never send between 21:00 and 08:00 local time.',
        ],
      },
      {
        id: 'g-10',
        title: 'Write subject lines that get opened',
        category: 'Email & automations',
        readTime: '4 min read',
        summary:
          'Benchmarks from 40M workspace sends on length, preview text and A/B testing.',
        steps: [
          'Keep subject lines under 44 characters so mobile clients do not truncate the hook.',
          'Pair every subject with explicit preheader text that adds concrete value.',
          'Run a 15% split test for 2 hours before sending to the remaining audience.',
        ],
      },
      {
        id: 'g-11',
        title: 'Schedule campaigns by time zone',
        category: 'Email & automations',
        readTime: '3 min read',
        summary:
          'Deliver announcements at 10:00 AM in each subscriber’s local region automatically.',
        steps: [
          'Select Recipient local time on the campaign review step.',
          'Choose a fallback timezone for contacts without geolocation metadata.',
          'Monitor regional rollout waves in real time from Campaign analytics.',
        ],
      },
      {
        id: 'g-12',
        title: 'Grow your list with signup forms',
        category: 'Email & automations',
        readTime: '5 min read',
        summary:
          'Embed high-converting inline or slide-in forms with double opt-in and welcome tags.',
        steps: [
          'Choose an inline or modal layout and match tokens to your storefront theme.',
          'Tag new signups by source page and trigger an immediate welcome email.',
          'Enable bot protection without adding friction for real visitors.',
        ],
      },
    ],
  },
];

export const POPULAR_ARTICLES: GuideArticle[] = [
  {
    id: 'pop-1',
    title: 'Why is my instant payout delayed?',
    category: 'Payments & payouts',
    readTime: '2 min read',
    views: '3.1k',
    tone: 'sky',
    summary:
      'Instant payouts occasionally queue for 30–45 minutes during partner bank maintenance windows or velocity checks.',
    steps: [
      'Check the System status panel on the right for active Instant payout advisories.',
      'Confirm your receiving debit card supports Visa Fast Funds or Mastercard Send.',
      'If a payout remains pending past 2 hours, it automatically falls back to same-day ACH.',
    ],
  },
  {
    id: 'pop-2',
    title: 'Connect Stripe to Loopo',
    category: 'Integrations',
    readTime: '3 min read',
    views: '2.4k',
    tone: 'lavender',
    summary:
      'Link your existing Stripe account in one click to sync subscriptions, invoices, disputes and payouts.',
    steps: [
      'Open Integrations and click Connect next to Stripe.',
      'Approve read/write webhook permissions for charge, invoice and payout events.',
      'Historical 90-day transactions import within 60 seconds.',
    ],
  },
  {
    id: 'pop-3',
    title: 'Import contacts from a CSV',
    category: 'Audience',
    readTime: '5 min read',
    views: '1.9k',
    tone: 'peach',
    summary:
      'Upload subscriber spreadsheets with custom attributes, consent timestamps and automatic deduplication.',
    steps: [
      'Format headers as email, first_name, last_name, phone and subscribed_at (UTF-8 CSV).',
      'Preview column mappings and choose whether to update existing profiles.',
      'Review the post-import summary for malformed addresses or duplicates.',
    ],
  },
  {
    id: 'pop-4',
    title: 'Set up your sending domain (DNS)',
    category: 'Email & automations',
    readTime: '6 min read',
    views: '1.6k',
    tone: 'mint',
    summary:
      'Authenticate your custom domain with DKIM and SPF records for 99.4% inbox placement.',
    steps: [
      'Add the three DNS records shown in Settings → Sending domains.',
      'Wait for green verification checks across all three records.',
      'Send a live test email to verify alignment headers.',
    ],
  },
  {
    id: 'pop-5',
    title: 'Refund an order or a subscription',
    category: 'Payments & payouts',
    readTime: '3 min read',
    views: '1.2k',
    tone: 'sky',
    summary:
      'Issue prorated subscription credits or full order refunds with automated customer receipts.',
    steps: [
      'Select the payment row in Orders or Payments.',
      'Choose Full refund or Prorated credit and confirm.',
      'Customer receives an itemized PDF credit memo immediately.',
    ],
  },
];

export type SystemService = {
  id: string;
  name: string;
  status: 'operational' | 'delayed';
  statusLabel: string;
  bars: Array<'up' | 'warn'>;
};

const ALL_UP: Array<'up' | 'warn'> = Array.from({ length: 28 }, () => 'up');
const DELAYED_BARS: Array<'up' | 'warn'> = [
  ...Array.from({ length: 25 }, () => 'up' as const),
  'warn',
  'warn',
  'up',
];

export const SYSTEM_SERVICES: SystemService[] = [
  {
    id: 'srv-1',
    name: 'Payments API',
    status: 'operational',
    statusLabel: 'Operational',
    bars: ALL_UP,
  },
  {
    id: 'srv-2',
    name: 'Email sending',
    status: 'operational',
    statusLabel: 'Operational',
    bars: ALL_UP,
  },
  {
    id: 'srv-3',
    name: 'Dashboard & reports',
    status: 'operational',
    statusLabel: 'Operational',
    bars: ALL_UP,
  },
  {
    id: 'srv-4',
    name: 'Instant payouts',
    status: 'delayed',
    statusLabel: 'Delayed ~40 min',
    bars: DELAYED_BARS,
  },
];
