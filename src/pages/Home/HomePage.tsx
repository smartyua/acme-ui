import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Check,
  Circle,
  CircleCheck,
  CircleDashed,
  Clock,
  Folder,
  FolderPlus,
  Inbox,
  OctagonAlert,
  Send,
  SignalHigh,
  SignalMedium,
  UserPlus,
} from 'lucide-react';

import { Avatar, Count } from '../../components/primitives';
import {
  Badge,
  Button,
  Drawer,
  Empty,
  FormField,
  Input,
  Meter,
  Modal,
  Panel,
  PillTabs,
  SearchBox,
  Select,
  TableWrap,
  Textarea,
  cx,
  tableClass,
} from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import styles from './Home.module.scss';
import {
  DEADLINES,
  INITIAL_ACTIVITY,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  NEW_PROJECT_ICON,
  PRIORITY_LABEL,
  PROJECT_STATUS_META,
  WORKSPACE_COMPLETED_OFFSET,
  WORKSPACE_OPEN_OFFSET,
  WORKSPACE_OVERDUE_OFFSET,
  type DeadlineGroupKey,
  type DeadlineItem,
  type HomeActivityItem,
  type HomeProject,
  type HomeTask,
  type ProjectStatus,
  type TaskPriority,
  type TaskTab,
} from './homeData';

type KpiFilter = 'projects' | 'open' | 'completed' | 'overdue';
type MemberRole = 'Member' | 'Admin' | 'Viewer';

const DEADLINE_GROUPS: DeadlineGroupKey[] = ['Today', 'Tomorrow', 'This week'];

const PriorityGlyph = ({ priority }: { priority: TaskPriority }) => {
  if (priority === 'urgent') {
    return <OctagonAlert size={14} className={styles.urgentIcon} aria-hidden />;
  }
  if (priority === 'high') {
    return <SignalHigh size={14} className={styles.highPriorityIcon} aria-hidden />;
  }
  return <SignalMedium size={14} className={styles.normalPriorityIcon} aria-hidden />;
};

