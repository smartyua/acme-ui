import { useMemo, useState } from 'react';
import { Download, Inbox, RotateCcw, CircleCheck } from 'lucide-react';

import { Avatar, Count, Segmented } from '../components/primitives';
import { Button, Drawer, Empty, PageHeader, Panel, SearchBox, TableWrap, tableClass } from '../components/ui';
import { STATUS_META, type Transaction, type TxStatus } from '../data';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import s from './pages.module.scss';

type Filter = TxStatus | 'all';

const parseAmount = (a: string) => Number(a.replace(/[$,]/g, ''));

export const OrdersPage = () => {
  const { transactions, updateTransactions, toast } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState<Transaction | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => filter === 'all' || t.status === filter)
      .filter((t) => !q || [t.customer, t.email, t.id].some((v) => v.toLowerCase().includes(q)));
  }, [transactions, filter, query]);

  const total = rows.reduce((sum, t) => sum + parseAmount(t.amount), 0);
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  const toggle = (id: string) => setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  const bulk = (status: TxStatus, label: string) => {
    updateTransactions(selected, { status });
    toast({ title: label, description: `${selected.length} order${selected.length > 1 ? 's' : ''} updated.`, tone: 'success' });
    setSelected([]);
  };

  const counts = (st: Filter) => (st === 'all' ? transactions.length : transactions.filter((t) => t.status === st).length);

  return (
    <Page>
      <PageHeader
        title="Orders"
        lead="Transactions, refunds and payment status across all customers."
        actions={
          <Button icon={<Download size={15} aria-hidden />} onClick={() => toast({ title: 'Export started', description: `${rows.length} orders will download as CSV.` })}>
            Export CSV
          </Button>
        }
      />

      <div className={s.kpis}>
        {(['completed', 'pending', 'failed', 'refunded'] as TxStatus[]).map((st) => (
          <button
            key={st}
            type="button"
            className={`${s.stat} ${s.statBtn}`}
            aria-pressed={filter === st}
            onClick={() => {
              setFilter(st);
              setSelected([]);
            }}
          >
            <span className={s.statLabel}>{STATUS_META[st].label}</span>
            <span className={s.statValue}>{counts(st)}</span>
            <span className={s.statHint}>
              <Count value={STATUS_META[st].label} tone={STATUS_META[st].tone} />
            </span>
          </button>
        ))}
      </div>

      <Panel flush title="All orders" description={`${rows.length} orders · $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}>
        <div className={s.toolbar}>
          <SearchBox value={query} onChange={setQuery} placeholder="Search customer, email or ID" className={s.toolbarSearch} />
          <Segmented
            label="Status"
            size="sm"
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setSelected([]);
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
        </div>

        {selected.length > 0 ? (
          <div className={s.bulkBar}>
            <strong>{selected.length} selected</strong>
            <Button size="sm" icon={<CircleCheck size={14} aria-hidden />} onClick={() => bulk('completed', 'Marked as completed')}>
              Mark completed
            </Button>
            <Button size="sm" variant="danger" icon={<RotateCcw size={14} aria-hidden />} onClick={() => bulk('refunded', 'Refund issued')}>
              Refund
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <Empty icon={<Inbox size={18} aria-hidden />} title="No orders found">
            Try a different status or search term.
          </Empty>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th style={{ width: '2.5rem' }}>
                    <input
                      type="checkbox"
                      className={s.check}
                      checked={allSelected}
                      onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))}
                      aria-label="Select all orders"
                    />
                  </th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className={s.num}>Amount</th>
                  <th className={s.hideSm}>Date</th>
                  <th className={s.hideMd}>Order</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className={s.rowBtn} onClick={() => setOpen(t)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className={s.check} checked={selected.includes(t.id)} onChange={() => toggle(t.id)} aria-label={`Select ${t.id}`} />
                    </td>
                    <td>
                      <div className={s.person}>
                        <Avatar initials={t.initials} />
                        <div className={s.personText}>
                          <span>{t.customer}</span>
                          <span>{t.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Count value={STATUS_META[t.status].label} tone={STATUS_META[t.status].tone} />
                    </td>
                    <td className={s.num}>{t.amount}</td>
                    <td className={`${s.hideSm} ${s.muted}`}>{t.date}</td>
                    <td className={`${s.hideMd} ${s.muted}`}>{t.id}</td>
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
        title={open ? `Order ${open.id}` : ''}
        footer={
          open && open.status !== 'refunded' ? (
            <>
              {open.status !== 'completed' ? (
                <Button
                  onClick={() => {
                    updateTransactions([open.id], { status: 'completed' });
                    toast({ title: 'Marked as completed', tone: 'success' });
                    setOpen(null);
                  }}
                >
                  Mark completed
                </Button>
              ) : null}
              <Button
                variant="danger"
                onClick={() => {
                  updateTransactions([open.id], { status: 'refunded' });
                  toast({ title: 'Refund issued', description: `${open.amount} returned to ${open.customer}.`, tone: 'success' });
                  setOpen(null);
                }}
              >
                Refund
              </Button>
            </>
          ) : undefined
        }
      >
        {open ? (
          <>
            <div className={s.person}>
              <Avatar initials={open.initials} />
              <div className={s.personText}>
                <span>{open.customer}</span>
                <span>{open.email}</span>
              </div>
            </div>
            <dl className={s.dl}>
              <dt>Status</dt>
              <dd>
                <Count value={STATUS_META[open.status].label} tone={STATUS_META[open.status].tone} />
              </dd>
              <dt>Amount</dt>
              <dd>{open.amount}</dd>
              <dt>Date</dt>
              <dd>{open.date}, 2026</dd>
              <dt>Payment</dt>
              <dd>Visa ···· 4242</dd>
              <dt>Order ID</dt>
              <dd>{open.id}</dd>
            </dl>
          </>
        ) : null}
      </Drawer>
    </Page>
  );
};
