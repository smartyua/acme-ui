import { Fragment, useState, type ReactNode } from 'react';
import { SmilePlus } from 'lucide-react';

import { type AppId } from '../content/templates';
import { Avatar } from './primitives';
import { AppChip, Button, cx } from './ui';
import styles from './ThreadMessage.module.scss';

// ── Inline @mention rendering ────────────────────────────────────────────
const MENTION_RE = /(@[A-Za-z][A-Za-z0-9_-]*(?:\s+[A-Z](?:\.|[a-z]+))?)/g;

export const MentionText = ({
  text,
  onMentionClick,
}: {
  text: string;
  onMentionClick?: (mention: string) => void;
}) => {
  const parts = text.split(MENTION_RE);
  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;
        const isMention = part.startsWith('@') && (idx === 0 || /\s$/.test(parts[idx - 1] ?? '') || parts[idx - 1] === '');
        if (!isMention) return <Fragment key={idx}>{part}</Fragment>;
        if (!onMentionClick) {
          return (
            <span key={idx} className={styles.mentionStatic}>
              {part}
            </span>
          );
        }
        return (
          <button
            key={idx}
            type="button"
            className={styles.mention}
            onClick={() => onMentionClick(part)}
          >
            {part}
          </button>
        );
      })}
    </>
  );
};

// ── Attachment preview card ──────────────────────────────────────────────
export type AttachmentCardProps = {
  app?: AppId;
  icon?: ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export const AttachmentCard = ({
  app,
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  className,
}: AttachmentCardProps) => (
  <div className={cx(styles.attachment, className)}>
    <div className={styles.attachmentLead}>
      {app ? (
        <AppChip app={app} size="md" />
      ) : icon ? (
        <span className={styles.attachmentIcon} aria-hidden>
          {icon}
        </span>
      ) : null}
      <div className={styles.attachmentMeta}>
        <strong className={styles.attachmentTitle}>{title}</strong>
        <span className={styles.attachmentSub}>{subtitle}</span>
      </div>
    </div>
    {actionLabel && onAction ? (
      <Button size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);

// ── Reaction bar ─────────────────────────────────────────────────────────
export type ReactionOption = {
  id: string;
  label: string;
  icon: ReactNode;
};

export type ReactionItem = ReactionOption & {
  count: number;
  reacted?: boolean;
};

export type ReactionBarProps = {
  reactions: ReactionItem[];
  onToggle: (reactionId: string) => void;
  availableReactions?: ReactionOption[];
  onAdd?: (reactionId: string) => void;
  className?: string;
};

export const ReactionBar = ({
  reactions,
  onToggle,
  availableReactions,
  onAdd,
  className,
}: ReactionBarProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className={cx(styles.reactions, className)}>
      {reactions.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cx(styles.reactionPill, item.reacted && styles.reactionPillActive)}
          aria-pressed={Boolean(item.reacted)}
          aria-label={`${item.label}, ${item.count}`}
          onClick={() => onToggle(item.id)}
        >
          <span className={styles.reactionIcon}>{item.icon}</span>
          <span className={styles.reactionCount}>{item.count}</span>
        </button>
      ))}

      {availableReactions && onAdd ? (
        <div className={styles.pickerWrap}>
          <button
            type="button"
            className={styles.addReactionBtn}
            aria-label="Add reaction"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((open) => !open)}
          >
            <SmilePlus size={14} aria-hidden />
          </button>

          {pickerOpen ? (
            <div className={styles.pickerPopover} role="group" aria-label="Choose a reaction">
              {availableReactions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={styles.pickerOption}
                  aria-label={`React with ${opt.label}`}
                  onClick={() => {
                    onAdd(opt.id);
                    setPickerOpen(false);
                  }}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

// ── Thread message ───────────────────────────────────────────────────────
export type ThreadMessageProps = {
  author: string;
  initials: string;
  timestamp: string;
  paragraphs: string[];
  onMentionClick?: (mention: string) => void;
  attachment?: ReactNode;
  reactions?: ReactionItem[];
  availableReactions?: ReactionOption[];
  onToggleReaction?: (reactionId: string) => void;
  onAddReaction?: (reactionId: string) => void;
  className?: string;
};

export const ThreadMessage = ({
  author,
  initials,
  timestamp,
  paragraphs,
  onMentionClick,
  attachment,
  reactions,
  availableReactions,
  onToggleReaction,
  onAddReaction,
  className,
}: ThreadMessageProps) => (
  <article className={cx(styles.message, className)}>
    <div className={styles.avatarCol}>
      <Avatar initials={initials} size="lg" />
    </div>
    <div className={styles.bodyCol}>
      <header className={styles.meta}>
        <strong className={styles.author}>{author}</strong>
        <span className={styles.time}>{timestamp}</span>
      </header>
      <div className={styles.paragraphs}>
        {paragraphs.map((p, idx) => (
          <p key={idx} className={styles.paragraph}>
            <MentionText text={p} onMentionClick={onMentionClick} />
          </p>
        ))}
      </div>
      {attachment ? <div className={styles.attachmentSlot}>{attachment}</div> : null}
      {reactions && onToggleReaction ? (
        <ReactionBar
          reactions={reactions}
          onToggle={onToggleReaction}
          availableReactions={availableReactions}
          onAdd={onAddReaction}
        />
      ) : null}
    </div>
  </article>
);
