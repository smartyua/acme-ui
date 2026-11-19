import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  AtSign,
  Maximize2,
  Mic,
  Minimize2,
  Paperclip,
  Smile,
  Sparkles,
  Zap,
} from 'lucide-react';

import { Avatar } from './primitives';
import { Button, cx } from './ui';
import styles from './MessageComposer.module.scss';

export type MentionCandidate = {
  id: string;
  name: string;
  initials: string;
  role?: string;
  offline?: boolean;
};

export type ComposerToolbarAction = 'ai' | 'slash' | 'emoji' | 'attach' | 'voice';

export type MessageComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onDiscard?: () => void;
  placeholder?: string;
  mentions?: MentionCandidate[];
  onToolbarAction?: (action: ComposerToolbarAction) => void;
  sendLabel?: string;
  discardLabel?: string;
  ariaLabel?: string;
  className?: string;
};

const ACTIVE_MENTION_RE = /(?:^|\s)@([A-Za-z0-9_-]*)$/;

export const MessageComposer = ({
  value,
  onChange,
  onSend,
  onDiscard,
  placeholder = 'Write a reply…',
  mentions = [],
  onToolbarAction,
  sendLabel = 'Send',
  discardLabel = 'Discard',
  ariaLabel = 'Reply message',
  className,
}: MessageComposerProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const mentionMatch = useMemo(() => value.match(ACTIVE_MENTION_RE), [value]);
  const mentionQuery = mentionMatch ? mentionMatch[1] : null;

  const filteredMentions = useMemo(() => {
    if (mentionQuery === null || dismissedQuery === value) return [];
    const q = mentionQuery.toLowerCase();
    return mentions.filter((m) =>
      q === '' ||
      m.name
        .toLowerCase()
        .split(/\s+/)
        .some((part) => part.startsWith(q)),
    );
  }, [mentionQuery, dismissedQuery, value, mentions]);

  const showMentions = filteredMentions.length > 0;
  const clampedIndex = showMentions ? Math.min(activeIndex, filteredMentions.length - 1) : 0;

  const insertMention = (candidate: MentionCandidate) => {
    const next = value.replace(ACTIVE_MENTION_RE, (full) => {
      const lead = full.startsWith('@') ? '' : full[0];
      return `${lead}@${candidate.name} `;
    });
    onChange(next);
    setActiveIndex(0);
    setDismissedQuery(null);
    textareaRef.current?.focus();
  };

  const triggerMention = () => {
    const needsSpace = value.length > 0 && !/\s$/.test(value);
    onChange(`${value}${needsSpace ? ' ' : ''}@`);
    setDismissedQuery(null);
    setActiveIndex(0);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filteredMentions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        insertMention(filteredMentions[clampedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setDismissedQuery(value);
        return;
      }
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <div className={cx(styles.wrap, className)}>
      {showMentions ? (
        <div className={styles.mentionPopover} role="region" aria-label="Mention suggestions">
          <div className={styles.mentionHeading}>Members</div>
          <ul className={styles.mentionList}>
            {filteredMentions.map((candidate, idx) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  className={cx(
                    styles.mentionItem,
                    idx === clampedIndex && styles.mentionItemActive,
                  )}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => insertMention(candidate)}
                >
                  <Avatar
                    initials={candidate.initials}
                    size="sm"
                    tone={candidate.offline ? 'muted' : undefined}
                  />
                  <span className={styles.mentionName}>{candidate.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.box}>
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            className={cx(styles.textarea, expanded && styles.textareaExpanded)}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setDismissedQuery(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={ariaLabel}
            rows={expanded ? 6 : 3}
          />
          <button
            type="button"
            className={styles.expandBtn}
            aria-label={expanded ? 'Collapse composer' : 'Expand composer'}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? <Minimize2 size={14} aria-hidden /> : <Maximize2 size={14} aria-hidden />}
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.tools}>
            <button
              type="button"
              className={styles.toolBtn}
              aria-label="Draft with AI assistant"
              onClick={() => onToolbarAction?.('ai')}
            >
              <Sparkles size={15} aria-hidden />
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              aria-label="Mention a member"
              onClick={triggerMention}
            >
              <AtSign size={15} aria-hidden />
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              aria-label="Insert quick action"
              onClick={() => onToolbarAction?.('slash')}
            >
              <Zap size={15} aria-hidden />
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              aria-label="Add reaction"
              onClick={() => onToolbarAction?.('emoji')}
            >
              <Smile size={15} aria-hidden />
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              aria-label="Attach a file"
              onClick={() => onToolbarAction?.('attach')}
            >
              <Paperclip size={15} aria-hidden />
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              aria-label="Record voice note"
              onClick={() => onToolbarAction?.('voice')}
            >
              <Mic size={15} aria-hidden />
            </button>
          </div>

          <div className={styles.actions}>
            {onDiscard ? (
              <Button size="sm" variant="secondary" disabled={!hasContent} onClick={onDiscard}>
                {discardLabel}
              </Button>
            ) : null}
            <Button size="sm" variant="primary" disabled={!hasContent} onClick={onSend}>
              {sendLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
