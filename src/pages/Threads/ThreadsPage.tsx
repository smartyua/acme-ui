import { useMemo, useState, type ReactNode } from 'react';
import {
  Bookmark,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Copy,
  CornerDownRight,
  FileEdit,
  Filter,
  Hash,
  Heart,
  Inbox,
  Info,
  Layers,
  Link2,
  Megaphone,
  MessageSquare,
  MoreHorizontal,
  PanelLeft,
  Pin,
  Plus,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  ThumbsUp,
  TrendingUp,
  UserRound,
  Zap,
} from 'lucide-react';

import { ActivityDots } from '../../components/ActivityDots';
import { MessageComposer, type ComposerToolbarAction } from '../../components/MessageComposer';
import { MemberRow, PropertyList, PropertyRow } from '../../components/PropertyList';
import { Avatar, Checkbox, Count } from '../../components/primitives';
import { AttachmentCard, ThreadMessage, type ReactionItem, type ReactionOption } from '../../components/ThreadMessage';
import {
  AppChip,
  Badge,
  Button,
  Drawer,
  Empty,
  FormField,
  Input,
  Modal,
  PillTabs,
  SearchBox,
  cx,
} from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import styles from './Threads.module.scss';
import {
  CHANNEL_TREE,
  FAVORITE_ITEMS,
  INITIAL_THREADS,
  THREAD_MEMBERS,
  THREAD_STATUS_META,
  WORKSPACES,
  getThreadById,
  type ChannelIconKind,
  type ChannelNode,
  type ReactionKind,
  type ThreadAttachment,
  type ThreadData,
  type ThreadMember,
  type ThreadStatus,
} from './threadsData';

type InspectorTab = 'info' | 'pins' | 'files' | 'links';

const STATUS_CYCLE: ThreadStatus[] = ['in-review', 'approved', 'in-progress'];

const REACTION_META: Record<ReactionKind, { label: string; icon: ReactNode }> = {
  zap: { label: 'Energy', icon: <Zap size={14} aria-hidden /> },
  star: { label: 'Star', icon: <Star size={14} aria-hidden /> },
  'thumbs-up': { label: 'Approve', icon: <ThumbsUp size={14} aria-hidden /> },
  heart: { label: 'Love', icon: <Heart size={14} aria-hidden /> },
  check: { label: 'Done', icon: <CheckCircle2 size={14} aria-hidden /> },
};

const AVAILABLE_REACTIONS: ReactionOption[] = (Object.keys(REACTION_META) as ReactionKind[]).map((kind) => ({
  id: kind,
  label: REACTION_META[kind].label,
  icon: REACTION_META[kind].icon,
}));

const ChannelGlyph = ({ icon }: { icon: ChannelIconKind }) => {
  switch (icon) {
    case 'zap':
      return <Zap size={14} aria-hidden />;
    case 'mobile':
      return <Smartphone size={14} aria-hidden />;
    case 'release':
      return <Layers size={14} aria-hidden />;
    case 'roadmap':
      return <TrendingUp size={14} aria-hidden />;
    case 'events':
      return <Calendar size={14} aria-hidden />;
    case 'announcements':
      return <Megaphone size={14} aria-hidden />;
    default:
      return <Hash size={14} aria-hidden />;
  }
};

