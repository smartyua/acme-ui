import { useMemo, useState } from 'react';
import { ArrowRight, RefreshCw, ScrollText, Unplug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Segmented, Switch } from '../../components/primitives';
import { Badge, Button, Empty, PageHeader, Panel, SearchBox, cx } from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import { INTEGRATIONS, type Integration } from './integrationsData';
import s from './Integrations.module.scss';

type Filter = 'all' | 'connected' | 'off';

export const IntegrationsPage = () => {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected])));

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTEGRATIONS.filter(
      (i) => (filter === 'all' || (filter === 'connected') === on[i.id]) && (!q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
    );
  }, [query, filter, on]);

  const connectedCount = INTEGRATIONS.filter((i) => on[i.id]).length;

  const toggle = (i: Integration, next: boolean) => {
    setOn((m) => ({ ...m, [i.id]: next }));
    toast(
      next
        ? { title: `${i.name} connected`, description: `Sync starts now · ${i.scope}`, tone: 'success' }
        : { title: `${i.name} disconnected`, description: 'Acme stopped syncing with this tool.' },
    );
  };

  return (
    <Page>
      <PageHeader
        title="Integrations"
        lead="Connect the tools your team already works in. A switch cuts or resumes the data flow the same second."
        actions={
          <Button
            icon={<RefreshCw size={15} aria-hidden />}
            onClick={() =>
              toast({
                title: 'Revalidating connections',
                description: `Checking live credentials for ${connectedCount} integration${connectedCount === 1 ? '' : 's'}.`,
              })
            }
          >
            Revalidate all
          </Button>
        }
      />

      <div className={s.split}>
        <Panel
          title="Integration directory"
          description={`${connectedCount} of ${INTEGRATIONS.length} connected`}
          actions={
            <Segmented
              label="Connection filter"
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'connected', label: 'Connected' },
                { value: 'off', label: 'Not connected' },
              ]}
            />
          }
        >
          <div className={s.searchRow}>
            <SearchBox className={s.searchField} value={query} onChange={setQuery} placeholder="Search integrations" label="Search integrations" />
          </div>

          {shown.length === 0 ? (
            <Empty icon={<Unplug size={16} aria-hidden />} title="Nothing here">
              {query
                ? `No integration matches “${query}”.`
                : filter === 'connected'
                  ? 'Nothing is connected right now.'
                  : 'No integrations in this filter.'}
            </Empty>
          ) : (
            <ul className={s.grid}>
              {shown.map((i) => {
                const Icon = i.icon;
                const connected = !!on[i.id];
                return (
                  <li key={i.id} className={s.card}>
                    <span className={s.cardIcon}>
                      <Icon size={16} aria-hidden />
                    </span>
                    <div className={s.cardText}>
                      <span className={s.cardName}>{i.name}</span>
                      <span className={s.cardDesc}>{i.description}</span>
                      <span className={s.cardMeta}>
                        {i.category} · {i.scope} · {i.lastSync ? `Synced ${i.lastSync}` : 'No sync yet'}
                      </span>
                    </div>
                    <span className={s.cardEnd}>
                      <Badge tone={connected ? 'mint' : 'muted'}>{connected ? 'Connected' : 'Not connected'}</Badge>
                      <Switch
                        id={`int-${i.id}`}
                        label={`${i.name} connection`}
                        hideLabel
                        checked={connected}
                        onChange={(v) => toggle(i, v)}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <aside className={s.side} aria-label="Connection summary">
          <Panel title="Connection health" description="Live status, refreshed on every change.">
            <ul className={s.healthList}>
              {INTEGRATIONS.map((i) => (
                <li key={i.id} className={s.healthRow}>
                  <span className={s.healthName}>{i.name}</span>
                  <span className={s.healthState}>
                    <span className={cx(s.dot, on[i.id] && s.dotOn)} aria-hidden />
                    <span>{on[i.id] ? 'Connected' : 'Off'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Data & audit" description="What toggling a switch actually does.">
            <p className={s.note}>Acme stores only the scopes listed on each card; turning a tool off stops the data flow and keeps its history.</p>
            <div className={s.sideActions}>
              <Button block onClick={() => navigate('/audit-log')} icon={<ScrollText size={15} aria-hidden />}>
                Open audit log
              </Button>
              <Button block onClick={() => navigate('/templates')} icon={<ArrowRight size={15} aria-hidden />}>
                Browse workflow templates
              </Button>
            </div>
          </Panel>
        </aside>
      </div>
    </Page>
  );
};
