import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownWideNarrow, ArrowRight, Check, Clock, LayoutTemplate, Plus, Upload, Users } from 'lucide-react';

import {
  AppChip,
  Badge,
  Button,
  Empty,
  FormField,
  Input,
  Modal,
  PageHeader,
  PillTabs,
  SearchBox,
  Select,
  Textarea,
  cx,
} from '../components/ui';
import { APPS, CATEGORY_TOTALS, FEATURED, TEMPLATES, formatCount, type AppId, type Category, type Template } from '../content/templates';
import { Page } from '../layout/Page';
import { useApp } from '../lib/app';
import styles from './Templates.module.scss';

type Tab = 'All' | Category;
type Sort = 'used' | 'newest' | 'saved' | 'az';

const TABS: Tab[] = ['All', 'Finance', 'Sales', 'Support', 'Operations', 'HR', 'IT'];
const TINTS = ['blue', 'peach', 'pink', 'mint', 'lavender', 'blue'] as const;

const SORTERS: Record<Sort, (a: Template, b: Template) => number> = {
  used: (a, b) => b.teams - a.teams,
  newest: (a, b) => a.addedDays - b.addedDays,
  saved: (a, b) => b.hoursPerWeek - a.hoursPerWeek,
  az: (a, b) => a.title.localeCompare(b.title),
};

const Flow = ({ apps }: { apps: AppId[] }) => (
  <div className={styles.flow}>
    {apps.map((app, i) => (
      <span key={`${app}-${i}`} className={styles.flowStep}>
        {i > 0 ? <ArrowRight size={14} className={styles.flowArrow} aria-hidden /> : null}
        <AppChip app={app} size="lg" />
      </span>
    ))}
  </div>
);

const Meta = ({ t, compact }: { t: Template; compact?: boolean }) => (
  <span className={styles.meta}>
    <span title={`${t.teams.toLocaleString('en-US')} teams use this`}>
      <Users size={14} aria-hidden />
      {compact ? formatCount(t.teams) : `${t.teams.toLocaleString('en-US')} teams`}
    </span>
    <span title={`Saves about ${t.hoursPerWeek} hours a week`}>
      <Clock size={14} aria-hidden />
      {compact ? `${t.hoursPerWeek}h` : `~${t.hoursPerWeek} h/week`}
    </span>
  </span>
);

// ── Use-template flow ────────────────────────────────────────────────────
const UseTemplateModal = ({ template, onClose, onCreated }: { template: Template | null; onClose: () => void; onCreated: (t: Template, name: string) => void }) => {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('realtime');
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (template) {
      setName(template.title);
      setSchedule('realtime');
      setConnected({ gmail: true, slack: true, ai: true });
    }
  }, [template]);

  if (!template) return null;
  const apps = template.apps.filter((a, i, arr) => arr.indexOf(a) === i);
  const missing = apps.filter((a) => !connected[a]);

  return (
    <Modal
      open
      onClose={onClose}
      title="Use template"
      description={template.title}
      width="md"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!name.trim() || missing.length > 0} onClick={() => onCreated(template, name.trim())}>
            Create workflow
          </Button>
        </>
      }
    >
      <Flow apps={template.apps} />
      <FormField label="Workflow name">{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}</FormField>
      <FormField label="Run" hint="You can change the trigger later in the workflow settings.">
        {(id) => (
          <Select id={id} value={schedule} onChange={(e) => setSchedule(e.target.value)}>
            <option value="realtime">When a new item arrives</option>
            <option value="hourly">Every hour</option>
            <option value="daily">Every day at 09:00</option>
            <option value="weekly">Every Monday at 09:00</option>
          </Select>
        )}
      </FormField>
      <div className={styles.connectList}>
        <span className={styles.connectLabel}>Connected apps</span>
        {apps.map((app) => (
          <div key={app} className={styles.connectRow}>
            <AppChip app={app} size="sm" />
            <span className={styles.connectName}>{APPS[app].name}</span>
            {connected[app] ? (
              <Badge tone="mint">
                <Check size={12} aria-hidden /> Connected
              </Badge>
            ) : (
              <Button size="sm" onClick={() => setConnected((c) => ({ ...c, [app]: true }))}>
                Connect
              </Button>
            )}
          </div>
        ))}
        {missing.length > 0 ? <span className={styles.connectHint}>Connect {missing.length === 1 ? 'the remaining app' : `${missing.length} apps`} to continue.</span> : null}
      </div>
    </Modal>
  );
};

