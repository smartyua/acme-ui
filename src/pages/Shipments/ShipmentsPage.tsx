import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CircleCheck,
  Clock,
  Download,
  LayoutGrid,
  Map,
  Package,
  ShieldCheck,
  Thermometer,
  Timer,
  Truck,
  Warehouse,
} from 'lucide-react';

import { EventTimeline } from '../../components/EventTimeline';
import { JourneyBar, type JourneySegment } from '../../components/JourneyBar';
import { MetricStrip, type MetricItem } from '../../components/MetricStrip';
import { PropertyList, PropertyRow } from '../../components/PropertyList';
import { RouteMap } from '../../components/RouteMap';
import { ThresholdChart } from '../../components/ThresholdChart';
import { Count, Segmented } from '../../components/primitives';
import { Button, Meter, Panel, cx } from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import styles from './Shipments.module.scss';
import {
  EVENT_SEGMENT_POSITION,
  EXCURSION_RANGE,
  ROUTE_LANDMARKS,
  ROUTE_SEGMENTS,
  ROUTE_TIMELINE_EVENTS,
  ROUTE_WAYPOINTS,
  TEMPERATURE_READINGS,
  TEMPERATURE_X_TICKS,
} from './shipmentsData';

type PageTab = 'overview' | 'route';
type RouteMode = 'route' | 'temperature';

const TEMPERATURE_METRICS: MetricItem[] = [
  {
    id: 'peak',
    label: 'Peak',
    icon: <Thermometer size={14} aria-hidden />,
    value: '10.2 °C',
    detail: 'at 11:00',
    tone: 'danger',
  },
  {
    id: 'over-limit',
    label: 'Over the limit',
    icon: <ArrowUpRight size={14} aria-hidden />,
    value: '+2.2 °C',
    detail: 'limit 8 °C',
    tone: 'danger',
  },
  {
    id: 'out-of-range',
    label: 'Out of range',
    icon: <Timer size={14} aria-hidden />,
    value: '1 h 10 min',
    detail: '10:25 to 11:35',
  },
  {
    id: 'at-delivery',
    label: 'At delivery',
    icon: <CircleCheck size={14} aria-hidden />,
    value: '5.6 °C',
    detail: 'back in range',
  },
];

const ROUTE_METRICS: MetricItem[] = [
  {
    id: 'distance',
    label: 'Distance',
    icon: <Map size={14} aria-hidden />,
    value: '136 km',
    detail: 'by road',
  },
  {
    id: 'on-road',
    label: 'On the road',
    icon: <Truck size={14} aria-hidden />,
    value: '5 h 5 min',
    detail: '07:05 to 12:10',
  },
  {
    id: 'route-out',
    label: 'Out of range',
    icon: <Thermometer size={14} aria-hidden />,
    value: '1 h 10 min',
    detail: '23% of the trip',
  },
  {
    id: 'waiting',
    label: 'Waiting',
    icon: <Clock size={14} aria-hidden />,
    value: '2 h 10 min',
    detail: 'since 12:10',
  },
];

