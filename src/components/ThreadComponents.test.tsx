import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FileText, Star, UserRound, Zap } from 'lucide-react';

import { ActivityDots } from './ActivityDots';
import { MessageComposer } from './MessageComposer';
import { MemberRow, PropertyList, PropertyRow } from './PropertyList';
import { AttachmentCard, MentionText, ReactionBar, ThreadMessage } from './ThreadMessage';
import { click, mount, press, typeText } from '../test/harness';

const bare = { app: false } as const;

describe('ActivityDots', () => {
  it('renders an accessible strip with one dot per entry and optional titles', () => {
    const screen = mount(
      <ActivityDots
        items={[0, { level: 2, label: 'Day 2: active' }, 3]}
        label="Thread activity"
      />,
      bare,
    );
    const strip = screen.find('[role="img"]');
    expect(strip.getAttribute('aria-label')).toBe('Thread activity');
    const dots = strip.querySelectorAll('span');
    expect(dots).toHaveLength(3);
    expect(dots[1].getAttribute('title')).toBe('Day 2: active');
  });
});

describe('PropertyList, PropertyRow and MemberRow', () => {
  it('renders static and interactive rows and routes clicks', () => {
    const onTags = vi.fn();
    const screen = mount(
      <PropertyList>
        <PropertyRow icon={<UserRound size={14} aria-hidden />} label="Creator" value="Leah C." />
        <PropertyRow label="Tags" value={9} actionLabel="Open tags" onClick={onTags} />
      </PropertyList>,
      bare,
    );
    expect(screen.text).toContain('Creator');
    expect(screen.text).toContain('Leah C.');
    click(screen.find('[aria-label="Open tags"]'));
    expect(onTags).toHaveBeenCalledTimes(1);
  });

  it('renders online and offline member rows with optional badge and click handler', () => {
    const onSelect = vi.fn();
    const screen = mount(
      <>
        <MemberRow
          initials="LC"
          name="Leah Chen"
          role="Product lead"
          badge={{ label: 'Management', tone: 'lemon' }}
          onClick={onSelect}
        />
        <MemberRow initials="SP" name="Samuel Park" role="QA engineer" offline />
      </>,
      bare,
    );
    expect(screen.text).toContain('Leah Chen');
    expect(screen.text).toContain('Management');
    expect(screen.text).toContain('Samuel Park');
    click(screen.findByText('button', 'Leah Chen'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('ThreadMessage, AttachmentCard and ReactionBar', () => {
  it('highlights inline mentions and makes them clickable when a handler is provided', () => {
    const onMention = vi.fn();
    const screen = mount(
      <MentionText text="Hey @Sofia K., check @Product and mail a@b.co" onMentionClick={onMention} />,
      bare,
    );
    const buttons = screen.findAll('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['@Sofia K.', '@Product']);
    click(buttons[0]);
    expect(onMention).toHaveBeenCalledWith('@Sofia K.');
  });

  it('renders static mentions when no click handler is given', () => {
    const screen = mount(<MentionText text="Ping @Marcus" />, bare);
    expect(screen.findAll('button')).toEqual([]);
    expect(screen.text).toContain('@Marcus');
  });

  it('renders AttachmentCard with either AppChip or custom icon and routes CTA', () => {
    const onAction = vi.fn();
    const screen = mount(
      <>
        <AttachmentCard
          app="figma"
          title="Orbitly onboarding · v4.0"
          subtitle="figma.com"
          actionLabel="Quick view"
          onAction={onAction}
        />
        <AttachmentCard icon={<FileText size={16} aria-hidden />} title="Spec.md" subtitle="12 KB" />
      </>,
      bare,
    );
    expect(screen.text).toContain('Orbitly onboarding · v4.0');
    expect(screen.text).toContain('Spec.md');
    click(screen.findByText('button', 'Quick view'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('toggles reactions and opens the reaction picker to add a reaction', () => {
    const onToggle = vi.fn();
    const onAdd = vi.fn();
    const screen = mount(
      <ReactionBar
        reactions={[{ id: 'zap', label: 'Energy', icon: <Zap size={14} aria-hidden />, count: 3, reacted: true }]}
        onToggle={onToggle}
        availableReactions={[
          { id: 'zap', label: 'Energy', icon: <Zap size={14} aria-hidden /> },
          { id: 'star', label: 'Star', icon: <Star size={14} aria-hidden /> },
        ]}
        onAdd={onAdd}
      />,
      bare,
    );
    click(screen.find('[aria-label="Energy, 3"]'));
    expect(onToggle).toHaveBeenCalledWith('zap');

    click(screen.find('[aria-label="Add reaction"]'));
    click(screen.find('[aria-label="React with Star"]'));
    expect(onAdd).toHaveBeenCalledWith('star');
  });

  it('composes a full ThreadMessage with attachment and reactions', () => {
    const onToggle = vi.fn();
    const screen = mount(
      <ThreadMessage
        author="Ravi I."
        initials="RI"
        timestamp="4h ago"
        paragraphs={['Mapped all five screens. @Sofia K. please check.']}
        attachment={<AttachmentCard app="figma" title="Deck" subtitle="figma.com" />}
        reactions={[{ id: 'star', label: 'Star', icon: <Star size={14} aria-hidden />, count: 4 }]}
        onToggleReaction={onToggle}
      />,
      bare,
    );
    expect(screen.text).toContain('Ravi I.');
    expect(screen.text).toContain('4h ago');
    expect(screen.text).toContain('Deck');
    click(screen.find('[aria-label="Star, 4"]'));
    expect(onToggle).toHaveBeenCalledWith('star');
  });
});

const ComposerHarness = ({
  initial = '',
  onSend = vi.fn(),
  onDiscard = vi.fn(),
  onToolbarAction = vi.fn(),
}: {
  initial?: string;
  onSend?: () => void;
  onDiscard?: () => void;
  onToolbarAction?: (a: string) => void;
}) => {
  const [val, setVal] = useState(initial);
  return (
    <MessageComposer
      value={val}
      onChange={setVal}
      onSend={onSend}
      onDiscard={onDiscard}
      onToolbarAction={onToolbarAction}
      mentions={[
        { id: 'sk', name: 'Sofia Kim', initials: 'SK' },
        { id: 'sp', name: 'Samuel Park', initials: 'SP', offline: true },
        { id: 'lc', name: 'Leah Chen', initials: 'LC' },
      ]}
    />
  );
};

describe('MessageComposer', () => {
  it('filters and inserts @mention suggestions on click or keyboard', () => {
    const screen = mount(<ComposerHarness initial="Hi @S" />, bare);
    expect(screen.find('[aria-label="Mention suggestions"]').textContent).toContain('Sofia Kim');
    expect(screen.find('[aria-label="Mention suggestions"]').textContent).toContain('Samuel Park');
    expect(screen.find('[aria-label="Mention suggestions"]').textContent).not.toContain('Leah Chen');

    const textarea = screen.find<HTMLTextAreaElement>('textarea');
    press('ArrowDown', textarea);
    press('ArrowUp', textarea);
    press('Enter', textarea);
    expect(screen.find<HTMLTextAreaElement>('textarea').value).toBe('Hi @Sofia Kim ');
    expect(screen.findAll('[aria-label="Mention suggestions"]')).toEqual([]);
  });

  it('dismisses mentions on Escape and triggers mention picker from the @ button', () => {
    const screen = mount(<ComposerHarness initial="Ping @S" />, bare);
    const textarea = screen.find<HTMLTextAreaElement>('textarea');
    press('Escape', textarea);
    expect(screen.findAll('[aria-label="Mention suggestions"]')).toEqual([]);

    click(screen.find('[aria-label="Mention a member"]'));
    expect(screen.find('[aria-label="Mention suggestions"]').textContent).toContain('Leah Chen');
  });

  it('expands, calls toolbar actions, discards and sends', () => {
    const onSend = vi.fn();
    const onDiscard = vi.fn();
    const onToolbarAction = vi.fn();
    const screen = mount(
      <ComposerHarness
        initial=""
        onSend={onSend}
        onDiscard={onDiscard}
        onToolbarAction={onToolbarAction}
      />,
      bare,
    );

    const sendBtn = screen.findByText<HTMLButtonElement>('button', 'Send');
    expect(sendBtn.disabled).toBe(true);

    click(screen.find('[aria-label="Expand composer"]'));
    expect(screen.find('[aria-label="Collapse composer"]')).toBeTruthy();

    click(screen.find('[aria-label="Draft with AI assistant"]'));
    click(screen.find('[aria-label="Insert quick action"]'));
    click(screen.find('[aria-label="Add reaction"]'));
    click(screen.find('[aria-label="Attach a file"]'));
    click(screen.find('[aria-label="Record voice note"]'));
    expect(onToolbarAction).toHaveBeenCalledTimes(5);

    typeText(screen.find<HTMLTextAreaElement>('textarea'), 'Ready to ship');
    click(screen.findByText('button', 'Discard'));
    expect(onDiscard).toHaveBeenCalledTimes(1);

    click(screen.findByText('button', 'Send'));
    expect(onSend).toHaveBeenCalledTimes(1);

    press('Enter', screen.find<HTMLTextAreaElement>('textarea'), { metaKey: true });
    expect(onSend).toHaveBeenCalledTimes(2);
  });
});
