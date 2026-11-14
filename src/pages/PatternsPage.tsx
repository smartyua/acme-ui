import { useEffect, useRef, useState } from 'react';
import { ClipboardList, Layers, Receipt, ScrollText, Table2, UserRound, Wallet, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Callout, CalloutDescription, CalloutTitle } from '../components/primitives/Callout';
import { Skeleton } from '../components/primitives/Skeleton';
import { Badge, Button, Empty, FormField, Input, Modal, PageHeader, Panel, PillTabs } from '../components/ui';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import i from './Insights.module.scss';
import s from './pages.module.scss';

type Recipe = { title: string; description: string; path: string; icon: LucideIcon };

const RECIPES: Recipe[] = [
  { title: 'Profile form', description: 'Panels, form fields, switches and a sticky save bar', path: '/profile', icon: UserRound },
  { title: 'Billing stack', description: 'Plan cards, usage meters, a dialog and an invoice table', path: '/payments', icon: Receipt },
  { title: 'Audit trail', description: 'Toolbar filters, a table with avatars and a detail drawer', path: '/audit-log', icon: ScrollText },
  { title: 'Request inbox', description: 'Pill tabs, an empty state, a create dialog and a drawer', path: '/requests', icon: ClipboardList },
  { title: 'Orders list', description: 'Bulk selection, status filters and row actions', path: '/orders', icon: Table2 },
  { title: 'Finance dashboard', description: 'KPI tiles, a donut, grouped bars and wallet cards', path: '/finance', icon: Wallet },
];

type Demo = 'confirm' | 'loading' | 'empty' | 'feedback';

const DEMO_LEAD: Record<Demo, string> = {
  confirm: 'A danger button opens a small dialog before anything irreversible happens.',
  loading: 'Skeleton blocks hold the layout while data loads, then real content replaces them.',
  empty: 'An empty state says what happened and offers a way out.',
  feedback: 'A callout carries lasting page status; a toast confirms each action.',
};

export const PatternsPage = () => {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [demo, setDemo] = useState<Demo>('confirm');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const simulate = () => {
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setLoading(false);
      toast({ title: 'Data loaded', description: 'Skeletons were replaced with content.', tone: 'success' });
    }, 1200);
  };

  return (
    <Page>
      <PageHeader title="Patterns" lead="Recipes for common product UI cases, built only from Acme UI components." />

      <div className={i.recipes}>
        {RECIPES.map((recipe) => {
          const Icon = recipe.icon;
          return (
            <button key={recipe.path} type="button" className={s.helpCard} onClick={() => navigate(recipe.path)}>
              <Icon size={18} aria-hidden />
              <strong>{recipe.title}</strong>
              <span>{recipe.description}</span>
            </button>
          );
        })}
      </div>

      <Panel
        title="Composition kit"
        description={DEMO_LEAD[demo]}
        actions={
          <PillTabs
            label="Pattern"
            value={demo}
            onChange={setDemo}
            items={[
              { value: 'confirm', label: 'Confirm' },
              { value: 'loading', label: 'Loading' },
              { value: 'empty', label: 'Empty' },
              { value: 'feedback', label: 'Feedback' },
            ]}
          />
        }
      >
        {demo === 'confirm' ? (
          <div className={i.demo}>
            <p>Integrations that use the key stop working until a new one is created, so the action asks first.</p>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Revoke API key
            </Button>
          </div>
        ) : null}

        {demo === 'loading' ? (
          <div className={`${i.demo} ${i.demoWide}`}>
            <div className={i.buttonRow}>
              <Button onClick={simulate} disabled={loading}>
                {loading ? 'Loading…' : 'Simulate fetch'}
              </Button>
            </div>
            {loading ? (
              <div className={i.skeletons} aria-busy="true" aria-label="Loading content">
                <Skeleton style={{ height: '1rem', width: '40%' }} />
                <Skeleton style={{ height: '1rem', width: '70%' }} />
                <Skeleton style={{ height: '5rem', width: '100%' }} />
              </div>
            ) : (
              <Callout variant="success">
                <Layers aria-hidden />
                <div>
                  <CalloutTitle>Ready</CalloutTitle>
                  <CalloutDescription>Swap skeletons for real content as soon as the request resolves.</CalloutDescription>
                </div>
              </Callout>
            )}
          </div>
        ) : null}

        {demo === 'empty' ? (
          <Empty icon={<Layers size={18} aria-hidden />} title="Nothing here yet">
            <Button size="sm" onClick={() => navigate('/requests')}>
              Go to requests
            </Button>
          </Empty>
        ) : null}

        {demo === 'feedback' ? (
          <div className={`${i.demo} ${i.demoWide}`}>
            <Callout variant="warning">
              <div>
                <CalloutTitle>Billing email unverified</CalloutTitle>
                <CalloutDescription>Invoices go to alex@acme.io — verify it to avoid failed renewals.</CalloutDescription>
              </div>
            </Callout>
            <FormField label="Quick note" hint="Shown as the toast description.">
              {(id) => <Input id={id} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional context" />}
            </FormField>
            <div className={i.buttonRow}>
              <Button onClick={() => toast({ title: 'Saved', description: note.trim() || 'Success toast after a mutation.', tone: 'success' })}>Show success toast</Button>
              <Button onClick={() => toast({ title: 'Sync delayed', description: note.trim() || 'Retrying in the background.', tone: 'danger' })}>Show error toast</Button>
              <Badge>Composable chips</Badge>
            </div>
          </div>
        ) : null}
      </Panel>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Revoke API key?"
        description="Integrations using this key will fail until a new key is created."
        width="sm"
        footer={
          <>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmOpen(false);
                toast({ title: 'API key revoked', description: 'Create a new key in Settings.', tone: 'danger' });
              }}
            >
              Revoke key
            </Button>
          </>
        }
      >
        <span />
      </Modal>
    </Page>
  );
};
