import { type Tone } from '../../data';

export type ActivityRange = 'day' | 'week' | 'month';
export type ProductSectionTab = 'summary' | 'attributes' | 'assets' | 'variants';
export type AttributeFilter = 'all' | 'required' | 'missing' | 'localized' | 'edited';
export type DotStatus = 'approved' | 'review' | 'needs-info' | 'projected' | 'empty';

export type ProductAttribute = {
  id: string;
  group: 'general' | 'specifications';
  label: string;
  value: string;
  required?: boolean;
  locales?: string[];
  missing?: boolean;
  editedThisWeek?: boolean;
  kind?: 'text' | 'swatches' | 'sizes';
  swatches?: Array<{ label: string; tone: 'brown' | 'beige' }>;
  sizes?: string[];
};

export type CycleBar = {
  id: string;
  dateLabel?: string;
  handsOn: number;
  waiting: number;
};

export type WorkflowStep = {
  id: string;
  stepNumber: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  approvalNote?: {
    author: string;
    initials: string;
    timestamp: string;
    comment: string;
  };
  assignee?: {
    name: string;
    initials: string;
  };
};

export type ProductRecord = {
  id: string;
  breadcrumb: string;
  sku: string;
  title: string;
  subtitle: string;
  kpiScore: number;
  kpiTotal: number;
  productId: string;
  gtin: string;
  parentCode: string;
  taxonomy: string[];
  ownerName: string;
  ownerInitials: string;
  updatesTotal: string;
  updatesDelta: string;
  projectedDelta: string;
  attributes: ProductAttribute[];
};

