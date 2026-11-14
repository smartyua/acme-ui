import {
  PACKET_OPS,
  TOPOLOGY_EDGES,
  TOPOLOGY_NODE_MAP,
  WORKER_NODES,
  WORKER_STATUS_POOL,
  type PacketOp,
  type TopologyEdge,
  type WorkerStatus,
} from './topologyData';

type Point = { x: number; y: number };

/** Measured size of the wiring canvas (px) and the centre line of every worker row inside it. */
export type TopologyGeometry = { width: number; height: number; rowYs: number[] };

/** Hub → lane → worker: a horizontal run, a vertical lane and a horizontal run into the row. */
export type EdgeLine = { x1: number; y1: number; laneX: number; y2: number; x2: number };

/** Distance from the hub centre to where connectors start (hub icon radius + gap), px. */
const HUB_CLEARANCE = 30;

export const getEdgeLine = (edge: TopologyEdge, geometry: TopologyGeometry): EdgeLine | null => {
  const worker = TOPOLOGY_NODE_MAP[edge.to];
  const y2 = geometry.rowYs[worker.index];
  if (y2 === undefined || geometry.width === 0) return null;
  const centerX = geometry.width / 2;
  const left = worker.group === 'adbreak';
  const x1 = left ? centerX - HUB_CLEARANCE : centerX + HUB_CLEARANCE;
  const x2 = left ? 0 : geometry.width;
  return { x1, y1: geometry.height / 2, laneX: (x1 + x2) / 2, y2, x2 };
};

/** SVG path for a connector with rounded corners where it enters and leaves the lane. */
export const edgePath = ({ x1, y1, laneX, y2, x2 }: EdgeLine, r = 10): string => {
  const dx1 = Math.sign(laneX - x1) || 1;
  const dx2 = Math.sign(x2 - laneX) || 1;
  const dy = Math.sign(y2 - y1) || 1;
  const v = Math.abs(y2 - y1);
  const ra = Math.min(r, Math.abs(laneX - x1) * 0.85, v * 0.45);
  const rb = Math.min(r, Math.abs(x2 - laneX) * 0.85, v * 0.45);

  if (v < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;

  return [
    `M ${x1} ${y1}`,
    `L ${laneX - ra * dx1} ${y1}`,
    `Q ${laneX} ${y1} ${laneX} ${y1 + ra * dy}`,
    `L ${laneX} ${y2 - rb * dy}`,
    `Q ${laneX} ${y2} ${laneX + rb * dx2} ${y2}`,
    `L ${x2} ${y2}`,
  ].join(' ');
};

/** Position at `t` (0 = hub, 1 = worker) along a connector. */
export const pointOnEdge = ({ x1, y1, laneX, y2, x2 }: EdgeLine, t: number): Point => {
  const s1 = Math.abs(laneX - x1);
  const s2 = Math.abs(y2 - y1);
  const s3 = Math.abs(x2 - laneX);
  const d = t * (s1 + s2 + s3);
  if (d <= s1) return { x: x1 + (laneX - x1) * (s1 === 0 ? 0 : d / s1), y: y1 };
  if (d <= s1 + s2) return { x: laneX, y: y1 + (y2 - y1) * (s2 === 0 ? 0 : (d - s1) / s2) };
  return { x: laneX + (x2 - laneX) * (s3 === 0 ? 0 : (d - s1 - s2) / s3), y: y2 };
};

const rand = (lo: number, hi: number, next: () => number = Math.random) => lo + next() * (hi - lo);

const randOf = <T>(arr: readonly T[], next: () => number = Math.random): T =>
  arr[Math.floor(next() * arr.length)];

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type WorkerMetrics = {
  read: number;
  write: number;
  total: number;
};

export type WorkerState = {
  status: Record<string, WorkerStatus>;
  metrics: Record<string, WorkerMetrics>;
};

/** The same starting picture on every load, so the first paint (and its screenshot) is stable. */
export const initialWorkerState = (): WorkerState => {
  const next = mulberry32(0x70b0);
  const state: WorkerState = { status: {}, metrics: {} };
  WORKER_NODES.forEach(({ id }) => {
    state.status[id] = randOf(WORKER_STATUS_POOL, next);
    state.metrics[id] = { read: rand(2, 48, next), write: rand(1, 28, next), total: rand(0.08, 9.4, next) };
  });
  return state;
};

export const nextWorkerStatus = (prev: Record<string, WorkerStatus>): Record<string, WorkerStatus> => {
  const next = { ...prev };
  WORKER_NODES.forEach(({ id }) => {
    if (Math.random() < 0.2) next[id] = randOf(WORKER_STATUS_POOL);
  });
  return next;
};

export const nextWorkerMetrics = (
  prev: Record<string, WorkerMetrics>,
  status: Record<string, WorkerStatus>,
): Record<string, WorkerMetrics> => {
  const next = { ...prev };
  WORKER_NODES.forEach(({ id }) => {
    const m = prev[id];
    const st = status[id] ?? 'idle';
    const factor = st === 'idle' ? 0.08 : st === 'busy' ? 1.0 : 0.45;
    next[id] = {
      read: Math.max(0.1, m.read + rand(-4, 4) * factor),
      write: Math.max(0.1, m.write + rand(-2.5, 2.5) * factor),
      total: m.total + rand(0.0008, 0.006) * factor,
    };
  });
  return next;
};

export type TopologyPacket = {
  id: number;
  edgeId: string;
  progress: number;
  speed: number;
  op: PacketOp;
  size: string;
  rate: string;
  reverse: boolean;
};

let packetId = 0;

export const spawnPacket = (
  edge: TopologyEdge,
  workerStatus: Record<string, WorkerStatus>,
): TopologyPacket | null => {
  const status = workerStatus[edge.to] ?? 'idle';
  if (status === 'idle' && Math.random() < 0.7) return null;
  const reverse = Math.random() < 0.35;
  return {
    id: packetId++,
    edgeId: edge.id,
    progress: reverse ? 1 : 0,
    speed: rand(0.1, 0.3) * (reverse ? -1 : 1),
    op: randOf(PACKET_OPS),
    size: `${rand(1, 999).toFixed(0)} KB`,
    rate: `${randOf(['0.4', '1.2', '2.8', '5.5', '11', '22', '48', '95'])} MB/s`,
    reverse,
  };
};

export const randomEdge = (): TopologyEdge => randOf(TOPOLOGY_EDGES);

export const formatSpeed = (value: number): string =>
  value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2);

export const formatTotal = (value: number): string =>
  value >= 1 ? `${value.toFixed(2)} TB` : `${(value * 1024).toFixed(1)} GB`;
