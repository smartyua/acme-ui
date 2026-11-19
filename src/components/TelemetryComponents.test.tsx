import { describe, expect, it, vi } from 'vitest';
import { Check, Thermometer, Warehouse } from 'lucide-react';

import { EventTimeline } from './EventTimeline';
import { JourneyBar } from './JourneyBar';
import { MetricStrip } from './MetricStrip';
import { RouteMap } from './RouteMap';
import { ThresholdChart } from './ThresholdChart';
import { click, focus, mount } from '../test/harness';

const bare = { app: false } as const;

describe('MetricStrip', () => {
  it('renders every KPI cell with icon, value, tone and detail', () => {
    const screen = mount(
      <MetricStrip
        items={[
          {
            id: 'peak',
            label: 'Peak',
            icon: <Thermometer size={14} aria-hidden />,
            value: '10.2 °C',
            detail: 'at 11:00',
            tone: 'danger',
          },
          { id: 'dist', label: 'Distance', value: '136 km', detail: 'by road' },
        ]}
      />,
      bare,
    );
    expect(screen.text).toContain('Peak');
    expect(screen.text).toContain('10.2 °C');
    expect(screen.text).toContain('at 11:00');
    expect(screen.text).toContain('136 km');
  });
});

describe('ThresholdChart', () => {
  const readings = [
    { id: 'r0', time: '07:05', value: 5.2 },
    { id: 'r1', time: '10:25', value: 8.4 },
    { id: 'r2', time: '11:00', value: 10.2 },
    { id: 'r3', time: '12:10', value: 5.6 },
  ];

  it('renders readings, threshold callout and updates callout on focus/click', () => {
    const onSelect = vi.fn();
    const screen = mount(
      <ThresholdChart
        readings={readings}
        threshold={8}
        min={4}
        max={11}
        yTicks={[4, 6, 8, 10]}
        xTicks={[
          { index: 0, label: '07:05' },
          { index: 1, label: '10:25', alert: true },
          { index: 3, label: '12:10' },
        ]}
        excursionRange={[1, 2]}
        excursionCallout={{
          rangeLabel: '10:25–11:35',
          durationLabel: '1 h 10 min',
          peakLabel: 'peak 10.2 °C',
        }}
        legend={{
          inRange: 'In range',
          aboveRange: 'Above range',
          limit: 'Limit 8 °C',
          caption: 'One column is a reading',
        }}
        onSelectReading={onSelect}
        ariaLabel="Temperature readings"
      />,
      bare,
    );

    expect(screen.text).toContain('10:25–11:35');
    expect(screen.text).toContain('peak 10.2 °C');
    expect(screen.text).toContain('One column is a reading');

    const peakBtn = screen.find<HTMLButtonElement>('[aria-label="11:00: 10.2 °C"]');
    focus(peakBtn);
    expect(screen.text).toContain('+2.2 °C over limit');

    click(peakBtn);
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});

describe('EventTimeline', () => {
  it('marks the active milestone and reports selection', () => {
    const onSelect = vi.fn();
    const screen = mount(
      <EventTimeline
        events={[
          { id: 'a', title: 'Departed Venlo DC', time: '07:05', value: '5.6 °C', detail: 'Refrigerated' },
          {
            id: 'b',
            title: 'Peak reading',
            time: '11:00',
            value: '10.2 °C',
            valueTone: 'danger',
            detail: '2.2 °C over 8 °C',
            tone: 'danger',
            segmentTone: 'danger',
          },
          { id: 'c', title: 'Delivered', time: '12:10', tone: 'success', completed: true },
        ]}
        activeId="b"
        onSelect={onSelect}
      />,
      bare,
    );

    expect(screen.find('[aria-current="step"]').textContent).toContain('Peak reading');
    click(screen.findByText('button', 'Departed Venlo DC'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });
});

describe('JourneyBar', () => {
  it('renders origin, destination, segments and routes segment clicks', () => {
    const onExcursion = vi.fn();
    const screen = mount(
      <JourneyBar
        origin={{ title: 'Venlo DC', detail: 'Departed 07:05', icon: <Warehouse size={14} aria-hidden /> }}
        destination={{
          title: 'Antwerp',
          detail: 'Delivered 12:10',
          icon: <Check size={14} aria-hidden />,
          tone: 'success',
        }}
        segments={[
          { id: 'ok', weight: 70, tone: 'success', label: 'In range' },
          {
            id: 'exc',
            weight: 30,
            tone: 'danger',
            label: '1 h 10 min above 8 °C',
            pill: { icon: <Thermometer size={14} aria-hidden />, text: '1 h 10 min' },
            onClick: onExcursion,
          },
        ]}
      />,
      bare,
    );

    expect(screen.text).toContain('Venlo DC');
    expect(screen.text).toContain('Antwerp');
    expect(screen.text).toContain('1 h 10 min');
    click(screen.find('[aria-label="1 h 10 min above 8 °C"]'));
    expect(onExcursion).toHaveBeenCalledTimes(1);
  });
});

describe('RouteMap', () => {
  it('renders landmarks, waypoints, active callout and routes clicks', () => {
    const onSelect = vi.fn();
    const screen = mount(
      <RouteMap
        segments={[{ id: 's1', d: 'M 470 132 L 52 184', tone: 'success' }]}
        landmarks={[{ label: 'NETHERLANDS', x: 20, y: 20, region: true }, { label: 'Breda', x: 140, y: 74 }]}
        waypoints={[
          { id: 'origin', label: 'Venlo DC', xPct: 90, yPct: 44, kind: 'origin', pinLabel: 'Venlo DC' },
          {
            id: 'peak',
            label: 'Peak reading',
            xPct: 30,
            yPct: 58,
            kind: 'alert',
            callout: { value: '10.2 °C', time: '11:00', alert: true },
          },
          { id: 'dest', label: 'Antwerp', xPct: 10, yPct: 61, kind: 'destination', pinLabel: 'Antwerp' },
        ]}
        activeWaypointId="peak"
        onSelectWaypoint={onSelect}
        ariaLabel="Route map"
      />,
      bare,
    );

    expect(screen.text).toContain('10.2 °C');
    expect(screen.text).toContain('11:00');
    expect(screen.text).toContain('Venlo DC');
    expect(screen.text).toContain('Antwerp');
    click(screen.find('[aria-label="Antwerp"]'));
    expect(onSelect).toHaveBeenCalledWith('dest');
  });
});