export const PRODUCTS_CATALOG: ProductRecord[] = [
  {
    id: 'prod-1',
    breadcrumb: 'French Terry Print Loose T-shirt',
    sku: 'TS43892B',
    title: 'French Terry Adidas Loose Brown T-shirt forWomen',
    subtitle: 'Brown and Beige · Sports Version',
    kpiScore: 5,
    kpiTotal: 10,
    productId: '#4533225677765',
    gtin: '937737828847676',
    parentCode: 'TS43892B',
    taxonomy: ['Women Clothing', 'Watches', 'Dresses'],
    ownerName: 'Jessica James',
    ownerInitials: 'JJ',
    updatesTotal: '1,284',
    updatesDelta: '+16.3%',
    projectedDelta: '+16% projected next 2 weeks',
    attributes: [
      {
        id: 'product-name',
        group: 'general',
        label: 'Product name',
        value: 'French Terry Adidas Loose Brown T-shirt forWomen',
        required: true,
        locales: ['EN', 'FR', 'DE'],
        editedThisWeek: true,
      },
      {
        id: 'brand',
        group: 'general',
        label: 'Brand',
        value: 'Adidas',
        required: true,
      },
      {
        id: 'category',
        group: 'general',
        label: 'Category',
        value: 'Women Clothing › Tops › T-shirts',
        required: true,
        locales: ['EN', 'FR'],
      },
      {
        id: 'gender',
        group: 'general',
        label: 'Gender',
        value: 'NA',
        missing: true,
      },
      {
        id: 'collection',
        group: 'general',
        label: 'Collection',
        value: 'Brown and Beige Line',
        editedThisWeek: true,
      },
      {
        id: 'season',
        group: 'general',
        label: 'Season',
        value: 'FW 2026',
      },
      {
        id: 'color',
        group: 'specifications',
        label: 'Color',
        value: 'Brown, Beige',
        required: true,
        kind: 'swatches',
        swatches: [
          { label: 'Brown', tone: 'brown' },
          { label: 'Beige', tone: 'beige' },
        ],
        editedThisWeek: true,
      },
      {
        id: 'sizes',
        group: 'specifications',
        label: 'Sizes',
        value: 'XS, S, M, L, XL, XXL',
        required: true,
        kind: 'sizes',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      {
        id: 'material',
        group: 'specifications',
        label: 'Material',
        value: 'French terry · 70% cotton, 30% polyester',
        required: true,
        locales: ['EN', 'FR', 'DE'],
        editedThisWeek: true,
      },
      {
        id: 'fit',
        group: 'specifications',
        label: 'Fit',
        value: 'NA',
        missing: true,
      },
      {
        id: 'care',
        group: 'specifications',
        label: 'Care instructions',
        value: 'Machine wash cold · tumble dry low',
        required: true,
        locales: ['EN', 'DE'],
      },
      {
        id: 'origin',
        group: 'specifications',
        label: 'Country of origin',
        value: 'Portugal',
        required: true,
      },
    ],
  },
  {
    id: 'prod-2',
    breadcrumb: 'Merino Ribbed Crewneck Knit',
    sku: 'KN20419M',
    title: 'Merino Wool Ribbed Studio Crewneck Sweater',
    subtitle: 'Oatmeal Melange · Winter Capsule',
    kpiScore: 8,
    kpiTotal: 10,
    productId: '#4533225678102',
    gtin: '937737828849120',
    parentCode: 'KN20419M',
    taxonomy: ['Women Clothing', 'Knitwear', 'Essentials'],
    ownerName: 'Jessica James',
    ownerInitials: 'JJ',
    updatesTotal: '942',
    updatesDelta: '+11.8%',
    projectedDelta: '+12% projected next 2 weeks',
    attributes: [
      {
        id: 'product-name',
        group: 'general',
        label: 'Product name',
        value: 'Merino Wool Ribbed Studio Crewneck Sweater',
        required: true,
        locales: ['EN', 'FR', 'DE'],
        editedThisWeek: true,
      },
      {
        id: 'brand',
        group: 'general',
        label: 'Brand',
        value: 'Acme Studio',
        required: true,
      },
      {
        id: 'category',
        group: 'general',
        label: 'Category',
        value: 'Women Clothing › Knitwear › Crewnecks',
        required: true,
      },
      {
        id: 'gender',
        group: 'general',
        label: 'Gender',
        value: 'Women',
        required: true,
      },
      {
        id: 'collection',
        group: 'general',
        label: 'Collection',
        value: 'Winter Capsule',
      },
      {
        id: 'season',
        group: 'general',
        label: 'Season',
        value: 'FW 2026',
      },
      {
        id: 'color',
        group: 'specifications',
        label: 'Color',
        value: 'Beige',
        required: true,
        kind: 'swatches',
        swatches: [{ label: 'Beige', tone: 'beige' }],
      },
      {
        id: 'sizes',
        group: 'specifications',
        label: 'Sizes',
        value: 'XS, S, M, L, XL',
        required: true,
        kind: 'sizes',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
      },
      {
        id: 'material',
        group: 'specifications',
        label: 'Material',
        value: '100% Australian extrafine merino wool',
        required: true,
        locales: ['EN', 'FR', 'DE'],
      },
      {
        id: 'fit',
        group: 'specifications',
        label: 'Fit',
        value: 'Relaxed studio fit',
      },
    ],
  },
];

// 32 columns × 6 rows (top to bottom) representing the dot-matrix enrichment chart.
// Columns 0..20 are historical through Today (col 20); columns 21..31 are projected.
export const ENRICHMENT_MATRIX_COLS = 32;
export const ENRICHMENT_TODAY_COL = 20;

export const buildEnrichmentMatrix = (range: ActivityRange): DotStatus[][] => {
  const rows = 6;
  const cols = ENRICHMENT_MATRIX_COLS;
  const shift = range === 'day' ? 1 : range === 'month' ? 2 : 0;

  // Active heights (1..6) for columns 0..20
  const heights = [3, 4, 3, 5, 4, 3, 5, 6, 4, 3, 4, 5, 6, 5, 6, 6, 5, 6, 4, 3, 2];

  const grid: DotStatus[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 'empty' as DotStatus),
  );

  for (let c = 0; c < cols; c += 1) {
    if (c > ENRICHMENT_TODAY_COL) {
      for (let r = 0; r < rows; r += 1) {
        grid[r][c] = 'projected';
      }
      continue;
    }
    const h = Math.max(1, Math.min(rows, heights[(c + shift) % heights.length]));
    for (let r = 0; r < rows; r += 1) {
      const fromBottom = rows - 1 - r;
      if (fromBottom >= h) {
        grid[r][c] = 'empty';
      } else if (fromBottom === 0 || (fromBottom === 1 && c % 2 === 0)) {
        grid[r][c] = 'review';
      } else if (fromBottom === h - 1 && c % 5 === 1) {
        grid[r][c] = 'needs-info';
      } else {
        grid[r][c] = 'approved';
      }
    }
  }

  return grid;
};

