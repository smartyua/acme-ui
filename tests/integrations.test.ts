// @vitest-environment node
// Guards the Integrations directory data: one entry per requested tool, and every
// derived UI string (badge, sync line) stays derivable from the record.
import { describe, expect, it } from 'vitest';

import { INTEGRATIONS } from '../src/pages/Integrations/integrationsData';

describe('integration directory', () => {
  it('lists each requested tool exactly once', () => {
    expect(INTEGRATIONS.map((i) => i.id).sort()).toEqual(['atlassian', 'bitbucket', 'github', 'gmail', 'jira', 'slack', 'teams']);
    expect(INTEGRATIONS.map((i) => i.name)).toEqual(['Slack', 'Gmail', 'Microsoft Teams', 'Jira', 'Atlassian', 'Bitbucket', 'GitHub']);
  });

  it('marks a connection live only with a sync stamp', () => {
    expect(INTEGRATIONS.filter((i) => i.connected !== (i.lastSync !== null))).toEqual([]);
  });

  it('never leaves a card without category, scope or icon', () => {
    expect(INTEGRATIONS.filter((i) => !i.icon || !i.scope || !i.category || !i.description)).toEqual([]);
  });
});
