import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, ScrollText } from 'lucide-react';

import { Avatar } from '../components/primitives';
import { Badge, Button, Drawer, Empty, PageHeader, Panel, SearchBox, Select, TableWrap, tableClass } from '../components/ui';
import { AUDIT_ACTION_META, AUDIT_LOG, type AuditAction, type AuditEntry } from '../content/account';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import i from './Insights.module.scss';
import s from './pages.module.scss';

type Filter = AuditAction | 'all';

export const AuditLogPage = () => {
  const { toast } = useApp();
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<Filter>('all');
  const [open, setOpen] = useState<AuditEntry | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // DESIGN.md §7: "/" focuses the main search on list pages.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.key !== '/' || (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIT_LOG.filter((entry) => action === 'all' || entry.action === action).filter(
      (entry) => !q || [entry.actor, entry.target, entry.detail, entry.id].some((value) => value.toLowerCase().includes(q))
    );
  }, [query, action]);

  const reset = () => {
    setQuery('');
    setAction('all');
  };

  return (
    <Page>
      <PageHeader
        title="Audit log"
        lead="Immutable history of security and workspace operations, kept for 90 days."
        actions={
          <Button
            icon={<Download size={15} aria-hidden />}
            onClick={() => toast({ title: 'Export started', description: `${rows.length} events will download as CSV.` })}
          >
            Export CSV
          </Button>
        }
      />

      <Panel flush title="Workspace operations" description={`${rows.length} event${rows.length === 1 ? '' : 's'} · retention 90 days`}>
        <div className={s.toolbar}>
          <SearchBox value={query} onChange={setQuery} placeholder="Search actor, target or detail" shortcut="/" inputRef={searchRef} className={s.toolbarSearch} />
          <Select aria-label="Filter by action" value={action} onChange={(e) => setAction(e.target.value as Filter)}>
            <option value="all">All actions</option>
            {(Object.keys(AUDIT_ACTION_META) as AuditAction[]).map((key) => (
              <option key={key} value={key}>
                {AUDIT_ACTION_META[key].label}
              </option>
            ))}
          </Select>
        </div>

        {rows.length === 0 ? (
          <Empty icon={<ScrollText size={18} />} title="No events match">
            <Button size="sm" onClick={reset}>
              Clear filters
            </Button>
          </Empty>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th>Actor</th>
                  <th>Action</th>
                  <th className={s.hideSm}>Target</th>
                  <th className={s.hideMd}>Detail</th>
                  <th className={`${s.num} ${s.hideSm}`}>When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id} className={s.rowBtn} onClick={() => setOpen(entry)}>
                    <td>
                      <div className={s.person}>
                        <Avatar initials={entry.initials} />
                        <div className={i.titleCell}>
                          <span>{entry.actor}</span>
                          <span>
                            {entry.id}
                            <span className={i.onlySm}> · {entry.at.replace(', 2026', '')}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={AUDIT_ACTION_META[entry.action].tone}>{AUDIT_ACTION_META[entry.action].label}</Badge>
                    </td>
                    <td className={s.hideSm}>{entry.target}</td>
                    <td className={`${s.hideMd} ${s.muted}`}>{entry.detail}</td>
                    <td className={`${s.num} ${s.hideSm} ${s.muted}`}>{entry.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open ? `Event ${open.id}` : ''}
        footer={
          open ? (
            <Button
              icon={<Copy size={15} aria-hidden />}
              onClick={() => {
                toast({ title: 'Event ID copied', description: open.id, tone: 'success' });
                setOpen(null);
              }}
            >
              Copy event ID
            </Button>
          ) : undefined
        }
      >
        {open ? (
          <>
            <div className={s.person}>
              <Avatar initials={open.initials} />
              <div className={i.titleCell}>
                <span>{open.actor}</span>
                <span>{open.at}</span>
              </div>
            </div>
            <dl className={s.dl}>
              <dt>Action</dt>
              <dd>
                <Badge tone={AUDIT_ACTION_META[open.action].tone}>{AUDIT_ACTION_META[open.action].label}</Badge>
              </dd>
              <dt>Target</dt>
              <dd>{open.target}</dd>
              <dt>Detail</dt>
              <dd>{open.detail}</dd>
              <dt>IP address</dt>
              <dd>{open.ip}</dd>
              <dt>Event ID</dt>
              <dd>{open.id}</dd>
            </dl>
          </>
        ) : null}
      </Drawer>
    </Page>
  );
};
