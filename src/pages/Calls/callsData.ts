export type CallDirection = 'inbound' | 'outbound' | 'internal';
export type CallOutcome = 'answered' | 'voicemail' | 'no-answer';
export type CallRange = '7d' | '24h' | '30d';

export type CallRecord = {
  id: string;
  time: string;
  number: string;
  direction: CallDirection;
  outcome: CallOutcome;
  length: string;
  currentPos: string;
  topic: string;
  topicTone: 'danger' | 'success' | 'neutral' | 'missed';
  extensionMeta: string;
  aiSummary: string;
  playable: boolean;
};

export const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'call-1',
    time: 'Jun 10, 11:13 AM',
    number: '+1 (416) 555-1005',
    direction: 'inbound',
    outcome: 'answered',
    length: '10:12',
    currentPos: '3:26',
    topic: 'Billing dispute',
    topicTone: 'danger',
    extensionMeta: '+1 (416) 555-1005, inbound, to extension 101',
    aiSummary: 'Charged twice for May. A callback was promised by Friday.',
    playable: true,
  },
  {
    id: 'call-2',
    time: 'Jun 10, 9:34 AM',
    number: '+1 (416) 555-1001',
    direction: 'inbound',
    outcome: 'answered',
    length: '3:04',
    currentPos: '1:12',
    topic: 'New order',
    topicTone: 'success',
    extensionMeta: '+1 (416) 555-1001, inbound, to extension 104',
    aiSummary: 'Confirmed 40-unit wholesale restock for downtown Toronto warehouse.',
    playable: true,
  },
  {
    id: 'call-3',
    time: 'Jun 10, 12:43 AM',
    number: '+1 (416) 555-1004',
    direction: 'inbound',
    outcome: 'voicemail',
    length: '0:32',
    currentPos: '0:14',
    topic: 'Voicemail',
    topicTone: 'missed',
    extensionMeta: '+1 (416) 555-1004, after-hours voicemail, to main queue',
    aiSummary: 'Caller requested urgent gate code update for morning freight delivery.',
    playable: true,
  },
  {
    id: 'call-4',
    time: 'Jun 9, 6:43 PM',
    number: '+1 (647) 555-2002',
    direction: 'outbound',
    outcome: 'no-answer',
    length: '0:00',
    currentPos: '0:00',
    topic: 'No answer',
    topicTone: 'missed',
    extensionMeta: '+1 (647) 555-2002, outbound from extension 101',
    aiSummary: 'Unanswered follow-up dial after hours; scheduled for morning retry.',
    playable: false,
  },
  {
    id: 'call-5',
    time: 'Jun 9, 4:52 PM',
    number: '+1 (416) 555-1007',
    direction: 'inbound',
    outcome: 'answered',
    length: '3:53',
    currentPos: '2:05',
    topic: 'Delivery update',
    topicTone: 'neutral',
    extensionMeta: '+1 (416) 555-1007, inbound, to extension 102',
    aiSummary: 'Updated dock arrival window to Thursday between 10:00 AM and 12:00 PM.',
    playable: true,
  },
  {
    id: 'call-6',
    time: 'Jun 9, 3:40 PM',
    number: '+1 (647) 555-2006',
    direction: 'outbound',
    outcome: 'answered',
    length: '1:35',
    currentPos: '0:48',
    topic: 'Outbound call',
    topicTone: 'neutral',
    extensionMeta: '+1 (647) 555-2006, outbound from extension 103',
    aiSummary: 'Verified net-30 wire remittance details with accounts payable.',
    playable: true,
  },
  {
    id: 'call-7',
    time: 'Jun 9, 2:34 PM',
    number: '104 to 103',
    direction: 'internal',
    outcome: 'answered',
    length: '0:45',
    currentPos: '0:20',
    topic: 'Internal',
    topicTone: 'neutral',
    extensionMeta: 'Extension 104 to extension 103 · internal transfer',
    aiSummary: 'Warm transfer of enterprise support escalation.',
    playable: false,
  },
  {
    id: 'call-8',
    time: 'Jun 9, 11:18 AM',
    number: '+1 (416) 555-1019',
    direction: 'inbound',
    outcome: 'answered',
    length: '4:12',
    currentPos: '1:30',
    topic: 'Contract renewal',
    topicTone: 'success',
    extensionMeta: '+1 (416) 555-1019, inbound, to extension 101',
    aiSummary: 'Approved 12-month SIP trunk renewal with 2 additional DIDs.',
    playable: true,
  },
  {
    id: 'call-9',
    time: 'Jun 8, 4:05 PM',
    number: '+1 (647) 555-2044',
    direction: 'outbound',
    outcome: 'answered',
    length: '1:22',
    currentPos: '0:40',
    topic: 'Onboarding check',
    topicTone: 'neutral',
    extensionMeta: '+1 (647) 555-2044, outbound from extension 102',
    aiSummary: 'Confirmed desk phone provisioning across 8 branch extensions.',
    playable: true,
  },
  {
    id: 'call-10',
    time: 'Jun 8, 1:15 PM',
    number: '101 to 104',
    direction: 'internal',
    outcome: 'answered',
    length: '0:42',
    currentPos: '0:15',
    topic: 'Internal',
    topicTone: 'neutral',
    extensionMeta: 'Extension 101 to extension 104 · internal consultation',
    aiSummary: 'Checked hardware inventory before quoting multi-site deployment.',
    playable: false,
  },
];

export type HourlyCallBar = {
  id: string;
  leftPct: number;
  minutes: number;
  kind: CallDirection;
};

export const OPEN_HOUR_BARS: HourlyCallBar[] = [
  { id: 'hb-1', leftPct: 39.5, minutes: 3.2, kind: 'inbound' },
  { id: 'hb-2', leftPct: 43.2, minutes: 1.4, kind: 'inbound' },
  { id: 'hb-3', leftPct: 46.8, minutes: 10.2, kind: 'inbound' },
  { id: 'hb-4', leftPct: 50.8, minutes: 5.4, kind: 'outbound' },
  { id: 'hb-5', leftPct: 56.2, minutes: 1.3, kind: 'inbound' },
  { id: 'hb-6', leftPct: 60.5, minutes: 0.9, kind: 'internal' },
  { id: 'hb-7', leftPct: 65.0, minutes: 1.8, kind: 'outbound' },
  { id: 'hb-8', leftPct: 69.2, minutes: 4.1, kind: 'inbound' },
];

export const WAVEFORM_HEIGHTS: number[] = [
  22, 34, 48, 30, 64, 52, 38, 72, 86, 44, 60, 78, 50, 92, 68, 42, 30, 56, 74,
  48, 36, 62, 80, 54, 40, 66, 46, 32, 58, 70, 44, 34, 52, 64, 38, 48, 76, 56,
  40, 60, 44, 32, 46, 28,
];
