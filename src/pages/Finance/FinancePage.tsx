// Ported from shacdn Dashboard/pages/Finance. Primitives come from ../components; the page
// keeps its own local data (./financeData) so it stays self-contained without dashboardContext.
import { useState, type CSSProperties } from 'react';
import { ArrowLeftRight, ArrowUpRight, Banknote, FileText, HandCoins, Receipt, TrendingUp, Wallet } from 'lucide-react';

import { Avatar, SectionLabel, Segmented } from '../../components/primitives';
import { ChartContainer, DonutChart, GroupedBarChart, Sparkline } from '../../components/primitives/Chart';
import { Progress } from '../../components/primitives/Progress';
import { ProgressRing } from '../../components/primitives/ProgressRing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/primitives/Dialog';
import { Badge, Button, Input, PageHeader, Panel, TableWrap, tableClass } from '../../components/ui';
import { useApp } from '../../lib/app';
import { Page } from '../../layout/Page';
import s from './Finance.module.scss';
import {
  EXPENSE_MONTHS,
  EXPENSE_SERIES,
  EXPENSE_SUMMARY,
  FINANCE_KPIS,
  FINANCE_TRANSACTIONS,
  INCOME_SOURCES,
  SAVING_GOAL,
  TOTAL_INCOME,
  WALLET_CARDS,
  formatUsd,
  type FinanceKpiTone,
  type WalletCardTone,
  type WalletNetwork,
} from './financeData';

const KPI_ICONS = {
  balance: Wallet,
  profit: Banknote,
  expenses: Receipt,
  invoices: FileText,
} as const;

const TONE_BADGE: Record<FinanceKpiTone, 'mint' | 'sky' | 'lemon'> = {
  success: 'mint',
  info: 'sky',
  warning: 'lemon',
  caution: 'lemon',
};

const walletToneClass = (tone: WalletCardTone): string => {
  switch (tone) {
    case 'dark':
      return s.walletDark;
    case 'muted':
      return s.walletMuted;
    case 'accent':
      return s.walletAccent;
    case 'primary':
      return s.walletPrimary;
    default: {
      const _exhaustive: never = tone;
      return _exhaustive;
    }
  }
};

const chartToken = (index: number): string => `var(--chart-${(index % 5) + 1})`;

const formatIncome = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const NetworkMark = ({ network }: { network: WalletNetwork }) => {
  if (network === 'visa') {
    return <span className={s.networkMark}>VISA</span>;
  }
  return (
    <span className={s.mastercard} aria-hidden>
      <span className={s.mastercardCircle} />
      <span className={s.mastercardCircle} />
    </span>
  );
};

type OverlayId = 'transfer' | 'request' | 'addCard' | null;

