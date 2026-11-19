import { describe, expect, it } from 'vitest';

import { Toaster } from '../../components/ui';
import { click, mount } from '../../test/harness';
import { ShipmentsPage } from './ShipmentsPage';

const open = () =>
  mount(
    <>
      <ShipmentsPage />
      <Toaster />
    </>,
  );

const toasts = () => Array.from(document.querySelectorAll('[role="status"]')).map((el) => el.textContent ?? '');

describe('ShipmentsPage', () => {
  it('renders the VEN-26-1946 temperature telemetry view by default', () => {
    const screen = open();
    expect(screen.find('h1').textContent).toBe('VEN-26-1946');
    expect(screen.text).toContain('10.2 °C');
    expect(screen.text).toContain('+2.2 °C');
    expect(screen.text).toContain('1 h 10 min');
    expect(screen.text).toContain('5.6 °C');
    expect(screen.text).toContain('Venlo DC');
    expect(screen.text).toContain('Antwerp');
  });

  it('switches to Route view and syncs EventTimeline with RouteMap and JourneyBar', () => {
    const screen = open();
    click(screen.findByText('[role="radio"]', 'Route'));
    expect(screen.text).toContain('136 km');
    expect(screen.text).toContain('5 h 5 min');
    expect(screen.text).toContain('2 h 10 min');
    expect(screen.find('[aria-current="step"]').textContent).toContain('Peak reading');

    click(screen.findByText('button', 'Went above 8 °C'));
    expect(screen.find('[aria-current="step"]').textContent).toContain('Went above 8 °C');

    click(screen.find('[aria-label="Delivered in Antwerp at 12:10"]'));
    expect(screen.find('[aria-current="step"]').textContent).toContain('Delivered in Antwerp');
  });

  it('switches from Temperature to Route when clicking the JourneyBar excursion pill', () => {
    const screen = open();
    click(screen.find('[aria-label="1 h 10 min above 8 °C"]'));
    expect(screen.text).toContain('136 km');
    expect(toasts().some((t) => t.includes('Opened route excursion'))).toBe(true);
  });

  it('supports clicking individual temperature readings, Overview tab and report export', () => {
    const screen = open();
    const readingBtn = screen.find('[aria-label="11:00: 10.2 °C"]');
    click(readingBtn);
    expect(readingBtn.getAttribute('aria-pressed')).toBe('true');

    click(screen.findByText('[role="tab"]', 'Overview'));
    expect(screen.text).toContain('Thermal budget consumed');
    click(screen.findByText('button', 'Open telemetry'));
    expect(screen.text).toContain('One column is a reading');

    click(screen.findByText('button', 'Export report'));
    expect(toasts().some((t) => t.includes('Telemetry report exported'))).toBe(true);
  });
});
