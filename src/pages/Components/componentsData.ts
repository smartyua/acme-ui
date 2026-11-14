import { type Point, type Tone } from '../../data';

export type MemberStatus = 'active' | 'invited' | 'suspended';

export type Member = { name: string; email: string; initials: string; role: string; status: MemberStatus; seats: number };

export const STATUS_TONE: Record<MemberStatus, Tone> = { active: 'mint', invited: 'lemon', suspended: 'rose' };

export const MEMBERS: Member[] = [
  { name: 'Alex Morgan', email: 'alex@acme.io', initials: 'AM', role: 'Owner', status: 'active', seats: 3 },
  { name: 'Emma Ruiz', email: 'emma@acme.io', initials: 'ER', role: 'Admin', status: 'active', seats: 2 },
  { name: 'Jonas Park', email: 'jonas@acme.io', initials: 'JP', role: 'Member', status: 'invited', seats: 1 },
  { name: 'Tara Brooks', email: 'tara@acme.io', initials: 'TB', role: 'Billing', status: 'active', seats: 1 },
  { name: 'Nina Olsen', email: 'nina@acme.io', initials: 'NO', role: 'Member', status: 'suspended', seats: 0 },
];

export type DemoKpi = { label: string; value: string; delta: string; up: boolean; trend: number[] };

export const KPIS: DemoKpi[] = [
  { label: 'Revenue', value: '$48,210', delta: '+12.4%', up: true, trend: [30, 34, 32, 38, 41, 40, 46] },
  { label: 'Active members', value: '1,284', delta: '+3.1%', up: true, trend: [20, 21, 21, 23, 22, 24, 25] },
  { label: 'Failed payments', value: '17', delta: '-8.0%', up: false, trend: [9, 8, 9, 7, 6, 6, 5] },
  { label: 'Avg. response', value: '2h 14m', delta: '+0.6%', up: true, trend: [12, 11, 13, 12, 14, 13, 14] },
];

export const WEEKLY: Point[] = [
  { label: 'Mon', value: 4200 },
  { label: 'Tue', value: 5100 },
  { label: 'Wed', value: 4700 },
  { label: 'Thu', value: 6300 },
  { label: 'Fri', value: 5800 },
  { label: 'Sat', value: 3100 },
  { label: 'Sun', value: 2600 },
];