export const FinancePage = () => {
  const { toast } = useApp();
  const [range, setRange] = useState<'3m' | '6m'>('6m');
  const [type, setType] = useState<'all' | 'Income' | 'Expenses'>('all');
  const [overlay, setOverlay] = useState<OverlayId>(null);
  const [transferAmount, setTransferAmount] = useState('500');
  const [requestAmount, setRequestAmount] = useState('250');
  const [cards, setCards] = useState(WALLET_CARDS);
  const [cardName, setCardName] = useState('Travel Card');
  const [cardLast4, setCardLast4] = useState('4421');

  const transferValid = Number(transferAmount) > 0;
  const requestValid = Number(requestAmount) > 0;
  const cardValid = cardName.trim().length > 0 && /^\d{4}$/.test(cardLast4.trim());

  const notify = (title: string, description: string) => {
    toast({ title, description });
  };

  const months = range === '3m' ? EXPENSE_MONTHS.slice(-3) : EXPENSE_MONTHS;
  const tx = FINANCE_TRANSACTIONS.filter((t) => type === 'all' || t.type === type);

  return (
    <Page>
      <PageHeader
        title="Finance Dashboard"
        lead="Balance, income mix, expenses, and wallet activity for the selected period."
        actions={
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
        }
      />

      <section className={s.section} aria-labelledby="finance-kpi-heading">
        <h2 id="finance-kpi-heading" className={s.sectionHeading}>
          Key metrics
        </h2>
        <div className={s.kpiGrid}>
          {FINANCE_KPIS.map((kpi) => {
            const Icon = KPI_ICONS[kpi.id as keyof typeof KPI_ICONS];
            return (
              <Panel key={kpi.id} className={s.kpiCard}>
                <div className={s.kpiIntro}>
                  <SectionLabel icon={<Icon size={16} aria-hidden />}>{kpi.label}</SectionLabel>
                  <Badge tone={TONE_BADGE[kpi.tone]}>{kpi.change}</Badge>
                </div>
                <p className={s.kpiValue}>{kpi.value}</p>
                {kpi.hint ? <p className={s.kpiHint}>{kpi.hint}</p> : null}
                {kpi.id === 'balance' ? (
                  <div className={s.kpiActions}>
                    <Button size="sm" onClick={() => setOverlay('transfer')} icon={<ArrowLeftRight size={14} aria-hidden />}>
                      Transfer
                    </Button>
                    <Button size="sm" onClick={() => setOverlay('request')} icon={<HandCoins size={14} aria-hidden />}>
                      Request
                    </Button>
                  </div>
                ) : null}
                {kpi.sparkline ? (
                  <div className={s.sparkline}>
                    <Sparkline data={kpi.sparkline} aria-label={`${kpi.label} trend, last ${kpi.sparkline.length} months`} />
                  </div>
                ) : null}
              </Panel>
            );
          })}
        </div>
      </section>

      <div className={s.chartsRow}>
        <section aria-labelledby="income-heading" className={s.cardFill}>
          <Panel
            className={s.cardFill}
            title="Income Sources"
            actions={
              <Badge tone="muted">{Math.round((TOTAL_INCOME / 1000) * 10) / 10}k total</Badge>
            }
          >
            <div className={s.incomeChart}>
              <ChartContainer variant="bare">
                <DonutChart
                  data={INCOME_SOURCES.map((source, index) => ({ ...source, color: chartToken(index) }))}
                  size={196}
                  thickness={26}
                  showLegend={false}
                >
                  <div className={s.donutCenter}>
                    <p className={s.donutCenterLabel}>Total Income</p>
                    <p className={s.donutCenterValue}>{formatIncome(TOTAL_INCOME)}</p>
                  </div>
                </DonutChart>
              </ChartContainer>
              <div className={s.incomeLegend}>
                <div className={s.incomeLegendHead}>
                  <p className={s.incomeTotalLabel}>Total Income</p>
                  <p className={s.incomeTotalValue}>{formatIncome(TOTAL_INCOME)}</p>
                  <span>
                    <Badge tone="mint">
                      <ArrowUpRight size={14} aria-hidden /> 15.5% compared to last month
                    </Badge>
                  </span>
                </div>
                {INCOME_SOURCES.map((source, index) => (
                  <div key={source.label} className={s.incomeLegendRow}>
                    <span className={s.incomeLegendName}>
                      <span className={s.swatch} style={{ '--chart-color': chartToken(index) } as CSSProperties} aria-hidden />
                      {source.label}
                    </span>
                    <span className={s.incomeLegendAmount}>{formatIncome(source.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </section>

        <section aria-labelledby="expenses-heading" className={s.cardFill}>
          <Panel
            className={s.cardFill}
            title="Monthly Expenses"
            actions={
              <Button
                size="sm"
                onClick={() => notify('Expense report', 'Monthly expense report is ready to export.')}
              >
                View Report
              </Button>
            }
          >
            <div className={s.expensesBody}>
              <div className={s.expensesChart}>
                <ChartContainer variant="bare">
                  <GroupedBarChart data={months} series={EXPENSE_SERIES} />
                  <div className={s.chartFoot}>
                    <p className={s.chartFootTitle}>
                      <TrendingUp size={14} aria-hidden />
                      Trending up by 5.2% this month
                    </p>
                    <p className={s.chartFootHint}>Showing data from the last {months.length} months</p>
                  </div>
                </ChartContainer>
              </div>
              <div>
                <h3 className={s.summaryTitle}>Summary</h3>
                <div className={s.summaryList}>
                  {EXPENSE_SUMMARY.map((item) => (
                    <div key={item.label} className={s.summaryRow}>
                      <div className={s.summaryMeta}>
                        <span>{item.label}</span>
                        <span>{item.percent}%</span>
                      </div>
                      <Progress value={item.percent} aria-label={`${item.label} share of expenses`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </section>
      </div>

      <div className={s.bottomRow}>
        <section aria-labelledby="transactions-heading" className={s.cardFill}>
          <Panel
            className={s.cardFill}
            flush
            title="Transactions"
            description="Latest income and expense activity"
            actions={
              <Segmented
                label="Type"
                size="sm"
                value={type}
                onChange={setType}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'Income', label: 'Income' },
                  { value: 'Expenses', label: 'Expenses' },
                ]}
              />
            }
          >
            <TableWrap label="Transactions">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tx.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className={s.party}>
                          <Avatar initials={row.initials} size="sm" />
                          <span className={s.partyName}>{row.name}</span>
                        </div>
                      </td>
                      <td>{row.date}</td>
                      <td>
                        <span className={row.type === 'Income' ? s.amountIncome : s.amountExpense}>{row.type}</span>
                      </td>
                      <td className={row.amount > 0 ? s.amountIncome : s.amountExpense}>{formatUsd(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </Panel>
        </section>

        <div className={s.stack}>
          <section aria-labelledby="saving-heading">
            <Panel title="Saving Goal" description={`${SAVING_GOAL.progress}% Progress`}>
              <div className={s.savingBody}>
                <ProgressRing
                  value={SAVING_GOAL.progress}
                  size={132}
                  strokeWidth={10}
                  aria-label="Saving goal progress"
                >
                  <span className={s.savingAmount}>{SAVING_GOAL.progress}%</span>
                </ProgressRing>
                <p className={s.savingCaption}>
                  ${SAVING_GOAL.current.toLocaleString('en-US')}
                  <span className={s.savingTarget}> of ${SAVING_GOAL.target.toLocaleString('en-US')}</span>
                </p>
              </div>
            </Panel>
          </section>

          <section aria-labelledby="wallet-heading">
            <Panel
              title="My Wallet"
              description={`A total of ${cards.length} cards are listed`}
              actions={
                <Button size="sm" onClick={() => setOverlay('addCard')}>
                  Add New
                </Button>
              }
            >
              <ul className={s.walletList}>
                {cards.map((card) => (
                  <li key={card.id} className={s.walletRow}>
                    <div className={`${s.walletCardFace} ${walletToneClass(card.tone)}`} aria-hidden>
                      <NetworkMark network={card.network} />
                    </div>
                    <div className={s.walletMeta}>
                      <p className={s.walletName}>{card.name}</p>
                      <p className={s.walletNumber}>
                        {card.network === 'visa' ? '4532' : '5375'} **** **** {card.last4}
                      </p>
                    </div>
                    <p className={s.walletBalance}>{card.balance}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>
        </div>
      </div>

      <Dialog open={overlay === 'transfer'} onOpenChange={(open) => !open && setOverlay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer funds</DialogTitle>
            <DialogDescription>Move money from your primary balance to another account.</DialogDescription>
          </DialogHeader>
          <Input
            id="transfer-amount"
            label="Amount"
            value={transferAmount}
            onChange={(event) => setTransferAmount(event.target.value)}
            inputMode="decimal"
          />
          <DialogFooter>
            <Button onClick={() => setOverlay(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!transferValid}
              onClick={() => {
                setOverlay(null);
                notify('Transfer requested', `$${transferAmount.trim()} is queued from your primary balance.`);
              }}
            >
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={overlay === 'request'} onOpenChange={(open) => !open && setOverlay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request payment</DialogTitle>
            <DialogDescription>Send a payment request to a contact or client.</DialogDescription>
          </DialogHeader>
          <Input
            id="request-amount"
            label="Amount"
            value={requestAmount}
            onChange={(event) => setRequestAmount(event.target.value)}
            inputMode="decimal"
          />
          <DialogFooter>
            <Button onClick={() => setOverlay(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!requestValid}
              onClick={() => {
                setOverlay(null);
                notify('Request sent', `Payment request for $${requestAmount.trim()} was sent.`);
              }}
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={overlay === 'addCard'} onOpenChange={(open) => !open && setOverlay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a card</DialogTitle>
            <DialogDescription>Store a new wallet card for transfers and payouts.</DialogDescription>
          </DialogHeader>
          <Input id="card-name" label="Card name" value={cardName} onChange={(event) => setCardName(event.target.value)} />
          <Input
            id="card-last4"
            label="Last 4 digits"
            value={cardLast4}
            onChange={(event) => setCardLast4(event.target.value)}
          />
          <DialogFooter>
            <Button onClick={() => setOverlay(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!cardValid}
              onClick={() => {
                const name = cardName.trim();
                const last4 = cardLast4.trim();
                setCards((prev) => [
                  ...prev,
                  {
                    id: `card-${prev.length + 1}-${last4}`,
                    name,
                    last4,
                    network: 'visa',
                    balance: '$0',
                    tone: 'primary',
                  },
                ]);
                setOverlay(null);
                notify('Card added', `${name} ···· ${last4} was saved to your wallet.`);
              }}
            >
              Add card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};
