// Invariants of the day simulation: time wrap-around, deterministic state, physical bounds.
import { describe, expect, it } from 'vitest';
import {
  BANKS,
  INVERTERS,
  INITIAL_MINUTE,
  clampMinute,
  formatClock,
  formatKw,
  formatMwh,
  formatPower,
  getDaySeries,
  getForecast,
  getHourlyExchange,
  getPlantState,
  powerMode,
  stringHealth,
  weatherAt,
} from './bessData';

const CONDITIONS = ['clear', 'partly', 'cloudy', 'overcast', 'rain'];

describe('time helpers', () => {
  it('wraps minutes into one day', () => {
    expect(clampMinute(0)).toBe(0);
    expect(clampMinute(720)).toBe(720);
    expect(clampMinute(1440)).toBe(0);
    expect(clampMinute(2880)).toBe(0);
    expect(clampMinute(-10)).toBe(1430);
  });

  it('formats clock times over the wrapped day', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(75)).toBe('01:15');
    expect(formatClock(440)).toBe('07:20');
    expect(formatClock(1439)).toBe('23:59');
    expect(formatClock(1500)).toBe('01:00');
    expect(formatClock(-100)).toBe('22:20');
  });

  it('maps power sign to battery mode', () => {
    expect(powerMode(-6)).toBe('charging');
    expect(powerMode(-5)).toBe('idle');
    expect(powerMode(5)).toBe('idle');
    expect(powerMode(6)).toBe('discharging');
  });

  it('formats power, energy and string health labels', () => {
    expect(formatPower(1500)).toBe('1.50 MW');
    expect(formatPower(-1500)).toBe('-1.50 MW');
    expect(formatPower(999.4)).toBe('999 kW');
    expect(formatKw(12.34, 1)).toBe('12.3 kW');
    expect(formatMwh(1.234)).toBe('1.2 MWh');
    expect(stringHealth(0.96)).toBe('good');
    expect(stringHealth(0.93)).toBe('fair');
    expect(stringHealth(0.85)).toBe('watch');
    expect(stringHealth(0.79)).toBe('poor');
  });
});

describe('weather and forecast', () => {
  it('wraps weather values and keeps them in range', () => {
    expect(weatherAt(-10).minute).toBe(1430);
    expect(weatherAt(-10)).toEqual(weatherAt(1430));
    for (const minute of [0, 340, 720, 1250, 1439]) {
      const w = weatherAt(minute);
      expect(w.cloudCover).toBeGreaterThanOrEqual(0);
      expect(w.cloudCover).toBeLessThanOrEqual(1);
      expect(w.humidity).toBeGreaterThanOrEqual(0.3);
      expect(w.humidity).toBeLessThanOrEqual(0.97);
      expect(w.precipitation).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(w.temperature) && Number.isFinite(w.windKph)).toBe(true);
      expect(CONDITIONS).toContain(w.condition);
    }
  });

  it('forecasts from the next full hour and keeps PV potential in daylight', () => {
    const beforeDawn = getForecast(200, 4);
    expect(beforeDawn.map((p) => p.minute)).toEqual([240, 300, 360, 420]);
    expect(beforeDawn[0].pvKw).toBe(0); // before sunrise (05:40) there is no irradiance
    expect(beforeDawn[3].pvKw).toBeGreaterThan(0); // 07:00 is after sunrise

    const noon = getForecast(720);
    expect(noon).toHaveLength(8);
    expect(noon[0].minute).toBe(780);
    expect(noon.reduce((sum, p) => sum + p.pvKw, 0)).toBeGreaterThan(0);
    for (const p of [...beforeDawn, ...noon]) {
      expect(p.pvKw).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(p.pvKw)).toBe(true);
      expect(CONDITIONS).toContain(p.condition);
    }
    expect(getForecast(1380, 4).map((p) => p.minute)).toEqual([0, 60, 120, 180]);
  });
});

describe('plant state', () => {
  it('is deterministic across repeats and day wrap', () => {
    expect(getPlantState(2160)).toEqual(getPlantState(720));
    expect(getPlantState(-1000).minute).toBe(440);
    expect(getPlantState(-1000).clock).toBe('07:20');
    expect(getPlantState(INITIAL_MINUTE).clock).toBe('13:20');
  });

  it('keeps every asset inside its working range', () => {
    const state = getPlantState(INITIAL_MINUTE);
    expect(state.forecast).toHaveLength(8);
    expect(state.banks).toHaveLength(BANKS.length);
    expect(state.inverters).toHaveLength(INVERTERS.length);
    for (const bank of state.banks) {
      expect(bank.soc).toBeGreaterThanOrEqual(bank.spec.socMin);
      expect(bank.soc).toBeLessThanOrEqual(bank.spec.socMax);
      expect(bank.availableKwh).toBeGreaterThanOrEqual(0);
      expect(['charging', 'discharging', 'idle']).toContain(bank.mode);
    }
    for (const charger of state.chargers) {
      for (const connector of charger.connectors) {
        expect(['charging', 'idle', 'fault']).toContain(connector.status);
        expect(connector.powerKw).toBeGreaterThanOrEqual(0);
      }
      if (charger.spec.faultConnector !== undefined) {
        expect(charger.connectors.some((c) => c.status === 'fault')).toBe(true);
      }
    }
    expect(state.totals.socPercent).toBeGreaterThanOrEqual(0);
    expect(state.totals.socPercent).toBeLessThanOrEqual(100);
    expect(state.totals.selfSufficiency).toBeGreaterThanOrEqual(0);
    expect(state.totals.selfSufficiency).toBeLessThanOrEqual(100);
    expect(state.alarms.length).toBeGreaterThanOrEqual(7);
    for (const alarm of state.alarms) {
      expect(['critical', 'warning', 'info']).toContain(alarm.severity);
      expect(alarm.messageKey.startsWith('_BESS_ALARM_M')).toBe(true);
    }
  });

  it('balances power at every point of the day', () => {
    const series = getDaySeries();
    expect(series).toHaveLength(72);
    expect(getDaySeries(30)).toHaveLength(48);
    expect(series[0].minute).toBe(0);
    for (const p of series) {
      expect(Math.abs(p.pvKw + p.batteryKw + p.gridKw - p.loadKw)).toBeLessThan(1e-6);
      expect(p.socPercent).toBeGreaterThanOrEqual(0);
      expect(p.socPercent).toBeLessThanOrEqual(100);
    }
  });

  it('splits exchange into elapsed and future hours', () => {
    const now = getHourlyExchange(0);
    expect(now).toHaveLength(24);
    expect(now[0].elapsed).toBe(true);
    expect(now[1].elapsed).toBe(false);
    expect(getHourlyExchange(1380).every((h) => h.elapsed)).toBe(true);
    for (const h of now) {
      expect(h.importKwh).toBeGreaterThanOrEqual(0);
      expect(h.exportKwh).toBeGreaterThanOrEqual(0);
      expect(h.pvKwh).toBeGreaterThanOrEqual(0);
      expect(h.evKwh).toBeGreaterThanOrEqual(0);
    }
    expect(getHourlyExchange(720).map((h) => h.hour)).toEqual(Array.from({ length: 24 }, (_, hour) => hour));
  });
});