export const ShipmentsPage = () => {
  const { toast } = useApp();
  const [pageTab, setPageTab] = useState<PageTab>('route');
  const [routeMode, setRouteMode] = useState<RouteMode>('temperature');
  const [activeEventId, setActiveEventId] = useState<string>('peak');
  const [selectedReadingIdx, setSelectedReadingIdx] = useState<number | null>(null);

  const activePos = EVENT_SEGMENT_POSITION[activeEventId] ?? EVENT_SEGMENT_POSITION.peak;

  const journeySegments: JourneySegment[] = [
    {
      id: 'before',
      weight: 66,
      tone: 'success',
      label: 'In range 07:05 to 10:25',
      markerPct:
        routeMode === 'route' && activePos.segmentId === 'before' ? activePos.pct : undefined,
      onClick: () => {
        setRouteMode('route');
        setActiveEventId('departed');
      },
    },
    {
      id: 'excursion',
      weight: 23,
      tone: 'danger',
      label: '1 h 10 min above 8 °C',
      pill:
        routeMode === 'temperature'
          ? { icon: <Thermometer size={14} aria-hidden />, text: '1 h 10 min' }
          : undefined,
      markerPct:
        routeMode === 'route' && activePos.segmentId === 'excursion' ? activePos.pct : undefined,
      onClick: () => {
        if (routeMode === 'temperature') {
          setRouteMode('route');
          setActiveEventId('peak');
          toast({ title: 'Opened route excursion', description: 'Peak 10.2 °C at 11:00 near Antwerp.' });
        } else {
          setRouteMode('temperature');
        }
      },
    },
    {
      id: 'after',
      weight: 11,
      tone: 'success',
      label: 'Back in range 11:35 to 12:10',
      markerPct:
        routeMode === 'route' && activePos.segmentId === 'after' ? activePos.pct : undefined,
      onClick: () => {
        setRouteMode('route');
        setActiveEventId('delivered');
      },
    },
  ];

  return (
    <Page>
      <div className={styles.pageStack}>
        {/* ── Shipment header ───────────────────────────────────────────── */}
        <header className={styles.headerRow}>
          <div className={styles.heading}>
            <div className={styles.titleLine}>
              <span className={styles.statusBar} aria-hidden />
              <h1>VEN-26-1946</h1>
              <Count tone="lemon" value="Excursion" />
            </div>
            <p className={styles.lead}>
              <strong>1 h 10 min</strong> above 8 °C, <strong>6.8 h</strong> of budget left
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              size="sm"
              icon={<Download size={14} aria-hidden />}
              onClick={() =>
                toast({
                  title: 'Telemetry report exported',
                  description: 'VEN-26-1946-cold-chain.csv downloaded.',
                  tone: 'success',
                })
              }
            >
              Export report
            </Button>
          </div>
        </header>

        {/* ── Underline tabs (Overview / Route) ─────────────────────────── */}
        <div className={styles.tabBar} role="tablist" aria-label="Shipment sections">
          <button
            type="button"
            role="tab"
            aria-selected={pageTab === 'overview'}
            className={cx(styles.tabBtn, pageTab === 'overview' && styles.tabBtnActive)}
            onClick={() => setPageTab('overview')}
          >
            <LayoutGrid size={15} aria-hidden />
            Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pageTab === 'route'}
            className={cx(styles.tabBtn, pageTab === 'route' && styles.tabBtnActive)}
            onClick={() => setPageTab('route')}
          >
            <Map size={15} aria-hidden />
            Route
          </button>
        </div>

        {/* ── Route & Temperature telemetry card ────────────────────────── */}
        {pageTab === 'route' ? (
          <Panel
            title="Route"
            description="Venlo DC to Antwerp"
            actions={
              <Segmented<RouteMode>
                label="Route telemetry view"
                size="sm"
                value={routeMode}
                onChange={setRouteMode}
                options={[
                  { value: 'route', label: 'Route', icon: <Map size={14} aria-hidden /> },
                  {
                    value: 'temperature',
                    label: 'Temperature',
                    icon: <Thermometer size={14} aria-hidden />,
                  },
                ]}
              />
            }
          >
            <div className={styles.telemetryPanel}>
              <MetricStrip
                items={routeMode === 'temperature' ? TEMPERATURE_METRICS : ROUTE_METRICS}
              />

              {routeMode === 'temperature' ? (
                <ThresholdChart
                  readings={TEMPERATURE_READINGS}
                  threshold={8}
                  min={3.5}
                  max={11.5}
                  unit="°C"
                  yTicks={[4, 6, 8, 10]}
                  xTicks={TEMPERATURE_X_TICKS}
                  excursionRange={EXCURSION_RANGE}
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
                  selectedIndex={selectedReadingIdx}
                  onSelectReading={(idx) => {
                    setSelectedReadingIdx((prev) => (prev === idx ? null : idx));
                  }}
                  ariaLabel="Temperature readings from 07:05 to 12:10 against 8 °C threshold"
                />
              ) : (
                <div className={styles.routeSplit}>
                  <RouteMap
                    segments={ROUTE_SEGMENTS}
                    waypoints={ROUTE_WAYPOINTS}
                    landmarks={ROUTE_LANDMARKS}
                    activeWaypointId={activeEventId}
                    onSelectWaypoint={setActiveEventId}
                    scaleLabel="25 km"
                    attribution="© OpenStreetMap"
                    ariaLabel="Cold chain route map from Venlo DC to Antwerp"
                  />
                  <EventTimeline
                    events={ROUTE_TIMELINE_EVENTS}
                    activeId={activeEventId}
                    onSelect={setActiveEventId}
                    ariaLabel="Shipment route milestones"
                  />
                </div>
              )}

              <div className={styles.journeyFooter}>
                <JourneyBar
                  origin={{
                    title: 'Venlo DC',
                    detail: (
                      <>
                        Departed <span className={styles.boldTime}>07:05</span>
                      </>
                    ),
                    icon: <Warehouse size={14} aria-hidden />,
                  }}
                  destination={{
                    title: 'Antwerp',
                    detail: (
                      <>
                        Delivered <span className={styles.boldTime}>12:10</span> · held for 2 h 10 min
                      </>
                    ),
                    icon: <Check size={14} aria-hidden />,
                    tone: 'success',
                  }}
                  segments={journeySegments}
                />
              </div>
            </div>
          </Panel>
        ) : (
          /* ── Overview tab ─────────────────────────────────────────────── */
          <div className={styles.overviewGrid}>
            <Panel
              title="Shipment summary"
              description="Cold-chain compliance and thermal excursion budget"
              actions={
                <Button
                  size="sm"
                  onClick={() => {
                    setPageTab('route');
                    setRouteMode('temperature');
                  }}
                >
                  Open telemetry
                </Button>
              }
            >
              <div className={styles.budgetBlock}>
                <div className={styles.budgetHeader}>
                  <span>Thermal budget consumed</span>
                  <strong>1.2 h of 8.0 h (6.8 h left)</strong>
                </div>
                <Meter label="Thermal budget consumed" value={1.2} max={8} tone="accent" />
              </div>
              <p className={styles.overviewNote}>
                One excursion occurred between 10:25 and 11:35 approaching Antwerp (peak 10.2 °C,
                +2.2 °C over the 8 °C limit). Cargo returned to 5.6 °C prior to delivery and remains
                within stability release criteria.
              </p>
              <PropertyList>
                <PropertyRow
                  icon={<Package size={14} aria-hidden />}
                  label="Cargo"
                  value="Biologics · 2–8 °C"
                />
                <PropertyRow
                  icon={<Truck size={14} aria-hidden />}
                  label="Vehicle"
                  value="Refrigerated van · NL-84-KR"
                />
                <PropertyRow
                  icon={<ShieldCheck size={14} aria-hidden />}
                  label="Release status"
                  value={<Count tone="mint" value="Within budget" />}
                />
              </PropertyList>
            </Panel>

            <Panel title="Milestones" description="Key events logged by sensor logger #TL-904">
              <EventTimeline
                events={ROUTE_TIMELINE_EVENTS}
                activeId={activeEventId}
                onSelect={(id) => {
                  setActiveEventId(id);
                  setPageTab('route');
                  setRouteMode('route');
                }}
              />
            </Panel>
          </div>
        )}
      </div>
    </Page>
  );
};
