// The primitives every screen leans on for counters, avatars and small controls. Class names are
// hashed by CSS modules in tests, so specs assert structure (roles, attributes, text) and class
// distinctness between variants — the things that map to what a user sees or a reader hears.
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Bell } from 'lucide-react';

import { AVATAR_TONE } from '../data';
import { Avatar, Checkbox, Count, Field, SectionLabel, Segmented, Switch } from './primitives';
import { click, mount, toggleCheckbox } from '../test/harness';

const bare = { app: false } as const;

const avatarFor = (initials: string): HTMLElement => mount(<Avatar initials={initials} />, bare).find('span');

describe('Count', () => {
  it('prints the value it is given', () => {
    const screen = mount(<Count value={42} />, bare);
    expect(screen.find('span').textContent).toBe('42');
  });

  it('pills word labels and keeps bare numbers tight', () => {
    mount(
      <>
        <Count value={7} />
        <Count value="7" />
        <Count value="Completed" />
      </>,
      bare,
    );
    const [numeric, numericString, word] = Array.from(document.querySelectorAll('span')).map((el) => el.className);
    expect(numeric).toBe(numericString);
    expect(word).not.toBe(numeric);
  });

  it('gives every tone its own look, and the untoned default its own too', () => {
    mount(
      <>
        <Count value={1} />
        <Count value={1} tone="mint" />
        <Count value={1} tone="rose" />
        <Count value={1} tone="muted" />
        <Count value={1} tone="alert" />
      </>,
      bare,
    );
    const classes = Array.from(document.querySelectorAll('span')).map((el) => el.className);
    expect(new Set(classes).size).toBe(5);
  });
});

describe('Avatar', () => {
  it('shows the initials and hides itself from assistive tech', () => {
    const screen = mount(<Avatar initials="SC" />, bare);
    const badge = screen.find('span');
    expect(badge.textContent).toBe('SC');
    expect(badge.getAttribute('aria-hidden')).toBe('true');
  });

  it('gives differently toned teammates different colours', () => {
    const pair = (Object.keys(AVATAR_TONE) as Array<keyof typeof AVATAR_TONE>).find((k) => AVATAR_TONE[k] !== AVATAR_TONE.SC);
    expect(pair).toBeTruthy();
    expect(avatarFor('SC').className).not.toBe(avatarFor(pair as string).className);
  });

  it('falls every stranger back onto one shared tone', () => {
    const sky = Object.keys(AVATAR_TONE).find((k) => AVATAR_TONE[k] === 'sky');
    expect(sky).toBeTruthy();
    const zz = avatarFor('ZZ');
    expect(zz.className).toBe(avatarFor('QZ').className);
    expect(zz.className).toBe(avatarFor(sky as string).className);
    expect(zz.className).not.toBe(avatarFor('SC').className);
  });

  it('has a visibly smaller small size', () => {
    mount(
      <>
        <Avatar initials="MW" size="sm" />
        <Avatar initials="MW" />
      </>,
      bare,
    );
    const [small, medium] = Array.from(document.querySelectorAll('span')).map((el) => el.className);
    expect(small).not.toBe(medium);
  });
});

describe('Switch', () => {
  const open = (checked: boolean, onChange = () => {}, hideLabel?: boolean) =>
    mount(<Switch id="live" checked={checked} onChange={onChange} label="Stream updates" hideLabel={hideLabel} />, bare);

  it('is a button-typed switch whose aria-checked mirrors the prop', () => {
    const on = open(true);
    const onControl = on.find('[role="switch"]');
    expect(onControl.tagName).toBe('BUTTON');
    expect((onControl as HTMLButtonElement).type).toBe('button');
    expect(onControl.getAttribute('aria-checked')).toBe('true');

    const off = open(false);
    const offControl = off.find('[role="switch"]');
    expect(offControl.getAttribute('aria-checked')).toBe('false');
    expect(offControl.className).not.toBe(onControl.className);
  });

  it('reports the NEXT value when the user flips it', () => {
    const turnOn = vi.fn();
    click(open(false, turnOn).find('[role="switch"]'));
    expect(turnOn).toHaveBeenCalledWith(true);

    const turnOff = vi.fn();
    click(open(true, turnOff).find('[role="switch"]'));
    expect(turnOff).toHaveBeenCalledWith(false);
  });

  it('wraps the control in its label so the text is a hit target too', () => {
    const screen = open(true);
    const label = screen.find('label');
    const control = screen.find('[role="switch"]');
    expect(label.getAttribute('for')).toBe('live');
    expect(control.id).toBe('live');
    expect(label.contains(control)).toBe(true);
    expect(label.textContent).toContain('Stream updates');
  });

  it('keeps a hidden label in the accessible name instead of deleting it', () => {
    const shownText = open(true).find('label span');
    const hidden = open(true, () => {}, true);
    const hiddenText = hidden.find('label span');
    expect(shownText.textContent).toBe('Stream updates');
    expect(hiddenText.textContent).toBe('Stream updates');
    // A visible label carries no decoration class; a hidden one is styled out of sight.
    expect(shownText.hasAttribute('class')).toBe(false);
    expect(hiddenText.hasAttribute('class')).toBe(true);
    expect(hidden.find('label').getAttribute('for')).toBe('live');
  });
});