export const HomePage = () => {
  const { toast } = useApp();

  const [query, setQuery] = useState('');
  const [kpiFilter, setKpiFilter] = useState<KpiFilter | null>(null);
  const [tab, setTab] = useState<TaskTab>('upcoming');
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [showMoreDeadlines, setShowMoreDeadlines] = useState(false);

  const [tasks, setTasks] = useState<HomeTask[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<HomeProject[]>(INITIAL_PROJECTS);
  const [activity, setActivity] = useState<HomeActivityItem[]>(INITIAL_ACTIVITY);

  // Overlays
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<DeadlineItem | null>(null);
  const [statusUpdateDraft, setStatusUpdateDraft] = useState('');
  const [allProjectsOpen, setAllProjectsOpen] = useState(false);

  // Invite Member modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('Member');

  // New Project modal state
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDue, setNewProjectDue] = useState('Dec 12');
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>('planning');

  const normalizedQuery = query.trim().toLowerCase();

  // Derived task counts
  const upcomingCount = useMemo(
    () => tasks.filter((t) => !t.completed && t.bucket === 'upcoming').length,
    [tasks],
  );
  const overdueCount = useMemo(
    () => tasks.filter((t) => !t.completed && t.bucket === 'overdue').length,
    [tasks],
  );
  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  const myOpenCount = upcomingCount + overdueCount;
  const openTasksTotal = WORKSPACE_OPEN_OFFSET + myOpenCount;
  const completedTasksTotal = WORKSPACE_COMPLETED_OFFSET + completedCount;
  const overdueTasksTotal = WORKSPACE_OVERDUE_OFFSET + overdueCount;

  const atRiskProjectNames = useMemo(
    () => new Set(projects.filter((p) => p.status === 'at-risk').map((p) => p.name)),
    [projects],
  );
  const atRiskCount = atRiskProjectNames.size;

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesTab = tasksExpanded
        ? true
        : tab === 'completed'
          ? t.completed
          : !t.completed && t.bucket === tab;
      if (!matchesTab) return false;

      if (kpiFilter === 'projects' && atRiskCount > 0 && !atRiskProjectNames.has(t.project)) {
        return false;
      }

      if (!normalizedQuery) return true;
      return [t.title, t.project, t.due, PRIORITY_LABEL[t.priority]].some((field) =>
        field.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [tasks, tasksExpanded, tab, kpiFilter, atRiskCount, atRiskProjectNames, normalizedQuery]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (!normalizedQuery) return true;
      return [p.name, PROJECT_STATUS_META[p.status].label, p.due, p.lead].some((field) =>
        field.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [projects, normalizedQuery]);

  const filteredDeadlinesByGroup = useMemo(() => {
    return DEADLINE_GROUPS.map((group) => {
      const matching = DEADLINES.filter((item) => {
        if (item.group !== group) return false;
        if (!normalizedQuery) return true;
        return [item.title, item.project, item.group, item.dueDetail, item.owner].some((field) =>
          field.toLowerCase().includes(normalizedQuery),
        );
      });

      const hiddenCount =
        group === 'This week' && !normalizedQuery ? matching.filter((item) => item.extra).length : 0;

      const visible =
        group === 'This week' && !normalizedQuery && !showMoreDeadlines
          ? matching.filter((item) => !item.extra)
          : matching;

      return {
        group,
        totalCount: matching.length,
        visible,
        hiddenCount,
      };
    }).filter((entry) => !normalizedQuery || entry.totalCount > 0);
  }, [normalizedQuery, showMoreDeadlines]);

  const selectedTask = useMemo(
    () => (selectedTaskId ? (tasks.find((t) => t.id === selectedTaskId) ?? null) : null),
    [tasks, selectedTaskId],
  );

  const selectedProject = useMemo(
    () => (selectedProjectId ? (projects.find((p) => p.id === selectedProjectId) ?? null) : null),
    [projects, selectedProjectId],
  );

  const pushActivity = (verb: string, target: string, project: string) => {
    setActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        initials: 'AM',
        actor: 'You',
        verb,
        target,
        project,
        time: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleKpiClick = (next: KpiFilter) => {
    if (kpiFilter === next) {
      setKpiFilter(null);
      return;
    }
    setKpiFilter(next);
    setTasksExpanded(false);
    if (next === 'open') {
      setTab('upcoming');
    } else if (next === 'completed') {
      setTab('completed');
    } else if (next === 'overdue') {
      setTab('overdue');
    } else if (next === 'projects') {
      setTab('upcoming');
    }
  };

  const resetFilters = () => {
    setQuery('');
    setKpiFilter(null);
    setTasksExpanded(false);
    setTab('upcoming');
  };

  const toggleTaskCompletion = (task: HomeTask) => {
    const nextCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((item) => (item.id === task.id ? { ...item, completed: nextCompleted } : item)),
    );
    pushActivity(nextCompleted ? 'completed' : 'reopened', task.title, task.project);
    toast({
      title: nextCompleted ? 'Task completed' : 'Task reopened',
      description: task.title,
      tone: 'success',
    });
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim());

  const handleSendInvite = () => {
    const cleanEmail = inviteEmail.trim();
    if (!emailValid) return;
    pushActivity('invited', cleanEmail, `${inviteRole} access`);
    toast({
      title: 'Invitation sent',
      description: `${cleanEmail} invited as ${inviteRole}.`,
      tone: 'success',
    });
    setInviteEmail('');
    setInviteRole('Member');
    setInviteOpen(false);
  };

  const handleCreateProject = () => {
    const cleanName = newProjectName.trim();
    if (!cleanName) return;
    const cleanDue = newProjectDue.trim() || 'Dec 31';
    const created: HomeProject = {
      id: `proj-${Date.now()}`,
      name: cleanName,
      icon: NEW_PROJECT_ICON,
      tileTone: newProjectStatus === 'at-risk' ? 'peach' : newProjectStatus === 'planning' ? 'mint' : 'blue',
      dotTone: newProjectStatus === 'at-risk' ? 'rose' : newProjectStatus === 'planning' ? 'mint' : 'sky',
      status: newProjectStatus,
      progress: newProjectStatus === 'in-progress' ? 10 : 0,
      due: cleanDue,
      team: ['AM', 'SC'],
      extraTeam: 0,
      lead: 'Alex Morgan',
      summary: 'Newly created workspace project with initial milestone tracking enabled.',
    };
    setProjects((prev) => [created, ...prev]);
    pushActivity('created project', cleanName, PROJECT_STATUS_META[newProjectStatus].label);
    toast({
      title: 'Project created',
      description: `${cleanName} added to Project progress.`,
      tone: 'success',
    });
    setNewProjectName('');
    setNewProjectDue('Dec 12');
    setNewProjectStatus('planning');
    setNewProjectOpen(false);
  };

  const handlePostStatusUpdate = () => {
    if (!selectedProject) return;
    const note = statusUpdateDraft.trim();
    const summaryNext =
      note || `Checkpoint confirmed — ${selectedProject.progress}% complete toward ${selectedProject.due}.`;
    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProject.id ? { ...p, summary: summaryNext } : p)),
    );
    pushActivity(
      'posted status update on',
      selectedProject.name,
      PROJECT_STATUS_META[selectedProject.status].label,
    );
    toast({
      title: 'Status update posted',
      description: `${selectedProject.name} timeline updated.`,
      tone: 'success',
    });
    setStatusUpdateDraft('');
  };

  return (
    <Page>
      {/* 1. Top Breadcrumb + Quick Search Bar */}
      <div className={styles.topBar}>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <span className={styles.workspaceBadge} aria-hidden>
            A
          </span>
          <span className={styles.crumbOrg}>Acme</span>
          <span className={styles.crumbSep} aria-hidden>
            /
          </span>
          <span aria-current="page" className={styles.crumbCurrent}>
            Home
          </span>
        </nav>

        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search or jump to…"
          shortcut="/"
          className={styles.topSearch}
        />
      </div>

      {/* 2. Greeting Hero Row */}
      <header className={styles.hero}>
        <div className={styles.heroHeading}>
          <h1>Good afternoon, Alex</h1>
          <p className={styles.lead}>
            Sunday, October 11 · Here&apos;s what&apos;s happening across your workspace.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Button icon={<UserPlus size={15} aria-hidden />} onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
          <Button
            variant="primary"
            icon={<FolderPlus size={15} aria-hidden />}
            onClick={() => setNewProjectOpen(true)}
          >
            New project
          </Button>
        </div>
      </header>

      {/* 3. 4-Cell Segmented KPI Strip */}
      <div className={styles.kpiStrip} role="group" aria-label="Workspace metrics">
        <button
          type="button"
          className={styles.kpiCell}
          aria-pressed={kpiFilter === 'projects'}
          onClick={() => handleKpiClick('projects')}
        >
          <span className={styles.kpiLabel}>
            <Folder size={14} aria-hidden />
            Active projects
          </span>
          <span className={styles.kpiValue}>{projects.length}</span>
          <span className={styles.kpiSub}>{atRiskCount} at risk</span>
        </button>

        <button
          type="button"
          className={styles.kpiCell}
          aria-pressed={kpiFilter === 'open'}
          onClick={() => handleKpiClick('open')}
        >
          <span className={styles.kpiLabel}>
            <CircleDashed size={14} aria-hidden />
            Open tasks
          </span>
          <span className={styles.kpiValue}>{openTasksTotal}</span>
          <span className={styles.kpiSub}>{myOpenCount} assigned to you</span>
        </button>

        <button
          type="button"
          className={styles.kpiCell}
          aria-pressed={kpiFilter === 'completed'}
          onClick={() => handleKpiClick('completed')}
        >
          <span className={styles.kpiLabel}>
            <CircleCheck size={14} aria-hidden />
            Completed
          </span>
          <span className={styles.kpiValue}>{completedTasksTotal}</span>
          <span className={styles.kpiSub}>
            <span className={styles.subSuccess}>this week</span>
          </span>
        </button>

        <button
          type="button"
          className={styles.kpiCell}
          aria-pressed={kpiFilter === 'overdue'}
          onClick={() => handleKpiClick('overdue')}
        >
          <span className={styles.kpiLabel}>
            <Clock size={14} aria-hidden />
            Overdue
          </span>
          <span className={styles.kpiValue}>
            <span className={styles.valDanger}>{overdueTasksTotal}</span>
          </span>
          <span className={styles.kpiSub}>
            <span className={styles.subDanger}>need attention</span>
          </span>
        </button>
      </div>

      {/* 4. Main Asymmetric Split Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.colStack}>
          {/* Panel A — My tasks */}
          <Panel
            flush
            title="My tasks"
            actions={
              <div className={styles.taskPanelActions}>
                <PillTabs
                  label="Task status"
                  value={tab}
                  onChange={(next) => {
                    setTab(next);
                    setTasksExpanded(false);
                    if (kpiFilter && kpiFilter !== 'projects') {
                      setKpiFilter(null);
                    }
                  }}
                  items={[
                    { value: 'upcoming', label: 'Upcoming', count: upcomingCount },
                    { value: 'overdue', label: 'Overdue', count: overdueCount },
                    { value: 'completed', label: 'Completed', count: completedCount },
                  ]}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.iconActionBtn}
                  aria-label="Expand task list"
                  aria-pressed={tasksExpanded}
                  onClick={() => {
                    const next = !tasksExpanded;
                    setTasksExpanded(next);
                    toast({
                      title: next ? 'Showing all assigned tasks' : 'Returned to tabbed view',
                      description: next
                        ? `Displaying all ${tasks.length} tasks across statuses.`
                        : `Filtered by ${tab} tasks.`,
                    });
                  }}
                >
                  <ArrowUpRight size={15} aria-hidden />
                </Button>
              </div>
            }
          >
            {kpiFilter === 'projects' || tasksExpanded ? (
              <div className={styles.filterNotice}>
                <span>
                  {kpiFilter === 'projects'
                    ? 'Filtered to tasks in at-risk projects'
                    : `Expanded view · showing all ${filteredTasks.length} tasks`}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    setKpiFilter(null);
                    setTasksExpanded(false);
                  }}
                >
                  Clear view
                </Button>
              </div>
            ) : null}

            {filteredTasks.length === 0 ? (
              <Empty icon={<Inbox size={18} aria-hidden />} title="No matching tasks">
                No tasks match the active tab or search query.
                <div className={styles.emptyAction}>
                  <Button size="sm" onClick={resetFilters}>
                    Reset filters
                  </Button>
                </div>
              </Empty>
            ) : (
              <ul className={styles.taskList}>
                {filteredTasks.map((task) => {
                  const dueToneClass =
                    !task.completed && task.dueTone === 'warning'
                      ? styles.dueWarn
                      : !task.completed && task.dueTone === 'danger'
                        ? styles.dueDanger
                        : undefined;

                  return (
                    <li key={task.id} className={styles.taskRow}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={task.completed}
                        aria-label={`Complete ${task.title}`}
                        className={cx(styles.taskCheck, task.completed && styles.taskCheckDone)}
                        onClick={() => toggleTaskCompletion(task)}
                      >
                        {task.completed ? <Check size={14} aria-hidden /> : null}
                      </button>

                      <button
                        type="button"
                        className={cx(styles.taskTitleBtn, task.completed && styles.taskTitleDone)}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        {task.completed ? (
                          <CircleCheck size={15} className={styles.doneIcon} aria-hidden />
                        ) : task.hasWarning ? (
                          <AlertCircle size={15} className={styles.warnIcon} aria-hidden />
                        ) : (
                          <Circle size={15} className={styles.statusIcon} aria-hidden />
                        )}
                        <span className={styles.taskTitleText}>{task.title}</span>
                      </button>

                      <div className={styles.taskMeta}>
                        <span className={styles.taskProject}>
                          <span className={cx(styles.dot, styles[`dot-${task.projectTone}`])} aria-hidden />
                          {task.project}
                        </span>
                        <PriorityGlyph priority={task.priority} />
                        <span className={cx(styles.taskDue, dueToneClass)}>{task.due}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* Panel B — Project progress */}
          <Panel
            flush
            title="Project progress"
            actions={
              <Button variant="ghost" size="sm" onClick={() => setAllProjectsOpen(true)}>
                All projects
              </Button>
            }
          >
            {filteredProjects.length === 0 ? (
              <Empty icon={<Folder size={18} aria-hidden />} title="No projects match">
                Try clearing your search query to see all active workspace projects.
                <div className={styles.emptyAction}>
                  <Button size="sm" onClick={() => setQuery('')}>
                    Reset filters
                  </Button>
                </div>
              </Empty>
            ) : (
              <div className={styles.tableTopBorder}>
                <TableWrap label="Project progress">
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Status</th>
                        <th className={styles.hideSm}>Progress</th>
                        <th className={styles.hideSm}>Due</th>
                        <th className={styles.hideMd}>Team</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => {
                        const Icon = project.icon;
                        const statusMeta = PROJECT_STATUS_META[project.status];
                        return (
                          <tr
                            key={project.id}
                            className={styles.projectRow}
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setStatusUpdateDraft('');
                            }}
                          >
                            <td>
                              <div className={styles.projectCell}>
                                <span className={cx(styles.projectTile, styles[`tile-${project.tileTone}`])}>
                                  <Icon size={15} aria-hidden />
                                </span>
                                <button
                                  type="button"
                                  className={styles.projectNameBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProjectId(project.id);
                                    setStatusUpdateDraft('');
                                  }}
                                >
                                  {project.name}
                                </button>
                              </div>
                            </td>
                            <td>
                              <Count tone={statusMeta.tone} value={statusMeta.label} />
                            </td>
                            <td className={styles.hideSm}>
                              <div className={styles.progressCell}>
                                <div
                                  className={styles.progressTrack}
                                  role="progressbar"
                                  aria-label={`${project.name} completion`}
                                  aria-valuenow={project.progress}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  <span
                                    className={styles.progressFill}
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <span className={styles.progressPct}>{project.progress}%</span>
                              </div>
                            </td>
                            <td className={cx(styles.hideSm, styles.dueCell)}>{project.due}</td>
                            <td className={styles.hideMd}>
                              <div className={styles.avatarStack}>
                                {project.team.map((initials) => (
                                  <Avatar key={initials} size="sm" initials={initials} />
                                ))}
                                {project.extraTeam > 0 ? (
                                  <span className={styles.avatarMore}>+{project.extraTeam}</span>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableWrap>
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column */}
        <div className={styles.colStack}>
          {/* Panel C — Upcoming deadlines */}
          <Panel title="Upcoming deadlines">
            {filteredDeadlinesByGroup.length === 0 ? (
              <Empty icon={<Calendar size={18} aria-hidden />} title="No upcoming deadlines">
                No deadlines match &ldquo;{query}&rdquo;.
                <div className={styles.emptyAction}>
                  <Button size="sm" onClick={() => setQuery('')}>
                    Reset filters
                  </Button>
                </div>
              </Empty>
            ) : (
              <div className={styles.deadlineGroups}>
                {filteredDeadlinesByGroup.map(({ group, totalCount, visible, hiddenCount }) => (
                  <div key={group} className={styles.deadlineGroup}>
                    <div className={styles.deadlineGroupHead}>
                      <span>{group}</span>
                      <span className={styles.deadlineGroupCount}>{totalCount}</span>
                    </div>

                    <ul className={styles.deadlineList}>
                      {visible.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            className={styles.deadlineBtn}
                            onClick={() => setSelectedDeadline(item)}
                          >
                            <span className={cx(styles.dot, styles[`dot-${item.dotTone}`])} aria-hidden />
                            <span className={styles.deadlineTitle}>{item.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {hiddenCount > 0 ? (
                      <button
                        type="button"
                        className={styles.moreBtn}
                        aria-expanded={showMoreDeadlines}
                        onClick={() => setShowMoreDeadlines((prev) => !prev)}
                      >
                        {showMoreDeadlines ? 'Show less' : `+${hiddenCount} more`}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Panel D — Recent activity */}
          <Panel title="Recent activity">
            <ul className={styles.activityList}>
              {activity.slice(0, 6).map((entry) => (
                <li key={entry.id} className={styles.activityRow}>
                  <Avatar size="sm" initials={entry.initials} />
                  <p className={styles.activityBody}>
                    <strong>{entry.actor}</strong> {entry.verb} <strong>{entry.target}</strong> in{' '}
                    <strong>{entry.project}</strong>
                  </p>
                  <span className={styles.activityTime}>{entry.time}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Task Detail Drawer */}
      <Drawer
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTaskId(null)}
        title={selectedTask ? selectedTask.title : 'Task details'}
        footer={
          selectedTask ? (
            <>
              <Button onClick={() => setSelectedTaskId(null)}>Close</Button>
              <Button
                variant="primary"
                icon={<CircleCheck size={15} aria-hidden />}
                onClick={() => {
                  toggleTaskCompletion(selectedTask);
                  setSelectedTaskId(null);
                }}
              >
                {selectedTask.completed ? 'Reopen task' : 'Mark complete'}
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedTask ? (
          <>
            <p className={styles.drawerLead}>{selectedTask.notes}</p>
            <dl className={styles.dl}>
              <dt>Status</dt>
              <dd>
                <Count
                  tone={
                    selectedTask.completed ? 'mint' : selectedTask.bucket === 'overdue' ? 'rose' : 'lemon'
                  }
                  value={
                    selectedTask.completed
                      ? 'Completed'
                      : selectedTask.bucket === 'overdue'
                        ? 'Overdue'
                        : 'Open'
                  }
                />
              </dd>

              <dt>Project</dt>
              <dd>
                <span className={cx(styles.dot, styles[`dot-${selectedTask.projectTone}`])} aria-hidden />
                <span>{selectedTask.project}</span>
              </dd>

              <dt>Priority</dt>
              <dd>
                <Badge
                  tone={
                    selectedTask.priority === 'urgent'
                      ? 'rose'
                      : selectedTask.priority === 'high'
                        ? 'lemon'
                        : 'neutral'
                  }
                >
                  {PRIORITY_LABEL[selectedTask.priority]}
                </Badge>
              </dd>

              <dt>Due</dt>
              <dd>{selectedTask.due}</dd>

              <dt>Assignee</dt>
              <dd>
                <Avatar size="sm" initials={selectedTask.assigneeInitials} />
                <span>{selectedTask.assignee}</span>
              </dd>
            </dl>
          </>
        ) : null}
      </Drawer>

      {/* Project Detail Drawer */}
      <Drawer
        open={Boolean(selectedProject)}
        onClose={() => setSelectedProjectId(null)}
        title={selectedProject ? selectedProject.name : 'Project details'}
        footer={
          selectedProject ? (
            <>
              <Button onClick={() => setSelectedProjectId(null)}>Close</Button>
              <Button
                variant="primary"
                icon={<Send size={15} aria-hidden />}
                onClick={handlePostStatusUpdate}
              >
                Post status update
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedProject ? (
          <>
            <p className={styles.drawerLead}>{selectedProject.summary}</p>

            <div className={styles.drawerSection}>
              <p className={styles.drawerSectionTitle}>Overall completion</p>
              <Meter
                value={selectedProject.progress}
                max={100}
                tone={selectedProject.status === 'at-risk' ? 'danger' : 'accent'}
                label={`${selectedProject.name} completion`}
              />
            </div>

            <dl className={styles.dl}>
              <dt>Status</dt>
              <dd>
                <Count
                  tone={PROJECT_STATUS_META[selectedProject.status].tone}
                  value={PROJECT_STATUS_META[selectedProject.status].label}
                />
              </dd>

              <dt>Progress</dt>
              <dd>{selectedProject.progress}%</dd>

              <dt>Target due</dt>
              <dd>{selectedProject.due}, 2026</dd>

              <dt>Project lead</dt>
              <dd>{selectedProject.lead}</dd>

              <dt>Team</dt>
              <dd>
                <div className={styles.avatarStack}>
                  {selectedProject.team.map((initials) => (
                    <Avatar key={initials} size="sm" initials={initials} />
                  ))}
                  {selectedProject.extraTeam > 0 ? (
                    <span className={styles.avatarMore}>+{selectedProject.extraTeam}</span>
                  ) : null}
                </div>
              </dd>
            </dl>

            <FormField
              label="Status update note"
              hint="Shared with project subscribers and logged in Recent activity."
            >
              {(id) => (
                <Textarea
                  id={id}
                  value={statusUpdateDraft}
                  onChange={(e) => setStatusUpdateDraft(e.target.value)}
                  placeholder="Add milestone progress, blockers, or next steps…"
                />
              )}
            </FormField>
          </>
        ) : null}
      </Drawer>

      {/* Deadline Detail Drawer */}
      <Drawer
        open={Boolean(selectedDeadline)}
        onClose={() => setSelectedDeadline(null)}
        title={selectedDeadline ? selectedDeadline.title : 'Deadline details'}
        footer={
          selectedDeadline ? (
            <>
              <Button onClick={() => setSelectedDeadline(null)}>Close</Button>
              <Button
                variant="primary"
                icon={<Clock size={15} aria-hidden />}
                onClick={() => {
                  const match = projects.find((p) => p.name === selectedDeadline.project);
                  if (match) {
                    setSelectedDeadline(null);
                    setSelectedProjectId(match.id);
                    setStatusUpdateDraft('');
                  } else {
                    toast({
                      title: 'Reminder scheduled',
                      description: `You’ll be notified 1 hour before ${selectedDeadline.title}.`,
                      tone: 'success',
                    });
                    setSelectedDeadline(null);
                  }
                }}
              >
                Open project
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedDeadline ? (
          <dl className={styles.dl}>
            <dt>Window</dt>
            <dd>
              <Badge
                tone={
                  selectedDeadline.group === 'Today'
                    ? 'lemon'
                    : selectedDeadline.group === 'Tomorrow'
                      ? 'peach'
                      : 'sky'
                }
              >
                {selectedDeadline.group}
              </Badge>
            </dd>

            <dt>Due</dt>
            <dd>{selectedDeadline.dueDetail}</dd>

            <dt>Project</dt>
            <dd>
              <span className={cx(styles.dot, styles[`dot-${selectedDeadline.dotTone}`])} aria-hidden />
              <span>{selectedDeadline.project}</span>
            </dd>

            <dt>Owner</dt>
            <dd>
              <Avatar size="sm" initials={selectedDeadline.ownerInitials} />
              <span>{selectedDeadline.owner}</span>
            </dd>
          </dl>
        ) : null}
      </Drawer>

      {/* All Projects Directory Modal */}
      <Modal
        open={allProjectsOpen}
        onClose={() => setAllProjectsOpen(false)}
        title="All workspace projects"
        description={`${projects.length} active projects tracked across Acme.`}
        width="md"
        footer={
          <>
            <Button onClick={() => setAllProjectsOpen(false)}>Close</Button>
            <Button
              variant="primary"
              icon={<FolderPlus size={15} aria-hidden />}
              onClick={() => {
                setAllProjectsOpen(false);
                setNewProjectOpen(true);
              }}
            >
              New project
            </Button>
          </>
        }
      >
        <ul className={styles.directoryList}>
          {projects.map((project) => {
            const Icon = project.icon;
            const statusMeta = PROJECT_STATUS_META[project.status];
            return (
              <li key={project.id}>
                <button
                  type="button"
                  className={styles.directoryRow}
                  onClick={() => {
                    setAllProjectsOpen(false);
                    setSelectedProjectId(project.id);
                    setStatusUpdateDraft('');
                  }}
                >
                  <span className={styles.directoryInfo}>
                    <span className={cx(styles.projectTile, styles[`tile-${project.tileTone}`])}>
                      <Icon size={15} aria-hidden />
                    </span>
                    <span className={styles.directoryText}>
                      <strong>{project.name}</strong>
                      <span>
                        Lead: {project.lead} · Due {project.due} · {project.progress}%
                      </span>
                    </span>
                  </span>
                  <Count tone={statusMeta.tone} value={statusMeta.label} />
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>

      {/* 5a. Invite Member Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite member"
        description="Send an invitation link to collaborate in the Acme workspace."
        width="sm"
        footer={
          <>
            <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              icon={<UserPlus size={15} aria-hidden />}
              disabled={!emailValid}
              onClick={handleSendInvite}
            >
              Send invite
            </Button>
          </>
        }
      >
        <div className={styles.formStack}>
          <FormField
            label="Email address"
            hint={
              inviteEmail.trim().length > 0 && !emailValid ? 'Enter a valid work email address.' : undefined
            }
          >
            {(id) => (
              <Input
                id={id}
                type="email"
                placeholder="teammate@acme.io"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            )}
          </FormField>

          <FormField label="Role">
            {(id) => (
              <Select
                id={id}
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              >
                <option value="Member">Member — create &amp; edit projects</option>
                <option value="Admin">Admin — manage members &amp; billing</option>
                <option value="Viewer">Viewer — comment &amp; view only</option>
              </Select>
            )}
          </FormField>
        </div>
      </Modal>

      {/* 5b. New Project Modal */}
      <Modal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        title="New project"
        description="Add a workspace project to track milestones, owners, and upcoming deadlines."
        width="md"
        footer={
          <>
            <Button onClick={() => setNewProjectOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              icon={<FolderPlus size={15} aria-hidden />}
              disabled={!newProjectName.trim()}
              onClick={handleCreateProject}
            >
              Create project
            </Button>
          </>
        }
      >
        <div className={styles.formStack}>
          <FormField label="Project name">
            {(id) => (
              <Input
                id={id}
                placeholder="e.g. Customer Portal"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            )}
          </FormField>

          <div className={styles.formRow}>
            <FormField label="Target due date">
              {(id) => (
                <Input
                  id={id}
                  placeholder="Dec 12"
                  value={newProjectDue}
                  onChange={(e) => setNewProjectDue(e.target.value)}
                />
              )}
            </FormField>

            <FormField label="Status">
              {(id) => (
                <Select
                  id={id}
                  value={newProjectStatus}
                  onChange={(e) => setNewProjectStatus(e.target.value as ProjectStatus)}
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In progress</option>
                  <option value="at-risk">At risk</option>
                </Select>
              )}
            </FormField>
          </div>
        </div>
      </Modal>
    </Page>
  );
};