export const CYCLE_TIME_BARS: CycleBar[] = [
  { id: 'c1', dateLabel: 'Nov 2', handsOn: 7, waiting: 8 },
  { id: 'c2', handsOn: 5, waiting: 7 },
  { id: 'c3', handsOn: 6, waiting: 9 },
  { id: 'c4', handsOn: 8, waiting: 6 },
  { id: 'c5', handsOn: 5, waiting: 8 },
  { id: 'c6', handsOn: 7, waiting: 7 },
  { id: 'c7', dateLabel: 'Nov 6', handsOn: 9, waiting: 8 },
  { id: 'c8', handsOn: 6, waiting: 9 },
  { id: 'c9', handsOn: 11, waiting: 12 },
  { id: 'c10', handsOn: 15, waiting: 14 },
  { id: 'c11', handsOn: 12, waiting: 19 },
  { id: 'c12', handsOn: 9, waiting: 14 },
  { id: 'c13', handsOn: 8, waiting: 12 },
  { id: 'c14', dateLabel: 'Nov 10', handsOn: 6, waiting: 10 },
  { id: 'c15', handsOn: 5, waiting: 8 },
  { id: 'c16', handsOn: 6, waiting: 7 },
  { id: 'c17', handsOn: 5, waiting: 6 },
  { id: 'c18', handsOn: 6, waiting: 9 },
  { id: 'c19', handsOn: 8, waiting: 11 },
  { id: 'c20', handsOn: 9, waiting: 8 },
  { id: 'c21', dateLabel: 'Nov 14', handsOn: 7, waiting: 9 },
  { id: 'c22', handsOn: 6, waiting: 8 },
  { id: 'c23', handsOn: 8, waiting: 10 },
  { id: 'c24', handsOn: 5, waiting: 9 },
];

export const INITIAL_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Parent Item Creation',
    status: 'completed',
    approvalNote: {
      author: 'Jessica Rachel',
      initials: 'JR',
      timestamp: 'Nov 18, 2024 · 5:20 PM',
      comment: 'Workflow updated',
    },
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Review & Approval',
    status: 'completed',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Ready for Copy',
    status: 'completed',
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'Marketing Enrichment',
    status: 'current',
    assignee: {
      name: 'Jessica Rachel (You)',
      initials: 'JR',
    },
  },
  {
    id: 'step-5',
    stepNumber: 5,
    title: 'Regional Translation QA',
    status: 'upcoming',
  },
  {
    id: 'step-6',
    stepNumber: 6,
    title: 'Merchandising Sign-off',
    status: 'upcoming',
  },
  {
    id: 'step-7',
    stepNumber: 7,
    title: 'Channel Syndication',
    status: 'upcoming',
  },
];

export const PRODUCT_ASSETS = [
  { id: 'as-1', label: 'Front studio shot', format: 'WEBP · 2400×3000', size: '1.4 MB', tone: 'peach' as Tone },
  { id: 'as-2', label: 'Back studio shot', format: 'WEBP · 2400×3000', size: '1.2 MB', tone: 'lemon' as Tone },
  { id: 'as-3', label: 'Collar & sleeve detail', format: 'WEBP · 1800×1800', size: '890 KB', tone: 'mint' as Tone },
  { id: 'as-4', label: 'Fabric macro texture', format: 'WEBP · 1800×1800', size: '940 KB', tone: 'lavender' as Tone },
  { id: 'as-5', label: 'Full outfit lookbook', format: 'WEBP · 2400×3000', size: '1.6 MB', tone: 'sky' as Tone },
];

export const PRODUCT_VARIANTS = [
  { sku: 'TS43892B-XS', size: 'XS', color: 'Brown / Beige', stock: 42, status: 'Active' },
  { sku: 'TS43892B-S', size: 'S', color: 'Brown / Beige', stock: 118, status: 'Active' },
  { sku: 'TS43892B-M', size: 'M', color: 'Brown / Beige', stock: 164, status: 'Active' },
  { sku: 'TS43892B-L', size: 'L', color: 'Brown / Beige', stock: 89, status: 'Active' },
  { sku: 'TS43892B-XL', size: 'XL', color: 'Brown / Beige', stock: 31, status: 'Low stock' },
  { sku: 'TS43892B-XXL', size: 'XXL', color: 'Brown / Beige', stock: 14, status: 'Low stock' },
];
