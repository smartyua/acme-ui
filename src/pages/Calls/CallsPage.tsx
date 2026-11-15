import { useMemo, useState } from 'react';
import {
  ChevronRight,
  Download,
  Pause,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Sparkles,
} from 'lucide-react';

import { Switch } from '../../components/primitives';
import {
  Button,
  Select,
  TableWrap,
  cx,
  tableClass,
} from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import styles from './Calls.module.scss';
import {
  INITIAL_CALLS,
  OPEN_HOUR_BARS,
  WAVEFORM_HEIGHTS,
  type CallDirection,
  type CallRange,
  type CallRecord,
} from './callsData';

const DirectionIcon = ({ direction }: { direction: CallDirection }) => {
  if (direction === 'inbound') return <PhoneIncoming size={14} aria-hidden />;
  if (direction === 'outbound') return <PhoneOutgoing size={14} aria-hidden />;
  return <Phone size={14} aria-hidden />;
};

export const CallsPage = () => {
  const { toast } = useApp();

  const [range, setRange] = useState<CallRange>('7d');
  const [directionFilter, setDirectionFilter] = useState<CallDirection | 'all'>('all');
  const [auraEnabled, setAuraEnabled] = useState(false);
  const [showAllCalls, setShowAllCalls] = useState(false);

  const [activeCallId, setActiveCallId] = useState<string>('call-1');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playedBars, setPlayedBars] = useState(16);

  const filteredCalls = useMemo(() => {
    const list =
      directionFilter === 'all'
        ? INITIAL_CALLS
        : INITIAL_CALLS.filter((c) => c.direction === directionFilter);
    return showAllCalls ? list : list.slice(0, 7);
  }, [directionFilter, showAllCalls]);

  const activeCall: CallRecord = useMemo(
    () =>
      INITIAL_CALLS.find((c) => c.id === activeCallId) ?? INITIAL_CALLS[0],
    [activeCallId],
  );

  const handleSelectCall = (call: CallRecord) => {
    if (call.id === activeCallId) {
      setIsPlaying((prev) => !prev);
      return;
    }
    setActiveCallId(call.id);
    setIsPlaying(true);
    setPlayedBars(16);
    toast({
      title: `Playing ${call.topic.toLowerCase()}`,
      description: `${call.number} · ${call.time}`,
    });
  };

  const handleDial = (number: string, mode: 'callback' | 'retry') => {
    toast({
      title: mode === 'callback' ? 'Calling back' : 'Redialing number',
      description: `Connecting extension 101 to ${number}…`,
      tone: 'success',
    });
  };

  return (
    <Page>
      <header className={styles.topBar}>
        <div className={styles.breadcrumbs}>
          <span>Nova PBX</span>
          <ChevronRight size={14} aria-hidden />
          <span>Analytics</span>
          <ChevronRight size={14} aria-hidden />
          <strong>Call history</strong>
        </div>

        <div className={styles.topActions}>
          <Select
            aria-label="Call history range"
            value={range}
            onChange={(e) => setRange(e.target.value as CallRange)}
          >
            <option value="7d">Last 7 days</option>
            <option value="24h">Last 24 hours</option>
            <option value="30d">Last 30 days</option>
          </Select>

          <Button
            icon={<Download size={15} aria-hidden />}
            onClick={() =>
              toast({
                title: 'Call log exported',
                description: 'nova-pbx-call-history.csv downloaded.',
                tone: 'success',
              })
            }
          >
            Export CSV
          </Button>
        </div>
      </header>

      <div className={styles.heroBlock}>
        <h1>
          <span className={styles.heroHighlight}>1 caller</span> could not reach you
        </h1>
        <p>
          Both unanswered calls came after hours. Only one was someone calling in, and they left a voicemail.
        </p>
      </div>

      {/* ── 5-tile KPI strip ───────────────────────────────────────────── */}
      <div className={styles.kpiStrip} role="group" aria-label="Call volume summary">
        <button
          type="button"
          className={cx(
            styles.kpiCell,
            directionFilter === 'all' && styles.kpiCellActive,
          )}
          onClick={() => setDirectionFilter('all')}
        >
          <span className={styles.kpiLabel}>Calls</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>10</span>
            <span className={styles.kpiSub}>8 answered</span>
          </div>
        </button>

        <button
          type="button"
          className={cx(
            styles.kpiCell,
            directionFilter === 'inbound' && styles.kpiCellActive,
          )}
          onClick={() =>
            setDirectionFilter((prev) => (prev === 'inbound' ? 'all' : 'inbound'))
          }
        >
          <span className={styles.kpiLabel}>Inbound</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>5</span>
            <span className={styles.kpiSub}>
              4 answered, <span className={styles.kpiSubDanger}>1 voicemail</span>
            </span>
          </div>
        </button>

        <button
          type="button"
          className={cx(
            styles.kpiCell,
            directionFilter === 'outbound' && styles.kpiCellActive,
          )}
          onClick={() =>
            setDirectionFilter((prev) => (prev === 'outbound' ? 'all' : 'outbound'))
          }
        >
          <span className={styles.kpiLabel}>Outbound</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>3</span>
            <span className={styles.kpiSub}>2 answered, 1 no answer</span>
          </div>
        </button>

        <button
          type="button"
          className={cx(
            styles.kpiCell,
            directionFilter === 'internal' && styles.kpiCellActive,
          )}
          onClick={() =>
            setDirectionFilter((prev) => (prev === 'internal' ? 'all' : 'internal'))
          }
        >
          <span className={styles.kpiLabel}>Internal</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>2</span>
          </div>
        </button>

        <button
          type="button"
          className={styles.kpiCell}
          onClick={() =>
            toast({
              title: 'Talk time breakdown',
              description: 'Inbound 21m 09s · Outbound 4m 54s · Internal 0m 45s.',
            })
          }
        >
          <span className={styles.kpiLabel}>Talk time</span>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>26m 48s</span>
          </div>
        </button>
      </div>

      {/* ── Upper split row: Calls by time of day + After hours ────────── */}
      <div className={styles.splitGrid}>
        <section className={styles.panelCard} aria-label="Calls by time of day">
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Calls by time of day</h2>
            <div className={styles.legendList}>
              <span className={styles.legendItem}>
                <span className={styles.dotInbound} aria-hidden />
                Inbound
              </span>
              <span className={styles.legendItem}>
                <span className={styles.dotOutbound} aria-hidden />
                Outbound
              </span>
              <span className={styles.legendItem}>
                <span className={styles.dotInternal} aria-hidden />
                Internal
              </span>
              <span className={styles.legendItem}>
                <span className={styles.dotMissedHollow} aria-hidden />
                Not answered
              </span>
            </div>
          </div>

          <div className={styles.timeChartWrap}>
            <div className={styles.zoneHeaderRow} aria-hidden>
              <span />
              <span>After hours</span>
              <span>Open, 9 AM to 6 PM</span>
              <span>After hours</span>
            </div>

            <div className={styles.chartCanvasRow}>
              <div className={styles.yAxis} aria-hidden>
                <span>10 min</span>
                <span>5 min</span>
                <span>0</span>
              </div>

              <div
                className={styles.plotArea}
                role="img"
                aria-label="24-hour call distribution with two after-hours unanswered calls"
              >
                <div className={styles.afterHoursBandLeft} />
                <div className={styles.afterHoursBandRight} />

                {OPEN_HOUR_BARS.map((bar) => (
                  <span
                    key={bar.id}
                    className={cx(styles.callBar, styles[`callBar-${bar.kind}`])}
                    style={{
                      left: `${bar.leftPct}%`,
                      height: `${Math.min(96, Math.round((bar.minutes / 10.5) * 100))}%`,
                    }}
                  />
                ))}

                <div className={styles.missedMarkerLeft}>
                  <span className={styles.missedCircle} aria-hidden />
                  <span className={styles.missedPill}>Voicemail, 12:43 AM</span>
                </div>

                <div className={styles.missedMarkerRight}>
                  <span className={styles.missedCircle} aria-hidden />
                  <span className={styles.missedPill}>No answer, 6:43 PM</span>
                </div>
              </div>
            </div>

            <div className={styles.xAxis} aria-hidden>
              <span>12 AM</span>
              <span>6 AM</span>
              <span>9 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>12 AM</span>
            </div>
          </div>
        </section>

        <section className={styles.panelCard} aria-label="After hours summary">
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>After hours</h2>
            <span className={styles.panelMeta}>6 PM to 9 AM</span>
          </div>

          <p className={styles.afterHoursLead}>
            You are closed 15 hours a day. Both unanswered calls fell in those hours.
          </p>

          <div className={styles.missedList}>
            <div className={styles.missedItem}>
              <div className={styles.missedItemText}>
                <strong>+1 (416) 555-1004</strong>
                <span>Called in Jun 10, 12:43 AM. Left a voicemail, 0:32</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleDial('+1 (416) 555-1004', 'callback')}
              >
                Call back
              </Button>
            </div>

            <div className={styles.missedItem}>
              <div className={styles.missedItemText}>
                <strong>+1 (647) 555-2002</strong>
                <span>You called Jun 9, 6:43 PM. No answer</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleDial('+1 (647) 555-2002', 'retry')}
              >
                Try again
              </Button>
            </div>
          </div>

          <div className={styles.auraBox}>
            <div className={styles.auraText}>
              <strong>Let Aura AI answer after hours</strong>
              <span>It takes the call, then sends you a summary</span>
            </div>
            <Switch
              id="aura-after-hours"
              label="Let Aura AI answer after hours"
              hideLabel
              checked={auraEnabled}
              onChange={(next) => {
                setAuraEnabled(next);
                toast({
                  title: next ? 'Aura AI enabled after hours' : 'Aura AI paused',
                  description: next
                    ? 'After-hours inbound calls between 6 PM and 9 AM will be answered and summarized.'
                    : 'Calls after 6 PM will route to standard voicemail.',
                  tone: 'success',
                });
              }}
            />
          </div>
        </section>
      </div>

      {/* ── Lower split row: Recent calls + Now playing ────────────────── */}
      <div className={styles.splitGrid}>
        <section className={styles.panelCard} aria-label="Recent calls">
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent calls</h2>
            <button
              type="button"
              className={styles.textBtn}
              onClick={() => setShowAllCalls((prev) => !prev)}
            >
              {showAllCalls ? 'Show recent 7' : `View all ${INITIAL_CALLS.length}`}
            </button>
          </div>

          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Number</th>
                  <th>Length</th>
                  <th>Topic</th>
                  <th className={styles.actionCellRight}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map((call) => {
                  const isCurrent = call.id === activeCallId;
                  return (
                    <tr
                      key={call.id}
                      className={cx(isCurrent && styles.callRowActive)}
                    >
                      <td>{call.time}</td>
                      <td>
                        <span className={styles.numberCell}>
                          <DirectionIcon direction={call.direction} />
                          {call.number}
                        </span>
                      </td>
                      <td>{call.length}</td>
                      <td>
                        <span
                          className={cx(
                            styles.topicCell,
                            call.topicTone === 'missed' && styles.topicMissed,
                          )}
                        >
                          <span
                            className={styles[`topicDot-${call.topicTone}`]}
                            aria-hidden
                          />
                          {call.topic}
                        </span>
                      </td>
                      <td className={styles.actionCellRight}>
                        {call.outcome === 'voicemail' ? (
                          <Button
                            size="sm"
                            onClick={() => handleDial(call.number, 'callback')}
                          >
                            Call back
                          </Button>
                        ) : call.outcome === 'no-answer' ? (
                          <Button
                            size="sm"
                            onClick={() => handleDial(call.number, 'retry')}
                          >
                            Try again
                          </Button>
                        ) : call.playable ? (
                          <button
                            type="button"
                            className={cx(
                              styles.playCircleBtn,
                              isCurrent && isPlaying && styles.playCircleBtnActive,
                            )}
                            aria-label={
                              isCurrent && isPlaying
                                ? `Pause ${call.topic} recording`
                                : `Play ${call.topic} recording`
                            }
                            onClick={() => handleSelectCall(call)}
                          >
                            {isCurrent && isPlaying ? (
                              <Pause size={14} aria-hidden />
                            ) : (
                              <Play size={14} aria-hidden />
                            )}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        </section>

        <section className={styles.panelCard} aria-label="Now playing">
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Now playing</h2>
            <span className={styles.panelMeta}>{activeCall.time}</span>
          </div>

          <div className={styles.nowTitleRow}>
            <span
              className={styles[`topicDot-${activeCall.topicTone}`]}
              aria-hidden
            />
            <h3>{activeCall.topic}</h3>
          </div>
          <p className={styles.nowSub}>{activeCall.extensionMeta}</p>

          <div
            className={styles.waveformRow}
            role="group"
            aria-label="Audio recording waveform"
          >
            {WAVEFORM_HEIGHTS.map((h, idx) => (
              <span
                key={idx}
                className={cx(
                  styles.waveBar,
                  idx < playedBars && styles.waveBarPlayed,
                )}
                style={{ height: `${h}%` }}
                onClick={() => setPlayedBars(idx + 1)}
              />
            ))}
          </div>

          <div className={styles.playerRow}>
            <div className={styles.playerLeft}>
              <button
                type="button"
                className={cx(styles.playCircleBtn, styles.playCircleBtnActive)}
                aria-label={isPlaying ? 'Pause recording' : 'Resume recording'}
                onClick={() => setIsPlaying((prev) => !prev)}
              >
                {isPlaying ? (
                  <Pause size={14} aria-hidden />
                ) : (
                  <Play size={14} aria-hidden />
                )}
              </button>
              <span>{activeCall.currentPos}</span>
            </div>
            <span>{activeCall.length}</span>
          </div>

          <div className={styles.aiSummaryBox}>
            <span className={styles.aiLabel}>
              <Sparkles size={14} aria-hidden />
              AI summary
            </span>
            <p className={styles.aiBody}>{activeCall.aiSummary}</p>
          </div>

          <Button
            variant="primary"
            block
            icon={<Phone size={15} aria-hidden />}
            onClick={() => handleDial(activeCall.number, 'callback')}
          >
            Call back
          </Button>
        </section>
      </div>
    </Page>
  );
};
