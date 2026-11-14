// Geometry and stochastic helpers that keep the pipeline diagram deterministic across renders.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PACKET_OPS, TOPOLOGY_EDGES, WORKER_NODES, WORKER_STATUS_POOL } from './topologyData';
import {
  edgePath,
  formatSpeed,
  formatTotal,
  getEdgeLine,
  initialWorkerState,
  nextWorkerMetrics,
  nextWorkerStatus,
  pointOnEdge,
  randomEdge,
  spawnPacket,
} from './topologyUtils';

const GEOMETRY = { width: 800, height: 200, rowYs: [20, 50, 80, 110, 140, 170] };
const edgeTo = (to: string) => TOPOLOGY_EDGES.find((e) => e.to === to);

afterEach(() => vi.restoreAllMocks());

describe('connector geometry', () => {
  it('routes hub to worker through the lane', () => {
    expect(getEdgeLine(edgeTo('ab1') as never, GEOMETRY)).toEqual({ x1: 370, y1: 100, laneX: 185, y2: 20, x2: 0 });
    expect(getEdgeLine(edgeTo('tc1') as never, GEOMETRY)).toEqual({ x1: 430, y1: 100, laneX: 615, y2: 20, x2: 800 });
    expect(getEdgeLine(edgeTo('ab1') as never, { width: 0, height: 200, rowYs: GEOMETRY.rowYs })).toBeNull();
    expect(getEdgeLine(edgeTo('ab6') as never, { width: 800, height: 200, rowYs: [20, 50, 80, 110, 140] })).toBeNull();
  });

  it('draws rounded corners and falls back to a straight line', () => {
    expect(edgePath({ x1: 0, y1: 100, laneX: 400, y2: 100, x2: 800 })).toBe('M 0 100 L 800 100');
    const path = edgePath({ x1: 370, y1: 100, laneX: 185, y2: 20, x2: 0 });
    expect(path.startsWith('M 370 100')).toBe(true);
    expect(path.includes('NaN')).toBe(false);
  });

  it('walks packets along the connector from hub to worker', () => {
    const line = { x1: 370, y1: 100, laneX: 185, y2: 20, x2: 0 };
    expect(pointOnEdge(line, 0)).toEqual({ x: 370, y: 100 });
    expect(pointOnEdge(line, 0.5)).toEqual({ x: 185, y: 60 });
    expect(pointOnEdge(line, 1)).toEqual({ x: 0, y: 20 });
  });
});

describe('worker state model', () => {
  it('rebuilds the same seed state on every call', () => {
    expect(initialWorkerState()).toEqual(initialWorkerState());
    const state = initialWorkerState();
    expect(Object.keys(state.status)).toHaveLength(12);
    for (const id of WORKER_NODES.map((n) => n.id)) {
      expect(WORKER_STATUS_POOL).toContain(state.status[id]);
      expect(state.metrics[id].read).toBeGreaterThanOrEqual(2);
      expect(state.metrics[id].read).toBeLessThan(48);
      expect(state.metrics[id].write).toBeGreaterThanOrEqual(1);
      expect(state.metrics[id].total).toBeGreaterThan(0);
    }
  });

  it('keeps metrics positive and total bytes growing', () => {
    const state = initialWorkerState();
    const next = nextWorkerMetrics(state.metrics, { ...state.status });
    for (const id of WORKER_NODES.map((n) => n.id)) {
      expect(next[id].read).toBeGreaterThanOrEqual(0.1);
      expect(next[id].write).toBeGreaterThanOrEqual(0.1);
      expect(next[id].total).toBeGreaterThan(state.metrics[id].total);
    }
  });

  it('rolls statuses below the 20% chance only', () => {
    const state = initialWorkerState();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(nextWorkerStatus(state.status)).toEqual(state.status);
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const rolled = nextWorkerStatus(state.status);
    for (const id of WORKER_NODES.map((n) => n.id)) expect(WORKER_STATUS_POOL).toContain(rolled[id]);
  });
});

describe('packets and formatting', () => {
  it('does not spawn packets for idle workers on most ticks', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2);
    expect(spawnPacket(TOPOLOGY_EDGES[0], {})).toBeNull();
    vi.spyOn(Math, 'random').mockReturnValue(0.8);
    expect(spawnPacket(TOPOLOGY_EDGES[0], {})).not.toBeNull();
  });

  it('builds forward and reverse packets with stable ids', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8);
    const first = spawnPacket(TOPOLOGY_EDGES[0], {});
    const second = spawnPacket(TOPOLOGY_EDGES[0], {});
    expect(first).not.toBeNull();
    expect(second!.id).toBeGreaterThan(first!.id);
    expect(first!.reverse).toBe(false);
    expect(first!.progress).toBe(0);
    expect(first!.speed).toBeGreaterThan(0);
    expect(first!.speed).toBeLessThan(0.3);
    expect(first!.size).toMatch(/\d+ KB$/);
    expect(first!.rate).toMatch(/ MB\/s$/);
    expect(PACKET_OPS.map((op) => op.type)).toContain(first!.op.type);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const back = spawnPacket(TOPOLOGY_EDGES[0], { ab1: 'busy' });
    expect(back).not.toBeNull();
    expect(back!.reverse).toBe(true);
    expect(back!.progress).toBe(1);
    expect(back!.speed).toBeLessThan(0);
  });

  it('picks edges and formats numbers', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(randomEdge()).toEqual(TOPOLOGY_EDGES[0]);
    expect(formatSpeed(100)).toBe('100');
    expect(formatSpeed(50)).toBe('50.0');
    expect(formatSpeed(5)).toBe('5.00');
    expect(formatTotal(1)).toBe('1.00 TB');
    expect(formatTotal(0.5)).toBe('512.0 GB');
  });
});
