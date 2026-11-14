import {
  forwardRef,
  useEffect,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  ModalPortal,
  ModalProvider,
  useModalContext,
  useModalDescription,
  useModalDismiss,
  useModalFocus,
  useModalTitle,
  useOptionalModalContext,
} from './modalLayer';
import styles from './Dialog.module.scss';
import { X } from "lucide-react";

const composeRefsLocal =
  <T,>(...refs: Array<React.Ref<T> | undefined>) =>
  (node: T | null) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ open, defaultOpen, onOpenChange, children, ...props }, ref) => (
    <ModalProvider
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      variant="dialog"
      dismissOnOverlayClick
      dismissOnEscape
      layerSlot="dialog"
    >
      <div ref={ref} data-slot="dialog-root" {...props}>
        {children}
      </div>
    </ModalProvider>
  )
);

Dialog.displayName = 'Dialog';

export const DialogOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', onClick, ...props }, ref) => {
    const ctx = useOptionalModalContext();
    const dismissOnOverlayClick = ctx?.dismissOnOverlayClick ?? true;
    const requestClose = ctx?.requestClose;

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || !dismissOnOverlayClick) {
        return;
      }
      requestClose?.();
    };

    return (
      <div
        ref={ref}
        className={`${styles.dialogOverlay} ${className}`}
        data-slot="dialog-overlay"
        onClick={handleClick}
        {...props}
      />
    );
  }
);

DialogOverlay.displayName = 'DialogOverlay';

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className = '', onClose, children, ...props }, ref) => {
    const {
      open,
      requestClose,
      contentRef,
      dismissOnEscape,
      preferCancelFocus,
      setOnCloseCallback,
      titleId,
      descriptionId,
      variant,
    } = useModalContext();

    useEffect(() => {
      setOnCloseCallback(onClose);
      return () => setOnCloseCallback(undefined);
    }, [onClose, setOnCloseCallback]);

    useModalFocus(open, contentRef, preferCancelFocus);
    useModalDismiss(open, requestClose, dismissOnEscape);

    const ariaProps: Record<string, string | boolean> = {
      role: variant === 'alertdialog' ? 'alertdialog' : 'dialog',
      'aria-modal': true,
    };
    if (titleId) {
      ariaProps['aria-labelledby'] = titleId;
    }
    if (descriptionId) {
      ariaProps['aria-describedby'] = descriptionId;
    }

    return (
      <ModalPortal className={styles.dialogRoot}>
        <DialogOverlay />
        <div
          ref={composeRefsLocal(ref, contentRef)}
          className={`${styles.dialogContent} ${className}`}
          data-slot="dialog-content"
          tabIndex={-1}
          {...ariaProps}
          {...props}
        >
          {children}
          {onClose && (
            <button
              type="button"
              className={styles.dialogClose}
              data-slot="dialog-close"
              onClick={() => requestClose()}
              aria-label="Close"
            >
              <X size={15} aria-hidden />
            </button>
          )}
        </div>
      </ModalPortal>
    );
  }
);

DialogContent.displayName = 'DialogContent';

export const DialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`${styles.dialogHeader} ${className}`} data-slot="dialog-header" {...props} />
  )
);

DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`${styles.dialogFooter} ${className}`} data-slot="dialog-footer" {...props} />
  )
);

DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', id: idProp, ...props }, ref) => {
    const id = useModalTitle(idProp);

    return (
      <h2
        ref={ref}
        id={id}
        className={`${styles.dialogTitle} ${className}`}
        data-slot="dialog-title"
        {...props}
      />
    );
  }
);

DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className = '', id: idProp, ...props }, ref) => {
  const id = useModalDescription(idProp);

  return (
    <p
      ref={ref}
      id={id}
      className={`${styles.dialogDescription} ${className}`}
      data-slot="dialog-description"
      {...props}
    />
  );
});

DialogDescription.displayName = 'DialogDescription';
