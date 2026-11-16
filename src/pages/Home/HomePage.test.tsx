// The workspace home: KPI tiles that double as filters, a task list with tabs and checkboxes,
// project/deadline drawers and three modals. Same pattern as every screen spec — click, look,
// and confirm the toast.
import { describe, expect, it } from 'vitest';

import { HomePage } from './HomePage';
import {
  DEADLINES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
} from './homeData';
import { Toaster } from '../../components/ui';
import { click, flush, mount, typeText } from '../../test/harness';

const open = () =>
  mount(
    <>
      <HomePage />
      <Toaster />
    </>,
    { route: '/' },
  );

const toastText = (screen: ReturnType<typeof open>) =>
  screen.findAll('[role="status"]').map((t) => t.textContent ?? '').join('\n');
const kpi = (screen: ReturnType<typeof open>, label: string) => {
  const tile = screen
    .findAll('[aria-label="Workspace metrics"] button')
    .find((b) => (b.querySelector('span')?.textContent ?? '').trim() === label);
  if (!tile) throw new Error(`no KPI tile ${label}`);
  return tile as HTMLElement;
};
const taskCheck = (screen: ReturnType<typeof open>, title: string) =>
  screen.find(`[role="checkbox"][aria-label="Complete ${title}"]`);
const taskRowTitles = (screen: ReturnType<typeof open>) =>
  screen
    .findAll('[role="checkbox"]')
    .map((c) => (c.getAttribute('aria-label') ?? '').replace('Complete ', ''));

const upcoming = () => INITIAL_TASKS.filter((t) => !t.completed && t.bucket === 'upcoming');
const overdue = () => INITIAL_TASKS.filter((t) => !t.completed && t.bucket === 'overdue');
const initialCompleted = () => INITIAL_TASKS.filter((t) => t.completed);

describe('the home screen', () => {
  it('greets the user and shows every dashboard section', () => {
    const screen = open();
    expect(screen.find('h1').textContent).toBe('Good afternoon, Alex');
    expect(screen.findAll('[aria-label="Workspace metrics"] button')).toHaveLength(4);
    expect(screen.text).toContain('My tasks');
    expect(screen.text).toContain('Project progress');
    expect(screen.text).toContain('Upcoming deadlines');
    expect(screen.text).toContain('Recent activity');
    expect(taskRowTitles(screen).length).toBe(upcoming().length);
  });

  it('completes a task from its checkbox, tells the activity feed, and reopens it', async () => {
    const screen = open();
    const task = upcoming()[0];
    click(taskCheck(screen, task.title));
    await flush();
    expect(toastText(screen)).toContain('Task completed');
    expect(screen.text).toContain(`completed ${task.title}`);
    // A completed task leaves the Upcoming tab…
    expect(screen.findAll(`[aria-label="Complete ${task.title}"]`)).toEqual([]);

    // …and can be reopened from the Completed tab.
    click(screen.findByText('[role="tab"]', 'Completed'));
    const done = screen.find(`[aria-label="Complete ${task.title}"]`);
    expect(done.getAttribute('aria-checked')).toBe('true');
    click(done);
    await flush();
    expect(toastText(screen)).toContain('Task reopened');
    expect(screen.text).toContain(`reopened ${task.title}`);
  });

  it('switches the task tabs and shows the fixture-matching set', () => {
    const screen = open();
    const tab = (label: string) => screen.findByText('[role="tab"]', label);

    click(tab('Overdue'));
    expect(tab('Overdue').getAttribute('aria-selected')).toBe('true');
    expect(taskRowTitles(screen).sort()).toEqual(overdue().map((t) => t.title).sort());

    click(tab('Completed'));
    expect(taskRowTitles(screen).sort()).toEqual(initialCompleted().map((t) => t.title).sort());

    click(tab('Upcoming'));
    expect(taskRowTitles(screen).length).toBe(upcoming().length);
  });

  it('expands the list beyond the active tab', async () => {
    const screen = open();
    const expand = screen.find('[aria-label="Expand task list"]');
    expect(expand.getAttribute('aria-pressed')).toBe('false');

    click(expand);
    await flush();
    expect(expand.getAttribute('aria-pressed')).toBe('true');
    expect(toastText(screen)).toContain('Showing all assigned tasks');
    expect(taskRowTitles(screen).length).toBe(INITIAL_TASKS.length);
  });

  it('searches tasks, projects and deadlines, and resets when nothing matches', () => {
    const screen = open();
    const search = screen.find<HTMLInputElement>('input[placeholder="Search or jump to…"]');

    typeText(search, 'Website Redesign');
    for (const title of taskRowTitles(screen)) {
      const task = INITIAL_TASKS.find((t) => t.title === title);
      expect(task?.project).toBe('Website Redesign');
    }
    expect(screen.findByText('button', 'Website Redesign')).toBeTruthy();

    typeText(search, 'zzz nothing here');
    expect(screen.text).toContain('No matching tasks');
    click(screen.findByText('button', 'Reset filters'));
    expect(taskRowTitles(screen).length).toBe(upcoming().length);
  });

  it('filters by KPI tile and lifts the filter on a second press', () => {
    const screen = open();
    const projectsTile = kpi(screen, 'Active projects');

    click(projectsTile);
    expect(projectsTile.getAttribute('aria-pressed')).toBe('true');
    const atRisk = INITIAL_PROJECTS.filter((p) => p.status === 'at-risk').map((p) => p.name);
    for (const title of taskRowTitles(screen)) {
      expect(atRisk).toContain(INITIAL_TASKS.find((t) => t.title === title)?.project);
    }

    click(projectsTile);
    expect(projectsTile.getAttribute('aria-pressed')).toBe('false');
    expect(taskRowTitles(screen).length).toBe(upcoming().length);
  });

  it('jumping to a KPI also jumps the task tab', () => {
    const screen = open();
    click(kpi(screen, 'Completed'));
    const selected = screen.find('[role="tab"][aria-selected="true"]');
    expect(selected.textContent).toContain('Completed');
  });
});

