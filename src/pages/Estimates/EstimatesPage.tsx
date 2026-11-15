import { useMemo, useState } from 'react';
import { CircleCheck, CirclePlay, FileText, Plus, Send } from 'lucide-react';

import {
  ESTIMATE_STATUS_LABEL,
  EstimateCard,
  formatEstimateCurrency,
  type Estimate,
  type EstimateStatus,
} from '../../components/EstimateCard';
import { Count } from '../../components/primitives';
import { Button, Drawer, Empty, FormField, Input, Modal, SearchBox, Select, cx } from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import styles from './Estimates.module.scss';
import {
  ESTIMATE_CATEGORIES,
  ESTIMATE_DATE_RANGES,
  INITIAL_ESTIMATES,
  TUTORIAL_STEPS,
  formatCompactEstimateSum,
  matchesEstimateTab,
  type DateRangeFilter,
  type EstimateTab,
} from './estimatesData';

const STATUS_TONE: Record<EstimateStatus, 'mint' | 'lemon' | 'muted'> = {
  accepted: 'mint',
  paid: 'mint',
  pending: 'lemon',
  draft: 'muted',
};

const roundCents = (value: number): number => Math.round(value * 100) / 100;

export const EstimatesPage = () => {
  const { toast } = useApp();
  const [estimates, setEstimates] = useState<Estimate[]>(INITIAL_ESTIMATES);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('sep-oct');
  const [category, setCategory] = useState<string>('all');
  const [statusTab, setStatusTab] = useState<EstimateTab>('all');
  const [query, setQuery] = useState('');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const [form, setForm] = useState<{
    client: string;
    project: string;
    total: string;
    status: EstimateStatus;
  }>({
    client: '',
    project: ESTIMATE_CATEGORIES[0],
    total: '8450.00',
    status: 'accepted',
  });

  const scopedEstimates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return estimates
      .filter((est) => dateRange === 'all' || est.period === dateRange)
      .filter((est) => category === 'all' || est.project === category)
      .filter(
        (est) =>
          !q ||
          [est.client, est.project, est.code, est.date, ESTIMATE_STATUS_LABEL[est.status]].some((field) =>
            field.toLowerCase().includes(q),
          ),
      );
  }, [estimates, dateRange, category, query]);

  const tabs = useMemo(() => {
    const defs: Array<{ id: EstimateTab; label: string }> = [
      { id: 'all', label: 'All' },
      { id: 'draft', label: 'Draft' },
      { id: 'pending', label: 'Pending' },
      { id: 'paid', label: 'Paid' },
    ];
    return defs.map((def) => {
      const matching = scopedEstimates.filter((est) => matchesEstimateTab(est, def.id));
      const sum = matching.reduce((acc, est) => acc + est.total, 0);
      return { ...def, count: matching.length, sum };
    });
  }, [scopedEstimates]);

  const visibleEstimates = useMemo(
    () => scopedEstimates.filter((est) => matchesEstimateTab(est, statusTab)),
    [scopedEstimates, statusTab],
  );

  const activeEstimate = useMemo(
    () => (activeId ? (estimates.find((est) => est.id === activeId) ?? null) : null),
    [estimates, activeId],
  );

  const parsedTotal = Number(form.total);
  const totalValid = Number.isFinite(parsedTotal) && parsedTotal > 0;
  const canCreate = form.client.trim().length > 0 && totalValid;

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setDateRange('all');
    setStatusTab('all');
  };

  const handleCreateEstimate = () => {
    if (!canCreate) return;
    const total = roundCents(parsedTotal);
    const nextNumber = 1092 + estimates.length - INITIAL_ESTIMATES.length;
    const code = `#00${nextNumber}`;
    const period = dateRange === 'aug-sep' ? 'aug-sep' : 'sep-oct';
    const date = period === 'aug-sep' ? 'Sep 22, 2026' : 'Oct 22, 2026';

    let created: Estimate;
    if (form.status === 'draft') {
      created = {
        id: `est-${nextNumber}`,
        client: form.client.trim(),
        project: form.project,
        code,
        date,
        period,
        status: 'draft',
        total,
        invoiced: 0,
        toBeInvoiced: total,
        paid: 0,
        due: 0,
        items: [],
        ctaLabel: 'Send estimate for approval',
      };
    } else if (form.status === 'paid') {
      created = {
        id: `est-${nextNumber}`,
        client: form.client.trim(),
        project: form.project,
        code,
        date,
        period,
        status: 'paid',
        total,
        invoiced: total,
        toBeInvoiced: 0,
        paid: total,
        due: 0,
        items: [{ id: `${nextNumber}-1`, label: 'Completed Scope Payment', amount: total, status: 'paid' }],
        ctaLabel: 'Review invoice & balance',
      };
    } else if (form.status === 'pending') {
      const deposit = roundCents(total * 0.5);
      const remainder = roundCents(total - deposit);
      created = {
        id: `est-${nextNumber}`,
        client: form.client.trim(),
        project: form.project,
        code,
        date,
        period,
        status: 'pending',
        total,
        invoiced: deposit,
        toBeInvoiced: remainder,
        paid: 0,
        due: deposit,
        items: [
          { id: `${nextNumber}-1`, label: 'Initial Deposit Draw', amount: deposit, status: 'pending' },
          { id: `${nextNumber}-2`, label: 'Not itemized', amount: remainder, status: 'unbilled' },
        ],
        ctaLabel: 'Review invoice & balance',
      };
    } else {
      const paidPart = roundCents(total * 0.4);
      const pendingPart = roundCents(total * 0.35);
      const unbilledPart = roundCents(total - paidPart - pendingPart);
      created = {
        id: `est-${nextNumber}`,
        client: form.client.trim(),
        project: form.project,
        code,
        date,
        period,
        status: 'accepted',
        total,
        invoiced: roundCents(paidPart + pendingPart),
        toBeInvoiced: unbilledPart,
        paid: paidPart,
        due: pendingPart,
        items: [
          { id: `${nextNumber}-1`, label: 'Deposit Invoice', amount: paidPart, status: 'paid' },
          { id: `${nextNumber}-2`, label: 'Progress Draw', amount: pendingPart, status: 'pending' },
          { id: `${nextNumber}-3`, label: 'Not itemized', amount: unbilledPart, status: 'unbilled' },
        ],
        ctaLabel: 'Add another invoice for the estimate',
      };
    }

    setEstimates((prev) => [created, ...prev]);
    if (!matchesEstimateTab(created, statusTab)) {
      setStatusTab('all');
    }
    if (category !== 'all' && category !== created.project) {
      setCategory('all');
    }
    setNewOpen(false);
    setForm({ client: '', project: ESTIMATE_CATEGORIES[0], total: '8450.00', status: 'accepted' });
    toast({
      title: 'Estimate created',
      description: `${created.client} (${created.code}) added for ${formatEstimateCurrency(created.total)}.`,
      tone: 'success',
    });
  };

  const handleSendDraft = (est: Estimate) => {
    const deposit = roundCents(est.total * 0.5);
    const remainder = roundCents(est.total - deposit);
    setEstimates((prev) =>
      prev.map((item) =>
        item.id === est.id
          ? {
              ...item,
              status: 'pending',
              invoiced: deposit,
              toBeInvoiced: remainder,
              due: deposit,
              items: [
                { id: `${est.id}-dep`, label: 'Initial Deposit Draw', amount: deposit, status: 'pending' },
                { id: `${est.id}-rem`, label: 'Not itemized', amount: remainder, status: 'unbilled' },
              ],
              ctaLabel: 'Review invoice & balance',
            }
          : item,
      ),
    );
    toast({
      title: 'Estimate sent to client',
      description: `${est.code} moved to Pending with a ${formatEstimateCurrency(deposit)} deposit draw.`,
      tone: 'success',
    });
  };

  const handleCreateDraw = (est: Estimate) => {
    const drawAmount = est.toBeInvoiced > 0 ? est.toBeInvoiced : 750;
    setEstimates((prev) =>
      prev.map((item) => {
        if (item.id !== est.id) return item;
        if (item.toBeInvoiced > 0) {
          const keptItems = item.items.filter((li) => li.status !== 'unbilled');
          return {
            ...item,
            invoiced: item.total,
            toBeInvoiced: 0,
            due: roundCents(item.due + drawAmount),
            items: [
              ...keptItems,
              {
                id: `${item.id}-draw-${keptItems.length + 1}`,
                label: `Invoice Draw ${keptItems.length + 1}`,
                amount: drawAmount,
                status: 'pending',
              },
            ],
            ctaLabel: 'Review invoice & balance',
          };
        }
        const nextTotal = roundCents(item.total + drawAmount);
        return {
          ...item,
          status: 'accepted',
          total: nextTotal,
          invoiced: roundCents(item.invoiced + drawAmount),
          due: roundCents(item.due + drawAmount),
          items: [
            ...item.items,
            {
              id: `${item.id}-co-${item.items.length + 1}`,
              label: 'Change Order Draw',
              amount: drawAmount,
              status: 'pending',
            },
          ],
          ctaLabel: 'Review invoice & balance',
        };
      }),
    );
    toast({
      title: 'Invoice draw created',
      description: `${formatEstimateCurrency(drawAmount)} billed on ${est.client} (${est.code}).`,
      tone: 'success',
    });
  };

  const handleMarkBalancePaid = (est: Estimate) => {
    if (est.due <= 0) return;
    const settled = est.due;
    setEstimates((prev) =>
      prev.map((item) => {
        if (item.id !== est.id) return item;
        const paidNow = roundCents(item.paid + item.due);
        const fullyDone = item.toBeInvoiced === 0;
        return {
          ...item,
          status: fullyDone ? 'paid' : 'accepted',
          paid: paidNow,
          due: 0,
          items: item.items.map((li) => (li.status === 'pending' ? { ...li, status: 'paid' } : li)),
          ctaLabel: fullyDone ? 'Review invoice & balance' : 'Add another invoice for the estimate',
        };
      }),
    );
    toast({
      title: 'Balance marked paid',
      description: `${formatEstimateCurrency(settled)} recorded as paid for ${est.client}.`,
      tone: 'success',
    });
  };

  return (
    <Page>
      <header className={styles.topBar}>
        <div className={styles.titleGroup}>
          <h1>Estimates</h1>
          <Button
            variant="ghost"
            size="sm"
            icon={<CirclePlay size={15} aria-hidden />}
            onClick={() => setTutorialOpen(true)}
          >
            Tutorial video
          </Button>
        </div>

        <div className={styles.headerControls}>
          <Select
            aria-label="Estimate date range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
          >
            {ESTIMATE_DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter estimates"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">Filter estimates: All</option>
            {ESTIMATE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Button variant="primary" icon={<Plus size={15} aria-hidden />} onClick={() => setNewOpen(true)}>
            New estimate
          </Button>
        </div>
      </header>

      <section className={styles.surface} aria-label="Estimates directory">
        <div className={styles.surfaceHeader}>
          <div className={styles.searchRow}>
            <SearchBox value={query} onChange={setQuery} placeholder="Search estimates…" shortcut="/" />
          </div>

          <div className={styles.tabBar} role="tablist" aria-label="Estimate status">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={statusTab === tab.id}
                className={cx(styles.tab, statusTab === tab.id && styles.tabActive)}
                onClick={() => setStatusTab(tab.id)}
              >
                <span className={styles.tabLabel}>{tab.label}</span>
                <Count tone="muted" value={tab.count} />
                <span className={styles.tabTotal}>{formatCompactEstimateSum(tab.sum)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.gridWrap}>
          {visibleEstimates.length === 0 ? (
            <Empty icon={<FileText size={18} aria-hidden />} title="No estimates match these filters">
              Try clearing your search or switching date ranges.
              <br />
              <span className={styles.emptyAction}>
                <Button size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              </span>
            </Empty>
          ) : (
            <div className={styles.grid}>
              {visibleEstimates.map((estimate) => (
                <EstimateCard
                  key={estimate.id}
                  estimate={estimate}
                  onSelect={(est) => setActiveId(est.id)}
                  onAction={(est) => setActiveId(est.id)}
                  onMore={(est) => setActiveId(est.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Drawer
        open={Boolean(activeEstimate)}
        onClose={() => setActiveId(null)}
        title={activeEstimate ? `${activeEstimate.client} · ${activeEstimate.code}` : ''}
        footer={
          activeEstimate ? (
            activeEstimate.status === 'draft' ? (
              <Button icon={<Send size={15} aria-hidden />} onClick={() => handleSendDraft(activeEstimate)}>
                Send estimate for approval
              </Button>
            ) : (
              <>
                <Button
                  icon={<Plus size={15} aria-hidden />}
                  onClick={() => handleCreateDraw(activeEstimate)}
                >
                  Create invoice draw
                </Button>
                <Button
                  icon={<CircleCheck size={15} aria-hidden />}
                  disabled={activeEstimate.due <= 0}
                  onClick={() => handleMarkBalancePaid(activeEstimate)}
                >
                  Mark balance paid
                </Button>
              </>
            )
          ) : undefined
        }
      >
        {activeEstimate ? (
          <>
            <div className={styles.drawerMetaRow}>
              <p className={styles.drawerSub}>
                {activeEstimate.project} · {activeEstimate.date}
              </p>
              <Count
                value={ESTIMATE_STATUS_LABEL[activeEstimate.status]}
                tone={STATUS_TONE[activeEstimate.status]}
              />
            </div>

            <dl className={styles.dl}>
              <dt>Estimate total</dt>
              <dd>{formatEstimateCurrency(activeEstimate.total)}</dd>
              <dt>Total invoiced</dt>
              <dd>{formatEstimateCurrency(activeEstimate.invoiced)}</dd>
              <dt>To be invoiced</dt>
              <dd>{formatEstimateCurrency(activeEstimate.toBeInvoiced)}</dd>
              <dt>Paid</dt>
              <dd>{formatEstimateCurrency(activeEstimate.paid)}</dd>
              <dt>Due</dt>
              <dd>{formatEstimateCurrency(activeEstimate.due)}</dd>
            </dl>

            <div className={styles.drawerSection}>
              <h3>Breakdown & draws</h3>
              {activeEstimate.items.length === 0 ? (
                <p className={styles.drawerNote}>
                  This draft has not been itemized into invoice draws yet. Send the estimate for approval to
                  generate the initial deposit schedule.
                </p>
              ) : (
                <ul className={styles.drawerItems}>
                  {activeEstimate.items.map((item) => (
                    <li key={item.id} className={styles.drawerItem}>
                      <span className={styles.drawerItemName}>{item.label}</span>
                      <span className={styles.drawerItemRight}>
                        <span>{formatEstimateCurrency(item.amount)}</span>
                        <Count
                          value={
                            item.status === 'paid'
                              ? 'Paid'
                              : item.status === 'pending'
                                ? 'Pending'
                                : 'Unbilled'
                          }
                          tone={
                            item.status === 'paid' ? 'mint' : item.status === 'pending' ? 'lemon' : 'muted'
                          }
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </Drawer>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New estimate"
        description="Create a project estimate and configure its initial billing status."
        footer={
          <>
            <Button onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!canCreate} onClick={handleCreateEstimate}>
              Create estimate
            </Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.fullSpan}>
            <FormField label="Client name">
              {(id) => (
                <Input
                  id={id}
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="e.g. Jordan Mercer"
                />
              )}
            </FormField>
          </div>

          <FormField label="Project type">
            {(id) => (
              <Select
                id={id}
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
              >
                {ESTIMATE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField label="Status">
            {(id) => (
              <Select
                id={id}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EstimateStatus })}
              >
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="paid">Paid</option>
              </Select>
            )}
          </FormField>

          <div className={styles.fullSpan}>
            <FormField
              label="Estimate total (USD)"
              hint={form.total && !totalValid ? 'Enter a positive dollar amount' : undefined}
            >
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: e.target.value })}
                  placeholder="8450.00"
                />
              )}
            </FormField>
          </div>
        </div>
      </Modal>

      <Modal
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        width="sm"
        title="Estimates workflow walkthrough"
        description="How construction estimates move from draft scope to final draw reconciliation."
        footer={
          <Button variant="primary" onClick={() => setTutorialOpen(false)}>
            Got it
          </Button>
        }
      >
        <ol className={styles.stepList}>
          {TUTORIAL_STEPS.map((step) => (
            <li key={step.step} className={styles.stepItem}>
              <span className={styles.stepBadge} aria-hidden>
                {step.step}
              </span>
              <div className={styles.stepText}>
                <strong>{step.title}</strong>
                <span>{step.detail}</span>
              </div>
            </li>
          ))}
        </ol>
      </Modal>
    </Page>
  );
};
