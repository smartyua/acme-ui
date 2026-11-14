import { useMemo, useState } from 'react';
import { Download, Plus, Receipt } from 'lucide-react';

import { Count, Segmented } from '../components/primitives';
import { Badge, Button, Empty, FormField, Input, Meter, Modal, PageHeader, Panel, TableWrap, cx, tableClass } from '../components/ui';
import { INVOICES, INVOICE_TONE, PAYMENT_METHODS, PLANS, type InvoiceStatus, type PaymentMethod, type PlanOption } from '../content/business';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import s from './pages.module.scss';

export const PaymentsPage = () => {
  const { toast } = useApp();
  const [plan, setPlan] = useState<PlanOption['id']>('pro');
  const [planOpen, setPlanOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanOption['id']>('pro');
  const [methods, setMethods] = useState(PAYMENT_METHODS);
  const [cardOpen, setCardOpen] = useState(false);
  const [card, setCard] = useState({ number: '', exp: '', cvc: '' });
  const [invoices, setInvoices] = useState(INVOICES);
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');

  const current = PLANS.find((p) => p.id === plan)!;
  const rows = useMemo(() => invoices.filter((i) => filter === 'all' || i.status === filter), [invoices, filter]);

  const digits = card.number.replace(/\D/g, '');
  const cardValid = digits.length >= 15 && /^\d{2}\/\d{2}$/.test(card.exp) && /^\d{3,4}$/.test(card.cvc);

  const addCard = () => {
    const m: PaymentMethod = { id: `pm_${Date.now()}`, brand: digits.startsWith('5') ? 'Mastercard' : 'Visa', last4: digits.slice(-4), exp: card.exp, isDefault: false };
    setMethods((list) => [...list, m]);
    setCard({ number: '', exp: '', cvc: '' });
    setCardOpen(false);
    toast({ title: 'Card added', description: `${m.brand} ···· ${m.last4}`, tone: 'success' });
  };

  return (
    <Page>
      <PageHeader title="Payments" lead="Your plan, payment methods and invoice history." />

      <div className={s.split}>
        <Panel
          title={`${current.name} plan`}
          description={`$${current.price}/month · renews Aug 1, 2026`}
          actions={
            <Button
              onClick={() => {
                setPendingPlan(plan);
                setPlanOpen(true);
              }}
            >
              Change plan
            </Button>
          }
        >
          <div className={s.usage}>
            <div>
              <strong>Seats</strong>
              <span>7 of {current.seats}</span>
            </div>
            <Meter label="Seats used" value={7} max={current.seats} tone={7 / current.seats > 0.85 ? 'danger' : 'accent'} />
          </div>
          <div className={s.usage}>
            <div>
              <strong>Workflow runs</strong>
              <span>{plan === 'business' ? '18,240 · unlimited' : `18,240 of ${plan === 'starter' ? '1,000' : '25,000'}`}</span>
            </div>
            <Meter label="Workflow runs used" value={plan === 'business' ? 18 : 18240} max={plan === 'business' ? 100 : plan === 'starter' ? 1000 : 25000} tone={plan === 'starter' ? 'danger' : 'warning'} />
          </div>
          <div className={s.usage}>
            <div>
              <strong>API quota</strong>
              <span>400k of 500k</span>
            </div>
            <Meter label="API quota used" value={400} max={500} tone="warning" />
          </div>
        </Panel>

        <Panel
          title="Payment methods"
          actions={
            <Button size="sm" icon={<Plus size={14} aria-hidden />} onClick={() => setCardOpen(true)}>
              Add card
            </Button>
          }
        >
          {methods.map((m) => (
            <div key={m.id} className={s.cardTile}>
              <span className={s.cardBrand}>{m.brand === 'Mastercard' ? 'MC' : m.brand}</span>
              <div className={s.rowMain}>
                <strong>
                  {m.brand} ···· {m.last4}
                </strong>
                <span>Expires {m.exp}</span>
              </div>
              {m.isDefault ? (
                <Badge tone="accent">Default</Badge>
              ) : (
                <div className={s.rowEnd}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMethods((list) => list.map((x) => ({ ...x, isDefault: x.id === m.id })));
                      toast({ title: 'Default card updated', description: `${m.brand} ···· ${m.last4}` });
                    }}
                  >
                    Make default
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setMethods((list) => list.filter((x) => x.id !== m.id));
                      toast({ title: 'Card removed', tone: 'danger' });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </Panel>
      </div>

      <Panel
        flush
        title="Invoices"
        description={`${invoices.filter((i) => i.status === 'open' || i.status === 'failed').length} need attention`}
        actions={
          <Segmented
            label="Invoice status"
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'paid', label: 'Paid' },
              { value: 'open', label: 'Open' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        }
      >
        {rows.length === 0 ? (
          <Empty icon={<Receipt size={18} aria-hidden />} title="No invoices with this status" />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th className={s.hideSm}>Description</th>
                  <th>Status</th>
                  <th className={s.num}>Amount</th>
                  <th className={s.hideMd}>Method</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className={s.personText}>
                        <span>{i.id}</span>
                        <span>{i.date}</span>
                      </div>
                    </td>
                    <td className={s.hideSm}>{i.description}</td>
                    <td>
                      <Count value={i.status[0].toUpperCase() + i.status.slice(1)} tone={INVOICE_TONE[i.status]} />
                    </td>
                    <td className={s.num}>{i.amount}</td>
                    <td className={`${s.hideMd} ${s.muted}`}>{i.method}</td>
                    <td className={s.num}>
                      {i.status === 'open' || i.status === 'failed' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setInvoices((list) => list.map((x) => (x.id === i.id ? { ...x, status: 'paid', method: 'Visa ···· 4242' } : x)));
                            toast({ title: 'Payment successful', description: `${i.id} · ${i.amount}`, tone: 'success' });
                          }}
                        >
                          Pay now
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" aria-label={`Download ${i.id}`} icon={<Download size={14} aria-hidden />} onClick={() => toast({ title: 'Downloading invoice', description: `${i.id}.pdf` })} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>

      <Modal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        title="Change plan"
        description="Changes apply immediately; we prorate the difference."
        width="lg"
        footer={
          <>
            <Button onClick={() => setPlanOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={pendingPlan === plan}
              onClick={() => {
                setPlan(pendingPlan);
                setPlanOpen(false);
                toast({ title: 'Plan changed', description: `You are now on ${PLANS.find((p) => p.id === pendingPlan)?.name}.`, tone: 'success' });
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className={s.planGrid} role="radiogroup" aria-label="Plans">
          {PLANS.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={pendingPlan === p.id} className={cx(s.plan, pendingPlan === p.id && s.choiceActive)} onClick={() => setPendingPlan(p.id)}>
              <strong>
                {p.name} {p.id === plan ? <Badge tone="accent">Current</Badge> : null}
              </strong>
              <span className={s.price}>
                ${p.price}
                <small>/month</small>
              </span>
              <ul>
                {p.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        title="Add card"
        width="sm"
        footer={
          <>
            <Button onClick={() => setCardOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!cardValid} onClick={addCard}>
              Add card
            </Button>
          </>
        }
      >
        <FormField label="Card number">
          {(id) => (
            <Input
              id={id}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) =>
                setCard({
                  ...card,
                  number: e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 16)
                    .replace(/(\d{4})(?=\d)/g, '$1 '),
                })
              }
            />
          )}
        </FormField>
        <div className={s.formGrid}>
          <FormField label="Expiry">
            {(id) => (
              <Input
                id={id}
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={card.exp}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCard({ ...card, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
                }}
              />
            )}
          </FormField>
          <FormField label="CVC">
            {(id) => <Input id={id} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} />}
          </FormField>
        </div>
      </Modal>
    </Page>
  );
};