const TemplateDetails = ({ template, onClose, onUse, inUse }: { template: Template | null; onClose: () => void; onUse: (t: Template) => void; inUse: boolean }) => {
  if (!template) return null;
  return (
    <Modal
      open
      onClose={onClose}
      title={template.title}
      description={`${template.category} · ${template.teams.toLocaleString('en-US')} teams · saves ~${template.hoursPerWeek} h/week`}
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => onUse(template)}>
            {inUse ? 'Use again' : 'Use template'}
          </Button>
        </>
      }
    >
      <div className={cx(styles.featuredHero, styles.tint_blue)}>
        <Flow apps={template.apps} />
      </div>
      <p className={styles.detailText}>{template.description}</p>
      <ol className={styles.steps}>
        {template.apps.map((app, i) => (
          <li key={`${app}-${i}`}>
            <AppChip app={app} size="sm" />
            <span>
              {i === 0 ? 'Trigger' : i === template.apps.length - 1 ? 'Action' : 'Step'} · {APPS[app].name}
            </span>
          </li>
        ))}
      </ol>
    </Modal>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────
export const TemplatesPage = () => {
  const { toast } = useApp();
  const [tab, setTab] = useState<Tab>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('used');
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [installed, setInstalled] = useState<Record<string, number>>({});
  const [detail, setDetail] = useState<Template | null>(null);
  const [using, setUsing] = useState<Template | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, like the hint in the field
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter((t) => tab === 'All' || t.category === tab)
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.apps.some((a) => APPS[a].name.toLowerCase().includes(q))
      )
      .sort(SORTERS[sort]);
  }, [tab, query, sort]);

  const featured = showAllFeatured ? FEATURED : FEATURED.slice(0, 3);

  const handleCreated = (t: Template, name: string) => {
    setUsing(null);
    setDetail(null);
    setInstalled((m) => ({ ...m, [t.id]: (m[t.id] ?? 0) + 1 }));
    toast({ title: 'Workflow created', description: `“${name}” is ready as a draft.`, tone: 'success' });
  };

  return (
    <Page wide>
      <PageHeader
        title="Templates"
        lead="180 tested templates, built from 12,400 live workflows"
        actions={
          <>
            <Button icon={<Upload size={15} aria-hidden />} onClick={() => setSubmitOpen(true)}>
              Submit a template
            </Button>
            <Button variant="primary" icon={<Plus size={16} aria-hidden />} onClick={() => setCreateOpen(true)}>
              Create workflow
            </Button>
          </>
        }
      />

      <section aria-labelledby="featured-title" className={styles.featuredSection}>
        <div className={styles.sectionHead}>
          <h2 id="featured-title">Featured this week</h2>
          <button type="button" className={styles.link} onClick={() => setShowAllFeatured((v) => !v)} aria-expanded={showAllFeatured}>
            {showAllFeatured ? 'Show less' : `See all ${FEATURED.length}`}
          </button>
        </div>
        <div className={styles.featuredGrid}>
          {featured.map((t, i) => (
            <article key={t.id} className={styles.featuredCard}>
              <button type="button" className={cx(styles.featuredHero, styles[`tint_${TINTS[i % TINTS.length]}`])} onClick={() => setDetail(t)} aria-label={`Preview ${t.title}`}>
                <Flow apps={t.apps} />
              </button>
              <div className={styles.featuredBody}>
                <h3>
                  <button type="button" className={styles.titleBtn} onClick={() => setDetail(t)}>
                    {t.title}
                  </button>
                  {t.ai ? <Badge tone="accent">AI</Badge> : null}
                  {installed[t.id] ? <Badge tone="mint">In use</Badge> : null}
                </h3>
                <p>{t.description}</p>
              </div>
              <footer className={styles.featuredFoot}>
                <Meta t={t} />
                <Button size="sm" onClick={() => setUsing(t)}>
                  Use template
                </Button>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.toolbar}>
        <PillTabs
          label="Template categories"
          value={tab}
          onChange={setTab}
          items={TABS.map((t) => ({ value: t, label: t, count: CATEGORY_TOTALS[t] }))}
        />
        <div className={styles.toolbarEnd}>
          <SearchBox value={query} onChange={setQuery} placeholder="Search templates" shortcut="/" inputRef={searchRef} className={styles.search} />
          <label className={styles.sort}>
            <ArrowDownWideNarrow size={15} aria-hidden />
            <span className={styles.srOnlyLabel}>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort templates">
              <option value="used">Most used</option>
              <option value="newest">Newest</option>
              <option value="saved">Most time saved</option>
              <option value="az">A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((t) => (
            <article key={t.id} className={styles.card}>
              <button type="button" className={styles.cardHit} onClick={() => setDetail(t)} aria-label={`Open ${t.title}`} />
              <div className={styles.chips}>
                {t.apps.map((a) => (
                  <AppChip key={a} app={a} />
                ))}
                {installed[t.id] ? <Badge tone="mint" className={styles.inUse}>In use</Badge> : null}
              </div>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <footer>
                <Badge>{t.category}</Badge>
                <Meta t={t} compact />
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyWrap}>
          <Empty icon={<LayoutTemplate size={18} />} title="No templates match">
            Try another category or search term.
          </Empty>
          <Button
            size="sm"
            onClick={() => {
              setQuery('');
              setTab('All');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <p className={styles.footNote}>
        Showing {results.length} most-used of {CATEGORY_TOTALS[tab]} {tab === 'All' ? '' : `${tab} `}templates
      </p>

      <TemplateDetails template={detail} onClose={() => setDetail(null)} onUse={(t) => setUsing(t)} inUse={Boolean(detail && installed[detail.id])} />
      <UseTemplateModal template={using} onClose={() => setUsing(null)} onCreated={handleCreated} />

      <SubmitTemplateModal open={submitOpen} onClose={() => setSubmitOpen(false)} onSubmitted={() => toast({ title: 'Template submitted', description: 'Our team reviews new templates within 2 business days.', tone: 'success' })} />
      <CreateWorkflowModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onPickTemplate={(t) => {
          setCreateOpen(false);
          setUsing(t);
        }}
        onCreated={(name) => toast({ title: 'Workflow created', description: `“${name}” was created from scratch.`, tone: 'success' })}
      />
    </Page>
  );
};

const SubmitTemplateModal = ({ open, onClose, onSubmitted }: { open: boolean; onClose: () => void; onSubmitted: () => void }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Finance');
  const [desc, setDesc] = useState('');
  const valid = title.trim().length > 2 && desc.trim().length > 10;

  const submit = () => {
    onSubmitted();
    onClose();
    setTitle('');
    setDesc('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Submit a template"
      description="Share a workflow that works for your team. We test it before publishing."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={submit}>
            Submit for review
          </Button>
        </>
      }
    >
      <FormField label="Title">{(id) => <Input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly pipeline digest" />}</FormField>
      <FormField label="Category">
        {(id) => (
          <Select id={id} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {TABS.filter((t) => t !== 'All').map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        )}
      </FormField>
      <FormField label="What does it do?" hint="At least a sentence — what triggers it and what it produces.">
        {(id) => <Textarea id={id} value={desc} onChange={(e) => setDesc(e.target.value)} />}
      </FormField>
    </Modal>
  );
};

const CreateWorkflowModal = ({
  open,
  onClose,
  onPickTemplate,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onPickTemplate: (t: Template) => void;
  onCreated: (name: string) => void;
}) => {
  const [mode, setMode] = useState<'scratch' | 'template'>('scratch');
  const [name, setName] = useState('Untitled workflow');
  const [trigger, setTrigger] = useState<AppId>('gmail');
  const [templateId, setTemplateId] = useState(FEATURED[0].id);
  const all = [...FEATURED, ...TEMPLATES];

  const confirm = () => {
    if (mode === 'template') {
      const t = all.find((x) => x.id === templateId);
      if (t) onPickTemplate(t);
      return;
    }
    onCreated(name.trim() || 'Untitled workflow');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create workflow"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={confirm}>
            {mode === 'template' ? 'Continue' : 'Create'}
          </Button>
        </>
      }
    >
      <div className={styles.modeGrid} role="radiogroup" aria-label="Start from">
        {(['scratch', 'template'] as const).map((m) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} className={cx(styles.modeCard, mode === m && styles.modeCardActive)} onClick={() => setMode(m)}>
            <strong>{m === 'scratch' ? 'Start from scratch' : 'Start from a template'}</strong>
            <span>{m === 'scratch' ? 'Pick a trigger and build step by step.' : 'Reuse one of the tested templates.'}</span>
          </button>
        ))}
      </div>
      {mode === 'scratch' ? (
        <>
          <FormField label="Name">{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}</FormField>
          <FormField label="Trigger app">
            {(id) => (
              <Select id={id} value={trigger} onChange={(e) => setTrigger(e.target.value as AppId)}>
                {(Object.keys(APPS) as AppId[])
                  .filter((a) => a !== 'ai')
                  .map((a) => (
                    <option key={a} value={a}>
                      {APPS[a].name}
                    </option>
                  ))}
              </Select>
            )}
          </FormField>
        </>
      ) : (
        <FormField label="Template">
          {(id) => (
            <Select id={id} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {all.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      )}
    </Modal>
  );
};
