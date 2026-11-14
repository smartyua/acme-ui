import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowDownToLine,
  BatteryCharging,
  Building2,
  Factory,
  Pause,
  Play,
  PlugZap,
  Sun,
  Thermometer,
  Zap,
} from 'lucide-react';

import { Count } from '../../components/primitives';
import {
  Badge,
  Button,
  Modal,
  PageHeader,
  Panel,
  PillTabs,
  TableWrap,
  tableClass,
  type BadgeTone,
} from '../../components/ui';
import { type Tone as CountTone } from '../../data';
import { Page } from '../../layout/Page';
import s from '../pages.module.scss';
import { BessProgress } from './BessProgress';
import { BessProgressRing } from './BessProgressRing';
import { EnergyFlowDiagram } from './EnergyFlowDiagram';
import { PowerChart } from './PowerChart';
import { GridExchangeChart } from './GridExchangeChart';
import { WeatherPanel } from './WeatherPanel';
import {
  INITIAL_MINUTE,
  PLANT,
  clampMinute,
  formatKw,
  formatPower,
  getDaySeries,
  getHourlyExchange,
  getPlantState,
  stringHealth,
  type AlarmSeverity,
  type ChargerStatus,
  type InverterStatus,
} from './bessData';
import { t } from './bessCopy';
import { type Tone } from './tones';
import styles from './Bess.module.scss';

const TICK_MS = 2000;
const TICK_MINUTES = 4;

// Status words use Count (solid pastel); energy categories use Badge (tinted). DESIGN.md §2.3, §6.
type StatusTone = CountTone | 'muted';

const StatusChip = ({ tone, children }: { tone: StatusTone; children: ReactNode }) => (
  <Count value={children} tone={tone} />
);

const STATUS_TONE: Record<InverterStatus, StatusTone> = {
  online: 'mint',
  derated: 'lemon',
  fault: 'rose',
  standby: 'muted',
};
const CHARGER_TONE: Record<ChargerStatus, StatusTone> = { charging: 'mint', idle: 'muted', fault: 'rose' };
const SEVERITY_TONE: Record<AlarmSeverity, StatusTone> = { critical: 'rose', warning: 'lemon', info: 'sky' };
const HEALTH_TONE: Record<'good' | 'fair' | 'watch' | 'poor', StatusTone> = {
  good: 'mint',
  fair: 'sky',
  watch: 'lemon',
  poor: 'rose',
};

type Tab = 'inverters' | 'strings' | 'chargers' | 'alarms';

type KpiProps = {
  icon: ReactNode;
  label: string;
  value: string;
  unitNote: string;
  badge?: { text: string; tone: BadgeTone };
  progress?: number;
  tone?: Tone;
};

const KpiTile = ({ icon, label, value, unitNote, badge, progress, tone }: KpiProps) => (
  <article className={s.stat}>
    <div className={styles.kpiHead}>
      <span className={styles.kpiLabel}>
        {icon}
        <span className={styles.kpiLabelText}>{label}</span>
      </span>
      {badge ? <Badge tone={badge.tone}>{badge.text}</Badge> : null}
    </div>
    <strong className={s.statValue}>{value}</strong>
    <span className={styles.kpiNote}>{unitNote}</span>
    {progress === undefined ? null : (
      <BessProgress value={progress} tone={tone} size="sm" aria-label={`${label} ${Math.round(progress)}%`} />
    )}
  </article>
);