describe('Segmented', () => {
  const OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'done', label: 'Done', icon: <Bell size={14} aria-hidden /> },
  ];

  it('is a labelled radiogroup, and only the current value is checked', () => {
    const screen = mount(<Segmented label="Payment status" value="all" options={OPTIONS} onChange={() => {}} />, bare);
    const group = screen.find('[role="radiogroup"]');
    expect(group.getAttribute('aria-label')).toBe('Payment status');
    const radios = screen.findAll('[role="radio"]');
    expect(radios).toHaveLength(2);
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

  it('tracks the value it is handed, not the one it started with', () => {
    const screen = mount(<Segmented label="Range" value="all" options={OPTIONS} onChange={() => {}} />, bare);
    screen.rerender(<Segmented label="Range" value="done" options={OPTIONS} onChange={() => {}} />);
    const radios = screen.findAll('[role="radio"]');
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });

  it('reports the option the user clicked, and shows its icon', () => {
    const onChange = vi.fn();
    const screen = mount(<Segmented label="Range" value="all" options={OPTIONS} onChange={onChange} />, bare);
    const done = screen.findAll('[role="radio"]')[1];
    expect(done.querySelectorAll('svg')).toHaveLength(1);
    click(done);
    expect(onChange).toHaveBeenCalledWith('done');
  });

  it('only the selected option looks selected', () => {
    const screen = mount(<Segmented label="Range" value="done" options={OPTIONS} onChange={() => {}} />, bare);
    const [all, done] = screen.findAll('[role="radio"]');
    expect(done.className).not.toBe(all.className);
    expect(screen.findAll('[role="radio"]').filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(1);
  });

  it('renders the sizes differently', () => {
    mount(
      <>
        <Segmented label="a" size="sm" value="all" options={OPTIONS} onChange={() => {}} />
        <Segmented label="b" value="all" options={OPTIONS} onChange={() => {}} />
      </>,
      bare,
    );
    const [small, medium] = Array.from(document.querySelectorAll('[role="radiogroup"]')).map((el) => el.className);
    expect(small).not.toBe(medium);
  });
});

// Controlled in local state, the way every real call site uses Checkbox.
const SyncPair = () => {
  const [on, setOn] = useState(false);
  return <Checkbox checked={on} onChange={setOn} label="Email me" />;
};

describe('Checkbox', () => {
  it('keeps a real checkbox in sync with the app state', () => {
    const sync = mount(<SyncPair />, bare);
    const input = sync.find<HTMLInputElement>('input');
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(false);
    expect(sync.findAll('svg')).toHaveLength(0);

    toggleCheckbox(input);
    expect(sync.find<HTMLInputElement>('input').checked).toBe(true);

    toggleCheckbox(sync.find<HTMLInputElement>('input'));
    expect(sync.find<HTMLInputElement>('input').checked).toBe(false);
  });

  it('shows the tick only while checked, and keeps it out of the reading order', () => {
    const off = mount(<Checkbox checked={false} onChange={() => {}} label="Email me" />, bare);
    expect(off.findAll('svg')).toHaveLength(0);

    const on = mount(<Checkbox checked onChange={() => {}} label="Email me" />, bare);
    expect(on.findAll('svg')).toHaveLength(1);
    const box = on.find('span');
    expect(box.getAttribute('aria-hidden')).toBe('true');
    expect(on.findAll('span').some((s) => s.querySelector('svg') && s.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('reports the value the user picked', () => {
    const onChange = vi.fn();
    const screen = mount(<Checkbox checked={false} onChange={onChange} label="Email me" />, bare);
    toggleCheckbox(screen.find<HTMLInputElement>('input'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows the hint only when one is given', () => {
    const withHint = mount(<Checkbox checked={false} onChange={() => {}} label="Email me" hint="Weekly digest" />, bare);
    expect(withHint.text).toContain('Email me');
    expect(withHint.text).toContain('Weekly digest');

    const without = mount(<Checkbox checked={false} onChange={() => {}} label="Email me" />, bare);
    expect(without.text).not.toContain('Weekly digest');
  });

  it('labels the whole row through the wrapping label', () => {
    const screen = mount(<Checkbox checked={false} onChange={() => {}} label="Email me" />, bare);
    const label = screen.find('label');
    expect(label.contains(screen.find('input'))).toBe(true);
    expect(label.textContent).toContain('Email me');
  });
});

describe('Field', () => {
  it('shows the label above a well holding the children', () => {
    const screen = mount(
      <Field label="Total revenue">
        <span>$48,352</span>
      </Field>,
      bare,
    );
    const label = screen.findByText('span', 'Total revenue');
    const value = screen.findByText('span', '$48,352');
    const outer = label.parentElement as HTMLElement;
    // Label sits directly in the field; the value one level deeper, in the well.
    expect(outer.tagName).toBe('DIV');
    expect(value.parentElement).not.toBe(outer);
    expect(value.parentElement?.parentElement).toBe(outer);
    expect(outer.textContent).toContain('Total revenue');
    expect(outer.textContent).toContain('$48,352');
  });
});

describe('SectionLabel', () => {
  it('shows the icon next to the text', () => {
    const screen = mount(
      <SectionLabel icon={<Bell size={15} aria-hidden />}>Revenue &amp; growth</SectionLabel>,
      bare,
    );
    expect(screen.find('div').textContent).toBe('Revenue & growth');
    expect(screen.findAll('svg')).toHaveLength(1);
  });

  it('renders no icon space when nothing is handed in', () => {
    const screen = mount(<SectionLabel icon={null}>Notes</SectionLabel>, bare);
    expect(screen.find('div').textContent).toBe('Notes');
    expect(screen.findAll('svg')).toHaveLength(0);
  });
});
