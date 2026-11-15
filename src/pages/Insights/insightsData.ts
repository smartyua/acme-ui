import { type Tone } from '../../data';

export type InsightKind = 'risk' | 'opportunity' | 'trend';
export type InsightFilter = 'all' | 'opportunity' | 'risk' | 'trend';
export type InsightSort = 'impact' | 'recency' | 'confidence';
export type InsightPeriod = 'this-week' | 'last-4-weeks' | 'qtd';

export type InsightChartType =
  | 'rolling-line'
  | 'source-bars'
  | 'report-split'
  | 'weekly-bars'
  | 'hour-heatmap';

export type InsightItem = {
  id: string;
  kind: InsightKind;
  source: string;
  time: string;
  title: string;
  body: string;
  primaryCta: string;
  primaryToastTitle: string;
  primaryToastDesc: string;
  impactScore: number;
  recencyRank: number;
  confidenceScore: number;
  chartType: InsightChartType;
  chartLabel: string;
  chartValue: string;
  chartDelta: string;
  chartDeltaTone: 'up' | 'down' | 'neutral';
  detailsSummary: string;
  recommendations: string[];
};

export const INITIAL_INSIGHTS: InsightItem[] = [
  {
    id: 'ins-1',
    kind: 'risk',
    source: 'Network',
    time: 'Today 06:00',
    title: 'Positive messages per person down 47% vs prior 4 weeks',
    body: '13.6 per person (3,277 ÷ 241) vs 25.7 before. New members are still ramping up — total messages fell only 5%.',
    primaryCta: 'Send ramp-up tips',
    primaryToastTitle: 'Ramp-up tips queued',
    primaryToastDesc: 'Onboarding playbook sent to 38 ramping workspace members.',
    impactScore: 98,
    recencyRank: 1,
    confidenceScore: 94,
    chartType: 'rolling-line',
    chartLabel: 'Per person · rolling 4 wk',
    chartValue: '13.6',
    chartDelta: '-47%',
    chartDeltaTone: 'down',
    detailsSummary:
      'Cohort analysis shows members who joined in W28–W31 average 6.2 positive messages/week compared with 25.7 for tenured reps.',
    recommendations: [
      'Assign the 14-day messaging cadence template to cohorts W29–W31.',
      'Pair new reps with top referral converters during Tue–Wed call blocks.',
      'Review automated follow-up triggers for unreturned first outreach.',
    ],
  },
  {
    id: 'ins-2',
    kind: 'opportunity',
    source: 'Sources',
    time: 'Today 06:00',
    title: 'Referrals convert 1.6× better than walk-ins (41% vs 26% MG1 rate)',
    body: '1,039 referral messages → 426 MG1; 1,249 walk-ins → 325. Moving 10% of walk-in effort to referrals ≈ +19 MG1.',
    primaryCta: 'Plan referral push',
    primaryToastTitle: 'Referral campaign drafted',
    primaryToastDesc: 'Shifted 10% outreach allocation to warm referral leads (+19 projected MG1).',
    impactScore: 92,
    recencyRank: 2,
    confidenceScore: 96,
    chartType: 'source-bars',
    chartLabel: 'MG1 rate by source',
    chartValue: '41% vs 26%',
    chartDelta: '1.6×',
    chartDeltaTone: 'up',
    detailsSummary:
      'Referral leads convert at 41.0% across all regions, outperforming walk-ins (26.0%), paid campaigns (29.4%) and cold inbound (18.2%).',
    recommendations: [
      'Trigger referral request prompt immediately after post-onboarding NPS >= 9.',
      'Rebalance 125 weekly outreach slots from walk-in follow-up to warm introductions.',
    ],
  },
  {
    id: 'ins-3',
    kind: 'risk',
    source: 'Oscar & Nayrobi Grullon',
    time: 'Yesterday',
    title: "Oscar & Nayrobi's MG1 fell 56% — 27 members didn't report",
    body: 'MG1 289 vs 657 in the prior 4 weeks. 27 of 58 members missed the weekly report, so part of the drop may be unreported.',
    primaryCta: 'Remind 27 members',
    primaryToastTitle: 'Reminders sent to 27 members',
    primaryToastDesc: 'Slack and SMS check-in links dispatched for W31 reporting.',
    impactScore: 89,
    recencyRank: 3,
    confidenceScore: 88,
    chartType: 'report-split',
    chartLabel: 'Weekly report · 58 people',
    chartValue: '31 of 58',
    chartDelta: '',
    chartDeltaTone: 'neutral',
    detailsSummary:
      'Only 53.4% of the Oscar & Nayrobi leg submitted their Friday activity rollup. Historical backfills recover ~65% of apparent MG1 drops.',
    recommendations: [
      'Enable automatic Friday 16:00 SMS digest reminders for missing reporters.',
      'Sync CRM call dispositions directly so baseline MG1 counts do not depend on manual entry.',
    ],
  },
  {
    id: 'ins-4',
    kind: 'opportunity',
    source: 'Plans',
    time: 'Jul 29',
    title: 'Family plan upgrades +18% after the June campaign',
    body: '46 upgrades to Family ($79) vs 39 the 4 weeks before — mostly from Plus. +$1,380 MRR at +$30 each.',
    primaryCta: 'Repeat campaign',
    primaryToastTitle: 'August Family upgrade campaign scheduled',
    primaryToastDesc: 'Targeting 410 eligible Plus accounts with >3 active seats.',
    impactScore: 84,
    recencyRank: 4,
    confidenceScore: 91,
    chartType: 'weekly-bars',
    chartLabel: 'Upgrades to Family / week',
    chartValue: '46',
    chartDelta: '+18%',
    chartDeltaTone: 'up',
    detailsSummary:
      'Plus accounts that hit 80% seat utilization upgraded at 3.4× the baseline rate when shown the in-app Family bundle comparison.',
    recommendations: [
      'Re-run the June seat-bundle banner for Plus workspaces adding their 3rd member.',
      'Include annual billing prepay incentive to lock in <1.2% monthly churn.',
    ],
  },
  {
    id: 'ins-5',
    kind: 'trend',
    source: 'Network',
    time: 'Jul 28',
    title: 'Efficiency peaks Tue–Wed 10:00–13:00',
    body: '38.4% of positive messages become MG1 in that window vs 30.58% overall; 31% of all MG1 (311) were booked there.',
    primaryCta: 'Schedule call blocks',
    primaryToastTitle: 'Protected call blocks added',
    primaryToastDesc: 'Tue–Wed 10:00–13:00 reserved for high-intent outreach across 14 teams.',
    impactScore: 78,
    recencyRank: 5,
    confidenceScore: 95,
    chartType: 'hour-heatmap',
    chartLabel: 'MG1 rate · day × hour',
    chartValue: '38.4%',
    chartDelta: '+7.8 pts',
    chartDeltaTone: 'up',
    detailsSummary:
      'Mid-morning Tuesday and Wednesday blocks yield +7.8 percentage points higher conversion than late-afternoon outreach.',
    recommendations: [
      'Hold internal standups before 09:30 or after 14:00 on Tuesdays and Wednesdays.',
      'Queue automated follow-up sequences to land between 10:00 and 11:30 recipient local time.',
    ],
  },
];

