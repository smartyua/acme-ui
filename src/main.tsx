import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { getEmbedContext } from './embed';
import { Shell } from './layout/Shell';
import { AppProvider } from './lib/app';
import './styles/globals.scss';

const ActivityPage = lazy(() => import('./pages/ActivityPage').then((m) => ({ default: m.ActivityPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage').then((m) => ({ default: m.AuditLogPage })));
const BessPage = lazy(() => import('./pages/Bess/BessPage').then((m) => ({ default: m.BessPage })));
const CallsPage = lazy(() =>
  import('./pages/Calls/CallsPage').then((m) => ({ default: m.CallsPage })),
);
const ComponentsPage = lazy(() =>
  import('./pages/Components/ComponentsPage').then((m) => ({ default: m.ComponentsPage })),
);
const CustomersPage = lazy(() => import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const EstimatesPage = lazy(() =>
  import('./pages/Estimates/EstimatesPage').then((m) => ({ default: m.EstimatesPage })),
);
const FinancePage = lazy(() =>
  import('./pages/Finance/FinancePage').then((m) => ({ default: m.FinancePage })),
);
const HelpPage = lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })));
const HomePage = lazy(() => import('./pages/Home/HomePage').then((m) => ({ default: m.HomePage })));
const InsightsPage = lazy(() =>
  import('./pages/Insights/InsightsPage').then((m) => ({ default: m.InsightsPage })),
);
const IntegrationsPage = lazy(() =>
  import('./pages/Integrations/IntegrationsPage').then((m) => ({ default: m.IntegrationsPage })),
);
const NotFoundPage = lazy(() => import('./pages/SystemPages').then((m) => ({ default: m.NotFoundPage })));
const SignedOutPage = lazy(() => import('./pages/SystemPages').then((m) => ({ default: m.SignedOutPage })));
const NotificationsPage = lazy(() =>
  import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
);
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const OverviewPage = lazy(() => import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage })));
const PatternsPage = lazy(() => import('./pages/PatternsPage').then((m) => ({ default: m.PatternsPage })));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage })));
const ProductsPage = lazy(() =>
  import('./pages/Products/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ProjectsPage = lazy(() =>
  import('./pages/Projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const RequestsPage = lazy(() => import('./pages/RequestsPage').then((m) => ({ default: m.RequestsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage })));
const TrafficPage = lazy(() =>
  import('./pages/Traffic/TrafficPage').then((m) => ({ default: m.TrafficPage })),
);
const TopologyPage = lazy(() =>
  import('./pages/Topology/TopologyPage').then((m) => ({ default: m.TopologyPage })),
);
const VendorsPage = lazy(() =>
  import('./pages/Vendors/VendorsPage').then((m) => ({ default: m.VendorsPage })),
);

/** `/en/acme-ui` when served by kylypko.com, undefined standalone. */
const routerBasename = getEmbedContext()?.basename;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter basename={routerBasename}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/signed-out" element={<SignedOutPage />} />
            <Route element={<Shell />}>
              <Route index element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/estimates" element={<EstimatesPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/calls" element={<CallsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/traffic" element={<TrafficPage />} />
              <Route path="/bess" element={<BessPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/audit-log" element={<AuditLogPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/patterns" element={<PatternsPage />} />
              <Route path="/components" element={<ComponentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/topology" element={<TopologyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>,
);
