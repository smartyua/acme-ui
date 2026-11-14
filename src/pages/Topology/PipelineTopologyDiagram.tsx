import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Clapperboard, Cog, Server, type LucideIcon } from 'lucide-react';

import { Badge, Panel } from '../../components/ui';
import { cn } from '../../lib/cn';
import s from '../pages.module.scss';

import {
  PACKET_OPS,
  SERVER_NODE,
  STATUS_LABELS,
  STATUS_TONES,
  TOPOLOGY_EDGES,
  TOPOLOGY_GROUPS,
  TOPOLOGY_NODE_MAP,
  WORKERS_PER_GROUP,
  WORKER_NODES,
  type NodeGroup,
  type PacketOpType,
  type WorkerStatus,
} from './topologyData';
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
  type TopologyGeometry,
  type TopologyPacket,
} from './topologyUtils';
import styles from './TopologyPage.module.scss';

const TIP_ID = 'topology-node-tip';

// Packet colours come from tokens, mapped in TopologyPage.module.scss (DESIGN.md §2).
const PACKET_CLASS: Record<PacketOpType, string> = {
  job: styles.toneJob,
  result: styles.toneResult,
  chunk: styles.toneChunk,
  status: styles.toneStatus,
  ack: styles.toneAck,
  retry: styles.toneRetry,
};

const GROUP_ICONS: Record<NodeGroup, LucideIcon> = { adbreak: Clapperboard, transcode: Cog };

const EDGE_BY_ID = Object.fromEntries(TOPOLOGY_EDGES.map((edge) => [edge.id, edge]));

const flowsOf = (packets: TopologyPacket[], nodeId: string | null): TopologyPacket[] =>
  nodeId
    ? packets.filter((p) => {
        const edge = EDGE_BY_ID[p.edgeId];
        return edge.from === nodeId || edge.to === nodeId;
      })
    : [];

type PacketsLayerProps = {
  running: boolean;
  geometry: TopologyGeometry | null;
  status: Record<string, WorkerStatus>;
  selectedNodeId: string | null;
  onSpawn: () => void;
  onInFlightChange: (count: number) => void;
  onSelectedFlowsChange: (flows: TopologyPacket[]) => void;
};

