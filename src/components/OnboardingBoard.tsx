import { type ReactNode } from 'react';
import { ChevronDown, MessageSquare, MoreVertical, Paperclip } from 'lucide-react';

import { type Tone } from '../data';
import { Avatar, Count } from './primitives';
import { Badge, cx } from './ui';
import styles from './OnboardingBoard.module.scss';

export type OnboardingPriority = 'High' | 'Medium' | 'Low';
export type ProgressTone = 'lemon' | 'rose' | 'mint';

export type OnboardingCardData = {
  id: string;
  vendor: string;
  monogram?: string;
  monogramTone: Tone;
  priority: OnboardingPriority;
  dateLabel: string;
  issue: string;
  summary: string;
  progress: number;
  progressTone: ProgressTone;
  assignees: string[];
  files: number;
  comments: number;
};

const PRIORITY_TONE: Record<OnboardingPriority, Tone> = {
  High: 'rose',
  Medium: 'lemon',
  Low: 'mint',
};

export type AvatarStackProps = {
  initials: string[];
  extra?: number;
  size?: 'sm' | 'md';
  className?: string;
};

export const AvatarStack = ({ initials, extra = 0, size = 'md', className }: AvatarStackProps) => (
  <span className={cx(styles.avatarStack, styles[`avatarStack-${size}`], className)}>
    {initials.map((ini, idx) => (
      <Avatar key={`${ini}-${idx}`} initials={ini} size={size} />
    ))}
    {extra > 0 ? (
      <span
        className={cx(styles.avatarExtra, styles[`avatarExtra-${size}`])}
        title={`${extra} more team members`}
      >
        +{extra}
      </span>
    ) : null}
  </span>
);

export type OnboardingCardProps = {
  card: OnboardingCardData;
  selected?: boolean;
  onSelect?: () => void;
  onMenu?: () => void;
};

export const OnboardingCard = ({ card, selected = false, onSelect, onMenu }: OnboardingCardProps) => {
  const monogram = card.monogram ?? card.vendor[0]?.toUpperCase() ?? 'V';

  return (
    <article
      className={cx(
        styles.card,
        Boolean(onSelect) && styles.cardInteractive,
        selected && styles.cardSelected,
      )}
    >
      <div className={styles.cardHeader}>
        <span className={cx(styles.monogram, styles[`tone-${card.monogramTone}`])} aria-hidden>
          {monogram}
        </span>
        <Count tone={PRIORITY_TONE[card.priority]} value={card.priority} />
        <Badge tone="muted">{card.dateLabel}</Badge>
        <span className={styles.spacer} />
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={`More actions for ${card.vendor}`}
          onClick={(e) => {
            e.stopPropagation();
            onMenu?.();
          }}
        >
          <MoreVertical size={15} aria-hidden />
        </button>
      </div>

      {onSelect ? (
        <button type="button" className={styles.cardMainBtn} aria-pressed={selected} onClick={onSelect}>
          <strong className={styles.cardTitle}>
            {card.vendor} · {card.issue}
          </strong>
        </button>
      ) : (
        <strong className={styles.cardTitle}>
          {card.vendor} · {card.issue}
        </strong>
      )}

      <p className={styles.cardSummary}>{card.summary}</p>

      <div className={styles.progressRow}>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={`${card.vendor} onboarding progress`}
          aria-valuenow={card.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className={cx(styles.progressFill, styles[`progress-${card.progressTone}`])}
            style={{ width: `${Math.max(0, Math.min(100, card.progress))}%` }}
          />
        </div>
        <span className={styles.progressPct}>{card.progress}%</span>
      </div>

      <div className={styles.cardFooter}>
        <AvatarStack initials={card.assignees} size="sm" />
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>
            <Paperclip size={14} aria-hidden />
            <span>{card.files}</span>
          </span>
          <span className={styles.metaItem}>
            <MessageSquare size={14} aria-hidden />
            <span>{card.comments}</span>
          </span>
        </div>
      </div>
    </article>
  );
};

export type KanbanColumnProps = {
  title: string;
  count: number;
  tone: Tone | 'alert' | 'muted';
  onMoreAction?: () => void;
  hiddenCount?: number;
  expanded?: boolean;
  onToggleExpand?: () => void;
  children: ReactNode;
};

export const KanbanColumn = ({
  title,
  count,
  tone,
  onMoreAction,
  hiddenCount = 0,
  expanded = false,
  onToggleExpand,
  children,
}: KanbanColumnProps) => (
  <section className={styles.column} aria-label={title}>
    <header className={styles.colHeader}>
      <div className={styles.colHeaderLeft}>
        <h2 className={styles.colTitle}>{title}</h2>
        <Count value={count} tone={tone} />
      </div>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={`${title} column options`}
        onClick={onMoreAction}
      >
        <MoreVertical size={15} aria-hidden />
      </button>
    </header>

    <div className={styles.colBody}>{children}</div>

    {hiddenCount > 0 ? (
      <button type="button" className={styles.moreBtn} aria-expanded={expanded} onClick={onToggleExpand}>
        <ChevronDown
          size={14}
          aria-hidden
          className={cx(styles.chevron, expanded && styles.chevronExpanded)}
        />
        <span>{expanded ? 'Show less' : `Show ${hiddenCount} more`}</span>
      </button>
    ) : null}
  </section>
);
