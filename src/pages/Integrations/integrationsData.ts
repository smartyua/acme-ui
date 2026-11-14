// Integration directory for the Integrations screen. lucide-react ships no brand logos,
// so each tool gets its closest semantic glyph (DESIGN.md §10). `connected` seeds the
// page switches; `lastSync` is the mock freshness stamp shown under the name.
import { BookOpen, Bug, GitBranch, GitFork, Mail, MessageSquare, Video, type LucideIcon } from 'lucide-react';

export type IntegrationCategory = 'Messaging' | 'Email' | 'Project' | 'Source control';

export type Integration = {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  scope: string;
  icon: LucideIcon;
  connected: boolean;
  lastSync: string | null;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'Messaging',
    icon: MessageSquare,
    connected: true,
    lastSync: '2 min ago',
    scope: '6 channels · read & post',
    description: 'Payment alerts, failed-payment digests and workflow errors in your team channels.',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Email',
    icon: Mail,
    connected: true,
    lastSync: '11 min ago',
    scope: 'Label "Acme" · read & send',
    description: 'Match refund and invoice threads to the customer and draft the reply.',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'Messaging',
    icon: Video,
    connected: false,
    lastSync: null,
    scope: '2 channels · read & post',
    description: 'Mirror Acme alerts into Teams chats and trigger workflows from a message.',
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'Project',
    icon: Bug,
    connected: true,
    lastSync: 'Just now',
    scope: 'Acme Ops board · read & write',
    description: 'Raise and sync issues whenever a workflow step throws an exception.',
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    category: 'Project',
    icon: BookOpen,
    connected: false,
    lastSync: null,
    scope: 'Confluence + Trello · read',
    description: 'Search Confluence pages from the command palette and run Trello boards as intake queues.',
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    category: 'Source control',
    icon: GitBranch,
    connected: false,
    lastSync: null,
    scope: 'acme/payments-api · read',
    description: 'Link deploys and pull requests to the service graph on the Topology page.',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Source control',
    icon: GitFork,
    connected: true,
    lastSync: '4 h ago',
    scope: 'acme/payments-api · read & checks',
    description: 'Read-only commit and check metadata for incident forensics.',
  },
];
