import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Download } from 'lucide-react';

import { Avatar, Segmented } from '../components/primitives';
import { Button, PageHeader, Panel, Sparkline } from '../components/ui';
import { EXPENSE_MONTHS, FINANCE_KPIS, FINANCE_TX, INCOME_SOURCES } from '../content/business';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import s from './pages.module.scss';

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

const Donut = ({ data }: { data: typeof INCOME_SOURCES }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = 15.915; // circumference ≈ 100
  let offset = 25;
  return (
    <svg width="148" height="148" viewBox="0 0 42 42" role="img" aria-label="Income by source">
      <circle cx="21" cy="21" r={r} fill="none" stroke="var(--tag-bg)" strokeWidth="5" />
      {data.map((d) => {
        const pct = (d.value / total) * 100;
        const seg = (
          <circle
            key={d.label}
            cx="21"
            cy="21"
            r={r}
            fill="none"
            stroke={`var(--${d.tone})`}
            strokeWidth="5"
            strokeDasharray={`${Math.max(0, pct - 0.8)} ${100 - pct + 0.8}`}
            strokeDashoffset={offset}
          />
        );
        offset -= pct;
        return seg;
      })}
      <text x="21" y="20.5" textAnchor="middle" fontSize="4.4" fontWeight="600" fill="var(--fg)">
        ${Math.round(total / 1000)}k
      </text>
      <text x="21" y="25.5" textAnchor="middle" fontSize="2.6" fill="var(--fg-muted)">
        total income
      </text>
    </svg>
  );
};

export const FinancePage = () => {
  const { toast } = useApp();
  const [range, setRange] = useState<'3m' | '6m'>('6m');
  const [type, setType] = useState<'all' | 'Income' | 'Expense'>('all');

  const months = range === '3m' ? EXPENSE_MONTHS.slice(-3) : EXPENSE_MONTHS;
  const max = Math.max(...months.map((m) => Math.max(m.payroll, m.tools)));
  const tx = useMemo(() => FINANCE_TX.filter((t) => type === 'all' || t.type === type), [type]);
  const totalIncome = INCOME_SOURCES.reduce((sum, d) => sum + d.value, 0);

  return (
    <Page>
      <PageHeader
        title="Finance"
        lead="Balance, income mix, expenses and recent money movement."
        actions={
          <>
            <Segmented
              label="Range"
              size="sm"
              value={range}
              onChange={setRange}
              options={[
                { value: '3m', label: '3 months' },
                { value: '6m', label: '6 months' },
              ]}
            />
            <Button icon={<Download size={15} aria-hidden />} onClick={() => toast({ title: 'Statement exported', description: `Finance statement for the last ${range === '3m' ? '3' : '6'} months.` })}>
              Export
            </Button>
          </>
        }
      />

      <div className={s.kpis}>
        {FINANCE_KPIS.map((k) => (
          <div key={k.id} className={s.stat}>
            <span className={s.statLabel}>{k.label}</span>
            <span className={s.statValue}>{k.value}</span>
            <Sparkline data={k.spark} up={k.up} />
            <span className={s.statHint}>
              <span className={k.up ? s.up : s.down}>
                {k.up ? <ArrowUpRight size={12} aria-hidden /> : <ArrowDownRight size={12} aria-hidden />} {k.change}
              </span>
              {k.hint}
            </span>
          </div>
        ))}
      </div>

      <div className={s.split}>
        <Panel
          title="Expenses"
          description={`Payroll vs tools, last ${months.length} months`}
          actions={
            <div className={s.legend}>
              <span>
                <i style={{ background: 'var(--lavender)' }} /> Payroll
              </span>
              <span>
                <i style={{ background: 'var(--bar)' }} /> Tools
              </span>
            </div>
          }
        >
          <div className={s.bars} role="img" aria-label="Monthly expenses">
            {months.map((m) => (
              <div key={m.label} className={s.barCol}>
                <div className={s.barStack}>
                  <span className={`${s.bar} ${s.barA}`} style={{ height: `${(m.payroll / max) * 100}%` }} title={`Payroll ${money(m.payroll)}`} />
                  <span className={`${s.bar} ${s.barB}`} style={{ height: `${(m.tools / max) * 100}%` }} title={`Tools ${money(m.tools)}`} />
                </div>
                <span className={s.barLabel}>{m.label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Income mix" description="Share of revenue by source">
          <div className={s.donutWrap}>
            <Donut data={INCOME_SOURCES} />
            <ul className={`${s.list} ${s.donutLegend}`}>
              {INCOME_SOURCES.map((d) => (
                <li key={d.label}>
                  <i style={{ background: `var(--${d.tone})` }} />
                  <span>{d.label}</span>
                  <span>{Math.round((d.value / totalIncome) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <Panel
        flush
        title="Recent transactions"
        actions={
          <Segmented
            label="Type"
            size="sm"
            value={type}
            onChange={setType}
            options={[
              { value: 'all', label: 'All' },
              { value: 'Income', label: 'Income' },
              { value: 'Expense', label: 'Expenses' },
            ]}
          />
        }
      >
        <ul className={s.list}>
          {tx.map((t) => (
            <li key={t.id} className={s.row}>
              <Avatar initials={t.initials} />
              <div className={s.rowMain}>
                <strong>{t.name}</strong>
                <span>
                  {t.type} · {t.date}
                </span>
              </div>
              <span className={t.type === 'Income' ? s.up : s.down}>
                {t.type === 'Income' ? '+' : '−'}
                {money(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </Page>
  );
};