export type FocusSubMetric = {
  id: string;
  label: string;
  score: number;
  sub: string;
  tone: 'lavender' | 'lemon' | 'sky';
};

export const FOCUS_METRICS: FocusSubMetric[] = [
  {
    id: 'quality',
    label: 'Message quality',
    score: 80,
    sub: 'MG1 per 100 msgs',
    tone: 'lavender',
  },
  {
    id: 'speed',
    label: 'Follow-up speed',
    score: 64,
    sub: 'median 3.1 days',
    tone: 'lemon',
  },
  {
    id: 'reporting',
    label: 'Reporting',
    score: 78,
    sub: '189 of 241',
    tone: 'sky',
  },
];

export type WhatChangedRow = {
  id: string;
  label: string;
  value: string;
  delta: string;
  up: boolean;
};

export const WHAT_CHANGED: WhatChangedRow[] = [
  { id: 'wc-1', label: 'New customers', value: '128', delta: '+19.1%', up: true },
  { id: 'wc-2', label: 'MG1', value: '1,002', delta: '-12.0%', up: false },
  { id: 'wc-3', label: 'Efficiency', value: '30.58%', delta: '-2.4 pts', up: false },
  { id: 'wc-4', label: 'Reporting rate', value: '78.4%', delta: '+3.2 pts', up: true },
  { id: 'wc-5', label: 'Active subscriptions', value: '1,751', delta: '+8.4%', up: true },
];

export type AlertRule = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: Tone;
};

export const INITIAL_ALERTS: AlertRule[] = [
  {
    id: 'al-1',
    title: 'Leg MG1 drops more than 40%',
    subtitle: 'MG1 vs prior 4 weeks · any leg',
    badge: '6 LEGS',
    tone: 'rose',
  },
  {
    id: 'al-2',
    title: 'Reporting rate below 75%',
    subtitle: 'Network · weekly, Mondays',
    badge: 'OK · 78.4%',
    tone: 'mint',
  },
  {
    id: 'al-3',
    title: 'Churn above 2.5%',
    subtitle: 'Subscriptions · daily',
    badge: 'NEAR · 2.3%',
    tone: 'lemon',
  },
];

// 5 days (Mon..Fri) × 6 time slots (08:00..15:00) intensity 1..4
export const HEATMAP_MATRIX: number[][] = [
  [1, 2, 2, 2, 1, 1],
  [2, 4, 4, 3, 2, 1],
  [2, 4, 4, 3, 2, 1],
  [1, 2, 3, 2, 2, 1],
  [1, 2, 2, 1, 1, 1],
];
