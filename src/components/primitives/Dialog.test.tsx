// Dialog is built from the modal layer, so these specs test the two together: what the user sees
// (portal, roles, labels), what keyboard users get (initial focus, focus trap, Escape), and what
// the rest of the page loses while it is open (scroll, clicks, screen-reader access).
import { describe, expect, it, vi } from 'vitest';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './Dialog';
import { ModalProvider, useModalContext } from './modalLayer';
import { click, focus, mount, mouseDown, press, type Screen } from '../../test/harness';

type SampleProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  description?: boolean;
};

const Sample = ({ open, onOpenChange, onClose, description = true }: SampleProps) => (
  <Dialog open={open} defaultOpen={open === undefined ? true : undefined} onOpenChange={onOpenChange}>
    <DialogContent onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Archive order?</DialogTitle>
      </DialogHeader>
      {description ? <DialogDescription>It leaves the board, but stays searchable.</DialogDescription> : null}
      <button type="button" data-slot="first">
        First
      </button>
      <button type="button" data-slot="last">
        Last
      </button>
      <DialogFooter>foot</DialogFooter>
    </DialogContent>
  </Dialog>
);

const CONTENT = '[role="dialog"]';
const CLOSE = '[data-slot="dialog-close"]';
const OVERLAY = '[data-slot="dialog-overlay"]';

const openDialog = (props: SampleProps = {}) => mount(<Sample {...props} />);

describe('opening', () => {
  it('is closed until something opens it', () => {
    const screen = mount(<Sample open={false} />);
    expect(screen.findAll(CONTENT)).toEqual([]);
    expect(screen.findAll(OVERLAY)).toEqual([]);
  });

  it('opens itself from defaultOpen and marks the layer it owns', () => {
    const screen = openDialog();
    expect(screen.find(CONTENT).getAttribute('aria-modal')).toBe('true');
    expect(screen.findAll('[data-shacdn-modal-layer][data-slot="dialog"]')).toHaveLength(1);
    expect(screen.find('[data-slot="dialog-footer"]').textContent).toBe('foot');
  });

  it('names the dialog after its title and describes it', () => {
    const screen = openDialog();
    const content = screen.find(CONTENT);
    const titleId = screen.find('[data-slot="dialog-title"]').id;
    const descriptionId = screen.find('[data-slot="dialog-description"]').id;
    expect(titleId).toBeTruthy();
    expect(content.getAttribute('aria-labelledby')).toBe(titleId);
    expect(content.getAttribute('aria-describedby')).toBe(descriptionId);
  });

  it('leaves aria-describedby off when there is no description', () => {
    const screen = openDialog({ description: false });
    expect(screen.find(CONTENT).getAttribute('aria-describedby')).toBeNull();
  });

  it('tells the caller when a controlled dialog wants to close', () => {
    const onOpenChange = vi.fn();
    const screen = mount(<Sample open onOpenChange={onOpenChange} onClose={() => {}} />);
    click(screen.find(CLOSE));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.findAll(CONTENT)).toHaveLength(1);
  });
});

describe('closing', () => {
  it('removes itself when uncontrolled', () => {
    const screen = openDialog({ onClose: () => {} });
    click(screen.find(CLOSE));
    expect(screen.findAll(CONTENT)).toEqual([]);
  });

  it('runs the onClose callback the content was given', () => {
    const onClose = vi.fn();
    const screen = openDialog({ onClose });
    click(screen.find(CLOSE));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('answers Escape', () => {
    const screen = openDialog();
    press('Escape');
    expect(screen.findAll(CONTENT)).toEqual([]);
  });

  it('answers a click on the overlay but not one inside the content', () => {
    const screen = openDialog();
    click(screen.find(CONTENT));
    expect(screen.findAll(CONTENT)).toHaveLength(1);
    click(screen.find(OVERLAY));
    expect(screen.findAll(CONTENT)).toEqual([]);
  });

  it('lets the owner veto the overlay and Escape', () => {
    const onClose = vi.fn();
    const screen = mount(
      <ModalProvider defaultOpen dismissOnOverlayClick={false} dismissOnEscape={false}>
        <DialogContent onClose={onClose}>
          <DialogTitle>Hold on</DialogTitle>
        </DialogContent>
      </ModalProvider>,
    );
    click(screen.find(OVERLAY));
    press('Escape');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.findAll(CONTENT)).toHaveLength(1);
    // …but the close control still works.
    click(screen.find(CLOSE));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('keyboard users', () => {
  it('moves focus into the dialog when it opens', () => {
    const screen = openDialog();
    expect(screen.find(CONTENT).contains(document.activeElement)).toBe(true);
  });

  it('wraps forward from the last control back to the first', () => {
    const screen = openDialog();
    const [first, last] = [screen.find('[data-slot="first"]'), screen.find('[data-slot="last"]')];
    focus(last);
    press('Tab');
    expect(document.activeElement).toBe(first);
  });

  it('wraps backward from the first control to the last', () => {
    const screen = openDialog();
    const [first, last] = [screen.find('[data-slot="first"]'), screen.find('[data-slot="last"]')];
    focus(first);
    press('Tab', first, { shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('keeps tabbing inside even when focus escaped the dialog', () => {
    const screen = openDialog();
    const outside = document.createElement('button');
    document.body.append(outside);
    focus(outside);
    press('Tab');
    expect(screen.find(CONTENT).contains(document.activeElement)).toBe(true);
    outside.remove();
  });

  it('holds Tab when the dialog has nothing focusable in it', () => {
    const screen = mount(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Nothing to press</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(screen.find(CONTENT));
  });
});

describe('the page behind it', () => {
  it('cannot scroll while the dialog is open', () => {
    const screen = openDialog();
    expect(document.body.style.overflow).toBe('hidden');
    screen.unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('is hidden from assistive tech and cannot be clicked through', () => {
    const screen = openDialog();
    expect(screen.container.getAttribute('aria-hidden')).toBe('true');
    expect(screen.container.inert).toBe(true);
    screen.unmount();
    expect(screen.container.hasAttribute('aria-hidden')).toBe(false);
    expect(Boolean(screen.container.inert)).toBe(false);
  });

  it('gives focus back to whatever opened it', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    focus(trigger);

    const screen: Screen = mount(<Sample open={false} />);
    expect(document.activeElement).toBe(trigger);

    screen.rerender(<Sample open />);
    expect(document.activeElement).not.toBe(trigger);

    screen.rerender(<Sample open={false} />);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('restores the page even when two dialogs overlap', () => {
    const first = openDialog();
    const second = openDialog();
    expect(document.body.style.overflow).toBe('hidden');
    second.unmount();
    expect(document.body.style.overflow).toBe('hidden');
    first.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('the layer contract', () => {
  it('refuses its pieces outside a dialog', () => {
    const Orphan = () => {
      useModalContext();
      return null;
    };
    expect(() => mount(<Orphan />, { app: false })).toThrow(
      'Modal components must be used within Dialog, Drawer, or AlertDialog',
    );
  });

  it('hides the portal entirely while closed, and keeps siblings reachable', () => {
    const screen = mount(
      <ModalProvider open={false}>
        <span>still here</span>
      </ModalProvider>,
      { app: false },
    );
    expect(screen.text).toContain('still here');
    expect(screen.container.hasAttribute('aria-hidden')).toBe(false);
  });

  it('presses the mouse down on the overlay without a click closing anything', () => {
    const onClose = vi.fn();
    const screen = openDialog({ onClose });
    mouseDown(screen.find(OVERLAY));
    expect(onClose).not.toHaveBeenCalled();
  });
});
