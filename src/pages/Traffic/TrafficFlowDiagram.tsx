import { Cloud, Database, Globe, HardDrive, Layers, Server, type LucideIcon } from 'lucide-react';

import { HEALTH_META, TRAFFIC_FLOW_NODES, type FlowNodeId } from '../../content/insights';
import styles from './Traffic.module.scss';

const BACKEND: FlowNodeId[] = ['services', 'cache', 'database'];

const NODE_ICON: Record<FlowNodeId, LucideIcon> = {
  users: Globe,
  edge: Cloud,
  lb: Layers,
  services: Server,
  cache: HardDrive,
  database: Database,
};

const getNode = (id: FlowNodeId) => TRAFFIC_FLOW_NODES.find((node) => node.id === id);

const FlowNode = ({ id }: { id: FlowNodeId }) => {
  const node = getNode(id);
  if (!node) return null;
  const Icon = NODE_ICON[id];
  const status = HEALTH_META[node.status].label;

  return (
    <article className={styles.node} aria-label={`${node.label}: ${status}. Throughput ${node.throughput}. Latency ${node.latency}.`}>
      <div className={styles.nodeTop}>
        <span className={styles.nodeIcon} aria-hidden>
          <Icon size={15} aria-hidden />
        </span>
        <span className={styles.nodeStatus} data-status={node.status}>
          <i aria-hidden />
          {status}
        </span>
      </div>
      <h3 className={styles.nodeTitle}>{node.label}</h3>
      <p className={styles.nodeSubtitle}>{node.subtitle}</p>
      <dl className={styles.nodeMetrics}>
        <div>
          <dt>Throughput</dt>
          <dd>{node.throughput}</dd>
        </div>
        <div>
          <dt>Latency</dt>
          <dd>{node.latency}</dd>
        </div>
      </dl>
    </article>
  );
};

const Connector = ({ label, down }: { label?: string; down?: boolean }) => (
  <div className={down ? `${styles.connector} ${styles.connectorDown}` : styles.connector} aria-hidden>
    <svg viewBox="0 0 100 24" preserveAspectRatio="none">
      <line className={styles.line} x1="0" y1="12" x2="100" y2="12" />
    </svg>
    {label ? <span className={styles.connectorLabel}>{label}</span> : null}
  </div>
);

export const TrafficFlowDiagram = ({ paused = false }: { paused?: boolean }) => (
  <figure className={styles.diagram} data-paused={paused} aria-labelledby="traffic-flow-caption">
    <div className={styles.pipeline}>
      <div className={styles.mainTrack}>
        <FlowNode id="users" />
        <Connector label={getNode('edge')?.latency} />
        <FlowNode id="edge" />
        <Connector label={getNode('lb')?.latency} />
        <FlowNode id="lb" />
      </div>

      <Connector down label={getNode('services')?.latency} />

      <span className={styles.backendLabel} id="traffic-backend-label">
        Backend layer
      </span>
      <div className={styles.backendTrack} role="group" aria-labelledby="traffic-backend-label">
        {BACKEND.map((id, index) => (
          <div key={id} className={styles.backendItem}>
            {index > 0 ? <Connector /> : null}
            <FlowNode id={id} />
          </div>
        ))}
      </div>
    </div>

    <figcaption id="traffic-flow-caption" className={styles.caption}>
      Request path from users through the edge CDN and load balancer to application services, cache and database. Status labels
      describe node health.
    </figcaption>
  </figure>
);
