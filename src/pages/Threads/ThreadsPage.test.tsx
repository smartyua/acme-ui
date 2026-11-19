import { describe, expect, it } from 'vitest';

import { Toaster } from '../../components/ui';
import { click, mount, typeText } from '../../test/harness';
import { ThreadsPage } from './ThreadsPage';

const open = () =>
  mount(
    <>
      <ThreadsPage />
      <Toaster />
    </>,
  );

const toasts = () => Array.from(document.querySelectorAll('[role="status"]')).map((el) => el.textContent ?? '');

describe('ThreadsPage', () => {
  it('renders the Orbitly onboarding thread with messages, mention popover and inspector', () => {
    const screen = open();
    expect(screen.find('h1').textContent).toBe('Onboarding flow');
    expect(screen.text).toContain('Leah C.');
    expect(screen.text).toContain('Ravi I.');
    expect(screen.text).toContain('Marcus O.');
    expect(screen.text).toContain('Orbitly onboarding · v4.0');
    expect(screen.find('[aria-label="Mention suggestions"]').textContent).toContain('Sofia Kim');
    expect(screen.text).toContain('Main info');
    expect(screen.text).toContain('Linked threads');
    expect(screen.text).toContain('Thread activity');
    expect(screen.text).toContain('Samuel Park');
  });

  it('inserts a mention from the popover and sends a new message', () => {
    const screen = open();
    click(screen.findByText('button', 'Sofia Kim'));
    expect(screen.find<HTMLTextAreaElement>('textarea').value).toContain('@Sofia Kim');

    click(screen.findByText('button', 'Send'));
    expect(screen.text).toContain('Just now');
    expect(toasts().some((t) => t.includes('Message sent'))).toBe(true);
  });

  it('discards the draft and supports AI assistant draft insertion', () => {
    const screen = open();
    click(screen.findByText('button', 'Discard'));
    expect(screen.find<HTMLTextAreaElement>('textarea').value).toBe('');
    expect(toasts().some((t) => t.includes('Draft discarded'))).toBe(true);

    click(screen.find('[aria-label="Draft with AI assistant"]'));
    expect(screen.find<HTMLTextAreaElement>('textarea').value).toContain('5 screens token-mapped');
  });

  it('toggles message reactions and opens Quick view attachment modal', () => {
    const screen = open();
    click(screen.find('[aria-label="Star, 4"]'));
    expect(screen.find('[aria-label="Star, 5"]')).toBeTruthy();

    click(screen.findByText('button', 'Quick view'));
    const dialog = screen.find('[role="dialog"]');
    expect(dialog.textContent).toContain('01 · Welcome & value prop');
    click(screen.findByText('button', 'Copy Figma link'));
    expect(toasts().some((t) => t.includes('Figma link copied'))).toBe(true);
  });

  it('switches threads via linked threads, favorites and channel search', () => {
    const screen = open();
    const linkedBtn = Array.from(document.querySelectorAll('aside[aria-label="Thread details"] button')).find((b) =>
      b.textContent?.includes('QA checklist'),
    ) as HTMLElement;
    click(linkedBtn);
    expect(screen.find('h1').textContent).toBe('QA checklist');

    click(screen.find('[aria-label="Toggle channel search"]'));
    typeText(screen.find<HTMLInputElement>('[aria-label="Filter channels and threads"]'), 'Wireframes');
    click(screen.findByText('button', 'Wireframes'));
    expect(screen.find('h1').textContent).toBe('Wireframes');
  });

  it('switches inspector tabs, cycles status and opens Tags and Tasks modals', () => {
    const screen = open();
    click(screen.find('[aria-label^="Status: In review"]'));
    expect(screen.find('[aria-label^="Status: Approved"]')).toBeTruthy();

    click(screen.findByText('button', 'Tags'));
    expect(screen.find('[role="dialog"]').textContent).toContain('#onboarding');
    click(screen.findByText('button', 'Done'));

    click(screen.findByText('button', 'Tasks'));
    expect(screen.find('[role="dialog"]').textContent).toContain('Review permission prompt copy');
    click(screen.findByText('button', 'Done'));

    click(screen.findByText('[role="tab"]', 'Pins'));
    expect(screen.text).toContain('lock the onboarding flow');
    click(screen.findByText('[role="tab"]', 'Files'));
    expect(screen.text).toContain('Onboarding copy deck v4');
    click(screen.findByText('[role="tab"]', 'Links'));
    expect(screen.text).toContain('figma.com/file/orbitly-v4-onboarding');
  });

  it('creates a new thread and adds a member via modals', () => {
    const screen = open();
    click(screen.find('[aria-label="New channel thread"]'));
    typeText(screen.find<HTMLInputElement>('[role="dialog"] input'), 'Paywall copy');
    click(screen.findByText('button', 'Create thread'));
    expect(screen.find('h1').textContent).toBe('Paywall copy');

    click(screen.find('[aria-label="Add member"]'));
    typeText(screen.find<HTMLInputElement>('[placeholder="Hannah Brooks"]'), 'Hannah Brooks');
    click(screen.findByText('button', 'Add member'));
    expect(screen.text).toContain('Hannah Brooks');
  });

  it('switches workspaces and toggles bookmark, pin, filter and inspector', () => {
    const screen = open();
    click(screen.find('[aria-label="Lumen workspace"]'));
    expect(screen.text).toContain('Lumen');

    click(screen.find('[aria-label="Remove bookmark"]'));
    expect(screen.find('[aria-label="Bookmark thread"]')).toBeTruthy();

    click(screen.find('[aria-label="Pin thread"]'));
    expect(screen.find('[aria-label="Unpin thread"]')).toBeTruthy();

    click(screen.find('[aria-label="Filter online members"]'));
    expect(screen.text).not.toContain('Offline');

    click(screen.find('[aria-label="Sort members"]'));
    expect(toasts().some((t) => t.includes('Sorted members'))).toBe(true);
  });
});
