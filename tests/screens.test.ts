// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { INITIAL_CALLS, OPEN_HOUR_BARS, WAVEFORM_HEIGHTS } from '../src/pages/Calls/callsData';
import { GUIDE_CATEGORIES, POPULAR_ARTICLES, SYSTEM_SERVICES } from '../src/pages/Help/helpData';
import { FOCUS_METRICS, INITIAL_ALERTS, INITIAL_INSIGHTS, WHAT_CHANGED } from '../src/pages/Insights/insightsData';
import {
  CYCLE_TIME_BARS,
  ENRICHMENT_MATRIX_COLS,
  ENRICHMENT_TODAY_COL,
  INITIAL_WORKFLOW_STEPS,
  PRODUCTS_CATALOG,
  buildEnrichmentMatrix,
} from '../src/pages/Products/productsData';
import { INITIAL_PROJECT_TASKS, STATUS_GROUP_META } from '../src/pages/Projects/projectsData';

describe('screen data contracts', () => {
  it('builds a 6x32 enrichment dot matrix with projected columns after Today', () => {
    const weekMatrix = buildEnrichmentMatrix('week');
    expect(weekMatrix).toHaveLength(6);
    expect(weekMatrix[0]).toHaveLength(ENRICHMENT_MATRIX_COLS);
    expect(weekMatrix[0][ENRICHMENT_TODAY_COL + 1]).toBe('projected');
    expect(PRODUCTS_CATALOG.length).toBeGreaterThanOrEqual(2);
    expect(CYCLE_TIME_BARS).toHaveLength(24);
    expect(INITIAL_WORKFLOW_STEPS).toHaveLength(7);
  });

  it('provides insights, focus metrics, deltas and alert rules', () => {
    expect(INITIAL_INSIGHTS).toHaveLength(5);
    expect(FOCUS_METRICS).toHaveLength(3);
    expect(WHAT_CHANGED).toHaveLength(5);
    expect(INITIAL_ALERTS).toHaveLength(3);
  });

  it('provides call history records, hourly bars and audio waveform', () => {
    expect(INITIAL_CALLS).toHaveLength(10);
    expect(OPEN_HOUR_BARS.length).toBeGreaterThan(0);
    expect(WAVEFORM_HEIGHTS).toHaveLength(44);
  });

  it('provides help categories, popular articles and 30-day uptime bars', () => {
    expect(GUIDE_CATEGORIES).toHaveLength(3);
    expect(POPULAR_ARTICLES).toHaveLength(5);
    expect(SYSTEM_SERVICES).toHaveLength(4);
    expect(SYSTEM_SERVICES.every((s) => s.bars.length === 28)).toBe(true);
  });

  it('provides project tasks across all three status groups and DAT-145 subtasks', () => {
    expect(Object.keys(STATUS_GROUP_META)).toEqual(['in-progress', 'review', 'backlog']);
    const dat145 = INITIAL_PROJECT_TASKS.find((t) => t.code === 'DAT-145');
    expect(dat145).toBeDefined();
    expect(dat145?.subtasks).toHaveLength(5);
    expect(dat145?.subtasks.filter((s) => s.done)).toHaveLength(2);
  });
});
