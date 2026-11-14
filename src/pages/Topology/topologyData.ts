export type WorkerStatus = 'busy' | 'processing' | 'idle' | 'error';

export type NodeGroup = 'adbreak' | 'transcode';

export type NodeType = 'server' | NodeGroup;

export type TopologyNode = {
  id: string;
  label: string;
  /** What the node is, as shown in its detail card. */
  kind: string;
  type: NodeType;
  group?: NodeGroup;
  /** Row of a worker inside its group, top to bottom. */
  index: number;
};

export type TopologyEdge = {
  id: string;
  from: string;
  to: string;
};

export type PacketOpType = 'job' | 'result' | 'chunk' | 'status' | 'ack' | 'retry';

export type PacketOp = {
  type: PacketOpType;
  label: string;
};

export const PACKET_OPS: PacketOp[] = [
  { type: 'job', label: 'Job' },
  { type: 'result', label: 'Result' },
  { type: 'chunk', label: 'Chunk' },
  { type: 'status', label: 'Status' },
  { type: 'ack', label: 'Ack' },
  { type: 'retry', label: 'Retry' },
];

export const WORKERS_PER_GROUP = 6;

export const TOPOLOGY_GROUPS: Array<{
  id: NodeGroup;
  title: string;
  /** KPI tile label. */
  stat: string;
  kind: string;
  prefix: string;
  label: string;
}> = [
  {
    id: 'adbreak',
    title: 'Ad-break workers',
    stat: 'Ad-break active',
    kind: 'Ad-break worker',
    prefix: 'ab',
    label: 'Ad-Break',
  },
  {
    id: 'transcode',
    title: 'Transcode workers',
    stat: 'Transcode active',
    kind: 'Transcode worker',
    prefix: 'tc',
    label: 'Transcode',
  },
];

export const SERVER_NODE: TopologyNode = {
  id: 'server',
  label: 'Main server',
  kind: 'Media pipeline hub',
  type: 'server',
  index: 0,
};

export const WORKER_NODES: TopologyNode[] = TOPOLOGY_GROUPS.flatMap((group) =>
  Array.from({ length: WORKERS_PER_GROUP }, (_, index) => ({
    id: `${group.prefix}${index + 1}`,
    label: `${group.label} #${index + 1}`,
    kind: group.kind,
    type: group.id,
    group: group.id,
    index,
  })),
);

export const TOPOLOGY_NODES: TopologyNode[] = [SERVER_NODE, ...WORKER_NODES];

export const TOPOLOGY_EDGES: TopologyEdge[] = WORKER_NODES.map((node) => ({
  id: `e${node.id}`,
  from: SERVER_NODE.id,
  to: node.id,
}));

export const TOPOLOGY_NODE_MAP = Object.fromEntries(TOPOLOGY_NODES.map((n) => [n.id, n])) as Record<
  string,
  TopologyNode
>;

export const STATUS_LABELS: Record<WorkerStatus, string> = {
  busy: 'Busy',
  processing: 'Processing',
  idle: 'Idle',
  error: 'Error',
};

/** Badge tone per status (DESIGN.md §2.3: mint = success, lemon = pending, rose = failed). */
export const STATUS_TONES: Record<WorkerStatus, 'mint' | 'lemon' | 'muted' | 'rose'> = {
  busy: 'mint',
  processing: 'lemon',
  idle: 'muted',
  error: 'rose',
};

export const WORKER_STATUS_POOL: WorkerStatus[] = [
  'busy',
  'busy',
  'busy',
  'processing',
  'processing',
  'idle',
];
