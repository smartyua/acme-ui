import { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Folder,
  Kanban,
  Link2,
  List,
  Maximize2,
  Plus,
  Send,
  SignalHigh,
  SignalMedium,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { Avatar, Count } from '../../components/primitives';
import {
  Badge,
  Button,
  Empty,
  FormField,
  Input,
  Modal,
  Select,
  cx,
} from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import styles from './Projects.module.scss';
import {
  INITIAL_PROJECT_TASKS,
  PRIORITY_LABEL,
  STATUS_GROUP_META,
  type ProjectTask,
  type ProjectTaskPriority,
  type ProjectTaskStatus,
  type ProjectViewMode,
} from './projectsData';

const STATUS_ORDER: ProjectTaskStatus[] = ['in-progress', 'review', 'backlog'];
const PRIORITY_ORDER: ProjectTaskPriority[] = ['urgent', 'high', 'medium'];

const StatusIcon = ({ status }: { status: ProjectTaskStatus }) => {
  if (status === 'in-progress') {
    return <CircleDot size={14} className={styles.statusIconProgress} aria-hidden />;
  }
  if (status === 'review') {
    return <CircleCheck size={14} className={styles.statusIconReview} aria-hidden />;
  }
  return <CircleDashed size={14} className={styles.statusIconBacklog} aria-hidden />;
};

const PriorityIndicator = ({ priority }: { priority: ProjectTaskPriority }) => {
  if (priority === 'urgent') {
    return (
      <span className={styles.urgentSquare} aria-hidden>
        !
      </span>
    );
  }
  if (priority === 'high') {
    return <SignalHigh size={14} className={styles.priorityBars} aria-hidden />;
  }
  return <SignalMedium size={14} className={styles.priorityBars} aria-hidden />;
};

export const ProjectsPage = () => {
  const { toast } = useApp();

  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_PROJECT_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('t-145');
  const [viewMode, setViewMode] = useState<ProjectViewMode>('list');

  // Filter states
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<ProjectTaskPriority | null>(
    null,
  );

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<ProjectTaskStatus, boolean>
  >({
    'in-progress': false,
    review: false,
    backlog: false,
  });

  // Modals & inline inputs
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<ProjectTaskStatus>('in-progress');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<ProjectTaskPriority>('high');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Sam Turner');

  const [subtaskModalOpen, setSubtaskModalOpen] = useState(false);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [commentDraft, setCommentDraft] = useState('');

  const filteredTasks = useMemo(
    () =>
      tasks
        .filter((t) => !assigneeFilter || t.assignee === assigneeFilter)
        .filter(
          (t) =>
            !labelFilter || t.labels.some((lbl) => lbl.text === labelFilter),
        )
        .filter((t) => !priorityFilter || t.priority === priorityFilter),
    [tasks, assigneeFilter, labelFilter, priorityFilter],
  );

  const selectedTask = useMemo(
    () =>
      selectedTaskId
        ? (tasks.find((t) => t.id === selectedTaskId) ?? null)
        : null,
    [tasks, selectedTaskId],
  );

  const cycleAssigneeFilter = () => {
    const order = [null, 'Sam Turner', 'Alex Morgan', 'Dana Walker'] as const;
    const idx = order.indexOf(assigneeFilter as (typeof order)[number]);
    const next = order[(idx + 1) % order.length];
    setAssigneeFilter(next);
  };

  const cycleLabelFilter = () => {
    const order = [null, 'Pipeline', 'Metrics', 'Infra'] as const;
    const idx = order.indexOf(labelFilter as (typeof order)[number]);
    const next = order[(idx + 1) % order.length];
    setLabelFilter(next);
  };

  const cyclePriorityFilter = () => {
    const order: Array<ProjectTaskPriority | null> = [
      null,
      'urgent',
      'high',
      'medium',
    ];
    const idx = order.indexOf(priorityFilter);
    const next = order[(idx + 1) % order.length];
    setPriorityFilter(next);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((st) =>
                st.id === subtaskId
                  ? { ...st, done: !st.done, running: false }
                  : st,
              ),
            }
          : task,
      ),
    );
  };

  const handleCycleTaskStatus = (task: ProjectTask) => {
    const nextStatus =
      STATUS_ORDER[(STATUS_ORDER.indexOf(task.status) + 1) % STATUS_ORDER.length];
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)),
    );
    toast({
      title: `${task.code} status updated`,
      description: `Moved to ${STATUS_GROUP_META[nextStatus].label}.`,
      tone: 'success',
    });
  };

  const handleCycleTaskPriority = (task: ProjectTask) => {
    const nextPriority =
      PRIORITY_ORDER[
        (PRIORITY_ORDER.indexOf(task.priority) + 1) % PRIORITY_ORDER.length
      ];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, priority: nextPriority } : t,
      ),
    );
    toast({
      title: `${task.code} priority updated`,
      description: `Priority set to ${PRIORITY_LABEL[nextPriority]}.`,
      tone: 'success',
    });
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    const nextNum = 148 + tasks.length - INITIAL_PROJECT_TASKS.length;
    const initials = newTaskAssignee
      .split(' ')
      .map((p) => p[0])
      .join('');
    const created: ProjectTask = {
      id: `t-${nextNum}`,
      code: `DAT-${nextNum}`,
      title: newTaskTitle.trim(),
      status: newTaskStatus,
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      assigneeInitials: initials,
      labels: [{ text: 'Pipeline', tone: 'mint' }],
      dueDate: 'Nov 25',
      dueRelative: 'in 22 days',
      descriptionBeforeCode: 'Execute scheduled warehouse task in ',
      descriptionCode: 'analytics_prod.events',
      descriptionAfterCode: ' and verify row-level parity before downstream promotion.',
      subtasks: [
        {
          id: `s-${nextNum}-1`,
          title: 'Validate staging schema and row count assertions',
          done: false,
          ownerInitials: initials,
        },
      ],
      activity: [
        {
          id: `a-${nextNum}-1`,
          author: newTaskAssignee,
          action: 'created the task in Q4 data platform',
          time: 'Just now',
          dotTone: 'accent',
        },
      ],
    };
    setTasks((prev) => [created, ...prev]);
    setSelectedTaskId(created.id);
    setNewTaskOpen(false);
    setNewTaskTitle('');
    toast({
      title: 'Task created',
      description: `${created.code} added to ${STATUS_GROUP_META[newTaskStatus].label}.`,
      tone: 'success',
    });
  };

  const handleAddSubtask = () => {
    if (!selectedTask || !subtaskDraft.trim()) return;
    const nextSub = {
      id: `sub-${Date.now()}`,
      title: subtaskDraft.trim(),
      done: false,
      ownerInitials: selectedTask.assigneeInitials,
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, subtasks: [...t.subtasks, nextSub] }
          : t,
      ),
    );
    setSubtaskDraft('');
    setSubtaskModalOpen(false);
    toast({
      title: 'Subtask added',
      description: `Added to ${selectedTask.code}.`,
      tone: 'success',
    });
  };

  const handlePostComment = () => {
    if (!selectedTask || !commentDraft.trim()) return;
    const entry = {
      id: `act-${Date.now()}`,
      author: 'Alex Morgan',
      initials: 'AM',
      action: 'commented',
      time: 'Just now',
      comment: commentDraft.trim(),
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, activity: [entry, ...t.activity] }
          : t,
      ),
    );
    setCommentDraft('');
    toast({
      title: 'Comment posted',
      description: `Added to ${selectedTask.code} activity stream.`,
      tone: 'success',
    });
  };

  const subtasksDone = selectedTask
    ? selectedTask.subtasks.filter((st) => st.done).length
    : 0;
  const subtasksTotal = selectedTask ? selectedTask.subtasks.length : 0;

  return (
    <Page>
      <div
        className={cx(
          styles.workbench,
          !selectedTask && styles.workbenchFull,
        )}
      >
        {/* ── Left Column: Project Task List ─────────────────────────── */}
        <div className={styles.mainCol}>
          <div className={styles.breadcrumbs}>
            <span>Projects</span>
            <ChevronRight size={14} aria-hidden />
            <strong>Q4 data platform</strong>
          </div>

          <header className={styles.projectHeader}>
            <div className={styles.titleRow}>
              <span className={styles.folderBadge} aria-hidden>
                <Folder size={15} aria-hidden />
              </span>
              <h1>Q4 data platform</h1>
              <Count tone="mint" value="On track" />
            </div>

            <p className={styles.projectLead}>
              Warehouse backfills, the metrics layer and executive reporting
            </p>

            <div className={styles.progressRow}>
              <div className={styles.progressTrack} aria-hidden>
                <span className={styles.progressFillGreen} />
                <span className={styles.progressFillPurple} />
              </div>
              <strong>62%</strong>
              <span>24 of 39</span>
            </div>
          </header>

          <div
            className={styles.viewTabBar}
            role="tablist"
            aria-label="Project views"
          >
            {(
              [
                { id: 'board', label: 'Board', icon: Kanban },
                { id: 'list', label: 'List', icon: List },
                { id: 'timeline', label: 'Timeline', icon: SlidersHorizontal },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === tab.id}
                  className={cx(
                    styles.viewTab,
                    viewMode === tab.id && styles.viewTabActive,
                  )}
                  onClick={() => setViewMode(tab.id)}
                >
                  <Icon size={14} aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className={styles.filterPillRow}>
            <div className={styles.filterPillsLeft}>
              <button
                type="button"
                className={cx(
                  styles.filterPill,
                  Boolean(assigneeFilter) && styles.filterPillActive,
                )}
                onClick={cycleAssigneeFilter}
              >
                <Plus size={14} aria-hidden />
                {assigneeFilter ? `Assignee: ${assigneeFilter}` : 'Assignee'}
              </button>

              <button
                type="button"
                className={cx(
                  styles.filterPill,
                  Boolean(labelFilter) && styles.filterPillActive,
                )}
                onClick={cycleLabelFilter}
              >
                <Plus size={14} aria-hidden />
                {labelFilter ? `Label: ${labelFilter}` : 'Label'}
              </button>

              <button
                type="button"
                className={cx(
                  styles.filterPill,
                  Boolean(priorityFilter) && styles.filterPillActive,
                )}
                onClick={cyclePriorityFilter}
              >
                <Plus size={14} aria-hidden />
                {priorityFilter
                  ? `Priority: ${PRIORITY_LABEL[priorityFilter]}`
                  : 'Priority'}
              </button>
            </div>

            <Button
              size="sm"
              icon={<Plus size={14} aria-hidden />}
              onClick={() => {
                setNewTaskStatus('in-progress');
                setNewTaskOpen(true);
              }}
            >
              New task
            </Button>
          </div>

          {filteredTasks.length === 0 ? (
            <Empty
              icon={<Folder size={18} aria-hidden />}
              title="No tasks match these filters"
            >
              <Button
                size="sm"
                onClick={() => {
                  setAssigneeFilter(null);
                  setLabelFilter(null);
                  setPriorityFilter(null);
                }}
              >
                Clear filters
              </Button>
            </Empty>
          ) : viewMode === 'board' ? (
            <div className={styles.boardColumns}>
              {STATUS_ORDER.map((status) => {
                const groupTasks = filteredTasks.filter(
                  (t) => t.status === status,
                );
                return (
                  <section
                    key={status}
                    className={styles.groupSection}
                    aria-label={STATUS_GROUP_META[status].label}
                  >
                    <div className={styles.groupHeader}>
                      <span className={styles.groupHeaderLeft}>
                        <StatusIcon status={status} />
                        <span>{STATUS_GROUP_META[status].label}</span>
                        <span className={styles.groupCount}>
                          {groupTasks.length}
                        </span>
                      </span>
                    </div>
                    <div className={styles.mainCol} style={{ padding: '0.625rem' }}>
                      {groupTasks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={styles.boardCard}
                          onClick={() => setSelectedTaskId(t.id)}
                        >
                          <span className={styles.taskCode}>{t.code}</span>
                          <strong className={styles.taskTitle}>{t.title}</strong>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            STATUS_ORDER.map((status) => {
              const groupTasks = filteredTasks.filter(
                (t) => t.status === status,
              );
              const isCollapsed = collapsedGroups[status];
              return (
                <section
                  key={status}
                  className={styles.groupSection}
                  aria-label={STATUS_GROUP_META[status].label}
                >
                  <button
                    type="button"
                    className={styles.groupHeader}
                    aria-expanded={!isCollapsed}
                    onClick={() =>
                      setCollapsedGroups((prev) => ({
                        ...prev,
                        [status]: !prev[status],
                      }))
                    }
                  >
                    <span className={styles.groupHeaderLeft}>
                      {isCollapsed ? (
                        <ChevronRight size={14} aria-hidden />
                      ) : (
                        <ChevronDown size={14} aria-hidden />
                      )}
                      <StatusIcon status={status} />
                      <span>{STATUS_GROUP_META[status].label}</span>
                      <span className={styles.groupCount}>
                        {STATUS_GROUP_META[status].totalCount}
                      </span>
                    </span>
                  </button>

                  {!isCollapsed ? (
                    <>
                      <ul className={styles.taskList}>
                        {groupTasks.map((task) => (
                          <li key={task.id} className={styles.taskRow}>
                            <button
                              type="button"
                              className={cx(
                                styles.taskRowBtn,
                                selectedTaskId === task.id &&
                                  styles.taskRowSelected,
                              )}
                              onClick={() => setSelectedTaskId(task.id)}
                            >
                              <PriorityIndicator priority={task.priority} />
                              <span className={styles.taskCode}>{task.code}</span>
                              <StatusIcon status={task.status} />
                              <span className={styles.taskTitle}>
                                {task.title}
                              </span>
                              <Avatar
                                initials={task.assigneeInitials}
                                size="sm"
                              />
                            </button>
                          </li>
                        ))}
                      </ul>

                      {status === 'in-progress' ? (
                        <button
                          type="button"
                          className={styles.addTaskBtn}
                          onClick={() => {
                            setNewTaskStatus(status);
                            setNewTaskOpen(true);
                          }}
                        >
                          <Plus size={14} aria-hidden />
                          Add task
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </section>
              );
            })
          )}
        </div>

        {/* ── Right Column: Docked Task Detail Sheet ─────────────────── */}
        {selectedTask ? (
          <aside
            className={styles.detailSheet}
            aria-label={`${selectedTask.code} task details`}
          >
            <div className={styles.sheetTopBar}>
              <span className={styles.sheetCrumb}>
                <strong>{selectedTask.code}</strong> in Q4 data platform
              </span>

              <div className={styles.sheetActions}>
                <button
                  type="button"
                  className={styles.sheetIconBtn}
                  aria-label="Copy task link"
                  onClick={() =>
                    toast({
                      title: 'Task link copied',
                      description: `https://acme.io/projects/q4/${selectedTask.code} copied.`,
                      tone: 'success',
                    })
                  }
                >
                  <Link2 size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  className={styles.sheetIconBtn}
                  aria-label="Focus task view"
                  onClick={() =>
                    toast({
                      title: `Focused ${selectedTask.code}`,
                      description: selectedTask.title,
                    })
                  }
                >
                  <Maximize2 size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  className={styles.sheetIconBtn}
                  aria-label="Close task panel"
                  onClick={() => setSelectedTaskId(null)}
                >
                  <X size={14} aria-hidden />
                </button>
              </div>
            </div>

            <h2 className={styles.sheetTitle}>{selectedTask.title}</h2>

            <div className={styles.propGrid}>
              <div className={styles.propRow}>
                <span className={styles.propLabel}>Status</span>
                <div className={styles.propValue}>
                  <button
                    type="button"
                    className={styles.propInteractiveBtn}
                    onClick={() => handleCycleTaskStatus(selectedTask)}
                  >
                    <StatusIcon status={selectedTask.status} />
                    <span>
                      {STATUS_GROUP_META[selectedTask.status].label}
                    </span>
                  </button>
                </div>
              </div>

              <div className={styles.propRow}>
                <span className={styles.propLabel}>Priority</span>
                <div className={styles.propValue}>
                  <button
                    type="button"
                    className={styles.propInteractiveBtn}
                    onClick={() => handleCycleTaskPriority(selectedTask)}
                  >
                    <PriorityIndicator priority={selectedTask.priority} />
                    <span>{PRIORITY_LABEL[selectedTask.priority]}</span>
                  </button>
                </div>
              </div>

              <div className={styles.propRow}>
                <span className={styles.propLabel}>Assignee</span>
                <div className={styles.propValue}>
                  <Avatar
                    initials={selectedTask.assigneeInitials}
                    size="sm"
                  />
                  <span>{selectedTask.assignee}</span>
                </div>
              </div>

              <div className={styles.propRow}>
                <span className={styles.propLabel}>Labels</span>
                <div className={styles.propValue}>
                  {selectedTask.labels.map((lbl) =>
                    lbl.tone === 'muted' ? (
                      <Badge key={lbl.text} tone="neutral">
                        {lbl.text}
                      </Badge>
                    ) : (
                      <Count
                        key={lbl.text}
                        tone={lbl.tone}
                        value={lbl.text}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className={styles.propRow}>
                <span className={styles.propLabel}>Due date</span>
                <div className={styles.propValue}>
                  <span>{selectedTask.dueDate}</span>
                  <span className={styles.mutedSpan}>
                    {selectedTask.dueRelative}
                  </span>
                </div>
              </div>

              {selectedTask.blocksCode ? (
                <div className={styles.propRow}>
                  <span className={styles.propLabel}>Blocks</span>
                  <div className={styles.propValue}>
                    <button
                      type="button"
                      className={styles.propInteractiveBtn}
                      onClick={() => {
                        const target = tasks.find(
                          (t) => t.code === selectedTask.blocksCode,
                        );
                        if (target) setSelectedTaskId(target.id);
                      }}
                    >
                      <span className={styles.mutedSpan}>
                        {selectedTask.blocksCode}
                      </span>
                      <span>{selectedTask.blocksTitle}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Description</h3>
              <p className={styles.descText}>
                {selectedTask.descriptionBeforeCode}
                <code>{selectedTask.descriptionCode}</code>
                {selectedTask.descriptionAfterCode}
              </p>
            </div>

            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <span>Subtasks</span>
                  <span className={styles.sectionCount}>
                    {subtasksDone} of {subtasksTotal}
                  </span>
                </h3>
                <div className={styles.subtaskMiniMeter} aria-hidden>
                  <span
                    className={styles.subtaskMiniFill}
                    style={{
                      width: `${
                        subtasksTotal > 0
                          ? Math.round((subtasksDone / subtasksTotal) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <ul className={styles.subtaskList}>
                {selectedTask.subtasks.map((st) => (
                  <li key={st.id} className={styles.subtaskRow}>
                    <button
                      type="button"
                      className={styles.subtaskBtn}
                      onClick={() =>
                        handleToggleSubtask(selectedTask.id, st.id)
                      }
                    >
                      <span
                        className={cx(
                          styles.checkBox,
                          st.done && styles.checkBoxDone,
                        )}
                        aria-hidden
                      >
                        {st.done ? <Check size={14} aria-hidden /> : null}
                      </span>
                      <span
                        className={cx(st.done && styles.subtaskDoneText)}
                      >
                        {st.title}
                      </span>
                    </button>

                    <div className={styles.subtaskRight}>
                      {st.running ? (
                        <span className={styles.runningLabel}>Running</span>
                      ) : null}
                      {st.ownerInitials ? (
                        <Avatar initials={st.ownerInitials} size="sm" />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={styles.addTaskBtn}
                onClick={() => setSubtaskModalOpen(true)}
              >
                <Plus size={14} aria-hidden />
                Add subtask
              </button>
            </div>

            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Activity</h3>

              <ul className={styles.activityTimeline}>
                {selectedTask.activity.map((item) => (
                  <li key={item.id} className={styles.activityItem}>
                    <div className={styles.activityRowTop}>
                      <span className={styles.activityActor}>
                        {item.initials ? (
                          <Avatar initials={item.initials} size="sm" />
                        ) : (
                          <span
                            className={
                              item.dotTone === 'accent'
                                ? styles.timelineDotAccent
                                : styles.timelineDotMuted
                            }
                            aria-hidden
                          />
                        )}
                        <span>
                          <strong>{item.author}</strong> {item.action}
                        </span>
                      </span>
                      <span className={styles.activityTime}>{item.time}</span>
                    </div>

                    {item.comment ? (
                      <div className={styles.commentBubble}>
                        {item.comment}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className={styles.commentForm}>
                <div className={styles.commentInputWrap}>
                  <Input
                    aria-label="Add activity comment"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Leave a comment on this task…"
                  />
                </div>
                <Button
                  size="sm"
                  icon={<Send size={14} aria-hidden />}
                  disabled={!commentDraft.trim()}
                  onClick={handlePostComment}
                >
                  Post
                </Button>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      {/* Create task modal */}
      <Modal
        open={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        width="sm"
        title="Add task to Q4 data platform"
        description="Create a tracked engineering task and assign an owner."
        footer={
          <>
            <Button onClick={() => setNewTaskOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!newTaskTitle.trim()}
              onClick={handleCreateTask}
            >
              Create task
            </Button>
          </>
        }
      >
        <div className={styles.formStack}>
          <FormField label="Task title">
            {(id) => (
              <Input
                id={id}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Backfill Q2 attribution events"
              />
            )}
          </FormField>

          <FormField label="Status">
            {(id) => (
              <Select
                id={id}
                value={newTaskStatus}
                onChange={(e) =>
                  setNewTaskStatus(e.target.value as ProjectTaskStatus)
                }
              >
                <option value="in-progress">In progress</option>
                <option value="review">Review</option>
                <option value="backlog">Backlog</option>
              </Select>
            )}
          </FormField>

          <FormField label="Priority">
            {(id) => (
              <Select
                id={id}
                value={newTaskPriority}
                onChange={(e) =>
                  setNewTaskPriority(e.target.value as ProjectTaskPriority)
                }
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </Select>
            )}
          </FormField>

          <FormField label="Assignee">
            {(id) => (
              <Select
                id={id}
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
              >
                <option value="Sam Turner">Sam Turner</option>
                <option value="Alex Morgan">Alex Morgan</option>
                <option value="Dana Walker">Dana Walker</option>
                <option value="Elena Rossi">Elena Rossi</option>
              </Select>
            )}
          </FormField>
        </div>
      </Modal>

      {/* Add subtask modal */}
      <Modal
        open={subtaskModalOpen}
        onClose={() => setSubtaskModalOpen(false)}
        width="sm"
        title="Add subtask"
        description={
          selectedTask
            ? `Add a checklist item to ${selectedTask.code}.`
            : 'Add a checklist item.'
        }
        footer={
          <>
            <Button onClick={() => setSubtaskModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!subtaskDraft.trim()}
              onClick={handleAddSubtask}
            >
              Add subtask
            </Button>
          </>
        }
      >
        <div className={styles.formStack}>
          <FormField label="Subtask title">
            {(id) => (
              <Input
                id={id}
                value={subtaskDraft}
                onChange={(e) => setSubtaskDraft(e.target.value)}
                placeholder="e.g. Verify partition row counts in Snowflake"
              />
            )}
          </FormField>
        </div>
      </Modal>
    </Page>
  );
};
