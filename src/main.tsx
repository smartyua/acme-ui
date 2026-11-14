import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Shell } from './layout/Shell';
import { AppProvider } from './lib/app';
import { ActivityPage } from './pages/ActivityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { BessPage } from './pages/Bess/BessPage';
import { ComponentsPage } from './pages/Components/ComponentsPage';
import { CustomersPage } from './pages/CustomersPage';
import { FinancePage } from './pages/Finance/FinancePage';
import { HelpPage } from './pages/HelpPage';
import { NotFoundPage, SignedOutPage } from './pages/SystemPages';
import { NotificationsPage } from './pages/NotificationsPage';
import { OrdersPage } from './pages/OrdersPage';
import { OverviewPage } from './pages/OverviewPage';
import { PatternsPage } from './pages/PatternsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { RequestsPage } from './pages/RequestsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { TrafficPage } from './pages/Traffic/TrafficPage';
import { TopologyPage } from './pages/Topology/TopologyPage';
import './styles/globals.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signed-out" element={<SignedOutPage />} />
          <Route element={<Shell />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
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
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
);
