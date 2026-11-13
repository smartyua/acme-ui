import { useMemo, useState } from 'react';
import { Trash2, UserPlus, Users } from 'lucide-react';

import { Avatar, Count, Segmented } from '../components/primitives';
import { Badge, Button, Empty, FormField, Input, Modal, PageHeader, Panel, SearchBox, Select, TableWrap, tableClass } from '../components/ui';
import { CUSTOMERS, PLAN_LABEL, type Customer, type CustomerStatus, type Plan } from '../content/business';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import s from './pages.module.scss';

const STATUS_TONE: Record<CustomerStatus, 'mint' | 'lemon' | 'rose'> = { active: 'mint', invited: 'lemon', churned: 'rose' };
const PLAN_TONE: Record<Plan, 'neutral' | 'sky' | 'lavender'> = { free: 'neutral', pro: 'sky', enterprise: 'lavender' };

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export const CustomersPage = () => {
  const { toast } = useApp();
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState<Plan | 'all'>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', plan: 'pro' as Plan });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .filter((c) => plan === 'all' || c.plan === plan)
      .filter((c) => !q || [c.name, c.email, c.company].some((v) => v.toLowerCase().includes(q)));
  }, [customers, query, plan]);

  const mrr = customers.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.mrr, 0);
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);

  const invite = () => {
    const c: Customer = {
      id: `CU-${110 + customers.length}`,
      name: form.name.trim(),
      initials: initialsOf(form.name) || '??',
      email: form.email.trim(),
      company: form.company.trim() || '—',
      plan: form.plan,
      mrr: 0,
      lastActive: 'Invited just now',
      status: 'invited',
    };
    setCustomers((list) => [c, ...list]);
    setInviteOpen(false);
    setForm({ name: '', email: '', company: '', plan: 'pro' });
    toast({ title: 'Invitation sent', description: `${c.email} will get an email to join.`, tone: 'success' });
  };

  return (
    <Page>
      <PageHeader
        title="Customers"
        lead="Accounts, plans and how recently they were active."
        actions={
          <Button variant="primary" icon={<UserPlus size={15} aria-hidden />} onClick={() => setInviteOpen(true)}>
            Invite customer
          </Button>
        }
      />

      <div className={s.kpis}>
        <div className={s.stat}>
          <span className={s.statLabel}>Customers</span>
          <span className={s.statValue}>{customers.length}</span>
          <span className={s.statHint}>{customers.filter((c) => c.status === 'active').length} active</span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>MRR</span>
          <span className={s.statValue}>${mrr.toLocaleString('en-US')}</span>
          <span className={s.statHint}>
            <span className={s.up}>+4.2%</span> vs last month
          </span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Enterprise</span>
          <span className={s.statValue}>{customers.filter((c) => c.plan === 'enterprise').length}</span>
          <span className={s.statHint}>accounts on annual contracts</span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Churned</span>
          <span className={s.statValue}>{customers.filter((c) => c.status === 'churned').length}</span>
          <span className={s.statHint}>
            <span className={s.down}>1</span> this quarter
          </span>
        </div>
      </div>

      <Panel flush title="All customers" description={`${rows.length} shown`}>
        <div className={s.toolbar}>
          <SearchBox value={query} onChange={setQuery} placeholder="Search name, email or company" className={s.toolbarSearch} />
          <Segmented
            label="Plan"
            size="sm"
            value={plan}
            onChange={setPlan}
            options={[
              { value: 'all', label: 'All plans' },
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
              { value: 'enterprise', label: 'Enterprise' },
            ]}
          />
        </div>
        {rows.length === 0 ? (
          <Empty icon={<Users size={18} />} title="No customers match" />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th className={`${s.num} ${s.hideSm}`}>MRR</th>
                  <th className={s.hideMd}>Last active</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className={s.person}>
                        <Avatar initials={c.initials} />
                        <div className={s.personText}>
                          <span>{c.name}</span>
                          <span>
                            {c.email} · {c.company}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Select
                        value={c.plan}
                        aria-label={`Plan for ${c.name}`}
                        onChange={(e) => {
                          const next = e.target.value as Plan;
                          setCustomers((list) => list.map((x) => (x.id === c.id ? { ...x, plan: next } : x)));
                          toast({ title: 'Plan updated', description: `${c.name} moved to ${PLAN_LABEL[next]}.` });
                        }}
                      >
                        {(Object.keys(PLAN_LABEL) as Plan[]).map((p) => (
                          <option key={p} value={p}>
                            {PLAN_LABEL[p]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td>
                      <Count value={c.status[0].toUpperCase() + c.status.slice(1)} tone={STATUS_TONE[c.status]} />
                    </td>
                    <td className={`${s.num} ${s.hideSm}`}>
                      <Badge tone={PLAN_TONE[c.plan]}>${c.mrr}</Badge>
                    </td>
                    <td className={`${s.hideMd} ${s.muted}`}>{c.lastActive}</td>
                    <td className={s.num}>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Remove ${c.name}`}
                        icon={<Trash2 size={14} aria-hidden />}
                        onClick={() => {
                          setCustomers((list) => list.filter((x) => x.id !== c.id));
                          toast({ title: 'Customer removed', description: c.name, tone: 'danger' });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite customer"
        description="They’ll receive an email with a link to set up their account."
        footer={
          <>
            <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!form.name.trim() || !emailOk} onClick={invite}>
              Send invite
            </Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <FormField label="Full name">{(id) => <Input id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</FormField>
          <FormField label="Email" hint={form.email && !emailOk ? 'Enter a valid email address' : undefined}>
            {(id) => <Input id={id} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}
          </FormField>
          <FormField label="Company">{(id) => <Input id={id} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />}</FormField>
          <FormField label="Plan">
            {(id) => (
              <Select id={id} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as Plan })}>
                {(Object.keys(PLAN_LABEL) as Plan[]).map((p) => (
                  <option key={p} value={p}>
                    {PLAN_LABEL[p]}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
      </Modal>
    </Page>
  );
};
