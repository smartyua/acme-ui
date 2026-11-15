import {
  type Estimate,
  type EstimateDatePeriod,
  type EstimateItemStatus,
  type EstimateLineItem,
  type EstimateStatus,
} from '../../components/EstimateCard';

export type { Estimate, EstimateDatePeriod, EstimateItemStatus, EstimateLineItem, EstimateStatus };

export type EstimateTab = 'all' | 'draft' | 'pending' | 'paid';
export type DateRangeFilter = 'sep-oct' | 'aug-sep' | 'all';

export const ESTIMATE_CATEGORIES = [
  'Bathroom Remodel',
  'Tile Installation',
  'Tile Service',
  'Carpentry',
] as const;

export const ESTIMATE_DATE_RANGES: ReadonlyArray<{ value: DateRangeFilter; label: string }> = [
  { value: 'sep-oct', label: 'Sep 24 – Oct 23, 2026' },
  { value: 'aug-sep', label: 'Aug 25 – Sep 23, 2026' },
  { value: 'all', label: 'All dates' },
];

export const formatCompactEstimateSum = (amount: number): string => {
  if (amount === 0) return '$0';
  if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}k`;
  return `$${amount.toFixed(2)}`;
};

export const matchesEstimateTab = (estimate: Estimate, tab: EstimateTab): boolean => {
  switch (tab) {
    case 'all':
      return true;
    case 'draft':
      return estimate.status === 'draft';
    case 'pending':
      return estimate.status === 'pending' || estimate.due > 0;
    case 'paid':
      return (
        estimate.status === 'paid' ||
        (estimate.status === 'accepted' && estimate.paid >= estimate.total && estimate.total > 0)
      );
  }
};

export const TUTORIAL_STEPS: ReadonlyArray<{ step: string; title: string; detail: string }> = [
  {
    step: '1',
    title: 'Scope & itemize phases',
    detail:
      'Break each estimate into trade milestones so clients see approved scope, deposits, and unbilled work.',
  },
  {
    step: '2',
    title: 'Issue progressive invoice draws',
    detail:
      'Convert remaining unbilled balance into scheduled invoice draws as field crews complete each phase.',
  },
  {
    step: '3',
    title: 'Track collected & due balances',
    detail: 'Reconcile paid cheques or transfers against pending draws in real time across every active job.',
  },
];

const estCode = (num: string): string => `#${num}`;