describe('the drawers', () => {
  it('opens a task, marks it complete from the footer and closes', async () => {
    const screen = open();
    const task = upcoming()[0];
    click(screen.findByText('button', task.title));
    const drawer = screen.find('[role="dialog"][aria-modal="true"]');
    expect(drawer.getAttribute('aria-label')).toBe(task.title);

    click(screen.findByText('button', 'Mark complete'));
    await flush();
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(toastText(screen)).toContain('Task completed');
    // Done: out of Upcoming, present as checked under Completed.
    expect(screen.findAll(`[aria-label="Complete ${task.title}"]`)).toEqual([]);
    click(screen.findByText('[role="tab"]', 'Completed'));
    expect(screen.find(`[aria-label="Complete ${task.title}"]`).getAttribute('aria-checked')).toBe('true');
  });

  it('posts a status update on a project and rewrites its summary', async () => {
    const screen = open();
    const project = INITIAL_PROJECTS[0];
    click(screen.findByText('button', project.name));
    const drawer = screen.find('[role="dialog"][aria-modal="true"]');
    expect(drawer.getAttribute('aria-label')).toBe(project.name);

    const note = drawer.querySelector('textarea') as HTMLTextAreaElement;
    typeText(note, 'Scope frozen, shipping next Tuesday.');
    click(screen.findByText('button', 'Post status update'));
    await flush();
    expect(toastText(screen)).toContain('Status update posted');
    expect(screen.text).toContain('Scope frozen, shipping next Tuesday.');
  });

  it('posts the checkpoint default when the note is left empty', async () => {
    const screen = open();
    const project = INITIAL_PROJECTS[1];
    click(screen.findByText('button', project.name));
    click(screen.findByText('button', 'Post status update'));
    await flush();
    expect(toastText(screen)).toContain('Status update posted');
    expect(screen.text).toContain('Checkpoint confirmed');
  });

  it('opens a deadline from the strip and closes it again', () => {
    const screen = open();
    const item = DEADLINES[0];
    click(screen.findByText('button', item.title));
    const drawer = screen.find('[role="dialog"][aria-modal="true"]');
    expect(drawer.getAttribute('aria-label')).toBe(item.title);
    click(screen.findByText('button', 'Close'));
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
  });
});

describe('the modals', () => {
  it('lists every project in the directory modal and hops to creating one', () => {
    const screen = open();
    click(screen.findByText('button', 'All projects'));
    const dialog = screen.find('[role="dialog"][aria-modal="true"]');
    expect(dialog.getAttribute('aria-label')).toBe('All workspace projects');
    for (const p of INITIAL_PROJECTS) {
      expect((dialog.textContent ?? '').includes(p.name)).toBe(true);
    }
    click(screen.findByText('button', 'Close'));
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
  });

  it('invites a teammate only once the email looks real', async () => {
    const screen = open();
    click(screen.findByText('button', 'Invite member'));
    const send = () => screen.findByText('button', 'Send invite') as HTMLButtonElement;
    expect(send().disabled).toBe(true);

    const email = screen.find<HTMLInputElement>('input[placeholder="teammate@acme.io"]');
    typeText(email, 'not-an-email');
    expect(send().disabled).toBe(true);

    typeText(email, 'jordan@acme.io');
    expect(send().disabled).toBe(false);
    click(send());
    await flush();
    expect(screen.findAll('[role="dialog"]')).toEqual([]);
    expect(toastText(screen)).toContain('Invitation sent');
    expect(screen.text).toContain('invited jordan@acme.io');
  });

  it('creates a project and puts it on the board', async () => {
    const screen = open();
    const before = kpi(screen, 'Active projects').textContent;
    click(screen.findByText('button', 'New project'));
    expect((screen.findByText('button', 'Create project') as HTMLButtonElement).disabled).toBe(true);

    typeText(screen.find<HTMLInputElement>('input[placeholder="e.g. Customer Portal"]'), 'Customer Portal');
    click(screen.findByText('button', 'Create project'));
    await flush();
    expect(toastText(screen)).toContain('Project created');
    expect(kpi(screen, 'Active projects').textContent).not.toBe(before);
    expect(screen.findByText('button', 'Customer Portal')).toBeTruthy();
  });
});
