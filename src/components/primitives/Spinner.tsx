import React, { forwardRef } from 'react';
import styles from './Spinner.module.scss';
import { Loader2 } from "lucide-react";

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'default' | 'lg';
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className = '', size = 'default', 'aria-label': ariaLabel = 'Loading', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={`${styles.spinner} ${styles[size]} ${className}`}
        {...props}
      >
        <Loader2 className={styles.icon} aria-hidden />
        <span className={styles.srOnly}>{ariaLabel}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
