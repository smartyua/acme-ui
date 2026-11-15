import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Archive,
  Calendar,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  ClipboardList,
  Clock3,
  Gem,
  Hourglass,
  Mail,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Store,
} from 'lucide-react';

import {
  AvatarStack,
  KanbanColumn,
  OnboardingCard,
  type OnboardingPriority,
} from '../../components/OnboardingBoard';
import { Count, Segmented, Switch } from '../../components/primitives';
import {
  Badge,
  Button,
  Drawer,
  Empty,
  FormField,
  Input,
  Modal,
  Panel,
  SearchBox,
  Select,
  TableWrap,
  Textarea,
  cx,
  tableClass,
} from '../../components/ui';
import { type Tone } from '../../data';
import { useApp } from '../../lib/app';
import {
  BUSINESS_UNIT_META,
  INITIAL_VENDORS,
  PRIORITY_TONE,
  REVIEWER_NAMES,
  STAGE_META,
  STAGE_ORDER,
  VIEW_TITLES,
  type BusinessUnit,
  type OnboardingStage,
  type SavedViewId,
  type VendorRecord,
} from './vendorsData';
import styles from './Vendors.module.scss';

type PriorityFilter = 'All' | OnboardingPriority;
const PRIORITY_CYCLE: PriorityFilter[] = ['All', 'High', 'Medium', 'Low'];
const MONOGRAM_TONES: Tone[] = ['lemon', 'lavender', 'mint', 'peach', 'sky', 'rose'];

const CollapsibleGroup = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {icon}
        <span>{label}</span>
        <ChevronUp
          size={14}
          aria-hidden
          className={cx(styles.groupChevron, !open && styles.groupChevronClosed)}
        />
      </button>
      {open ? <ul className={styles.tree}>{children}</ul> : null}
    </div>
  );
};

