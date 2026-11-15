import { CircleCheck, FileText, Hourglass, MoreHorizontal, Plus, ThumbsUp } from 'lucide-react';

import styles from './EstimateCard.module.scss';
import { Button, cx } from './ui';

export type EstimateStatus = 'accepted' | 'draft' | 'pending' | 'paid';
export type EstimateItemStatus = 'paid' | 'pending' | 'unbilled';
export type EstimateDatePeriod = 'sep-oct' | 'aug-sep';

export type EstimateLineItem = {
  id: string;
  label: string;
  amount: number;
  status: EstimateItemStatus;
};

export type Estimate = {
  id: string;
  client: string;
  project: string;
  code: string;
  date: string;
  period: EstimateDatePeriod;
  status: EstimateStatus;
  total: number;
  invoiced: number;
  toBeInvoiced: number;
  paid: number;
  due: number;
  showBillingGrid?: boolean;
  items: EstimateLineItem[];
  ctaLabel: string;
};

export const formatEstimateCurrency = (amount: number): string => {
  if (amount === 0) return '$0';
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const ESTIMATE_STATUS_LABEL: Record<EstimateStatus, string> = {
  accepted: 'Accepted',
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid',
};

const renderStatusIcon = (status: EstimateStatus) => {
  switch (status) {
    case 'accepted':
      return <ThumbsUp size={14} aria-hidden />;
    case 'draft':
      return <FileText size={14} aria-hidden />;
    case 'pending':
      return <Hourglass size={14} aria-hidden />;
    case 'paid':
      return <CircleCheck size={14} aria-hidden />;
  }
};

export type EstimateCardProps = {
  estimate: Estimate;
  onSelect: (estimate: Estimate) => void;
  onAction: (estimate: Estimate) => void;
  onMore?: (estimate: Estimate) => void;
};

export const EstimateCard = ({ estimate, onSelect, onAction, onMore }: EstimateCardProps) => {
  const showBilling =
    estimate.status !== 'draft' && (estimate.invoiced > 0 || Boolean(estimate.showBillingGrid));

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button type="button" className={styles.clientBtn} onClick={() => onSelect(estimate)}>
            {estimate.client}
          </button>
          <div className={styles.headerRight}>
            <span className={cx(styles.statusPill, styles[`status-${estimate.status}`])}>
              {renderStatusIcon(estimate.status)}
              {ESTIMATE_STATUS_LABEL[estimate.status]}
            </span>
            <button
              type="button"
              className={styles.moreBtn}
              aria-label={`Options for ${estimate.client} ${estimate.code}`}
              onClick={() => (onMore ? onMore(estimate) : onSelect(estimate))}
            >
              <MoreHorizontal size={15} aria-hidden />
            </button>
          </div>
        </div>
        <p className={styles.meta}>
          {estimate.project} · {estimate.code} · {estimate.date}
        </p>
      </div>

      <div className={styles.financialBand}>
        <div className={styles.totalBlock}>
          <span className={styles.finLabel}>Estimate total</span>
          <strong className={styles.totalAmount}>{formatEstimateCurrency(estimate.total)}</strong>
        </div>

        {showBilling ? (
          <div className={styles.billingGrid}>
            <div className={styles.billingRow}>
              <div className={styles.billingCell}>
                <span className={styles.finLabel}>Total invoiced</span>
                <span className={styles.billingValue}>{formatEstimateCurrency(estimate.invoiced)}</span>
              </div>
              <div className={styles.billingCell}>
                <span className={styles.finLabel}>To be invoiced</span>
                <span className={styles.billingValue}>{formatEstimateCurrency(estimate.toBeInvoiced)}</span>
              </div>
            </div>
            <div className={cx(styles.billingRow, styles.billingRowBottom)}>
              <div className={styles.billingCell}>
                <span className={styles.finLabel}>Paid</span>
                <span className={styles.billingValue}>{formatEstimateCurrency(estimate.paid)}</span>
              </div>
              <div className={styles.billingCell}>
                <span className={styles.finLabel}>Due</span>
                <span className={styles.billingValue}>{formatEstimateCurrency(estimate.due)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {estimate.items.length > 0 ? (
        <div className={styles.breakdown}>
          <div className={styles.breakdownHeader}>
            <span>Estimate breakdown</span>
            <span className={styles.breakdownTotal}>{formatEstimateCurrency(estimate.total)}</span>
          </div>

          <div className={styles.segmentedBar} aria-hidden>
            {estimate.items.map((item) => (
              <span
                key={item.id}
                className={cx(styles.segment, styles[`segment-${item.status}`])}
                style={{ flexGrow: Math.max(item.amount, 1) }}
              />
            ))}
          </div>

          <ul className={styles.itemList}>
            {estimate.items.map((item) => (
              <li key={item.id} className={styles.itemRow}>
                <span className={styles.itemLeft}>
                  <span className={cx(styles.swatch, styles[`swatch-${item.status}`])} aria-hidden />
                  <span className={cx(styles.itemLabel, item.status === 'unbilled' && styles.itemLabelMuted)}>
                    {item.label}
                  </span>
                </span>
                <span className={styles.itemRight}>
                  <span
                    className={cx(styles.itemAmount, item.status === 'unbilled' && styles.itemAmountMuted)}
                  >
                    {formatEstimateCurrency(item.amount)}
                  </span>
                  {item.status === 'paid' ? (
                    <span className={cx(styles.itemStatus, styles.itemStatusPaid)}>
                      <CircleCheck size={14} aria-hidden />
                      Paid
                    </span>
                  ) : null}
                  {item.status === 'pending' ? (
                    <span className={cx(styles.itemStatus, styles.itemStatusPending)}>
                      <Hourglass size={14} aria-hidden />
                      Pending
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.footer}>
        <Button size="sm" block icon={<Plus size={15} aria-hidden />} onClick={() => onAction(estimate)}>
          {estimate.ctaLabel}
        </Button>
      </div>
    </article>
  );
};
