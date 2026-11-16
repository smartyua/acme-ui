// The pause hook every looping visual shares: a button-owned toggle, an optional controlled
// value, and the operating system's reduced-motion switch overriding everything.
import { describe, expect, it, vi } from 'vitest';

import { useMotionPause } from './useMotionPause';
import { click, mount, setMedia } from '../../test/harness';

const REDUCE = '(prefers-reduced-motion: reduce)';

const Host = ({
  paused,
  defaultPaused,
  onPausedChange,
}: {
  paused?: boolean;
  defaultPaused?: boolean;
  onPausedChange?: (paused: boolean) => void;
}) => {
  const motion = useMotionPause(paused, defaultPaused, onPausedChange);
  return (
    <div>
      <span data-slot="state">{JSON.stringify({ paused: motion.paused, explicit: motion.explicit, reduced: motion.reduced })}</span>
      <button type="button" onClick={motion.toggle}>
        toggle
      </button>
    </div>
  );
};

const state = (screen: ReturnType<typeof mount>) =>
  JSON.parse(screen.find('[data-slot="state"]').textContent ?? '{}') as {
    paused: boolean;
    explicit: boolean;
    reduced: boolean;
  };

const bare = { app: false } as const;

describe('useMotionPause', () => {
  it('starts unpaused and lets the button flip itself', () => {
    const screen = mount(<Host />, bare);
    expect(state(screen)).toEqual({ paused: false, explicit: false, reduced: false });

    click(screen.findByText('button', 'toggle'));
    expect(state(screen)).toEqual({ paused: true, explicit: true, reduced: false });
  });

  it('honours defaultPaused and reports every change outward', () => {
    const onPausedChange = vi.fn();
    const screen = mount(<Host defaultPaused onPausedChange={onPausedChange} />, bare);
    expect(state(screen).paused).toBe(true);

    click(screen.findByText('button', 'toggle'));
    expect(onPausedChange).toHaveBeenCalledWith(false);
    expect(state(screen).paused).toBe(false);
  });

  it('stays on the value it is handed while controlled', () => {
    const onPausedChange = vi.fn();
    const screen = mount(<Host paused onPausedChange={onPausedChange} />, bare);
    expect(state(screen).paused).toBe(true);

    click(screen.findByText('button', 'toggle'));
    // A controlled hook reports the intent; only the parent can actually move it.
    expect(onPausedChange).toHaveBeenCalledWith(false);
    expect(state(screen).paused).toBe(true);

    screen.rerender(<Host paused={false} onPausedChange={onPausedChange} />);
    expect(state(screen).paused).toBe(false);
  });

  it('treats reduced motion as paused even when the toggle is off', () => {
    setMedia(REDUCE, true);
    const screen = mount(<Host />, bare);
    expect(state(screen)).toEqual({ paused: true, explicit: false, reduced: true });
    setMedia(REDUCE, false);
  });

  it('follows the operating system while mounted', () => {
    const screen = mount(<Host />, bare);
    expect(state(screen).reduced).toBe(false);

    setMedia(REDUCE, true);
    expect(state(screen).reduced).toBe(true);
    expect(state(screen).paused).toBe(true);

    setMedia(REDUCE, false);
    expect(state(screen).paused).toBe(false);
  });
});
