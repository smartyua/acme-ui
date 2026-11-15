import { useMemo, useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Image,
  Layers,
  ListFilter,
  Package,
  PanelRight,
  Plus,
  RotateCcw,
  Star,
  Table2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';

import { Avatar, Count, Segmented } from '../../components/primitives';
import {
  Badge,
  Button,
  Empty,
  FormField,
  Input,
  Modal,
  SearchBox,
  Select,
  TableWrap,
  cx,
  tableClass,
} from '../../components/ui';
import { Page } from '../../layout/Page';
import { useApp } from '../../lib/app';
import s from '../pages.module.scss';
import styles from './Products.module.scss';
import {
  CYCLE_TIME_BARS,
  ENRICHMENT_TODAY_COL,
  INITIAL_WORKFLOW_STEPS,
  PRODUCTS_CATALOG,
  PRODUCT_ASSETS,
  PRODUCT_VARIANTS,
  buildEnrichmentMatrix,
  type ActivityRange,
  type AttributeFilter,
  type DotStatus,
  type ProductAttribute,
  type ProductRecord,
  type ProductSectionTab,
  type WorkflowStep,
} from './productsData';

const DOT_CLASS: Record<DotStatus, string> = {
  approved: styles.dotApproved,
  review: styles.dotReview,
  'needs-info': styles.dotNeedsInfo,
  projected: styles.dotProjected,
  empty: styles.dotEmpty,
};

export const ProductsPage = () => {
  const { toast } = useApp();

  const [catalog, setCatalog] = useState<ProductRecord[]>(PRODUCTS_CATALOG);
  const [productIndex, setProductIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [starred, setStarred] = useState(true);
  const [activityRange, setActivityRange] = useState<ActivityRange>('week');
  const [sectionTab, setSectionTab] = useState<ProductSectionTab>('attributes');
  const [attrQuery, setAttrQuery] = useState('');
  const [attrFilter, setAttrFilter] = useState<AttributeFilter>('all');
  const [generalOpen, setGeneralOpen] = useState(true);
  const [specsOpen, setSpecsOpen] = useState(true);
  const [activeSize, setActiveSize] = useState('M');

  const [workflowsOpen, setWorkflowsOpen] = useState(true);
  const [workflowFilter, setWorkflowFilter] = useState<'all' | 'enrichment' | 'review'>('all');
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_WORKFLOW_STEPS);
  const [stepComment, setStepComment] = useState('');

  // Modals
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [valueModalAttr, setValueModalAttr] = useState<ProductAttribute | null>(null);
  const [valueDraft, setValueDraft] = useState('');

  const product = catalog[productIndex] ?? catalog[0];

  const [detailsDraft, setDetailsDraft] = useState({
    title: product.title,
    sku: product.sku,
    subtitle: product.subtitle,
  });

  const matrix = useMemo(() => buildEnrichmentMatrix(activityRange), [activityRange]);

  const filterCounts = useMemo(() => {
    const attrs = product.attributes;
    return {
      all: attrs.length,
      required: attrs.filter((a) => a.required).length,
      missing: attrs.filter((a) => a.missing).length,
      localized: attrs.filter((a) => (a.locales?.length ?? 0) > 0).length,
      edited: attrs.filter((a) => a.editedThisWeek).length,
    };
  }, [product.attributes]);

  const filteredAttributes = useMemo(() => {
    const q = attrQuery.trim().toLowerCase();
    return product.attributes
      .filter((a) => {
        if (attrFilter === 'required') return Boolean(a.required);
        if (attrFilter === 'missing') return Boolean(a.missing);
        if (attrFilter === 'localized') return (a.locales?.length ?? 0) > 0;
        if (attrFilter === 'edited') return Boolean(a.editedThisWeek);
        return true;
      })
      .filter((a) => !q || `${a.label} ${a.value}`.toLowerCase().includes(q));
  }, [product.attributes, attrFilter, attrQuery]);

  const generalAttrs = useMemo(
    () => filteredAttributes.filter((a) => a.group === 'general'),
    [filteredAttributes],
  );
  const specAttrs = useMemo(
    () => filteredAttributes.filter((a) => a.group === 'specifications'),
    [filteredAttributes],
  );

  const generalFilled = useMemo(
    () => product.attributes.filter((a) => a.group === 'general' && !a.missing).length,
    [product.attributes],
  );
  const generalTotal = useMemo(
    () => product.attributes.filter((a) => a.group === 'general').length,
    [product.attributes],
  );

  const specsFilled = useMemo(
    () => product.attributes.filter((a) => a.group === 'specifications' && !a.missing).length,
    [product.attributes],
  );
  const specsTotal = useMemo(
    () => product.attributes.filter((a) => a.group === 'specifications').length,
    [product.attributes],
  );

  const completedStepsCount = useMemo(
    () => steps.filter((st) => st.status === 'completed').length,
    [steps],
  );
  const currentStep = useMemo(
    () => steps.find((st) => st.status === 'current') ?? steps[steps.length - 1],
    [steps],
  );

  const switchProduct = (dir: -1 | 1) => {
    const next = (productIndex + dir + catalog.length) % catalog.length;
    setProductIndex(next);
    setSlideIndex(0);
    const nextProd = catalog[next];
    setDetailsDraft({
      title: nextProd.title,
      sku: nextProd.sku,
      subtitle: nextProd.subtitle,
    });
    toast({
      title: 'Switched product',
      description: `Now viewing ${nextProd.breadcrumb} (${nextProd.sku}).`,
    });
  };

  const handleCopy = (label: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => undefined);
    toast({
      title: `${label} copied`,
      description: `${val} copied to clipboard.`,
      tone: 'success',
    });
  };

  const handleSaveValue = () => {
    if (!valueModalAttr || !valueDraft.trim()) return;
    const nextVal = valueDraft.trim();
    setCatalog((prev) =>
      prev.map((item, idx) =>
        idx === productIndex
          ? {
              ...item,
              kpiScore: Math.min(item.kpiTotal, item.kpiScore + 1),
              attributes: item.attributes.map((attr) =>
                attr.id === valueModalAttr.id
                  ? { ...attr, value: nextVal, missing: false, editedThisWeek: true }
                  : attr,
              ),
            }
          : item,
      ),
    );
    toast({
      title: `${valueModalAttr.label} updated`,
      description: `Set to "${nextVal}".`,
      tone: 'success',
    });
    setValueModalAttr(null);
    setValueDraft('');
  };

  const handleSaveDetails = () => {
    if (!detailsDraft.title.trim() || !detailsDraft.sku.trim()) return;
    setCatalog((prev) =>
      prev.map((item, idx) =>
        idx === productIndex
          ? {
              ...item,
              title: detailsDraft.title.trim(),
              sku: detailsDraft.sku.trim(),
              subtitle: detailsDraft.subtitle.trim() || item.subtitle,
            }
          : item,
      ),
    );
    setEditDetailsOpen(false);
    toast({
      title: 'Product details saved',
      description: `${detailsDraft.sku.trim()} metadata updated.`,
      tone: 'success',
    });
  };

  const handleApproveStep = () => {
    const noteText = stepComment.trim() || 'Enrichment verified and approved';
    setSteps((prev) => {
      const currentIdx = prev.findIndex((st) => st.status === 'current');
      if (currentIdx === -1) return prev;
      return prev.map((st, idx) => {
        if (idx === currentIdx) {
          return {
            ...st,
            status: 'completed',
            approvalNote: {
              author: 'Jessica Rachel',
              initials: 'JR',
              timestamp: 'Just now',
              comment: noteText,
            },
          };
        }
        if (idx === currentIdx + 1) {
          return {
            ...st,
            status: 'current',
            assignee: { name: 'Jessica Rachel (You)', initials: 'JR' },
          };
        }
        return st;
      });
    });
    setStepComment('');
    toast({
      title: 'Workflow step approved',
      description: `${currentStep.title} marked complete.`,
      tone: 'success',
    });
  };

  const handleRejectStep = () => {
    toast({
      title: 'Step sent back for revision',
      description: stepComment.trim() || `${currentStep.title} flagged for follow-up.`,
      tone: 'danger',
    });
    setStepComment('');
  };

  return (
    <Page>
      <div className={cx(styles.workbench, !workflowsOpen && styles.workbenchCollapsedRight)}>
        {/* ── Left Column: Product Overview ──────────────────────────── */}
        <section className={styles.columnCard} aria-label="Product overview">
          <div className={styles.colHeader}>
            <span className={styles.colTitle}>Product Overview</span>
            <button
              type="button"
              className={styles.iconAction}
              aria-label={workflowsOpen ? 'Collapse workflow panel' : 'Expand workflow panel'}
              onClick={() => setWorkflowsOpen((v) => !v)}
            >
              <PanelRight size={15} aria-hidden />
            </button>
          </div>

          <div className={styles.galleryMain}>
            <svg
              className={styles.garmentSvg}
              viewBox="0 0 180 150"
              role="img"
              aria-label={`${product.title} preview ${slideIndex + 1} of 5`}
            >
              <defs>
                <linearGradient id="teeBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--peach)" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="var(--fg-muted)" stopOpacity="0.55" />
                </linearGradient>
              </defs>
              <path
                d="M55 24 L72 18 C80 28 100 28 108 18 L125 24 L152 48 L136 68 L120 55 L120 132 L60 132 L60 55 L44 68 L28 48 Z"
                fill="url(#teeBody)"
                stroke="var(--border-strong)"
                strokeWidth="2"
              />
              <path
                d="M72 18 C80 30 100 30 108 18"
                fill="none"
                stroke="var(--fg)"
                strokeWidth="2.5"
              />
              <line x1="36" y1="55" x2="50" y2="43" stroke="var(--card)" strokeWidth="2.5" />
              <line x1="144" y1="55" x2="130" y2="43" stroke="var(--card)" strokeWidth="2.5" />
            </svg>

            <button
              type="button"
              className={cx(styles.favBtn, starred && styles.favBtnActive)}
              aria-label={starred ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => {
                setStarred((prev) => !prev);
                toast({
                  title: !starred ? 'Added to favorites' : 'Removed from favorites',
                  description: product.sku,
                });
              }}
            >
              <Star size={15} aria-hidden />
            </button>

            <span className={styles.slideCounter}>{slideIndex + 1}/5</span>
          </div>

          <div className={styles.thumbRow} role="group" aria-label="Product angles">
            {['Front', 'Side', 'Back', 'Detail', 'Look'].map((angle, idx) => (
              <button
                key={angle}
                type="button"
                className={cx(styles.thumbBtn, slideIndex === idx && styles.thumbBtnActive)}
                aria-label={`View ${angle} angle (${idx + 1} of 5)`}
                onClick={() => setSlideIndex(idx)}
              >
                <span className={styles.thumbSwatch} aria-hidden />
              </button>
            ))}
          </div>

          <div className={styles.skuLine}>
            <span>SKU</span>
            <strong>{product.sku}</strong>
          </div>

          <h1 className={styles.productHeading}>{product.title}</h1>
          <p className={styles.productSub}>{product.subtitle}</p>

          <div className={styles.tagRow}>
            <Badge tone="neutral">
              <Package size={14} aria-hidden />
              Product
            </Badge>
            <Count tone="peach" value="New" />
          </div>

          <div className={styles.kpiBox}>
            <div className={styles.kpiMetaRow}>
              <span>Business KPI score</span>
              <span>
                {product.kpiScore} of {product.kpiTotal}
              </span>
            </div>
            <div className={styles.kpiValue}>
              {Math.round((product.kpiScore / product.kpiTotal) * 100)}%
            </div>
            <div className={styles.segmentBar} aria-hidden>
              {Array.from({ length: product.kpiTotal }).map((_, idx) => (
                <span
                  key={idx}
                  className={cx(
                    styles.segmentTick,
                    idx < product.kpiScore && styles.segmentTickFilled,
                  )}
                />
              ))}
            </div>
          </div>

          <div className={styles.sectionDivider}>
            <h2 className={styles.eyebrow}>Identifiers</h2>
            <div className={styles.idList}>
              <div className={styles.idRow}>
                <span className={styles.idLabel}>Product ID</span>
                <span className={styles.idValueWrap}>
                  {product.productId}
                  <button
                    type="button"
                    className={styles.copyBtn}
                    aria-label="Copy Product ID"
                    onClick={() => handleCopy('Product ID', product.productId)}
                  >
                    <Copy size={14} aria-hidden />
                  </button>
                </span>
              </div>
              <div className={styles.idRow}>
                <span className={styles.idLabel}>GTIN</span>
                <span className={styles.idValueWrap}>
                  {product.gtin}
                  <button
                    type="button"
                    className={styles.copyBtn}
                    aria-label="Copy GTIN"
                    onClick={() => handleCopy('GTIN', product.gtin)}
                  >
                    <Copy size={14} aria-hidden />
                  </button>
                </span>
              </div>
              <div className={styles.idRow}>
                <span className={styles.idLabel}>Parent code</span>
                <span className={styles.idValueWrap}>
                  {product.parentCode}
                  <button
                    type="button"
                    className={styles.copyBtn}
                    aria-label="Copy Parent code"
                    onClick={() => handleCopy('Parent code', product.parentCode)}
                  >
                    <Copy size={14} aria-hidden />
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.sectionDivider}>
            <h2 className={styles.eyebrow}>Taxonomy</h2>
            <div className={styles.taxonomyWrap}>
              {product.taxonomy.map((tax) => (
                <button
                  key={tax}
                  type="button"
                  className={styles.taxChip}
                  onClick={() =>
                    toast({
                      title: `Filtered by ${tax}`,
                      description: `Showing catalog items in ${tax}.`,
                    })
                  }
                >
                  {tax}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sectionDivider}>
            <h2 className={styles.eyebrow}>Ownership</h2>
            <div className={styles.ownerRow}>
              <span>Created by</span>
              <span className={styles.ownerPerson}>
                <Avatar initials={product.ownerInitials} size="sm" />
                {product.ownerName}
              </span>
            </div>
            <div className={styles.overviewActions}>
              <Button
                size="sm"
                onClick={() => {
                  setDetailsDraft({
                    title: product.title,
                    sku: product.sku,
                    subtitle: product.subtitle,
                  });
                  setEditDetailsOpen(true);
                }}
              >
                Edit details
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  toast({
                    title: 'Product exported',
                    description: `${product.sku} PIM feed downloaded as JSON.`,
                    tone: 'success',
                  })
                }
              >
                Export
              </Button>
            </div>
          </div>
        </section>

        {/* ── Center Column: Enrichment Activity + Attributes ────────── */}
        <div className={styles.centerCol}>
          <div className={styles.centerTopBar}>
            <div className={styles.crumbPill}>
              <span>Products</span>
              <span aria-hidden>/</span>
              <strong>{product.breadcrumb}</strong>
            </div>

            <div className={styles.navBtns}>
              <button
                type="button"
                className={styles.iconAction}
                aria-label="Product notifications"
                onClick={() =>
                  toast({
                    title: 'Subscribed to SKU alerts',
                    description: `You will be notified when ${product.sku} enrichment completes.`,
                    tone: 'success',
                  })
                }
              >
                <Bell size={15} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.iconAction}
                aria-label="Previous product"
                onClick={() => switchProduct(-1)}
              >
                <ChevronLeft size={15} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.iconAction}
                aria-label="Next product"
                onClick={() => switchProduct(1)}
              >
                <ChevronRight size={15} aria-hidden />
              </button>
            </div>
          </div>

          <section className={styles.activityCard} aria-label="Enrichment activity">
            <div className={styles.activityHeader}>
              <div>
                <h2 className={styles.activityTitle}>Enrichment Activity</h2>
                <div className={styles.activityMetricRow}>
                  <span className={styles.bigCount}>{product.updatesTotal}</span>
                  <span className={styles.deltaUp}>{product.updatesDelta}</span>
                  <span className={styles.deltaSub}>updates in the last 30 days</span>
                </div>
              </div>

              <Segmented
                label="Enrichment range"
                size="sm"
                value={activityRange}
                onChange={setActivityRange}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </div>

            <div className={styles.legendRow}>
              <div className={styles.legendItems}>
                <span className={styles.legendItem}>
                  <span className={cx(styles.dotSwatch, styles.dotApproved)} aria-hidden />
                  Approved
                </span>
                <span className={styles.legendItem}>
                  <span className={cx(styles.dotSwatch, styles.dotReview)} aria-hidden />
                  In review
                </span>
                <span className={styles.legendItem}>
                  <span className={cx(styles.dotSwatch, styles.dotNeedsInfo)} aria-hidden />
                  Needs info
                </span>
                <span className={styles.legendItem}>
                  <span className={cx(styles.dotSwatch, styles.dotProjected)} aria-hidden />
                  Projected
                </span>
              </div>

              <span className={styles.projectedCallout}>{product.projectedDelta}</span>
              <span>1 dot = 10 updates</span>
            </div>

            <div className={styles.matrixWrap}>
              <div className={styles.matrixGrid} role="img" aria-label="Enrichment updates dot matrix">
                {matrix.map((row, rIdx) => (
                  <div key={rIdx} className={styles.matrixRow}>
                    {row.map((status, cIdx) => (
                      <span
                        key={cIdx}
                        className={cx(
                          styles.matrixDot,
                          DOT_CLASS[status],
                          cIdx === ENRICHMENT_TODAY_COL && rIdx === 0 && styles.matrixTodayMarker,
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className={styles.matrixAxis} aria-hidden>
                <span>Oct 19</span>
                <span>Oct 26</span>
                <span>Nov 2</span>
                <span>Nov 9</span>
                <span className={styles.axisToday}>Today</span>
                <span>Nov 23</span>
              </div>
            </div>
          </section>

          <section className={styles.attributesPanel} aria-label="Product attributes">
            <div className={styles.sectionTabBar} role="tablist" aria-label="Product workspace sections">
              {(
                [
                  { id: 'summary', label: 'Summary', icon: FileText },
                  { id: 'attributes', label: 'Attributes', icon: Table2 },
                  { id: 'assets', label: 'Assets', icon: Image },
                  { id: 'variants', label: 'Variants', icon: Layers },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={sectionTab === tab.id}
                    className={cx(
                      styles.sectionTab,
                      sectionTab === tab.id && styles.sectionTabActive,
                    )}
                    onClick={() => setSectionTab(tab.id)}
                  >
                    <Icon size={15} aria-hidden />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {sectionTab === 'attributes' ? (
              <>
                <div className={styles.attrToolbar}>
                  <SearchBox
                    value={attrQuery}
                    onChange={setAttrQuery}
                    placeholder={`Search ${product.attributes.length} attributes...`}
                    shortcut="/"
                    className={styles.attrSearch}
                  />
                  <div className={styles.attrActions}>
                    <Button
                      size="sm"
                      icon={<ListFilter size={15} aria-hidden />}
                      onClick={() => {
                        const next: AttributeFilter =
                          attrFilter === 'all' ? 'missing' : 'all';
                        setAttrFilter(next);
                        toast({
                          title: next === 'missing' ? 'Showing missing attributes' : 'Showing all attributes',
                        });
                      }}
                    >
                      Refine
                    </Button>
                    <button
                      type="button"
                      className={styles.iconAction}
                      aria-label="Import attributes"
                      onClick={() =>
                        toast({
                          title: 'Attribute import ready',
                          description: 'Synced 12 fields from ERP master catalog.',
                          tone: 'success',
                        })
                      }
                    >
                      <Upload size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={styles.iconAction}
                      aria-label="Download attribute sheet"
                      onClick={() =>
                        toast({
                          title: 'Downloaded CSV',
                          description: `${product.sku}-attributes.csv saved.`,
                          tone: 'success',
                        })
                      }
                    >
                      <Download size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={styles.iconAction}
                      aria-label="Reset attribute filters"
                      onClick={() => {
                        setAttrQuery('');
                        setAttrFilter('all');
                        toast({ title: 'Filters cleared' });
                      }}
                    >
                      <RotateCcw size={15} aria-hidden />
                    </button>
                  </div>
                </div>

                <div className={styles.filterRow} role="group" aria-label="Attribute status filter">
                  {(
                    [
                      { id: 'all', label: 'All', count: filterCounts.all },
                      { id: 'required', label: 'Required', count: filterCounts.required },
                      { id: 'missing', label: 'Missing', count: filterCounts.missing, dot: true },
                      { id: 'localized', label: 'Localized', count: filterCounts.localized },
                      { id: 'edited', label: 'Edited this week', count: filterCounts.edited },
                    ] as const
                  ).map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      className={cx(
                        styles.filterChip,
                        attrFilter === pill.id && styles.filterChipActive,
                      )}
                      onClick={() => setAttrFilter(pill.id)}
                    >
                      {'dot' in pill && pill.dot ? <span className={styles.filterDot} aria-hidden /> : null}
                      <span>{pill.label}</span>
                      <span>{pill.count}</span>
                    </button>
                  ))}
                </div>

                {filteredAttributes.length === 0 ? (
                  <Empty icon={<Table2 size={18} aria-hidden />} title="No attributes match">
                    <Button
                      size="sm"
                      onClick={() => {
                        setAttrQuery('');
                        setAttrFilter('all');
                      }}
                    >
                      Reset filters
                    </Button>
                  </Empty>
                ) : (
                  <>
                    {/* General group */}
                    {generalAttrs.length > 0 ? (
                      <div className={styles.groupCard}>
                        <button
                          type="button"
                          className={styles.groupHeader}
                          aria-expanded={generalOpen}
                          onClick={() => setGeneralOpen((v) => !v)}
                        >
                          <span className={styles.groupHeaderLeft}>
                            <span>General</span>
                            <span className={styles.groupFraction}>
                              {generalFilled}/{generalTotal}
                            </span>
                            <span className={styles.miniSegments} aria-hidden>
                              {Array.from({ length: generalTotal }).map((_, i) => (
                                <span
                                  key={i}
                                  className={cx(
                                    styles.miniSeg,
                                    i < generalFilled && styles.miniSegFilled,
                                  )}
                                />
                              ))}
                            </span>
                          </span>
                          {generalOpen ? (
                            <ChevronUp size={15} aria-hidden />
                          ) : (
                            <ChevronDown size={15} aria-hidden />
                          )}
                        </button>

                        {generalOpen ? (
                          <div className={styles.attrGrid}>
                            {generalAttrs.map((attr) => (
                              <div key={attr.id} className={styles.attrCell}>
                                <div className={styles.attrLabelRow}>
                                  <span>{attr.label}</span>
                                  {attr.required ? <span className={styles.reqTag}>Required</span> : null}
                                  {attr.locales?.map((loc) => (
                                    <span key={loc} className={styles.localeBadge}>
                                      {loc}
                                    </span>
                                  ))}
                                </div>
                                <div className={styles.attrValueRow}>
                                  <span
                                    className={cx(
                                      styles.attrValue,
                                      attr.missing && styles.attrMissing,
                                    )}
                                  >
                                    {attr.value}
                                  </span>
                                  {attr.missing ? (
                                    <button
                                      type="button"
                                      className={styles.addValueBtn}
                                      onClick={() => {
                                        setValueModalAttr(attr);
                                        setValueDraft('');
                                      }}
                                    >
                                      <Plus size={14} aria-hidden />
                                      Add value
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Specifications group */}
                    {specAttrs.length > 0 ? (
                      <div className={styles.groupCard}>
                        <button
                          type="button"
                          className={styles.groupHeader}
                          aria-expanded={specsOpen}
                          onClick={() => setSpecsOpen((v) => !v)}
                        >
                          <span className={styles.groupHeaderLeft}>
                            <span>Specifications</span>
                            <span className={styles.groupFraction}>
                              {specsFilled}/{specsTotal}
                            </span>
                            <span className={styles.miniSegments} aria-hidden>
                              {Array.from({ length: specsTotal }).map((_, i) => (
                                <span
                                  key={i}
                                  className={cx(
                                    styles.miniSeg,
                                    i < specsFilled && styles.miniSegFilled,
                                  )}
                                />
                              ))}
                            </span>
                          </span>
                          {specsOpen ? (
                            <ChevronUp size={15} aria-hidden />
                          ) : (
                            <ChevronDown size={15} aria-hidden />
                          )}
                        </button>

                        {specsOpen ? (
                          <div className={styles.attrGrid}>
                            {specAttrs.map((attr) => (
                              <div key={attr.id} className={styles.attrCell}>
                                <div className={styles.attrLabelRow}>
                                  <span>{attr.label}</span>
                                  {attr.required ? <span className={styles.reqTag}>Required</span> : null}
                                  {attr.locales?.map((loc) => (
                                    <span key={loc} className={styles.localeBadge}>
                                      {loc}
                                    </span>
                                  ))}
                                </div>
                                <div className={styles.attrValueRow}>
                                  {attr.kind === 'swatches' && attr.swatches ? (
                                    <div className={styles.swatchRow}>
                                      {attr.swatches.map((sw) => (
                                        <span key={sw.label} className={styles.colorChip}>
                                          <span
                                            className={
                                              sw.tone === 'brown'
                                                ? styles.swatchDotBrown
                                                : styles.swatchDotBeige
                                            }
                                            aria-hidden
                                          />
                                          {sw.label}
                                        </span>
                                      ))}
                                    </div>
                                  ) : attr.kind === 'sizes' && attr.sizes ? (
                                    <div className={styles.sizeRow}>
                                      {attr.sizes.map((sz) => (
                                        <button
                                          key={sz}
                                          type="button"
                                          className={cx(
                                            styles.sizeChip,
                                            activeSize === sz && styles.sizeChipActive,
                                          )}
                                          onClick={() => {
                                            setActiveSize(sz);
                                            toast({
                                              title: `Selected size ${sz}`,
                                              description: `${product.sku}-${sz} variant focused.`,
                                            });
                                          }}
                                        >
                                          {sz}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <>
                                      <span
                                        className={cx(
                                          styles.attrValue,
                                          attr.missing && styles.attrMissing,
                                        )}
                                      >
                                        {attr.value}
                                      </span>
                                      {attr.missing ? (
                                        <button
                                          type="button"
                                          className={styles.addValueBtn}
                                          onClick={() => {
                                            setValueModalAttr(attr);
                                            setValueDraft('');
                                          }}
                                        >
                                          <Plus size={14} aria-hidden />
                                          Add value
                                        </button>
                                      ) : null}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                )}
              </>
            ) : null}

            {sectionTab === 'summary' ? (
              <div className={styles.subPanel}>
                <div className={styles.subPanelTitleRow}>
                  <h3 className={styles.subPanelTitle}>Syndication summary</h3>
                  <Count tone="mint" value="Ready for 4 channels" />
                </div>
                <p className={styles.subPanelMeta}>
                  {product.title} ({product.sku}) has {generalFilled + specsFilled} of{' '}
                  {generalTotal + specsTotal} required & optional merchandising attributes enriched across EN,
                  FR and DE locales.
                </p>
              </div>
            ) : null}

            {sectionTab === 'assets' ? (
              <div className={styles.assetGrid}>
                {PRODUCT_ASSETS.map((asset) => (
                  <div key={asset.id} className={styles.assetCard}>
                    <div className={styles.assetMeta}>
                      <strong>{asset.label}</strong>
                      <span>
                        {asset.format} · {asset.size}
                      </span>
                    </div>
                    <Count tone={asset.tone} value="Verified" />
                  </div>
                ))}
              </div>
            ) : null}

            {sectionTab === 'variants' ? (
              <TableWrap>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th>Variant SKU</th>
                      <th>Size</th>
                      <th className={s.hideSm}>Colorway</th>
                      <th className={s.num}>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCT_VARIANTS.map((v) => (
                      <tr key={v.sku}>
                        <td>{v.sku}</td>
                        <td>{v.size}</td>
                        <td className={s.hideSm}>{v.color}</td>
                        <td className={s.num}>{v.stock}</td>
                        <td>
                          <Count
                            tone={v.status === 'Active' ? 'mint' : 'lemon'}
                            value={v.status}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            ) : null}
          </section>
        </div>

        {/* ── Right Column: Workflows ────────────────────────────────── */}
        {workflowsOpen ? (
          <aside className={styles.columnCard} aria-label="Product workflows">
            <div className={styles.colHeader}>
              <div className={styles.rightHeaderLeft}>
                <TrendingUp size={15} aria-hidden />
                <span className={styles.colTitle}>Workflows</span>
                <Count tone="muted" value={3} />
              </div>

              <div className={styles.rightHeaderControls}>
                <Select
                  aria-label="Filter workflows"
                  value={workflowFilter}
                  onChange={(e) =>
                    setWorkflowFilter(e.target.value as 'all' | 'enrichment' | 'review')
                  }
                >
                  <option value="all">All</option>
                  <option value="enrichment">Enrichment</option>
                  <option value="review">Review</option>
                </Select>
                <button
                  type="button"
                  className={styles.iconAction}
                  aria-label="Hide workflows column"
                  onClick={() => setWorkflowsOpen(false)}
                >
                  <X size={15} aria-hidden />
                </button>
              </div>
            </div>

            <div className={styles.subPanel}>
              <h2 className={styles.subPanelTitle}>Workflow health</h2>
              <div className={styles.healthBar} aria-hidden>
                <span className={styles.healthSegReview} />
                <span className={styles.healthSegEnrich} />
                <span className={styles.healthSegWait} />
              </div>
              <div className={styles.healthLegend}>
                <div className={styles.healthStat}>
                  <span>Review</span>
                  <strong>6.8 h · 14%</strong>
                </div>
                <div className={styles.healthStat}>
                  <span>Enrichment</span>
                  <strong>25.3 h · 52%</strong>
                </div>
                <div className={styles.healthStat}>
                  <span>Waiting</span>
                  <strong>16.5 h · 34%</strong>
                </div>
              </div>
            </div>

            <div className={styles.subPanel}>
              <div className={styles.subPanelTitleRow}>
                <h2 className={styles.subPanelTitle}>Step cycle time</h2>
                <span className={styles.subPanelMeta}>hours · last 14 days</span>
              </div>

              <div className={styles.legendItems}>
                <span className={styles.legendItem}>
                  <span className={cx(styles.dotSwatch, styles.dotReview)} aria-hidden />
                  Hands-on
                </span>
                <span className={styles.legendItem}>
                  <span className={cx(styles.dotSwatch, styles.dotProjected)} aria-hidden />
                  Waiting
                </span>
              </div>

              <div className={styles.cycleChart}>
                <div className={styles.cycleYAxis} aria-hidden>
                  <span>36h</span>
                  <span>24h</span>
                  <span>12h</span>
                  <span>0h</span>
                </div>
                <div className={styles.cycleBarsWrap}>
                  <div className={styles.cycleBars} role="img" aria-label="14-day step cycle time chart">
                    {CYCLE_TIME_BARS.map((bar) => (
                      <div key={bar.id} className={styles.cycleCol}>
                        <span
                          className={styles.cycleSegWait}
                          style={{ height: `${Math.round((bar.waiting / 36) * 100)}%` }}
                        />
                        <span
                          className={styles.cycleSegHands}
                          style={{ height: `${Math.round((bar.handsOn / 36) * 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className={styles.cycleXAxis} aria-hidden>
                    <span>Nov 2</span>
                    <span>Nov 6</span>
                    <span>Nov 10</span>
                    <span>Nov 14</span>
                  </div>
                </div>
              </div>

              <div className={styles.cycleMetrics}>
                <div className={styles.cycleMetric}>
                  <strong>9.4 h</strong>
                  <span>Avg cycle</span>
                </div>
                <div className={styles.cycleMetric}>
                  <strong>2 h</strong>
                  <span>Fastest</span>
                </div>
                <div className={styles.cycleMetric}>
                  <strong>31 h</strong>
                  <span>Slowest</span>
                </div>
              </div>
            </div>

            <div className={styles.subPanel}>
              <div className={styles.subPanelTitleRow}>
                <h2 className={styles.subPanelTitle}>Workflow status</h2>
                <ChevronUp size={15} aria-hidden />
              </div>
              <span className={styles.subPanelMeta}>Started Sep 24, 2024 · 12:39 AM</span>

              <div className={styles.stepProgressRow}>
                <span>
                  Step { Math.min(steps.length, completedStepsCount + 1) } of {steps.length}
                </span>
                <strong>{Math.round((completedStepsCount / steps.length) * 100)}%</strong>
              </div>

              <div className={styles.stepSegments} aria-hidden>
                {steps.map((st) => (
                  <span
                    key={st.id}
                    className={cx(
                      styles.stepSeg,
                      st.status === 'completed' && styles.stepSegDone,
                    )}
                  />
                ))}
              </div>

              <ol className={styles.stepList}>
                {steps.slice(0, 4).map((st) => (
                  <li key={st.id} className={styles.stepItem}>
                    <div className={styles.stepTitleRow}>
                      {st.status === 'completed' ? (
                        <span className={styles.stepBadgeDone} aria-hidden>
                          <Check size={14} aria-hidden />
                        </span>
                      ) : st.status === 'current' ? (
                        <span className={styles.stepBadgeCurrent} aria-hidden>
                          {st.stepNumber}
                        </span>
                      ) : (
                        <span className={styles.stepBadgeUpcoming} aria-hidden>
                          {st.stepNumber}
                        </span>
                      )}
                      <span>{st.title}</span>
                    </div>

                    {st.approvalNote ? (
                      <div className={styles.approvalNote}>
                        <Avatar initials={st.approvalNote.initials} size="sm" />
                        <div>
                          <strong>{st.approvalNote.author}</strong> approved on{' '}
                          {st.approvalNote.timestamp} — “{st.approvalNote.comment}”
                        </div>
                      </div>
                    ) : null}

                    {st.status === 'current' && st.assignee ? (
                      <div className={styles.activeStepBox}>
                        <div className={styles.assigneeRow}>
                          <div className={styles.assigneeInfo}>
                            <Avatar initials={st.assignee.initials} size="sm" />
                            <div>
                              <span className={styles.assigneeRoleLabel}>Assignee</span>
                              <strong>{st.assignee.name}</strong>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toast({
                                title: 'Step reassigned',
                                description: 'Moved to merchandising queue.',
                              })
                            }
                          >
                            Unassign
                          </Button>
                        </div>

                        <Input
                          aria-label="Step approval comment"
                          value={stepComment}
                          onChange={(e) => setStepComment(e.target.value)}
                          placeholder="Type comment (required)"
                        />

                        <div className={styles.stepBtnRow}>
                          <Button
                            size="sm"
                            icon={<X size={14} aria-hidden />}
                            onClick={handleRejectStep}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<Check size={14} aria-hidden />}
                            onClick={handleApproveStep}
                          >
                            Approve step
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        ) : null}
      </div>

      {/* Add attribute value modal */}
      <Modal
        open={Boolean(valueModalAttr)}
        onClose={() => setValueModalAttr(null)}
        width="sm"
        title={valueModalAttr ? `Set ${valueModalAttr.label}` : 'Set attribute'}
        description="Assign an enriched attribute value for syndication."
        footer={
          <>
            <Button onClick={() => setValueModalAttr(null)}>Cancel</Button>
            <Button variant="primary" disabled={!valueDraft.trim()} onClick={handleSaveValue}>
              Save value
            </Button>
          </>
        }
      >
        <div className={styles.formStack}>
          <FormField label={valueModalAttr?.label ?? 'Value'}>
            {(id) => (
              <Input
                id={id}
                value={valueDraft}
                onChange={(e) => setValueDraft(e.target.value)}
                placeholder="e.g. Women · Relaxed fit"
              />
            )}
          </FormField>
        </div>
      </Modal>

      {/* Edit product details modal */}
      <Modal
        open={editDetailsOpen}
        onClose={() => setEditDetailsOpen(false)}
        width="sm"
        title="Edit product details"
        description="Update master catalog title, SKU code and subtitle."
        footer={
          <>
            <Button onClick={() => setEditDetailsOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!detailsDraft.title.trim() || !detailsDraft.sku.trim()}
              onClick={handleSaveDetails}
            >
              Save changes
            </Button>
          </>
        }
      >
        <div className={styles.formStack}>
          <FormField label="Product title">
            {(id) => (
              <Input
                id={id}
                value={detailsDraft.title}
                onChange={(e) => setDetailsDraft({ ...detailsDraft, title: e.target.value })}
              />
            )}
          </FormField>
          <FormField label="SKU">
            {(id) => (
              <Input
                id={id}
                value={detailsDraft.sku}
                onChange={(e) => setDetailsDraft({ ...detailsDraft, sku: e.target.value })}
              />
            )}
          </FormField>
          <FormField label="Subtitle">
            {(id) => (
              <Input
                id={id}
                value={detailsDraft.subtitle}
                onChange={(e) => setDetailsDraft({ ...detailsDraft, subtitle: e.target.value })}
              />
            )}
          </FormField>
        </div>
      </Modal>
    </Page>
  );
};
