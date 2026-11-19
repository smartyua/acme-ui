import { type TimelineEvent } from '../../components/EventTimeline';
import { type MapLandmark, type MapWaypoint, type RoutePathSegment } from '../../components/RouteMap';
import { type ThresholdReading, type ThresholdTick } from '../../components/ThresholdChart';

// 61 readings at 5-minute intervals from 07:05 (idx 0) to 12:10 (idx 61)
// Excursion above 8.0 °C spans 10:25 (idx 40) to 11:35 (idx 54), peaking at 11:00 (idx 47) = 10.2 °C.
const BASE_VALUES = [
  5.1, 5.4, 5.2, 5.0, 4.9, 5.1, 4.8, 5.0, 5.2, 5.4,
  5.3, 5.1, 5.0, 4.9, 5.1, 4.8, 4.9, 5.0, 5.2, 5.1,
  5.3, 5.4, 5.2, 5.0, 4.9, 5.1, 5.0, 4.8, 4.9, 5.0,
  5.1, 5.0, 4.9, 5.0, 4.8, 5.1, 5.4, 5.8, 6.4, 7.2,
  8.2, 8.5, 8.8, 9.1, 9.4, 9.8, 10.0, 10.2, 9.8, 9.4,
  9.0, 8.7, 8.3, 8.1, 7.2, 6.4, 5.9, 5.6, 5.5, 5.4,
  5.6,
];

const formatTime = (idx: number) => {
  const totalMinutes = 7 * 60 + 5 + idx * 5;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const TEMPERATURE_READINGS: ThresholdReading[] = BASE_VALUES.map((value, idx) => ({
  id: `r-${idx}`,
  time: formatTime(idx),
  value,
}));

export const TEMPERATURE_X_TICKS: ThresholdTick[] = [
  { index: 0, label: '07:05' },
  { index: 40, label: '10:25', alert: true },
  { index: 54, label: '11:35', alert: true },
  { index: 60, label: '12:10' },
];

export const EXCURSION_RANGE: [number, number] = [40, 53];

export const ROUTE_LANDMARKS: MapLandmark[] = [
  { label: 'NETHERLANDS', x: 18, y: 28, region: true },
  { label: "'s-Hertogenbosch", x: 266, y: 40 },
  { label: 'Breda', x: 142, y: 74 },
  { label: 'Tilburg', x: 210, y: 76 },
  { label: 'BELGIUM', x: 294, y: 214, region: true },
  { label: 'Hasselt', x: 274, y: 242 },
  { label: 'GERMANY', x: 408, y: 224, region: true },
];

// Venlo DC (right, x=470 y=132) -> Antwerp (left, x=52 y=184)
export const ROUTE_SEGMENTS: RoutePathSegment[] = [
  {
    id: 'seg-in-1',
    d: 'M 470 132 C 442 142, 420 130, 386 126 C 344 122, 314 126, 276 144 C 248 158, 224 162, 194 160',
    tone: 'success',
  },
  {
    id: 'seg-alert',
    d: 'M 194 160 C 176 158, 162 164, 146 172 C 128 180, 114 186, 98 186',
    tone: 'danger',
  },
  {
    id: 'seg-in-2',
    d: 'M 98 186 C 82 186, 68 185, 52 184',
    tone: 'success',
  },
];

export const ROUTE_WAYPOINTS: MapWaypoint[] = [
  {
    id: 'departed',
    label: 'Departed Venlo DC at 07:05',
    xPct: 90.4,
    yPct: 44,
    kind: 'origin',
    pinLabel: 'Venlo DC',
    callout: { value: '5.6 °C', time: '07:05' },
  },
  {
    id: 'above',
    label: 'Went above 8 °C at 10:25',
    xPct: 37.3,
    yPct: 53.3,
    kind: 'alert',
    callout: { value: '8.2 °C', time: '10:25', alert: true },
  },
  {
    id: 'peak',
    label: 'Peak reading 10.2 °C at 11:00',
    xPct: 28.1,
    yPct: 57.3,
    kind: 'alert',
    callout: { value: '10.2 °C', time: '11:00', alert: true },
  },
  {
    id: 'recovered',
    label: 'Back in range at 11:35',
    xPct: 18.8,
    yPct: 62,
    kind: 'alert',
    callout: { value: '7.2 °C', time: '11:35' },
  },
  {
    id: 'delivered',
    label: 'Delivered in Antwerp at 12:10',
    xPct: 10,
    yPct: 61.3,
    kind: 'destination',
    pinLabel: 'Antwerp',
    callout: { value: '5.6 °C', time: '12:10' },
  },
];

export const ROUTE_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'departed',
    title: 'Departed Venlo DC',
    time: '07:05',
    value: '5.6 °C',
    detail: 'Refrigerated vehicle',
    tone: 'neutral',
    segmentTone: 'neutral',
  },
  {
    id: 'above',
    title: 'Went above 8 °C',
    time: '10:25',
    value: '8.2 °C',
    valueTone: 'danger',
    detail: 'first reading over the limit',
    tone: 'danger',
    segmentTone: 'danger',
  },
  {
    id: 'peak',
    title: 'Peak reading',
    time: '11:00',
    value: '10.2 °C',
    valueTone: 'danger',
    detail: '2.2 °C over 8 °C',
    tone: 'danger',
    segmentTone: 'danger',
  },
  {
    id: 'recovered',
    title: 'Back in range',
    time: '11:35',
    value: '7.2 °C',
    detail: 'after 1 h 10 min above 8 °C',
    tone: 'neutral',
    segmentTone: 'neutral',
  },
  {
    id: 'delivered',
    title: 'Delivered in Antwerp',
    time: '12:10',
    value: '5.6 °C',
    detail: 'held for 2 h 10 min',
    tone: 'success',
    completed: true,
  },
];

export const EVENT_SEGMENT_POSITION: Record<string, { segmentId: string; pct: number }> = {
  departed: { segmentId: 'before', pct: 4 },
  above: { segmentId: 'excursion', pct: 8 },
  peak: { segmentId: 'excursion', pct: 50 },
  recovered: { segmentId: 'excursion', pct: 92 },
  delivered: { segmentId: 'after', pct: 95 },
};
