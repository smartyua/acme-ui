import { type ReactNode } from 'react';

import styles from './Page.module.scss';

// Scroll container + centred content column used by every page except Overview
export const Page = ({ children, wide }: { children: ReactNode; wide?: boolean }) => (
  <main className={styles.main}>
    <div className={wide ? `${styles.inner} ${styles.wide}` : styles.inner}>{children}</div>
  </main>
);