export const INITIAL_ESTIMATES: Estimate[] = [
  {
    id: 'est-1088',
    client: 'Susan Santoro',
    project: 'Bathroom Remodel',
    code: estCode('001088'),
    date: 'Oct 6, 2026',
    period: 'sep-oct',
    status: 'accepted',
    total: 23335.75,
    invoiced: 18843.0,
    toBeInvoiced: 4492.75,
    paid: 8968.33,
    due: 9874.67,
    items: [
      { id: '1088-1', label: 'Demolition & Disposal', amount: 8968.33, status: 'paid' },
      { id: '1088-2', label: 'Plumbing', amount: 9874.67, status: 'pending' },
      { id: '1088-3', label: 'Not itemized', amount: 4492.75, status: 'unbilled' },
    ],
    ctaLabel: 'Add another invoice for the estimate',
  },
  {
    id: 'est-1089',
    client: 'Ken Trajanovski',
    project: 'Tile Installation',
    code: estCode('001089'),
    date: 'Oct 9, 2026',
    period: 'sep-oct',
    status: 'accepted',
    total: 19668.52,
    invoiced: 12867.41,
    toBeInvoiced: 6801.11,
    paid: 7867.41,
    due: 5000.0,
    items: [
      { id: '1089-1', label: 'Deposit Invoice', amount: 7867.41, status: 'paid' },
      { id: '1089-2', label: 'Draw 2', amount: 5000.0, status: 'pending' },
      { id: '1089-3', label: 'Not itemized', amount: 6801.11, status: 'unbilled' },
    ],
    ctaLabel: 'Review invoice & balance',
  },
  {
    id: 'est-1090',
    client: 'Doris Muller',
    project: 'Tile Service',
    code: estCode('001090'),
    date: 'Oct 14, 2026',
    period: 'sep-oct',
    status: 'accepted',
    total: 6271.08,
    invoiced: 937.09,
    toBeInvoiced: 5333.99,
    paid: 937.09,
    due: 0,
    items: [
      { id: '1090-1', label: 'Cheque Payment', amount: 937.09, status: 'paid' },
      { id: '1090-2', label: 'Not itemized', amount: 5333.99, status: 'unbilled' },
    ],
    ctaLabel: 'Add another invoice for the estimate',
  },
  {
    id: 'est-1087-2',
    client: 'Gary Lindberg',
    project: 'Bathroom Remodel',
    code: estCode('001087-2'),
    date: 'Sep 29, 2026',
    period: 'sep-oct',
    status: 'draft',
    total: 1026.27,
    invoiced: 0,
    toBeInvoiced: 1026.27,
    paid: 0,
    due: 0,
    items: [],
    ctaLabel: 'Send estimate for approval',
  },
  {
    id: 'est-1087-3',
    client: 'Kathleen Reed',
    project: 'Tile Installation',
    code: estCode('001087-3'),
    date: 'Oct 2, 2026',
    period: 'sep-oct',
    status: 'pending',
    total: 3309.65,
    invoiced: 2151.27,
    toBeInvoiced: 1158.38,
    paid: 0,
    due: 2151.27,
    items: [
      { id: '1087-3-1', label: 'Demolition & Disposal', amount: 827.41, status: 'pending' },
      { id: '1087-3-2', label: 'Plumbing', amount: 1323.86, status: 'pending' },
      { id: '1087-3-3', label: 'Not itemized', amount: 1158.38, status: 'unbilled' },
    ],
    ctaLabel: 'Review invoice & balance',
  },
  {
    id: 'est-1091',
    client: 'Gary Lindberg',
    project: 'Carpentry',
    code: estCode('001091'),
    date: 'Oct 20, 2026',
    period: 'sep-oct',
    status: 'accepted',
    total: 2718.03,
    invoiced: 2718.03,
    toBeInvoiced: 0,
    paid: 2718.03,
    due: 0,
    items: [{ id: '1091-1', label: 'Cabinetry & Trim', amount: 2718.03, status: 'paid' }],
    ctaLabel: 'Add another invoice for the estimate',
  },
  {
    id: 'est-1084',
    client: 'Marcus Vance',
    project: 'Bathroom Remodel',
    code: estCode('001084'),
    date: 'Sep 18, 2026',
    period: 'aug-sep',
    status: 'paid',
    total: 6140.8,
    invoiced: 6140.8,
    toBeInvoiced: 0,
    paid: 6140.8,
    due: 0,
    items: [
      { id: '1084-1', label: 'Rough-in & Waterproofing', amount: 2840.8, status: 'paid' },
      { id: '1084-2', label: 'Vanity & Fixture Install', amount: 3300.0, status: 'paid' },
    ],
    ctaLabel: 'Review invoice & balance',
  },
  {
    id: 'est-1085',
    client: 'Elena Rostova',
    project: 'Carpentry',
    code: estCode('001085'),
    date: 'Sep 11, 2026',
    period: 'aug-sep',
    status: 'draft',
    total: 4890.0,
    invoiced: 0,
    toBeInvoiced: 4890.0,
    paid: 0,
    due: 0,
    items: [],
    ctaLabel: 'Send estimate for approval',
  },
  {
    id: 'est-1086',
    client: 'Hannah Okafor',
    project: 'Tile Service',
    code: estCode('001086'),
    date: 'Sep 21, 2026',
    period: 'aug-sep',
    status: 'pending',
    total: 3450.0,
    invoiced: 1725.0,
    toBeInvoiced: 1725.0,
    paid: 0,
    due: 1725.0,
    items: [
      { id: '1086-1', label: 'Grout & Reseal Deposit', amount: 1725.0, status: 'pending' },
      { id: '1086-2', label: 'Not itemized', amount: 1725.0, status: 'unbilled' },
    ],
    ctaLabel: 'Review invoice & balance',
  },
];