// Owns the packet simulation and its per-frame state, so only this layer re-renders every frame.
// It keeps simulating without a canvas (phone layout): the counters stay live there too.
const PacketsLayer = ({
  running,
  geometry,
  status,
  selectedNodeId,
  onSpawn,
  onInFlightChange,
  onSelectedFlowsChange,
}: PacketsLayerProps) => {
  const [packets, setPackets] = useState<TopologyPacket[]>([]);
  const packetsRef = useRef<TopologyPacket[]>([]);
  const latest = useRef({ status, selectedNodeId, onSpawn, onInFlightChange, onSelectedFlowsChange });
  const lastInFlight = useRef(0);
  const lastFlowsKey = useRef('');

  useEffect(() => {
    latest.current = { status, selectedNodeId, onSpawn, onInFlightChange, onSelectedFlowsChange };
  });

  const reportFlows = useCallback(() => {
    const flows = flowsOf(packetsRef.current, latest.current.selectedNodeId);
    const key = flows.map((p) => p.id).join(',');
    if (key === lastFlowsKey.current) return;
    lastFlowsKey.current = key;
    latest.current.onSelectedFlowsChange(flows);
  }, []);

  // Also while paused: the detail card of a newly selected node lists the frozen packets.
  useEffect(reportFlows, [reportFlows, selectedNodeId]);

  useEffect(() => {
    if (!running) return undefined;
    let frame = 0;
    let last: number | null = null;
    let sinceSpawn = 0;

    const tick = (ts: number) => {
      const dt = Math.min((ts - (last ?? ts)) / 1000, 0.05);
      last = ts;

      let next = packetsRef.current
        .map((p) => ({ ...p, progress: p.progress + p.speed * dt }))
        .filter((p) => (p.reverse ? p.progress > -0.05 : p.progress < 1.05));

      sinceSpawn += dt;
      if (sinceSpawn > 0.18) {
        sinceSpawn = 0;
        const count = Math.random() < 0.5 ? 2 : 1;
        for (let i = 0; i < count && next.length < 60; i += 1) {
          const packet = spawnPacket(randomEdge(), latest.current.status);
          if (packet) {
            next = [...next, packet];
            latest.current.onSpawn();
          }
        }
      }

      packetsRef.current = next;
      if (next.length !== lastInFlight.current) {
        lastInFlight.current = next.length;
        latest.current.onInFlightChange(next.length);
      }
      reportFlows();
      setPackets(next);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, reportFlows]);

  if (!geometry) return null;

  return (
    <svg
      className={styles.wires}
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      aria-hidden
    >
      {packets.map((packet) => {
        const line = getEdgeLine(EDGE_BY_ID[packet.edgeId], geometry);
        if (!line) return null;
        const { x, y } = pointOnEdge(line, Math.max(0, Math.min(1, packet.progress)));
        return (
          <g key={packet.id} transform={`translate(${x},${y})`} className={PACKET_CLASS[packet.op.type]}>
            <circle r="6" className={styles.packetHalo} />
            <circle r="3" className={styles.packetCore} />
          </g>
        );
      })}
    </svg>
  );
};

type Anchor = { el: HTMLElement; pointer: { x: number; y: number } | null };

export const PipelineTopologyDiagram = ({ running }: { running: boolean }) => {
  const [initial] = useState(initialWorkerState);
  const [status, setStatus] = useState(initial.status);
  const [metrics, setMetrics] = useState(initial.metrics);
  const [inFlight, setInFlight] = useState(0);
  const [totalPackets, setTotalPackets] = useState(0);
  const [flows, setFlows] = useState<TopologyPacket[]>([]);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  const [geometry, setGeometry] = useState<TopologyGeometry | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<Record<string, HTMLElement | null>>({});
  const anchorRef = useRef<Anchor | null>(null);
  const wasOpen = useRef(false);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // "Pause" freezes the whole picture: statuses, throughput and packets.
  useEffect(() => {
    if (!running) return undefined;
    const statusTimer = window.setInterval(() => setStatus(nextWorkerStatus), 1800);
    const metricsTimer = window.setInterval(
      () => setMetrics((prev) => nextWorkerMetrics(prev, statusRef.current)),
      1300,
    );
    return () => {
      window.clearInterval(statusTimer);
      window.clearInterval(metricsTimer);
    };
  }, [running]);

  // Connectors are drawn in real pixels between the hub and the measured centre of every row.
  // On phones the hub sits above the lists, the rows fall outside the canvas and nothing is drawn.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const measure = () => {
      const box = canvas.getBoundingClientRect();
      const rowYs = WORKER_NODES.filter((node) => node.group === 'adbreak').map((node) => {
        const row = nodeEls.current[node.id]?.getBoundingClientRect();
        return row ? Math.round(row.top + row.height / 2 - box.top) : -1;
      });
      const wired = box.width > 0 && rowYs.every((y) => y >= 0 && y <= box.height);
      const next = wired ? { width: Math.round(box.width), height: Math.round(box.height), rowYs } : null;
      setGeometry((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const tipNodeId = hoverNode ?? focusNode;
  const tipNode = tipNodeId ? TOPOLOGY_NODE_MAP[tipNodeId] : null;

  // The detail card follows the pointer; for keyboard and touch it sits beside the node, or
  // below it when there is no room at the side (DESIGN.md §4).
  const placeTip = useCallback(() => {
    const tip = tipRef.current;
    const anchor = anchorRef.current;
    if (!tip || !anchor) return;
    const edge = 8;
    const { width, height } = tip.getBoundingClientRect();
    const maxLeft = window.innerWidth - edge - width;
    const maxTop = window.innerHeight - edge - height;
    let left: number;
    let top: number;
    if (anchor.pointer) {
      left = anchor.pointer.x + 16;
      if (left > maxLeft) left = anchor.pointer.x - 16 - width;
      top = anchor.pointer.y + 16;
    } else {
      const box = anchor.el.getBoundingClientRect();
      const right = box.right + edge;
      const before = box.left - edge - width;
      const preferRight = box.left + box.width / 2 < window.innerWidth / 2;
      const side = [preferRight ? right : before, preferRight ? before : right].find(
        (x) => x >= edge && x <= maxLeft,
      );
      if (side === undefined) {
        left = box.left;
        top = box.bottom + edge > maxTop ? box.top - edge - height : box.bottom + edge;
      } else {
        left = side;
        top = box.top;
      }
    }
    tip.style.left = `${Math.max(edge, Math.min(left, maxLeft))}px`;
    tip.style.top = `${Math.max(edge, Math.min(top, maxTop))}px`;
  }, []);

  useLayoutEffect(placeTip);

  useEffect(() => {
    if (!tipNodeId) return undefined;
    window.addEventListener('scroll', placeTip, true);
    window.addEventListener('resize', placeTip);
    return () => {
      window.removeEventListener('scroll', placeTip, true);
      window.removeEventListener('resize', placeTip);
    };
  }, [tipNodeId, placeTip]);

  // Every node button carries its id in `data-node`; the handlers below read it from the event.
  const registerNode = (el: HTMLButtonElement | null) => {
    if (el?.dataset.node) nodeEls.current[el.dataset.node] = el;
  };

  const handlePointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    anchorRef.current = { el: e.currentTarget, pointer: { x: e.clientX, y: e.clientY } };
    setHoverNode(e.currentTarget.dataset.node ?? null);
  };

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    anchorRef.current = { el: e.currentTarget, pointer: { x: e.clientX, y: e.clientY } };
    placeTip();
  };

  const handlePointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    const focused = focusNode ? nodeEls.current[focusNode] : null;
    anchorRef.current = focused ? { el: focused, pointer: null } : null;
    setHoverNode(null);
  };

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    wasOpen.current = focusNode === e.currentTarget.dataset.node;
  };

  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    if (!hoverNode) anchorRef.current = { el: e.currentTarget, pointer: null };
    setFocusNode(e.currentTarget.dataset.node ?? null);
  };

  const handleBlur = (e: FocusEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.node;
    setFocusNode((prev) => (prev === id ? null : prev));
  };

  // Click or tap pins the card to the node (Safari does not focus buttons on click).
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.node ?? null;
    const open = e.detail === 0 ? focusNode === id : wasOpen.current;
    if (open) {
      setFocusNode(null);
      return;
    }
    e.currentTarget.focus();
    if (!hoverNode) anchorRef.current = { el: e.currentTarget, pointer: null };
    setFocusNode(id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') setFocusNode(null);
  };

  const activeIn = (group: NodeGroup) =>
    WORKER_NODES.filter((node) => node.group === group && status[node.id] !== 'idle').length;

  const tipStatus = tipNode?.group ? status[tipNode.id] : null;
  const tipMetrics = tipNode?.group ? metrics[tipNode.id] : null;

  return (
    <>
      <div className={cn(s.kpis, styles.kpis)}>
        {TOPOLOGY_GROUPS.map((group) => (
          <div key={group.id} className={s.stat}>
            <span className={s.statLabel}>{group.stat}</span>
            <span className={s.statValue}>
              {activeIn(group.id)}
              <span className={styles.statOf}> / {WORKERS_PER_GROUP}</span>
            </span>
          </div>
        ))}
        <div className={s.stat}>
          <span className={s.statLabel}>Packets sent</span>
          <span className={s.statValue}>{totalPackets.toLocaleString('en-US')}</span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>In flight</span>
          <span className={s.statValue}>{inFlight}</span>
        </div>
      </div>

      <Panel>
        <div className={styles.diagram} data-paused={!running}>
          <div className={styles.canvas} ref={canvasRef}>
            {geometry ? (
              <svg
                className={styles.wires}
                width={geometry.width}
                height={geometry.height}
                viewBox={`0 0 ${geometry.width} ${geometry.height}`}
                aria-hidden
              >
                {TOPOLOGY_EDGES.map((edge) => {
                  const line = getEdgeLine(edge, geometry);
                  if (!line) return null;
                  const d = edgePath(line);
                  const active = status[edge.to] !== 'idle';
                  const selected = tipNodeId === edge.to || tipNodeId === SERVER_NODE.id;
                  return (
                    <g key={edge.id}>
                      <path
                        d={d}
                        className={cn(
                          styles.wire,
                          active && styles.wireActive,
                          selected && styles.wireSelected,
                        )}
                      />
                      {active ? <path d={d} className={styles.wireFlow} /> : null}
                    </g>
                  );
                })}
              </svg>
            ) : null}
            <PacketsLayer
              running={running}
              geometry={geometry}
              status={status}
              selectedNodeId={tipNodeId}
              onSpawn={() => setTotalPackets((prev) => prev + 1)}
              onInFlightChange={setInFlight}
              onSelectedFlowsChange={setFlows}
            />
            <button
              type="button"
              className={cn(styles.hub, tipNodeId === SERVER_NODE.id && styles.hubSelected)}
              data-node={SERVER_NODE.id}
              ref={registerNode}
              aria-describedby={tipNodeId === SERVER_NODE.id ? TIP_ID : undefined}
              onPointerEnter={handlePointerEnter}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onPointerDown={handlePointerDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
            >
              <span className={styles.hubIcon} aria-hidden>
                <Server size={20} />
              </span>
              <span className={styles.hubText}>
                <span className={styles.hubName}>{SERVER_NODE.label}</span>
                <span className={styles.hubSub}>{SERVER_NODE.kind}</span>
              </span>
            </button>
          </div>

          {TOPOLOGY_GROUPS.map((group) => {
            const Icon = GROUP_ICONS[group.id];
            return (
              <section
                key={group.id}
                className={styles.group}
                data-group={group.id}
                aria-labelledby={`topology-${group.id}`}
              >
                <h2 id={`topology-${group.id}`} className={styles.groupTitle}>
                  {group.title}
                </h2>
                <ul className={styles.workers}>
                  {WORKER_NODES.filter((node) => node.group === group.id).map((node) => (
                    <li key={node.id}>
                      <button
                        type="button"
                        className={cn(styles.worker, tipNodeId === node.id && styles.workerSelected)}
                        data-node={node.id}
                        ref={registerNode}
                        aria-describedby={tipNodeId === node.id ? TIP_ID : undefined}
                        onPointerEnter={handlePointerEnter}
                        onPointerMove={handlePointerMove}
                        onPointerLeave={handlePointerLeave}
                        onPointerDown={handlePointerDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onClick={handleClick}
                        onKeyDown={handleKeyDown}
                      >
                        <span className={styles.workerIcon} aria-hidden>
                          <Icon size={16} />
                        </span>
                        <span className={styles.workerName}>{node.label}</span>
                        <Badge tone={STATUS_TONES[status[node.id]]} className={styles.workerStatus}>
                          {STATUS_LABELS[status[node.id]]}
                        </Badge>
                        <span className={styles.workerMeta}>
                          <span className={styles.workerRates}>
                            <abbr title="Read">R</abbr> {formatSpeed(metrics[node.id].read)} ·{' '}
                            <abbr title="Write">W</abbr> {formatSpeed(metrics[node.id].write)} MB/s
                          </span>
                          <span className={styles.workerTotal}>{formatTotal(metrics[node.id].total)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <footer className={styles.legend}>
          <span className={styles.legendTitle}>Packets</span>
          <ul className={styles.legendItems}>
            {PACKET_OPS.map((op) => (
              <li key={op.type} className={cn(styles.legendItem, PACKET_CLASS[op.type])}>
                <i aria-hidden />
                {op.label}
              </li>
            ))}
          </ul>
          <span className={styles.legendHint}>Hover or select a node for details</span>
        </footer>
      </Panel>

      {tipNode
        ? createPortal(
            <div ref={tipRef} id={TIP_ID} role="tooltip" className={styles.tip}>
              <div className={styles.tipHead}>
                <strong>{tipNode.label}</strong>
                {tipStatus ? <Badge tone={STATUS_TONES[tipStatus]}>{STATUS_LABELS[tipStatus]}</Badge> : null}
              </div>
              <p className={styles.tipKind}>{tipNode.kind}</p>
              {tipMetrics ? (
                <div className={styles.tipSection}>
                  {(
                    [
                      ['Read', tipMetrics.read, 50, styles.barRead],
                      ['Write', tipMetrics.write, 30, styles.barWrite],
                    ] as const
                  ).map(([label, value, max, tone]) => (
                    <div key={label} className={styles.tipMetric}>
                      <span className={styles.tipRow}>
                        <span>{label}</span>
                        <b>{formatSpeed(value)} MB/s</b>
                      </span>
                      <span className={styles.bar}>
                        <i className={tone} style={{ width: `${Math.min(value / max, 1) * 100}%` }} />
                      </span>
                    </div>
                  ))}
                  <span className={styles.tipRow}>
                    <span>Total today</span>
                    <b>{formatTotal(tipMetrics.total)}</b>
                  </span>
                </div>
              ) : null}
              <div className={styles.tipSection}>
                <span className={styles.tipRow}>
                  <span>Packets in flight</span>
                  <b>{flows.length}</b>
                </span>
                {flows.slice(0, 4).map((packet) => (
                  <span key={packet.id} className={cn(styles.tipFlow, PACKET_CLASS[packet.op.type])}>
                    <i aria-hidden />
                    {packet.op.label} · {packet.size} · {packet.rate}
                  </span>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
