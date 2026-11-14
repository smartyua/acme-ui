import { useState } from 'react';
import { Pause, Play } from 'lucide-react';

import { Button, PageHeader } from '../../components/ui';
import { Page } from '../../layout/Page';
import { cn } from '../../lib/cn';

import { PipelineTopologyDiagram } from './PipelineTopologyDiagram';
import { persistPaused, readStoredPaused } from './topologyMotion';
import styles from './TopologyPage.module.scss';

export const TopologyPage = () => {
  const [paused, setPaused] = useState(readStoredPaused);

  const togglePaused = () => {
    setPaused((prev) => {
      persistPaused(!prev);
      return !prev;
    });
  };

  return (
    <Page>
      <PageHeader
        title="Network topology"
        lead="Live view of the media pipeline: the main server and its workers."
        actions={
          <div className={styles.headerStatus}>
            <span className={cn(styles.livePill, !paused && styles.liveOn)} role="status">
              <i aria-hidden />
              {paused ? 'Paused' : 'Live'}
            </span>
            <Button
              size="sm"
              onClick={togglePaused}
              icon={paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
            >
              {paused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        }
      />

      <PipelineTopologyDiagram running={!paused} />
    </Page>
  );
};