export const VendorsPage = () => {
  const { toast } = useApp();
  const [vendors, setVendors] = useState<VendorRecord[]>(INITIAL_VENDORS);
  const [scope, setScope] = useState<'team' | 'mine'>('team');
  const [query, setQuery] = useState('');
  const [activeView, setActiveView] = useState<SavedViewId>('needs-attention');
  const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
  const [customTitles, setCustomTitles] = useState<Partial<Record<SavedViewId, string>>>({});
  const [autoFollowUps, setAutoFollowUps] = useState(true);
  const [dueSoonOnly, setDueSoonOnly] = useState(false);
  const [layout, setLayout] = useState<'board' | 'list'>('board');
  const [starred, setStarred] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [kpiFilter, setKpiFilter] = useState<OnboardingStage | 'approved' | null>(null);
  const [expandedCols, setExpandedCols] = useState<Record<OnboardingStage, boolean>>({
    blocked: false,
    reviewers: false,
    vendors: false,
  });
  const [prioritySortCols, setPrioritySortCols] = useState<Record<OnboardingStage, boolean>>({
    blocked: false,
    reviewers: false,
    vendors: false,
  });

  const [selectedId, setSelectedId] = useState<string>('lanternfish');
  const [drawerVendorId, setDrawerVendorId] = useState<string | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');

  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState<{
    vendor: string;
    summary: string;
    priority: OnboardingPriority;
    stage: OnboardingStage;
    businessUnit: BusinessUnit;
  }>({
    vendor: '',
    summary: '',
    priority: 'High',
    stage: 'blocked',
    businessUnit: 'Product',
  });

  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          (e.target as HTMLElement | null)?.isContentEditable
        ) {
          return;
        }
        if (searchRef.current && searchRef.current.offsetParent !== null) {
          e.preventDefault();
          searchRef.current.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onboardingVendors = useMemo(() => vendors.filter((v) => v.lifecycle === 'onboarding'), [vendors]);
  const approvedVendors = useMemo(() => vendors.filter((v) => v.lifecycle === 'approved'), [vendors]);

  const blockedCount = useMemo(
    () => onboardingVendors.filter((v) => v.stage === 'blocked').length,
    [onboardingVendors],
  );
  const internalReviewsCount = useMemo(
    () => onboardingVendors.filter((v) => v.stage === 'reviewers').length,
    [onboardingVendors],
  );
  const awaitingVendorCount = useMemo(
    () => onboardingVendors.filter((v) => v.stage === 'vendors').length,
    [onboardingVendors],
  );
  const renewalsDueCount = useMemo(
    () => onboardingVendors.filter((v) => v.renewal).length,
    [onboardingVendors],
  );

  const allOnboardingsTotal = 16 + onboardingVendors.length;
  const approvedOctTotal = 4 + approvedVendors.length;

  const displayTitle = selectedUnit
    ? `${selectedUnit} vendors`
    : (customTitles[activeView] ?? VIEW_TITLES[activeView]);

  const selectSavedView = (view: SavedViewId) => {
    setActiveView(view);
    setSelectedUnit(null);
    setKpiFilter(null);
  };

  const selectBusinessUnit = (unit: BusinessUnit) => {
    setSelectedUnit((prev) => (prev === unit ? null : unit));
    setKpiFilter(null);
  };

  const filteredVendors = useMemo(() => {
    const q = query.trim().toLowerCase();

    return vendors.filter((v) => {
      if (kpiFilter === 'approved') {
        if (v.lifecycle !== 'approved') return false;
      } else if (activeView === 'approved') {
        if (v.lifecycle !== 'approved') return false;
      } else if (activeView === 'archived') {
        if (v.lifecycle !== 'archived') return false;
      } else {
        if (v.lifecycle !== 'onboarding') return false;
      }

      if (!selectedUnit && kpiFilter === null) {
        if (activeView === 'awaiting-vendor' && v.stage !== 'vendors') return false;
        if (activeView === 'internal-reviews' && v.stage !== 'reviewers') return false;
        if (activeView === 'blocked' && v.stage !== 'blocked') return false;
        if (activeView === 'renewals-due' && !v.renewal) return false;
      }

      if (selectedUnit && v.businessUnit !== selectedUnit) return false;
      if (kpiFilter && kpiFilter !== 'approved' && v.stage !== kpiFilter) return false;
      if (scope === 'mine' && !v.mine) return false;
      if (dueSoonOnly && !v.dueSoon) return false;
      if (priorityFilter !== 'All' && v.priority !== priorityFilter) return false;

      if (q) {
        const haystack = `${v.vendor} ${v.issue} ${v.summary} ${v.businessUnit}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [vendors, activeView, selectedUnit, kpiFilter, scope, dueSoonOnly, priorityFilter, query]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    scope === 'mine' ||
    dueSoonOnly ||
    priorityFilter !== 'All' ||
    selectedUnit !== null ||
    kpiFilter !== null;

  const clearAllFilters = () => {
    setQuery('');
    setScope('team');
    setDueSoonOnly(false);
    setPriorityFilter('All');
    setSelectedUnit(null);
    setKpiFilter(null);
    setActiveView('needs-attention');
    toast({ title: 'Filters cleared', description: 'Showing all Needs attention vendors.' });
  };

  const drawerVendor = useMemo(
    () => vendors.find((v) => v.id === drawerVendorId) ?? null,
    [vendors, drawerVendorId],
  );

  const handleToggleAutoFollowUps = (next: boolean) => {
    setAutoFollowUps(next);
    toast({
      title: next ? 'Auto follow-ups enabled' : 'Auto follow-ups paused',
      description: next
        ? 'Vendors receive polite nudges every 48 hours.'
        : 'Automatic vendor reminder emails are paused.',
      tone: 'success',
    });
  };

  const handleToggleDueWindow = () => {
    const next = !dueSoonOnly;
    setDueSoonOnly(next);
    toast({
      title: next ? 'Showing due-soon items' : 'Showing all due dates',
      description: next
        ? 'Filtered to vendors due within 48 hours or overdue.'
        : 'Date window filter cleared.',
    });
  };

  const handleToggleStar = () => {
    const next = !starred;
    setStarred(next);
    toast({
      title: next ? 'View starred' : 'Removed from starred',
      description: `${displayTitle} ${next ? 'pinned to your favorites.' : 'unpinned from favorites.'}`,
      tone: 'success',
    });
  };

  const handleCyclePriority = () => {
    const nextIdx = (PRIORITY_CYCLE.indexOf(priorityFilter) + 1) % PRIORITY_CYCLE.length;
    const next = PRIORITY_CYCLE[nextIdx];
    setPriorityFilter(next);
    toast({
      title: next === 'All' ? 'Priority filter: All' : `Priority filter: ${next}`,
      description:
        next === 'All'
          ? 'Showing High, Medium, and Low priority onboardings.'
          : `Filtered to ${next} priority items.`,
    });
  };

  const handleKpiClick = (target: OnboardingStage | 'approved' | 'all') => {
    if (target === 'all') {
      setKpiFilter(null);
      setActiveView('needs-attention');
      setSelectedUnit(null);
      return;
    }
    setKpiFilter((prev) => (prev === target ? null : target));
  };

  const openRenameModal = () => {
    setRenameDraft(displayTitle);
    setRenameOpen(true);
  };

  const handleSaveRename = () => {
    const trimmed = renameDraft.trim();
    if (!trimmed) return;
    setCustomTitles((prev) => ({ ...prev, [activeView]: trimmed }));
    setRenameOpen(false);
    toast({ title: 'View renamed', description: `Saved view updated to “${trimmed}”.`, tone: 'success' });
  };

  const handleCreateVendor = () => {
    const name = newForm.vendor.trim();
    const rawSummary = newForm.summary.trim();
    if (!name || !rawSummary) return;

    const dotIdx = rawSummary.indexOf('.');
    const issueHeadline =
      rawSummary.length <= 28
        ? rawSummary
        : dotIdx > 0 && dotIdx <= 32
          ? rawSummary.slice(0, dotIdx)
          : `${rawSummary.slice(0, 26).trim()}…`;

    const tone = MONOGRAM_TONES[vendors.length % MONOGRAM_TONES.length];
    const created: VendorRecord = {
      id: `vendor-${Date.now()}`,
      vendor: name,
      monogram: name[0]?.toUpperCase() ?? 'V',
      monogramTone: tone,
      priority: newForm.priority,
      dateLabel: 'Added Oct 9',
      issue: issueHeadline,
      summary: rawSummary,
      progress: 18,
      progressTone: newForm.priority === 'High' ? 'rose' : newForm.priority === 'Medium' ? 'lemon' : 'mint',
      assignees: ['AM', 'SC'],
      files: 1,
      comments: 0,
      stage: newForm.stage,
      lifecycle: 'onboarding',
      businessUnit: newForm.businessUnit,
      contractValue: '$60,000 / yr',
      dueSoon: newForm.priority === 'High',
      mine: true,
      renewal: false,
      latestNote: rawSummary,
    };

    setVendors((prev) => [created, ...prev]);
    setSelectedId(created.id);
    setActiveView('needs-attention');
    setSelectedUnit(null);
    setKpiFilter(null);
    setNewOpen(false);
    setNewForm({
      vendor: '',
      summary: '',
      priority: 'High',
      stage: 'blocked',
      businessUnit: 'Product',
    });
    toast({
      title: 'Vendor added',
      description: `${created.vendor} added to ${STAGE_META[created.stage].title}.`,
      tone: 'success',
    });
  };

  const handleSendFollowUp = (vendor: VendorRecord) => {
    setVendors((prev) =>
      prev.map((item) =>
        item.id === vendor.id
          ? {
              ...item,
              comments: item.comments + 1,
              dateLabel: 'Nudged Oct 9',
              latestNote: 'Follow-up reminder dispatched to vendor primary security & legal contacts.',
            }
          : item,
      ),
    );
    toast({
      title: 'Follow-up sent',
      description: `Reminder email sent to ${vendor.vendor}.`,
      tone: 'success',
    });
  };

  const handleApproveVendor = (vendor: VendorRecord) => {
    setVendors((prev) =>
      prev.map((item) =>
        item.id === vendor.id
          ? {
              ...item,
              lifecycle: 'approved',
              progress: 100,
              progressTone: 'mint',
              dateLabel: 'Approved Oct 9',
              issue: 'Onboarding complete',
              latestNote: 'Approved by procurement and activated in vendor master.',
            }
          : item,
      ),
    );
    setDrawerVendorId(null);
    toast({
      title: 'Vendor approved',
      description: `${vendor.vendor} moved to Approved vendors.`,
      tone: 'success',
    });
  };

  const handleColumnOptions = (stage: OnboardingStage) => {
    const next = !prioritySortCols[stage];
    setPrioritySortCols((prev) => ({ ...prev, [stage]: next }));
    toast({
      title: `${STAGE_META[stage].title} sorted`,
      description: next ? 'Ordered by highest priority first.' : 'Restored default onboarding order.',
    });
  };

  const showListLayout =
    layout === 'list' || activeView === 'approved' || activeView === 'archived' || kpiFilter === 'approved';

  const savedViewsList: Array<{ id: SavedViewId; label: string; count: number; tone: Tone }> = [
    { id: 'needs-attention', label: 'Needs attention', count: onboardingVendors.length, tone: 'rose' },
    { id: 'awaiting-vendor', label: 'Awaiting vendor', count: awaitingVendorCount, tone: 'lemon' },
    { id: 'internal-reviews', label: 'Internal reviews', count: internalReviewsCount, tone: 'lavender' },
    { id: 'blocked', label: 'Blocked', count: blockedCount, tone: 'rose' },
    { id: 'renewals-due', label: 'Renewals due', count: renewalsDueCount, tone: 'mint' },
  ];

  const priorityRank: Record<OnboardingPriority, number> = { High: 0, Medium: 1, Low: 2 };

  return (
    <>
      <aside className={styles.sidePanel} aria-label="Vendor onboarding views">
        <h2 className={styles.sidePanelTitle}>Overview</h2>

        <Segmented
          label="Assignment scope"
          value={scope}
          onChange={setScope}
          options={[
            { value: 'team', label: 'Team' },
            { value: 'mine', label: 'Mine' },
          ]}
        />

        <label className={styles.sideSearch}>
          <Search size={15} aria-hidden />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors…"
            aria-label="Search vendors"
          />
          <kbd className={styles.kbd}>⌘ K</kbd>
        </label>

        <div className={styles.panelScroll}>
          <CollapsibleGroup icon={<Clock3 size={15} aria-hidden />} label="Saved views">
            {savedViewsList.map((item) => {
              const isActive = !selectedUnit && activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cx(styles.treeItem, isActive && styles.treeItemActive)}
                    onClick={() => selectSavedView(item.id)}
                  >
                    <span className={styles.treeName}># {customTitles[item.id] ?? item.label}</span>
                    <Count value={item.count} tone={item.tone} />
                  </button>
                </li>
              );
            })}
          </CollapsibleGroup>

          <button
            type="button"
            className={cx(styles.flatItem, !selectedUnit && activeView === 'all' && styles.flatItemActive)}
            onClick={() => selectSavedView('all')}
          >
            <Store size={15} aria-hidden />
            <span>All onboardings</span>
            <Count value={allOnboardingsTotal} tone="muted" />
          </button>

          <CollapsibleGroup icon={<Gem size={15} aria-hidden />} label="Business units">
            {BUSINESS_UNIT_META.map((bu) => {
              const isActive = selectedUnit === bu.unit;
              return (
                <li key={bu.unit}>
                  <button
                    type="button"
                    className={cx(styles.treeItem, isActive && styles.treeItemActive)}
                    onClick={() => selectBusinessUnit(bu.unit)}
                  >
                    <span className={styles.treeName}># {bu.unit}</span>
                    <Count value={bu.baseCount} tone={bu.tone} />
                  </button>
                </li>
              );
            })}
          </CollapsibleGroup>

          <button
            type="button"
            className={cx(
              styles.flatItem,
              !selectedUnit && activeView === 'approved' && styles.flatItemActive,
            )}
            onClick={() => selectSavedView('approved')}
          >
            <CircleCheck size={15} aria-hidden />
            <span>Approved vendors</span>
          </button>

          <button
            type="button"
            className={cx(
              styles.flatItem,
              !selectedUnit && activeView === 'archived' && styles.flatItemActive,
            )}
            onClick={() => selectSavedView('archived')}
          >
            <Archive size={15} aria-hidden />
            <span>Archived vendors</span>
          </button>
        </div>

        <button type="button" className={styles.sideNewBtn} onClick={() => setNewOpen(true)}>
          <Plus size={15} aria-hidden />
          New vendor
        </button>
      </aside>

      <main className={styles.main}>
        <div className={styles.topbar}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <span>Dashboard</span>
            <ChevronRight size={14} aria-hidden />
            <span className={styles.crumbCurrent} aria-current="page">
              {displayTitle}
            </span>
          </nav>

          <span className={styles.synced}>
            <span className={styles.dotLive} aria-hidden />
            Last update Oct 9, 2026 · 09:45 AM
          </span>
        </div>

        <div className={styles.headingRow}>
          <h1 className={styles.title}>{displayTitle}</h1>
          <button
            type="button"
            className={styles.renameBtn}
            aria-label="Rename view"
            onClick={openRenameModal}
          >
            <Pencil size={15} aria-hidden />
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <AvatarStack initials={['AM', 'SC', 'MW', 'ER', 'JP']} extra={3} />
            <span className={styles.vsep} aria-hidden />
            <span className={styles.autoFollow}>
              <Mail size={15} aria-hidden />
              <Switch
                id="vendor-auto-followups"
                label="Auto follow-ups"
                checked={autoFollowUps}
                onChange={handleToggleAutoFollowUps}
              />
            </span>
          </div>

          <div className={styles.toolbarRight}>
            <button
              type="button"
              className={cx(styles.toolbarIconBtn, dueSoonOnly && styles.toolbarIconBtnActive)}
              aria-label="Filter due window"
              aria-pressed={dueSoonOnly}
              onClick={handleToggleDueWindow}
            >
              <Calendar size={15} aria-hidden />
            </button>

            <Select
              aria-label="Layout view"
              className={styles.layoutSelect}
              value={layout}
              onChange={(e) => setLayout(e.target.value as 'board' | 'list')}
            >
              <option value="board">Board</option>
              <option value="list">List</option>
            </Select>

            <button
              type="button"
              className={cx(styles.toolbarIconBtn, starred && styles.toolbarIconBtnActive)}
              aria-label="Star view"
              aria-pressed={starred}
              onClick={handleToggleStar}
            >
              <Star size={15} aria-hidden />
            </button>

            <span className={styles.vsep} aria-hidden />

            <Button
              variant="primary"
              className={styles.toolbarPrimaryBtn}
              icon={<Plus size={15} aria-hidden />}
              onClick={() => setNewOpen(true)}
            >
              New vendor
            </Button>

            <button
              type="button"
              className={cx(styles.toolbarIconBtn, priorityFilter !== 'All' && styles.toolbarIconBtnActive)}
              aria-label="Cycle priority filter"
              onClick={handleCyclePriority}
            >
              <SlidersHorizontal size={15} aria-hidden />
            </button>
          </div>
        </div>

        <div className={styles.compactFilters}>
          <Segmented
            label="Assignment scope"
            size="sm"
            value={scope}
            onChange={setScope}
            options={[
              { value: 'team', label: 'Team' },
              { value: 'mine', label: 'Mine' },
            ]}
          />
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search vendors…"
            shortcut="/"
            className={styles.compactSearch}
          />
        </div>

        {hasActiveFilters ? (
          <div className={styles.filterStrip}>
            <span className={styles.filterLabel}>Active filters:</span>
            {scope === 'mine' ? <Badge tone="accent">Assigned to me</Badge> : null}
            {dueSoonOnly ? <Badge tone="lemon">Due window</Badge> : null}
            {priorityFilter !== 'All' ? (
              <Badge tone={PRIORITY_TONE[priorityFilter]}>Priority: {priorityFilter}</Badge>
            ) : null}
            {selectedUnit ? <Badge tone="lavender">{selectedUnit}</Badge> : null}
            {kpiFilter ? (
              <Badge tone="sky">
                {kpiFilter === 'approved' ? 'Approved in Oct' : STAGE_META[kpiFilter].title}
              </Badge>
            ) : null}
            {query.trim() ? <Badge tone="neutral">“{query.trim()}”</Badge> : null}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear filters
            </Button>
          </div>
        ) : null}

        <div className={styles.kpiRow}>
          <button
            type="button"
            className={cx(styles.kpiTile, kpiFilter === null && activeView === 'all' && styles.kpiTileActive)}
            aria-pressed={kpiFilter === null && activeView === 'all'}
            onClick={() => handleKpiClick('all')}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>In onboarding</span>
              <Store size={15} aria-hidden className={styles.iconMuted} />
            </div>
            <div className={styles.kpiBottom}>
              <span className={styles.kpiValue}>{allOnboardingsTotal}</span>
              <span className={styles.kpiMeta}>+4 this week</span>
            </div>
          </button>

          <button
            type="button"
            className={cx(styles.kpiTile, kpiFilter === 'vendors' && styles.kpiTileActive)}
            aria-pressed={kpiFilter === 'vendors'}
            onClick={() => handleKpiClick('vendors')}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Awaiting vendor</span>
              <Hourglass size={15} aria-hidden className={styles.iconWarn} />
            </div>
            <div className={styles.kpiBottom}>
              <span className={styles.kpiValue}>{awaitingVendorCount}</span>
              <span className={styles.kpiMeta}>oldest 7 days</span>
            </div>
          </button>

          <button
            type="button"
            className={cx(styles.kpiTile, kpiFilter === 'reviewers' && styles.kpiTileActive)}
            aria-pressed={kpiFilter === 'reviewers'}
            onClick={() => handleKpiClick('reviewers')}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Internal reviews</span>
              <ClipboardList size={15} aria-hidden className={styles.iconMuted} />
            </div>
            <div className={styles.kpiBottom}>
              <span className={styles.kpiValue}>{internalReviewsCount}</span>
              <span className={styles.kpiMeta}>2 due today</span>
            </div>
          </button>

          <button
            type="button"
            className={cx(styles.kpiTile, kpiFilter === 'blocked' && styles.kpiTileActive)}
            aria-pressed={kpiFilter === 'blocked'}
            onClick={() => handleKpiClick('blocked')}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Blocked</span>
              <AlertTriangle size={15} aria-hidden className={styles.iconDanger} />
            </div>
            <div className={styles.kpiBottom}>
              <span className={styles.kpiValue}>{blockedCount}</span>
              <span className={styles.dangerMeta}>1 overdue</span>
            </div>
          </button>

          <button
            type="button"
            className={cx(styles.kpiTile, kpiFilter === 'approved' && styles.kpiTileActive)}
            aria-pressed={kpiFilter === 'approved'}
            onClick={() => handleKpiClick('approved')}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Approved in Oct</span>
              <CircleCheck size={15} aria-hidden className={styles.iconSuccess} />
            </div>
            <div className={styles.kpiBottom}>
              <span className={styles.kpiValue}>{approvedOctTotal}</span>
              <span className={styles.kpiMeta}>avg 9 days</span>
            </div>
          </button>
        </div>

        {filteredVendors.length === 0 ? (
          <Panel>
            <Empty icon={<Store size={18} aria-hidden />} title="No vendors match your filters">
              <span className={styles.emptyContent}>
                <span>Try another search query or reset the active view filters.</span>
                <Button size="sm" onClick={clearAllFilters}>
                  Clear filters
                </Button>
              </span>
            </Empty>
          </Panel>
        ) : showListLayout ? (
          <Panel flush title={displayTitle} description={`${filteredVendors.length} vendors shown`}>
            <TableWrap label={`${displayTitle} table`}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Stage</th>
                    <th>Priority</th>
                    <th className={styles.hideMd}>Business unit</th>
                    <th className={cx(styles.num, styles.hideSm)}>Progress</th>
                    <th className={styles.hideSm}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((v) => (
                    <tr
                      key={v.id}
                      className={styles.rowBtn}
                      onClick={() => {
                        setSelectedId(v.id);
                        setDrawerVendorId(v.id);
                      }}
                    >
                      <td>
                        <div className={styles.vendorCell}>
                          <span
                            className={cx(styles.monogramSm, styles[`tone-${v.monogramTone}`])}
                            aria-hidden
                          >
                            {v.monogram ?? v.vendor[0]?.toUpperCase()}
                          </span>
                          <button
                            type="button"
                            className={cx(styles.vendorCellText, styles.vendorRowBtn)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(v.id);
                              setDrawerVendorId(v.id);
                            }}
                          >
                            <strong>{v.vendor}</strong>
                            <span>{v.issue}</span>
                          </button>
                        </div>
                      </td>
                      <td>
                        {v.lifecycle === 'approved' ? (
                          <Count value="Approved" tone="mint" />
                        ) : v.lifecycle === 'archived' ? (
                          <Count value="Archived" tone="muted" />
                        ) : (
                          <Count value={STAGE_META[v.stage].title} tone={STAGE_META[v.stage].tone} />
                        )}
                      </td>
                      <td>
                        <Count value={v.priority} tone={PRIORITY_TONE[v.priority]} />
                      </td>
                      <td className={styles.hideMd}>
                        <Badge tone="neutral">{v.businessUnit}</Badge>
                      </td>
                      <td className={cx(styles.num, styles.hideSm)}>{v.progress}%</td>
                      <td className={cx(styles.mutedCell, styles.hideSm)}>{v.dateLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </Panel>
        ) : (
          <div className={styles.boardGrid}>
            {STAGE_ORDER.map((stage) => {
              const meta = STAGE_META[stage];
              const stageItems = filteredVendors.filter((v) => v.stage === stage);
              const ordered = prioritySortCols[stage]
                ? [...stageItems].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
                : stageItems;
              const isExpanded = expandedCols[stage];
              const hiddenCount = Math.max(0, ordered.length - meta.collapsedLimit);
              const visibleItems = isExpanded ? ordered : ordered.slice(0, meta.collapsedLimit);

              return (
                <KanbanColumn
                  key={stage}
                  title={meta.title}
                  count={ordered.length}
                  tone={meta.tone}
                  hiddenCount={hiddenCount}
                  expanded={isExpanded}
                  onToggleExpand={() => setExpandedCols((prev) => ({ ...prev, [stage]: !prev[stage] }))}
                  onMoreAction={() => handleColumnOptions(stage)}
                >
                  {visibleItems.map((card) => (
                    <OnboardingCard
                      key={card.id}
                      card={card}
                      selected={selectedId === card.id}
                      onSelect={() => {
                        setSelectedId(card.id);
                        setDrawerVendorId(card.id);
                      }}
                      onMenu={() => {
                        setSelectedId(card.id);
                        setDrawerVendorId(card.id);
                      }}
                    />
                  ))}
                </KanbanColumn>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Drawer */}
      <Drawer
        open={Boolean(drawerVendor)}
        onClose={() => setDrawerVendorId(null)}
        title={drawerVendor ? drawerVendor.vendor : 'Vendor details'}
        footer={
          drawerVendor ? (
            <>
              <Button onClick={() => handleSendFollowUp(drawerVendor)}>Send follow-up</Button>
              {drawerVendor.lifecycle !== 'approved' ? (
                <Button variant="primary" onClick={() => handleApproveVendor(drawerVendor)}>
                  Approve vendor
                </Button>
              ) : null}
            </>
          ) : undefined
        }
      >
        {drawerVendor ? (
          <>
            <div className={styles.drawerLead}>
              <span
                className={cx(styles.monogramSm, styles[`tone-${drawerVendor.monogramTone}`])}
                aria-hidden
              >
                {drawerVendor.monogram ?? drawerVendor.vendor[0]?.toUpperCase()}
              </span>
              <div className={styles.drawerLeadText}>
                <strong>{drawerVendor.issue}</strong>
                <span>{drawerVendor.summary}</span>
              </div>
            </div>

            <dl className={styles.dl}>
              <dt>Stage</dt>
              <dd>
                {drawerVendor.lifecycle === 'approved' ? (
                  <Count value="Approved" tone="mint" />
                ) : drawerVendor.lifecycle === 'archived' ? (
                  <Count value="Archived" tone="muted" />
                ) : (
                  <Count
                    value={STAGE_META[drawerVendor.stage].title}
                    tone={STAGE_META[drawerVendor.stage].tone}
                  />
                )}
              </dd>

              <dt>Priority</dt>
              <dd>
                <Count value={drawerVendor.priority} tone={PRIORITY_TONE[drawerVendor.priority]} />
              </dd>

              <dt>Business unit</dt>
              <dd>
                <Badge tone="neutral">{drawerVendor.businessUnit}</Badge>
              </dd>

              <dt>Contract value</dt>
              <dd>{drawerVendor.contractValue}</dd>

              <dt>Progress</dt>
              <dd>{drawerVendor.progress}%</dd>

              <dt>Reviewers</dt>
              <dd>
                <AvatarStack initials={drawerVendor.assignees} size="sm" />
                <span>{drawerVendor.assignees.map((ini) => REVIEWER_NAMES[ini] ?? ini).join(', ')}</span>
              </dd>

              <dt>Latest note</dt>
              <dd>{drawerVendor.dateLabel}</dd>
            </dl>

            <div className={styles.noteBlock}>
              <span className={styles.noteLabel}>Latest activity note</span>
              <p className={styles.noteText}>{drawerVendor.latestNote}</p>
            </div>
          </>
        ) : null}
      </Drawer>

      {/* Rename View Modal */}
      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename saved view"
        description="Update how this view appears in your Overview sidebar and header."
        width="sm"
        footer={
          <>
            <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!renameDraft.trim()} onClick={handleSaveRename}>
              Save name
            </Button>
          </>
        }
      >
        <FormField label="View name">
          {(id) => (
            <Input
              id={id}
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              placeholder="Needs attention"
            />
          )}
        </FormField>
      </Modal>

      {/* New Vendor Modal */}
      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New vendor"
        description="Start a security, legal, and finance onboarding workflow."
        width="md"
        footer={
          <>
            <Button onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!newForm.vendor.trim() || !newForm.summary.trim()}
              onClick={handleCreateVendor}
            >
              Add vendor
            </Button>
          </>
        }
      >
        <FormField label="Vendor name" hint="Legal or trading name shown on onboarding cards.">
          {(id) => (
            <Input
              id={id}
              value={newForm.vendor}
              onChange={(e) => setNewForm((prev) => ({ ...prev, vendor: e.target.value }))}
              placeholder="e.g. Corvane Systems"
            />
          )}
        </FormField>

        <FormField
          label="Blocker / summary"
          hint="Describe the current review step, missing document, or approval requirement."
        >
          {(id) => (
            <Textarea
              id={id}
              value={newForm.summary}
              onChange={(e) => setNewForm((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="Signed DPA awaits external counsel review."
            />
          )}
        </FormField>

        <div className={styles.formGrid}>
          <FormField label="Priority">
            {(id) => (
              <Select
                id={id}
                value={newForm.priority}
                onChange={(e) =>
                  setNewForm((prev) => ({
                    ...prev,
                    priority: e.target.value as OnboardingPriority,
                  }))
                }
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            )}
          </FormField>

          <FormField label="Column stage">
            {(id) => (
              <Select
                id={id}
                value={newForm.stage}
                onChange={(e) =>
                  setNewForm((prev) => ({
                    ...prev,
                    stage: e.target.value as OnboardingStage,
                  }))
                }
              >
                <option value="blocked">Blocked</option>
                <option value="reviewers">Waiting on reviewers</option>
                <option value="vendors">Waiting on vendors</option>
              </Select>
            )}
          </FormField>
        </div>

        <FormField label="Business unit">
          {(id) => (
            <Select
              id={id}
              value={newForm.businessUnit}
              onChange={(e) =>
                setNewForm((prev) => ({
                  ...prev,
                  businessUnit: e.target.value as BusinessUnit,
                }))
              }
            >
              {BUSINESS_UNIT_META.map((bu) => (
                <option key={bu.unit} value={bu.unit}>
                  {bu.unit}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </Modal>
    </>
  );
};