export const ThreadsPage = () => {
  const { toast } = useApp();

  const [activeWorkspaceId, setActiveWorkspaceId] = useState('orbitly');
  const [threads, setThreads] = useState<Record<string, ThreadData>>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState('onboarding-flow');
  const [drafts, setDrafts] = useState<Record<string, string>>({
    'onboarding-flow': INITIAL_THREADS['onboarding-flow'].defaultDraft ?? '',
  });
  const [savedIds, setSavedIds] = useState<string[]>(['onboarding-flow']);
  const [pinnedThreadIds, setPinnedThreadIds] = useState<string[]>([]);

  // Sidebar navigation state
  const [searchOpen, setSearchOpen] = useState(false);
  const [channelQuery, setChannelQuery] = useState('');
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'ch-mobile': true,
    'ch-v4': true,
  });

  // Inspector & responsive drawers
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('info');
  const [mobileChannelsOpen, setMobileChannelsOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [members, setMembers] = useState<ThreadMember[]>(THREAD_MEMBERS);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortMembersAsc, setSortMembersAsc] = useState(false);

  // Modals
  const [quickViewAttachment, setQuickViewAttachment] = useState<ThreadAttachment | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [newChannelOpen, setNewChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Product engineer');

  const activeWorkspace = WORKSPACES.find((w) => w.id === activeWorkspaceId) ?? WORKSPACES[0];
  const activeThread = getThreadById(threads, activeThreadId);
  const activeDraft = drafts[activeThread.id] ?? '';
  const isSaved = savedIds.includes(activeThread.id);
  const isPinned = pinnedThreadIds.includes(activeThread.id);

  const mentionCandidates = useMemo(
    () =>
      members.map((m) => ({
        id: m.id,
        name: m.name,
        initials: m.initials,
        role: m.role,
        offline: m.offline,
      })),
    [members],
  );

  const visibleMembers = useMemo(() => {
    const list = onlineOnly ? members.filter((m) => !m.offline) : members;
    return sortMembersAsc ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : list;
  }, [members, onlineOnly, sortMembersAsc]);

  const onlineMembers = visibleMembers.filter((m) => !m.offline);
  const offlineMembers = visibleMembers.filter((m) => m.offline);

  const selectThread = (threadId: string, fallbackTitle?: string) => {
    if (threads[threadId]) {
      setActiveThreadId(threadId);
    } else {
      setActiveThreadId('onboarding-flow');
      if (fallbackTitle) {
        toast({ title: `Opened ${fallbackTitle}`, description: 'Showing active v4.0 thread.' });
      }
    }
    setMobileChannelsOpen(false);
  };

  const handleToggleReaction = (messageId: string, reactionId: string) => {
    const kind = reactionId as ReactionKind;
    setThreads((prev) => {
      const current = getThreadById(prev, activeThreadId);
      const nextMessages = current.messages.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existing = msg.reactions.find((r) => r.kind === kind);
        if (!existing) {
          return { ...msg, reactions: [...msg.reactions, { kind, count: 1, reacted: true }] };
        }
        const nextCount = existing.reacted ? existing.count - 1 : existing.count + 1;
        const nextReactions =
          nextCount <= 0
            ? msg.reactions.filter((r) => r.kind !== kind)
            : msg.reactions.map((r) => (r.kind === kind ? { ...r, count: nextCount, reacted: !r.reacted } : r));
        return { ...msg, reactions: nextReactions };
      });
      return { ...prev, [current.id]: { ...current, messages: nextMessages } };
    });
  };

  const handleSendMessage = () => {
    const body = activeDraft.trim();
    if (!body) return;
    const paragraphs = body
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    setThreads((prev) => {
      const current = getThreadById(prev, activeThreadId);
      const nextMsg = {
        id: `m-${Date.now()}`,
        author: 'Ravi I.',
        initials: 'RI',
        timestamp: 'Just now',
        paragraphs,
        reactions: [],
      };
      const nextActivity = [...current.activity.slice(1), 3] as ThreadData['activity'];
      return {
        ...prev,
        [current.id]: {
          ...current,
          messages: [...current.messages, nextMsg],
          activity: nextActivity,
        },
      };
    });

    setDrafts((prev) => ({ ...prev, [activeThread.id]: '' }));
    toast({ title: 'Message sent', description: `Posted in ${activeThread.title}.`, tone: 'success' });
  };

  const handleDiscardDraft = () => {
    setDrafts((prev) => ({ ...prev, [activeThread.id]: '' }));
    toast({ title: 'Draft discarded' });
  };

  const handleToolbarAction = (action: ComposerToolbarAction) => {
    if (action === 'ai') {
      setDrafts((prev) => ({
        ...prev,
        [activeThread.id]:
          (prev[activeThread.id] ? `${prev[activeThread.id]} ` : '') +
          'Summary: 5 screens token-mapped, copy review pending on screens 2 and 4.',
      }));
      toast({ title: 'AI summary inserted', tone: 'success' });
      return;
    }
    const labels: Record<Exclude<ComposerToolbarAction, 'ai'>, { title: string; description: string }> = {
      slash: { title: 'Quick actions', description: 'Try /handoff, /remind or /poll.' },
      emoji: { title: 'Reaction shortcuts', description: 'Click any message pill to react inline.' },
      attach: { title: 'Attach file', description: 'Select a Figma frame or local file to share.' },
      voice: { title: 'Voice note ready', description: 'Microphone capture is muted in preview mode.' },
    };
    toast(labels[action]);
  };

  const handleCycleStatus = () => {
    const idx = STATUS_CYCLE.indexOf(activeThread.status);
    const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setThreads((prev) => ({
      ...prev,
      [activeThread.id]: { ...activeThread, status: nextStatus },
    }));
    toast({
      title: 'Thread status updated',
      description: `Marked as ${THREAD_STATUS_META[nextStatus].label}.`,
      tone: 'success',
    });
  };

  const handleToggleTask = (taskId: string) => {
    setThreads((prev) => {
      const current = getThreadById(prev, activeThreadId);
      return {
        ...prev,
        [current.id]: {
          ...current,
          tasks: current.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
        },
      };
    });
  };

  const handleCreateChannel = () => {
    const title = newChannelName.trim();
    if (!title) return;
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created: ThreadData = {
      id,
      title,
      breadcrumbs: ['Mobile app', 'v4.0'],
      creator: 'Ravi I.',
      creatorInitials: 'RI',
      createdAt: 'Today',
      status: 'in-progress',
      tags: ['v4.0', id],
      tasks: [{ id: `tk-${id}`, title: `Kick off ${title}`, done: false }],
      linkedThreadIds: ['onboarding-flow'],
      activity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3],
      messages: [
        {
          id: `msg-${id}`,
          author: 'Ravi I.',
          initials: 'RI',
          timestamp: 'Just now',
          paragraphs: [`Started #${title} in ${activeWorkspace.name}. @Leah C.`],
          reactions: [],
        },
      ],
      files: [],
      links: [],
    };
    setThreads((prev) => ({ ...prev, [id]: created }));
    setActiveThreadId(id);
    setNewChannelName('');
    setNewChannelOpen(false);
    toast({ title: 'Thread created', description: `Switched to ${title}.`, tone: 'success' });
  };

  const handleAddMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
    const created: ThreadMember = {
      id: `mem-${Date.now()}`,
      name,
      initials: initials || 'TM',
      role: newMemberRole.trim() || 'Contributor',
      department: 'Product',
      departmentTone: 'mint',
    };
    setMembers((prev) => [created, ...prev]);
    setNewMemberName('');
    setAddMemberOpen(false);
    toast({ title: 'Member added', description: `${name} joined ${activeThread.title}.`, tone: 'success' });
  };

  const matchesQuery = (label: string) =>
    !channelQuery.trim() || label.toLowerCase().includes(channelQuery.trim().toLowerCase());

  const renderChannelNode = (node: ChannelNode, depth = 0): ReactNode => {
    const hasChildren = Boolean(node.children?.length);
    const childMatches = hasChildren
      ? node.children!.map((child) => renderChannelNode(child, depth + 1)).filter(Boolean)
      : [];
    const selfMatches = matchesQuery(node.label);

    if (!selfMatches && childMatches.length === 0) return null;

    const isExpanded = Boolean(expandedNodes[node.id]) || Boolean(channelQuery.trim());
    const isActive = node.threadId === activeThread.id;

    return (
      <div key={node.id}>
        <button
          type="button"
          className={cx(styles.navItem, isActive && styles.navItemActive)}
          aria-current={isActive ? 'true' : undefined}
          onClick={() => {
            if (hasChildren) {
              setExpandedNodes((prev) => ({ ...prev, [node.id]: !prev[node.id] }));
            } else if (node.threadId) {
              selectThread(node.threadId, node.label);
            }
          }}
        >
          {depth >= 2 ? (
            <span className={styles.navItemIcon}>
              <CornerDownRight size={14} aria-hidden />
            </span>
          ) : node.tone ? (
            <span className={cx(styles.channelIconTile, styles[`tile-${node.tone}`])} aria-hidden>
              <ChannelGlyph icon={node.icon} />
            </span>
          ) : (
            <span className={styles.navItemIcon}>
              <ChannelGlyph icon={node.icon} />
            </span>
          )}
          <span className={styles.navItemLabel}>{node.label}</span>
          {node.count !== undefined ? <Count value={node.count} tone="muted" /> : null}
        </button>

        {hasChildren && isExpanded && childMatches.length > 0 ? (
          <div className={depth === 0 ? styles.channelChildren : styles.threadChildren}>{childMatches}</div>
        ) : null}
      </div>
    );
  };

  const channelSidebarContent = (
    <>
      <div className={styles.channelScroll}>
        {searchOpen ? (
          <div className={styles.searchWrap}>
            <SearchBox
              value={channelQuery}
              onChange={setChannelQuery}
              placeholder="Filter channels"
              label="Filter channels and threads"
            />
          </div>
        ) : null}

        <div className={styles.navGroup}>
          <button
            type="button"
            className={styles.navItem}
            onClick={() =>
              toast({ title: 'Assistant ready', description: 'Ask for thread summaries or action items.' })
            }
          >
            <span className={styles.navItemIcon}>
              <Sparkles size={15} aria-hidden />
            </span>
            <span className={styles.navItemLabel}>Assistant</span>
            <Badge tone="lavender">New</Badge>
          </button>

          <button
            type="button"
            className={styles.navItem}
            onClick={() =>
              toast({
                title: 'Drafts',
                description: activeDraft.trim() ? '1 unsent reply in Onboarding flow.' : 'No unsent drafts.',
              })
            }
          >
            <span className={styles.navItemIcon}>
              <FileEdit size={15} aria-hidden />
            </span>
            <span className={styles.navItemLabel}>Drafts</span>
          </button>

          <button
            type="button"
            className={styles.navItem}
            onClick={() =>
              toast({
                title: 'Saved items',
                description: `${savedIds.length} bookmarked thread${savedIds.length === 1 ? '' : 's'}.`,
              })
            }
          >
            <span className={styles.navItemIcon}>
              <Bookmark size={15} aria-hidden />
            </span>
            <span className={styles.navItemLabel}>Saved items</span>
          </button>

          <button
            type="button"
            className={styles.navItem}
            onClick={() => selectThread('onboarding-flow')}
          >
            <span className={styles.navItemIcon}>
              <Inbox size={15} aria-hidden />
            </span>
            <span className={styles.navItemLabel}>Inbox</span>
            <Count value={8} tone="muted" />
          </button>

          <button
            type="button"
            className={styles.navItem}
            onClick={() => selectThread('dm-leah')}
          >
            <span className={styles.navItemIcon}>
              <MessageSquare size={15} aria-hidden />
            </span>
            <span className={styles.navItemLabel}>Direct messages</span>
            <Count value={1} tone="muted" />
          </button>
        </div>

        {/* Favorites */}
        <div className={styles.navGroup}>
          <div className={styles.groupHeaderRow}>
            <button
              type="button"
              className={styles.groupToggle}
              aria-expanded={favoritesOpen}
              onClick={() => setFavoritesOpen((open) => !open)}
            >
              <span>Favorites</span>
            </button>
            <button
              type="button"
              className={styles.smallIconBtn}
              aria-label={favoritesOpen ? 'Collapse favorites' : 'Expand favorites'}
              onClick={() => setFavoritesOpen((open) => !open)}
            >
              {favoritesOpen ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
            </button>
          </div>

          {favoritesOpen
            ? FAVORITE_ITEMS.filter((fav) => matchesQuery(fav.label)).map((fav) => {
                const isActive = fav.threadId === activeThread.id;
                return (
                  <button
                    key={fav.id}
                    type="button"
                    className={cx(styles.navItem, isActive && styles.navItemActive)}
                    onClick={() => selectThread(fav.threadId, fav.label)}
                  >
                    {fav.kind === 'dm' && fav.initials ? (
                      <Avatar initials={fav.initials} size="sm" />
                    ) : (
                      <span className={styles.navItemIcon}>
                        <Hash size={14} aria-hidden />
                      </span>
                    )}
                    <span className={styles.navItemLabel}>{fav.label}</span>
                    {fav.count !== undefined ? <Count value={fav.count} tone="muted" /> : null}
                  </button>
                );
              })
            : null}
        </div>

        {/* Channels */}
        <div className={styles.navGroup}>
          <div className={styles.groupHeaderRow}>
            <button
              type="button"
              className={styles.groupToggle}
              aria-expanded={channelsOpen}
              onClick={() => setChannelsOpen((open) => !open)}
            >
              <span>Channels</span>
            </button>
            <div className={styles.groupHeaderActions}>
              <button
                type="button"
                className={styles.smallIconBtn}
                aria-label="New channel thread"
                onClick={() => setNewChannelOpen(true)}
              >
                <Plus size={14} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.smallIconBtn}
                aria-label={channelsOpen ? 'Collapse channels' : 'Expand channels'}
                onClick={() => setChannelsOpen((open) => !open)}
              >
                {channelsOpen ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
              </button>
            </div>
          </div>

          {channelsOpen ? CHANNEL_TREE.map((node) => renderChannelNode(node)) : null}
        </div>
      </div>
    </>
  );

  const pinnedMessages = activeThread.messages.filter((m) => m.pinned);
  const statusMeta = THREAD_STATUS_META[activeThread.status];

  const inspectorBodyContent = (
    <>
      {inspectorTab === 'info' ? (
        <>
          <section className={styles.inspectorSection} aria-label="Main info">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <h2>Main info</h2>
              </div>
            </div>

            <PropertyList>
              <PropertyRow
                icon={<UserRound size={14} aria-hidden />}
                label="Creator"
                value={
                  <span className={styles.creatorValue}>
                    <Avatar initials={activeThread.creatorInitials} size="sm" />
                    <span>{activeThread.creator}</span>
                  </span>
                }
              />
              <PropertyRow
                icon={<Calendar size={14} aria-hidden />}
                label="Date of creation"
                value={activeThread.createdAt}
              />
              <PropertyRow
                icon={<Sparkles size={14} aria-hidden />}
                label="Status"
                value={
                  <button
                    type="button"
                    className={styles.statusBtn}
                    onClick={handleCycleStatus}
                    aria-label={`Status: ${statusMeta.label}. Click to cycle status.`}
                  >
                    <Count value={statusMeta.label} tone={statusMeta.tone} />
                  </button>
                }
              />
              <PropertyRow
                icon={<Tag size={14} aria-hidden />}
                label="Tags"
                value={activeThread.tags.length}
                onClick={() => setTagsOpen(true)}
              />
              <PropertyRow
                icon={<CircleCheck size={14} aria-hidden />}
                label="Tasks"
                value={activeThread.tasks.length}
                onClick={() => setTasksOpen(true)}
              />
            </PropertyList>
          </section>

          <section className={cx(styles.inspectorSection, styles.sectionDivider)} aria-label="Linked threads">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <h2>Linked threads</h2>
              </div>
            </div>

            <div className={styles.linkedList}>
              {activeThread.linkedThreadIds.map((linkedId) => {
                const target = threads[linkedId];
                if (!target) return null;
                return (
                  <button
                    key={linkedId}
                    type="button"
                    className={styles.linkedItem}
                    onClick={() => {
                      setActiveThreadId(linkedId);
                      setMobileInspectorOpen(false);
                    }}
                  >
                    <span className={styles.linkedLead}>
                      <Hash size={14} aria-hidden />
                      <span>{target.title}</span>
                    </span>
                    {linkedId === 'design-system' ? <Count value={4} tone="muted" /> : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={cx(styles.inspectorSection, styles.sectionDivider)} aria-label="Thread activity">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <h2>Thread activity</h2>
              </div>
            </div>
            <ActivityDots
              items={activeThread.activity.map((level, idx) => ({
                level,
                label: `Day ${idx + 1}: level ${level}`,
              }))}
              label={`Activity strip for ${activeThread.title} over 24 days`}
            />
          </section>

          <section className={cx(styles.inspectorSection, styles.sectionDivider)} aria-label="Thread members">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <h2>Members</h2>
                <span className={styles.sectionCount}>{members.length + 2}</span>
              </div>
              <div className={styles.sectionActions}>
                <button
                  type="button"
                  className={styles.smallIconBtn}
                  aria-label="Add member"
                  onClick={() => setAddMemberOpen(true)}
                >
                  <Plus size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  className={styles.smallIconBtn}
                  aria-label={onlineOnly ? 'Show all members' : 'Filter online members'}
                  aria-pressed={onlineOnly}
                  onClick={() => {
                    setOnlineOnly((prev) => !prev);
                    toast({ title: onlineOnly ? 'Showing all members' : 'Showing online members only' });
                  }}
                >
                  <Filter size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  className={styles.smallIconBtn}
                  aria-label="Sort members"
                  aria-pressed={sortMembersAsc}
                  onClick={() => {
                    setSortMembersAsc((prev) => !prev);
                    toast({ title: sortMembersAsc ? 'Default member order' : 'Sorted members A–Z' });
                  }}
                >
                  <SlidersHorizontal size={14} aria-hidden />
                </button>
              </div>
            </div>

            <div className={styles.memberList}>
              {onlineMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  initials={member.initials}
                  name={member.name}
                  role={member.role}
                  badge={{ label: member.department, tone: member.departmentTone }}
                  onClick={() =>
                    toast({ title: member.name, description: `${member.role} · ${member.department}` })
                  }
                />
              ))}
            </div>

            {offlineMembers.length > 0 ? (
              <>
                <span className={styles.offlineLabel}>Offline</span>
                <div className={styles.memberList}>
                  {offlineMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      initials={member.initials}
                      name={member.name}
                      role={member.role}
                      offline
                      onClick={() =>
                        toast({ title: member.name, description: `${member.role} · Offline` })
                      }
                    />
                  ))}
                </div>
              </>
            ) : null}
          </section>
        </>
      ) : null}

      {inspectorTab === 'pins' ? (
        pinnedMessages.length === 0 ? (
          <Empty icon={<Pin size={18} aria-hidden />} title="No pinned messages">
            Pin key decisions from this thread to keep them handy.
          </Empty>
        ) : (
          <div className={styles.cardStack}>
            {pinnedMessages.map((msg) => (
              <div key={msg.id} className={styles.pinCard}>
                <div className={styles.pinMeta}>
                  <span className={styles.pinAuthor}>
                    <Avatar initials={msg.initials} size="sm" />
                    <span>{msg.author}</span>
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className={styles.pinSnippet}>{msg.paragraphs[0]}</p>
              </div>
            ))}
          </div>
        )
      ) : null}

      {inspectorTab === 'files' ? (
        activeThread.files.length === 0 ? (
          <Empty icon={<Layers size={18} aria-hidden />} title="No files shared">
            Attachments dropped in this thread appear here.
          </Empty>
        ) : (
          <div className={styles.cardStack}>
            {activeThread.files.map((file) => (
              <AttachmentCard
                key={file.id}
                app={file.app}
                title={file.title}
                subtitle={file.meta}
                actionLabel="Open"
                onAction={() =>
                  toast({ title: `Opened ${file.title}`, description: file.meta, tone: 'success' })
                }
              />
            ))}
          </div>
        )
      ) : null}

      {inspectorTab === 'links' ? (
        activeThread.links.length === 0 ? (
          <Empty icon={<Link2 size={18} aria-hidden />} title="No links yet">
            Shared URLs from messages collect here automatically.
          </Empty>
        ) : (
          <div className={styles.cardStack}>
            {activeThread.links.map((link) => (
              <div key={link.id} className={styles.linkCard}>
                <AppChip app={link.app} size="sm" />
                <div className={styles.linkInfo}>
                  <strong>{link.title}</strong>
                  <span>{link.url}</span>
                </div>
                <button
                  type="button"
                  className={styles.smallIconBtn}
                  aria-label={`Copy ${link.title} link`}
                  onClick={() =>
                    toast({ title: 'Link copied', description: link.url, tone: 'success' })
                  }
                >
                  <Copy size={14} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )
      ) : null}
    </>
  );

  return (
    <Page wide>
      <div className={cx(styles.workspaceShell, !inspectorOpen && styles.workspaceShellNoInspector)}>
        {/* ── 1. Workspace Switcher Rail ────────────────────────────────── */}
        <aside className={styles.wsRail} aria-label="Workspaces">
          <div className={styles.wsList}>
            {WORKSPACES.map((ws) => {
              const active = ws.id === activeWorkspace.id;
              return (
                <button
                  key={ws.id}
                  type="button"
                  className={cx(
                    styles.wsBtn,
                    ws.tone !== 'inverted' && styles[`wsTone-${ws.tone}`],
                    active && styles.wsBtnActive,
                  )}
                  aria-label={`${ws.name} workspace`}
                  aria-pressed={active}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    toast({ title: `Switched to ${ws.name}`, description: 'Workspace channels synced.' });
                  }}
                >
                  {ws.mono}
                </button>
              );
            })}
            <button
              type="button"
              className={styles.wsAddBtn}
              aria-label="Create workspace"
              onClick={() =>
                toast({ title: 'New workspace', description: 'Workspace creation is available to admins.' })
              }
            >
              <Plus size={15} aria-hidden />
            </button>
          </div>

          <button
            type="button"
            className={styles.wsProfileBtn}
            aria-label="RI · Ravi Iyer profile status"
            onClick={() => toast({ title: 'Ravi Iyer', description: 'Online · Product designer' })}
          >
            <Avatar initials="RI" size="md" />
          </button>
        </aside>

        {/* ── 2. Channel Navigation Sidebar ─────────────────────────────── */}
        <aside className={styles.channelSidebar} aria-label="Channels and threads">
          <div className={styles.channelHeader}>
            <button
              type="button"
              className={styles.wsSelector}
              onClick={() => {
                const idx = WORKSPACES.findIndex((w) => w.id === activeWorkspace.id);
                const next = WORKSPACES[(idx + 1) % WORKSPACES.length];
                setActiveWorkspaceId(next.id);
                toast({ title: `Switched to ${next.name}` });
              }}
            >
              <span>{activeWorkspace.name}</span>
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className={styles.smallIconBtn}
              aria-label="Toggle channel search"
              aria-pressed={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              <Search size={15} aria-hidden />
            </button>
          </div>

          {channelSidebarContent}
        </aside>

        {/* ── 3. Center Thread Conversation ─────────────────────────────── */}
        <section className={styles.threadPane} aria-label="Thread conversation">
          <header className={styles.threadHeader}>
            <div className={styles.threadHeaderLeft}>
              <button
                type="button"
                className={cx(styles.headerIconBtn, styles.mobileChannelsBtn)}
                aria-label="Browse channels"
                onClick={() => setMobileChannelsOpen(true)}
              >
                <PanelLeft size={16} aria-hidden />
              </button>

              <div className={styles.breadcrumbs}>
                <Hash size={14} aria-hidden />
                {activeThread.breadcrumbs.map((crumb) => (
                  <span key={crumb} className={styles.crumbSeg}>
                    {crumb}
                    <span className={styles.crumbSlash} aria-hidden>
                      {' '}
                      /{' '}
                    </span>
                  </span>
                ))}
                <h1 className={styles.threadTitle}>{activeThread.title}</h1>
              </div>

              <button
                type="button"
                className={cx(styles.headerIconBtn, isSaved && styles.headerIconBtnActive)}
                aria-label={isSaved ? 'Remove bookmark' : 'Bookmark thread'}
                aria-pressed={isSaved}
                onClick={() => {
                  setSavedIds((prev) =>
                    prev.includes(activeThread.id)
                      ? prev.filter((id) => id !== activeThread.id)
                      : [...prev, activeThread.id],
                  );
                  toast({
                    title: isSaved ? 'Removed from saved items' : 'Saved thread',
                    description: activeThread.title,
                  });
                }}
              >
                <Bookmark size={14} aria-hidden />
              </button>
            </div>

            <div className={styles.threadHeaderActions}>
              <button
                type="button"
                className={styles.headerIconBtn}
                aria-label="Copy thread link"
                onClick={() =>
                  toast({
                    title: 'Thread link copied',
                    description: `https://orbitly.acme.io/threads/${activeThread.id}`,
                    tone: 'success',
                  })
                }
              >
                <MoreHorizontal size={15} aria-hidden />
              </button>
              <button
                type="button"
                className={cx(styles.headerIconBtn, isPinned && styles.headerIconBtnActive)}
                aria-label={isPinned ? 'Unpin thread' : 'Pin thread'}
                aria-pressed={isPinned}
                onClick={() => {
                  setPinnedThreadIds((prev) =>
                    prev.includes(activeThread.id)
                      ? prev.filter((id) => id !== activeThread.id)
                      : [...prev, activeThread.id],
                  );
                  toast({
                    title: isPinned ? 'Thread unpinned' : 'Thread pinned',
                    description: activeThread.title,
                  });
                }}
              >
                <Pin size={15} aria-hidden />
              </button>
              <button
                type="button"
                className={cx(styles.headerIconBtn, inspectorOpen && styles.headerIconBtnActive)}
                aria-label="Toggle thread info panel"
                aria-pressed={inspectorOpen}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileInspectorOpen(true);
                  } else {
                    setInspectorOpen((open) => !open);
                  }
                }}
              >
                <Info size={15} aria-hidden />
              </button>
            </div>
          </header>

          <div className={styles.feed}>
            {activeThread.messages.map((msg) => {
              const reactions: ReactionItem[] = msg.reactions.map((r) => ({
                id: r.kind,
                label: REACTION_META[r.kind].label,
                icon: REACTION_META[r.kind].icon,
                count: r.count,
                reacted: r.reacted,
              }));

              return (
                <ThreadMessage
                  key={msg.id}
                  author={msg.author}
                  initials={msg.initials}
                  timestamp={msg.timestamp}
                  paragraphs={msg.paragraphs}
                  onMentionClick={(mention) =>
                    toast({ title: mention, description: `Mentioned in ${activeThread.title}` })
                  }
                  attachment={
                    msg.attachment ? (
                      <AttachmentCard
                        app={msg.attachment.app}
                        title={msg.attachment.title}
                        subtitle={msg.attachment.subtitle}
                        actionLabel={msg.attachment.actionLabel}
                        onAction={() => setQuickViewAttachment(msg.attachment ?? null)}
                      />
                    ) : undefined
                  }
                  reactions={reactions.length > 0 ? reactions : undefined}
                  availableReactions={AVAILABLE_REACTIONS}
                  onToggleReaction={(reactionId) => handleToggleReaction(msg.id, reactionId)}
                  onAddReaction={(reactionId) => handleToggleReaction(msg.id, reactionId)}
                />
              );
            })}
          </div>

          <div className={styles.composerDock}>
            <MessageComposer
              value={activeDraft}
              onChange={(next) => setDrafts((prev) => ({ ...prev, [activeThread.id]: next }))}
              onSend={handleSendMessage}
              onDiscard={handleDiscardDraft}
              mentions={mentionCandidates}
              onToolbarAction={handleToolbarAction}
              placeholder={`Reply in #${activeThread.title}…`}
              ariaLabel={`Reply in ${activeThread.title}`}
            />
          </div>
        </section>

        {/* ── 4. Right Thread Inspector Pane (Desktop) ──────────────────── */}
        {inspectorOpen ? (
          <aside className={styles.inspectorPane} aria-label="Thread details">
            <div className={styles.inspectorTabs}>
              <PillTabs<InspectorTab>
                label="Thread detail sections"
                size="sm"
                fullWidth
                value={inspectorTab}
                onChange={setInspectorTab}
                items={[
                  { value: 'info', label: 'Info' },
                  { value: 'pins', label: 'Pins' },
                  { value: 'files', label: 'Files' },
                  { value: 'links', label: 'Links' },
                ]}
              />
            </div>
            <div className={styles.inspectorBody}>{inspectorBodyContent}</div>
          </aside>
        ) : null}
      </div>

      {/* ── Mobile Channels Drawer ──────────────────────────────────────── */}
      <Drawer
        open={mobileChannelsOpen}
        onClose={() => setMobileChannelsOpen(false)}
        title={activeWorkspace.name}
      >
        <div className={styles.drawerWsRow}>
          {WORKSPACES.map((ws) => (
            <button
              key={ws.id}
              type="button"
              className={cx(styles.drawerWsPill, ws.id === activeWorkspace.id && styles.drawerWsPillActive)}
              onClick={() => {
                setActiveWorkspaceId(ws.id);
                toast({ title: `Switched to ${ws.name}` });
              }}
            >
              <span>{ws.mono}</span>
              <span>{ws.name}</span>
            </button>
          ))}
        </div>
        {channelSidebarContent}
      </Drawer>

      {/* ── Tablet / Mobile Inspector Drawer ────────────────────────────── */}
      <Drawer
        open={mobileInspectorOpen}
        onClose={() => setMobileInspectorOpen(false)}
        title={`${activeThread.title} details`}
      >
        <PillTabs<InspectorTab>
          label="Thread detail sections"
          size="sm"
          fullWidth
          value={inspectorTab}
          onChange={setInspectorTab}
          items={[
            { value: 'info', label: 'Info' },
            { value: 'pins', label: 'Pins' },
            { value: 'files', label: 'Files' },
            { value: 'links', label: 'Links' },
          ]}
        />
        <div className={styles.drawerInspectorBody}>{inspectorBodyContent}</div>
      </Drawer>

      {/* ── Quick View Attachment Modal ─────────────────────────────────── */}
      <Modal
        open={Boolean(quickViewAttachment)}
        onClose={() => setQuickViewAttachment(null)}
        title={quickViewAttachment?.title ?? ''}
        description="Five v4.0 onboarding screens mapped to Acme UI tokens."
        width="md"
        footer={
          <>
            <Button onClick={() => setQuickViewAttachment(null)}>Close</Button>
            <Button
              variant="primary"
              onClick={() => {
                toast({
                  title: 'Figma link copied',
                  description: `${quickViewAttachment?.title} copied to clipboard.`,
                  tone: 'success',
                });
                setQuickViewAttachment(null);
              }}
            >
              Copy Figma link
            </Button>
          </>
        }
      >
        <div className={styles.screenList}>
          {quickViewAttachment?.screens.map((screen) => (
            <div key={screen.name} className={styles.screenRow}>
              <span>{screen.name}</span>
              <Count value={screen.status} tone={screen.tone} />
            </div>
          ))}
        </div>
      </Modal>

      {/* ── Tags Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={tagsOpen}
        onClose={() => setTagsOpen(false)}
        title={`Tags (${activeThread.tags.length})`}
        description={`Labels attached to ${activeThread.title}.`}
        width="sm"
        footer={<Button onClick={() => setTagsOpen(false)}>Done</Button>}
      >
        <div className={styles.tagWrap}>
          {activeThread.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              #{tag}
            </Badge>
          ))}
        </div>
      </Modal>

      {/* ── Tasks Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        title={`Linked tasks (${activeThread.tasks.length})`}
        description={`Track deliverables directly from ${activeThread.title}.`}
        width="md"
        footer={<Button onClick={() => setTasksOpen(false)}>Done</Button>}
      >
        <div className={styles.taskList}>
          {activeThread.tasks.map((task) => (
            <Checkbox
              key={task.id}
              label={task.title}
              checked={task.done}
              onChange={() => handleToggleTask(task.id)}
            />
          ))}
        </div>
      </Modal>

      {/* ── New Channel Thread Modal ────────────────────────────────────── */}
      <Modal
        open={newChannelOpen}
        onClose={() => setNewChannelOpen(false)}
        title="New thread"
        description="Start a focused discussion inside Mobile app / v4.0."
        width="sm"
        footer={
          <>
            <Button onClick={() => setNewChannelOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!newChannelName.trim()} onClick={handleCreateChannel}>
              Create thread
            </Button>
          </>
        }
      >
        <FormField label="Thread name" hint="Use a short topic name like Paywall copy.">
          {(id) => (
            <Input
              id={id}
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Paywall copy"
            />
          )}
        </FormField>
      </Modal>

      {/* ── Add Member Modal ────────────────────────────────────────────── */}
      <Modal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Add member to thread"
        description={`Invite a teammate to ${activeThread.title}.`}
        width="sm"
        footer={
          <>
            <Button onClick={() => setAddMemberOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!newMemberName.trim()} onClick={handleAddMember}>
              Add member
            </Button>
          </>
        }
      >
        <div className={styles.formStack}>
          <FormField label="Full name">
            {(id) => (
              <Input
                id={id}
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Hannah Brooks"
              />
            )}
          </FormField>
          <FormField label="Role">
            {(id) => (
              <Input
                id={id}
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                placeholder="Product engineer"
              />
            )}
          </FormField>
        </div>
      </Modal>
    </Page>
  );
};