export const BessPage = () => {
  const [minute, setMinute] = useState(INITIAL_MINUTE);
  const [playing, setPlaying] = useState(true);
  const [stringDialogId, setStringDialogId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('inverters');

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => setMinute((current) => clampMinute(current + TICK_MINUTES)), TICK_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  const state = useMemo(() => getPlantState(minute), [minute]);
  const series = useMemo(() => getDaySeries(20), []);
  const hours = useMemo(() => getHourlyExchange(minute), [minute]);

  const charging = state.batteryKw < 0;
  const exporting = state.gridKw < 0;
  const gridLimit = exporting ? PLANT.exportLimitKw : PLANT.importLimitKw;
  const siteKw = state.loadKw - state.evKw;
  const peakHourImport = Math.max(...hours.map((hour) => hour.importKwh));
  const peakHourExport = Math.max(...hours.map((hour) => hour.exportKwh));
  const criticalCount = state.alarms.filter((alarm) => alarm.severity === 'critical').length;
  const warningCount = state.alarms.filter((alarm) => alarm.severity === 'warning').length;
  const stringDialogInverter =
    state.inverters.find((inverter) => inverter.spec.id === stringDialogId) ?? null;

  return (
    <Page>
      <PageHeader
        title="BESS & solar"
        lead={`${PLANT.name} · ${(PLANT.acCapacityKw / 1000).toFixed(2)} MW AC · ${(PLANT.storageCapacityKwh / 1000).toFixed(0)} MWh storage · ${PLANT.inverterCount} ${t('_BESS_INVERTERS')} · ${PLANT.stringCount} ${t('_BESS_STRINGS')}`}
        actions={
          <div className={styles.headerStatus}>
            {criticalCount > 0 ? (
              <Count value={`${criticalCount} ${t('_BESS_SEV_CRITICAL')}`} tone="rose" />
            ) : null}
            {warningCount > 0 ? (
              <Count value={`${warningCount} ${t('_BESS_SEV_WARNING')}`} tone="lemon" />
            ) : null}
            <span className={`${styles.livePill} ${playing ? styles.liveOn : ''}`}>
              <i />
              {playing ? t('_BESS_LIVE') : t('_BESS_PAUSED')}
            </span>
            <span className={styles.clock}>{state.clock}</span>
            <Button
              size="sm"
              onClick={() => setPlaying((current) => !current)}
              aria-label={playing ? t('_BESS_PAUSE_SIM') : t('_BESS_RESUME_SIM')}
              icon={playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
            />
          </div>
        }
      />

      <section className={styles.group} aria-label={t('_BESS_SECTION_LIVE')}>
        <div className={`${s.kpis} ${styles.kpis}`}>
          <KpiTile
            icon={<Sun aria-hidden />}
            label={t('_BESS_KPI_PV')}
            value={formatPower(state.pvKw)}
            unitNote={`${t('_BESS_OF')} ${(PLANT.acCapacityKw / 1000).toFixed(2)} MW AC`}
            badge={{ text: `${Math.round((state.pvKw / PLANT.acCapacityKw) * 100)} %`, tone: 'lemon' }}
            progress={(state.pvKw / PLANT.acCapacityKw) * 100}
            tone="solar"
          />
          <KpiTile
            icon={<BatteryCharging aria-hidden />}
            label={t('_BESS_KPI_BATTERY')}
            value={formatPower(Math.abs(state.batteryKw))}
            unitNote={`${t('_BESS_OF')} ${(PLANT.storagePowerKw / 1000).toFixed(1)} MW`}
            badge={{
              text: charging ? t('_BESS_FLOW_CHARGE') : t('_BESS_FLOW_DISCHARGE'),
              tone: charging ? 'mint' : 'lemon',
            }}
            progress={(Math.abs(state.batteryKw) / PLANT.storagePowerKw) * 100}
            tone="battery"
          />
          <KpiTile
            icon={<Activity aria-hidden />}
            label={t('_BESS_KPI_SOC')}
            value={`${state.totals.socPercent.toFixed(1)} %`}
            unitNote={`${(state.totals.storedKwh / 1000).toFixed(2)} / ${(PLANT.storageCapacityKwh / 1000).toFixed(0)} MWh`}
            progress={state.totals.socPercent}
            tone="battery"
          />
          <KpiTile
            icon={<Building2 aria-hidden />}
            label={t('_BESS_KPI_LOAD')}
            value={formatPower(siteKw)}
            unitNote={`${t('_BESS_SELF_SUFFICIENCY')} ${state.totals.selfSufficiency.toFixed(0)} %`}
            progress={state.totals.selfSufficiency}
            tone="load"
          />
          <KpiTile
            icon={<PlugZap aria-hidden />}
            label={t('_BESS_KPI_EV')}
            value={formatPower(state.evKw)}
            unitNote={`${state.totals.evActiveConnectors} / ${PLANT.connectorCount} ${t('_BESS_EV_CONNECTORS')}`}
            badge={{
              text: `${state.totals.evSolarShare.toFixed(0)} % ${t('_BESS_EV_GREEN')}`,
              tone: 'lavender',
            }}
            progress={state.totals.evUtilization}
            tone="ev"
          />
          <KpiTile
            icon={<Factory aria-hidden />}
            label={t('_BESS_KPI_GRID')}
            value={formatPower(Math.abs(state.gridKw))}
            unitNote={`${t('_BESS_OF')} ${gridLimit} kW ${exporting ? t('_BESS_FLOW_EXPORT') : t('_BESS_FLOW_IMPORT')}`}
            badge={{
              text: exporting ? t('_BESS_FLOW_EXPORT') : t('_BESS_FLOW_IMPORT'),
              tone: exporting ? 'sky' : 'peach',
            }}
            progress={(Math.abs(state.gridKw) / gridLimit) * 100}
            tone={exporting ? 'export' : 'import'}
          />
          <KpiTile
            icon={<ArrowDownToLine aria-hidden />}
            label={t('_BESS_KPI_IMPORT')}
            value={`${state.totals.importMwh.toFixed(2)} MWh`}
            unitNote={`${t('_BESS_PEAK')} ${state.totals.peakImportKw.toFixed(0)} / ${PLANT.importLimitKw} kW`}
            progress={(state.totals.peakImportKw / PLANT.importLimitKw) * 100}
            tone="import"
          />
          <KpiTile
            icon={<Zap aria-hidden />}
            label={t('_BESS_KPI_YIELD')}
            value={`${state.totals.pvYieldMwh.toFixed(1)} MWh`}
            unitNote={`↑ ${state.totals.exportMwh.toFixed(2)} MWh ${t('_BESS_FLOW_EXPORT')}`}
            badge={
              state.curtailedKw > 1
                ? { text: `${t('_BESS_CURTAILED')} ${formatKw(state.curtailedKw)}`, tone: 'lemon' }
                : undefined
            }
          />
        </div>
      </section>

      <section className={styles.group} aria-label={t('_BESS_SECTION_SITE')}>
        <div className={styles.panelStack}>
          <Panel title={t('_BESS_WX_TITLE')} description={t('_BESS_WX_DESC')}>
            <div>
              <WeatherPanel
                weather={state.weather}
                forecast={state.forecast}
                pvPotentialKw={state.pvKw + state.curtailedKw}
              />
            </div>
          </Panel>

          <Panel title={t('_BESS_FLOW_TITLE')} description={t('_BESS_FLOW_DESC')}>
            <div>
              <EnergyFlowDiagram state={state} paused={!playing} />
            </div>
          </Panel>
        </div>
      </section>

      <section className={styles.group} aria-label={t('_BESS_SECTION_STORAGE')}>
        <div className={styles.bankGrid}>
          {state.banks.map((bank) => (
            <Panel
              key={bank.spec.id}
              title={bank.spec.id}
              description={`${(bank.spec.capacityKwh / 1000).toFixed(0)} MWh · ${(bank.spec.powerKw / 1000).toFixed(1)} MW · ${bank.spec.chemistry}`}
              actions={
                <>
                  <Badge
                    tone={
                      bank.mode === 'charging' ? 'mint' : bank.mode === 'discharging' ? 'lemon' : 'neutral'
                    }
                  >
                    {t(`_BESS_MODE_${bank.mode.toUpperCase()}`)}
                  </Badge>
                </>
              }
            >
              <div className={styles.bankBody}>
                <BessProgressRing value={bank.soc * 100} size={92} strokeWidth={7} tone="battery" aria-label={`${bank.spec.id} state of charge`}>
                  <b className={styles.ringValue}>{`${(bank.soc * 100).toFixed(0)}%`}</b>
                  <small className={styles.ringLabel}>SOC</small>
                </BessProgressRing>
                <dl className={styles.bankStats}>
                  <div>
                    <dt>{t('_BESS_POWER')}</dt>
                    <dd>{formatPower(Math.abs(bank.powerKw))}</dd>
                  </div>
                  <div>
                    <dt>{t('_BESS_AVAILABLE')}</dt>
                    <dd>{`${(bank.availableKwh / 1000).toFixed(2)} MWh`}</dd>
                  </div>
                  <div>
                    <dt>SOH</dt>
                    <dd>{`${bank.spec.soh.toFixed(1)} %`}</dd>
                  </div>
                  <div>
                    <dt>{t('_BESS_CYCLES')}</dt>
                    <dd>{bank.spec.cycles}</dd>
                  </div>
                  <div>
                    <dt>{t('_BESS_CELL_TEMP')}</dt>
                    <dd>{`${bank.cellTemp.toFixed(1)} °C`}</dd>
                  </div>
                  <div>
                    <dt>{t('_BESS_C_RATE')}</dt>
                    <dd>{`${(Math.abs(bank.powerKw) / bank.spec.capacityKwh).toFixed(2)} C`}</dd>
                  </div>
                </dl>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section className={styles.group} aria-label={t('_BESS_SECTION_TRENDS')}>
        <div className={styles.panelStack}>
          <Panel title={t('_BESS_CHART_TITLE')} description={t('_BESS_CHART_DESC')}>
            <div>
              <PowerChart series={series} currentMinute={state.minute} />
            </div>
          </Panel>

          <Panel
            title={t('_BESS_GRID_TITLE')}
            description={t('_BESS_GRID_DESC')}
            actions={
              <>
                <ul className={styles.chartLegend}>
                  <li className={styles.legendImport}>
                    <i />
                    {t('_BESS_FLOW_IMPORT')}
                  </li>
                  <li className={styles.legendExport}>
                    <i />
                    {t('_BESS_FLOW_EXPORT')}
                  </li>
                </ul>
              </>
            }
          >
            <div className={styles.gridExchange}>
              <GridExchangeChart hours={hours} currentHour={Math.floor(state.minute / 60)} />
              <ul className={styles.gridStats}>
                <li>
                  <span>{t('_BESS_GRID_IMPORT_TODAY')}</span>
                  <strong className={styles.importValue}>{`${state.totals.importMwh.toFixed(2)} MWh`}</strong>
                  <small>{`${t('_BESS_PEAK')} ${state.totals.peakImportKw.toFixed(0)} kW · ${t('_BESS_OF')} ${PLANT.importLimitKw} kW`}</small>
                  <BessProgress
                    value={(state.totals.peakImportKw / PLANT.importLimitKw) * 100}
                    tone="import"
                    size="sm"
                  />
                </li>
                <li>
                  <span>{t('_BESS_GRID_EXPORT_TODAY')}</span>
                  <strong className={styles.exportValue}>{`${state.totals.exportMwh.toFixed(2)} MWh`}</strong>
                  <small>{`${t('_BESS_PEAK')} ${state.totals.peakExportKw.toFixed(0)} kW · ${t('_BESS_OF')} ${PLANT.exportLimitKw} kW`}</small>
                  <BessProgress
                    value={(state.totals.peakExportKw / PLANT.exportLimitKw) * 100}
                    tone="export"
                    size="sm"
                  />
                </li>
                <li>
                  <span>{t('_BESS_GRID_NET')}</span>
                  <strong>{`${(state.totals.exportMwh - state.totals.importMwh).toFixed(2)} MWh`}</strong>
                  <small>{`${t('_BESS_GRID_PEAK_HOUR_IN')} ${peakHourImport.toFixed(0)} kWh · ${t('_BESS_GRID_PEAK_HOUR_OUT')} ${peakHourExport.toFixed(0)} kWh`}</small>
                </li>
                <li>
                  <span>{t('_BESS_GRID_SHAVED')}</span>
                  <strong>{`${(state.totals.shavedMwh * 1000).toFixed(0)} kWh`}</strong>
                  <small>{t('_BESS_GRID_SHAVED_NOTE')}</small>
                </li>
              </ul>
            </div>
          </Panel>
        </div>
      </section>

      <section className={styles.group} aria-label={t('_BESS_SECTION_EQUIPMENT')}>
        <Panel
          title="Equipment"
          description={t(
            `_BESS_${{ inverters: 'INV', strings: 'STR', chargers: 'EVSE', alarms: 'ALARM' }[tab]}_DESC`,
          )}
          actions={
            <PillTabs
              label="Equipment"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'inverters', label: t('_BESS_TAB_INVERTERS') },
                { value: 'strings', label: t('_BESS_TAB_STRINGS') },
                { value: 'chargers', label: t('_BESS_TAB_CHARGERS') },
                { value: 'alarms', label: t('_BESS_TAB_ALARMS'), count: state.alarms.length },
              ]}
            />
          }
        >
          {tab === 'inverters' ? (
            <>
              <div className={styles.inverterGrid}>
                {state.inverters.map((inverter) => {
                  const loadPercent = (inverter.powerKw / inverter.spec.ratedKw) * 100;
                  return (
                    <button
                      key={inverter.spec.id}
                      type="button"
                      className={styles.inverterCard}
                      data-status={inverter.spec.status}
                      onClick={() => setStringDialogId(inverter.spec.id)}
                        title={t('_BESS_STR_VIEW_DETAILS')}
                    >
                      <span className={styles.inverterHead}>
                        <span className={styles.inverterId}>{inverter.spec.id}</span>
                        <StatusChip tone={STATUS_TONE[inverter.spec.status]}>
                          {t(`_BESS_STATUS_${inverter.spec.status.toUpperCase()}`)}
                        </StatusChip>
                      </span>
                      <strong className={styles.inverterPower}>{formatKw(inverter.powerKw, 1)}</strong>
                      <BessProgress value={loadPercent} tone="solar" size="sm" />
                      <span className={styles.inverterMeta}>
                        <span>{`${inverter.spec.ratedKw} kW · ${inverter.spec.block}`}</span>
                        <span>{`η ${inverter.efficiency.toFixed(1)} %`}</span>
                      </span>
                      <span className={styles.inverterMeta}>
                        <span>{`${inverter.spec.strings} ${t('_BESS_STRINGS')}`}</span>
                        <span className={styles.temp}>
                          <Thermometer aria-hidden />
                          {`${inverter.temperature.toFixed(0)} °C`}
                        </span>
                      </span>
                      <span className={styles.stringBars}>
                        {inverter.strings.map((item) => (
                          <i
                            key={item.id}
                            data-health={stringHealth(item.ratio)}
                            title={`${item.id} · ${(item.ratio * 100).toFixed(0)} %`}
                          />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {tab === 'strings' ? (
            <>
              <ul className={styles.healthLegend}>
                <li data-health="good">{t('_BESS_STR_GOOD')}</li>
                <li data-health="fair">{t('_BESS_STR_FAIR')}</li>
                <li data-health="watch">{t('_BESS_STR_WATCH')}</li>
                <li data-health="poor">{t('_BESS_STR_POOR')}</li>
              </ul>
              <div className={styles.matrixScroller}>
                <div className={styles.matrix}>
                  {state.inverters.map((inverter) => (
                    <div key={inverter.spec.id} className={styles.matrixRow}>
                      <span className={styles.matrixLabel}>{inverter.spec.id}</span>
                      {inverter.strings.map((item) => (
                        <span
                          key={item.id}
                          className={styles.matrixCell}
                          data-health={stringHealth(item.ratio)}
                        >
                          <b>{`${(item.ratio * 100).toFixed(0)}%`}</b>
                          <small>{`${item.powerKw.toFixed(1)} kW`}</small>
                          <small>{`${item.current.toFixed(1)} A`}</small>
                        </span>
                      ))}
                      {Array.from({ length: 6 - inverter.strings.length }, (_, index) => (
                        <span key={`empty-${index}`} className={styles.matrixEmpty} aria-hidden />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {tab === 'chargers' ? (
            <>
              <div className={styles.chargerGrid}>
                {state.chargers.map((charger) => (
                  <div key={charger.spec.id} className={styles.chargerCard} data-status={charger.status}>
                    <div className={styles.chargerHead}>
                      <span className={styles.inverterId}>{charger.spec.id}</span>
                      <StatusChip tone={CHARGER_TONE[charger.status]}>
                        {t(`_BESS_EVSE_${charger.status.toUpperCase()}`)}
                      </StatusChip>
                    </div>
                    <div className={styles.chargerTop}>
                      <strong className={styles.inverterPower}>{formatKw(charger.powerKw)}</strong>
                      <span
                        className={styles.chargerRated}
                      >{`${t('_BESS_OF')} ${charger.spec.ratedKw} kW`}</span>
                    </div>
                    <BessProgress value={charger.utilization} tone="ev" size="sm" />
                    <div className={styles.inverterMeta}>
                      <span>{charger.spec.standard}</span>
                      <span>{`${charger.sessionsToday} ${t('_BESS_EV_SESSIONS')}`}</span>
                    </div>
                    <div className={styles.inverterMeta}>
                      <span>{`${charger.energyTodayKwh.toFixed(0)} kWh ${t('_BESS_TODAY')}`}</span>
                      <span>{`${t('_BESS_PEAK')} ${charger.peakKw.toFixed(0)} kW`}</span>
                    </div>
                    <ul className={styles.connectorList}>
                      {charger.connectors.map((connector) => (
                        <li key={connector.index} className={styles.connector} data-status={connector.status}>
                          <span className={styles.connectorId}>{`#${connector.index}`}</span>
                          <span className={styles.connectorBody}>
                            <span className={styles.connectorTop}>
                              <b>
                                {connector.vehicleKey
                                  ? t(connector.vehicleKey)
                                  : t(`_BESS_EVSE_${connector.status.toUpperCase()}`)}
                              </b>
                              <em>{connector.status === 'charging' ? formatKw(connector.powerKw) : '—'}</em>
                            </span>
                            {connector.status === 'charging' ? (
                              <>
                                <BessProgress value={(connector.progress || 0) * 100} tone="ev" size="xs" />
                                <span className={styles.connectorMeta}>
                                  {`${((connector.progress || 0) * 100).toFixed(0)} % · ${(connector.deliveredKwh || 0).toFixed(0)} kWh · ${connector.remainingMin || 0} ${t('_BESS_EV_MIN_LEFT')}`}
                                </span>
                              </>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {tab === 'alarms' ? (
            <>
              <TableWrap>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th>{t('_BESS_ALARM_SEVERITY')}</th>
                      <th>{t('_BESS_ALARM_TIME')}</th>
                      <th>{t('_BESS_ALARM_SOURCE')}</th>
                      <th>{t('_BESS_ALARM_MESSAGE')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.alarms.map((alarm) => (
                      <tr key={alarm.id}>
                        <td>
                          <StatusChip tone={SEVERITY_TONE[alarm.severity]}>
                            {t(`_BESS_SEV_${alarm.severity.toUpperCase()}`)}
                          </StatusChip>
                        </td>
                        <td className={styles.mono}>{alarm.time}</td>
                        <td className={styles.mono}>{alarm.source}</td>
                        <td>{t(alarm.messageKey)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </>
          ) : null}
        </Panel>
      </section>

      <Modal
        open={Boolean(stringDialogInverter)}
        onClose={() => setStringDialogId(null)}
        title={
          stringDialogInverter ? `${stringDialogInverter.spec.id} — ${t('_BESS_STR_DIALOG_SUFFIX')}` : ''
        }
        description={t('_BESS_STR_DIALOG_DESC')}
        width="lg"
      >
        {stringDialogInverter ? (
          <>
            <div className={styles.stringDialogMeta}>
              <span>{`${stringDialogInverter.spec.ratedKw} kW · ${stringDialogInverter.spec.block}`}</span>
              <span>{`η ${stringDialogInverter.efficiency.toFixed(1)} %`}</span>
              <span>{`${stringDialogInverter.temperature.toFixed(0)} °C`}</span>
              <StatusChip tone={STATUS_TONE[stringDialogInverter.spec.status]}>
                {t(`_BESS_STATUS_${stringDialogInverter.spec.status.toUpperCase()}`)}
              </StatusChip>
            </div>
            <TableWrap>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>{t('_BESS_STR_COL_STRING')}</th>
                    <th>{t('_BESS_STR_COL_HEALTH')}</th>
                    <th>{t('_BESS_STR_COL_POWER')}</th>
                    <th>{t('_BESS_STR_COL_VOLTAGE')}</th>
                    <th>{t('_BESS_STR_COL_CURRENT')}</th>
                    <th>{t('_BESS_STR_COL_RATIO')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stringDialogInverter.strings.map((item) => {
                    const health = stringHealth(item.ratio);
                    return (
                      <tr key={item.id}>
                        <td className={styles.mono}>{item.id}</td>
                        <td>
                          <StatusChip tone={HEALTH_TONE[health]}>
                            {t(`_BESS_STR_BADGE_${health.toUpperCase()}`)}
                          </StatusChip>
                        </td>
                        <td className={styles.mono}>{`${item.powerKw.toFixed(2)} kW`}</td>
                        <td className={styles.mono}>{`${item.voltage.toFixed(0)} V`}</td>
                        <td className={styles.mono}>{`${item.current.toFixed(1)} A`}</td>
                        <td className={styles.mono}>{`${(item.ratio * 100).toFixed(0)} %`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          </>
        ) : null}
      </Modal>
    </Page>
  );
};
