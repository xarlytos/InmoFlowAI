import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/features/auth/components/AuthGuard';

// Lazy load pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { PropertiesListPage } from '@/features/properties/pages/PropertiesListPage';
import { PropertyFormPage } from '@/features/properties/pages/PropertyFormPage';
import { PropertyDetailPage } from '@/features/properties/pages/PropertyDetailPage';
import { LeadsListPage } from '@/features/leads/pages/LeadsListPage';
import { LeadDetailPage } from '@/features/leads/pages/LeadDetailPage';
import { MatchingPage } from '@/features/matching/pages/MatchingPage';
import { ValuationPage } from '@/features/valuations/pages/ValuationPage';
import { SchedulePage } from '@/features/schedule/pages/SchedulePage';
import { PublishingPage } from '@/features/publishing/pages/PublishingPage';
import { MarketingPage } from '@/features/marketing/pages/MarketingPage';
import { ContractsPage } from '@/features/contracts/pages/ContractsPage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/auth/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'properties', element: <PropertiesListPage /> },
      { path: 'properties/new', element: <PropertyFormPage /> },
      { path: 'properties/:id', element: <PropertyDetailPage /> },
      { path: 'properties/:id/edit', element: <PropertyFormPage /> },
      { path: 'leads', element: <LeadsListPage /> },
      { path: 'leads/:id', element: <LeadDetailPage /> },
      { path: 'matching', element: <MatchingPage /> },
      { path: 'valuations', element: <ValuationPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'publishing', element: <PublishingPage /> },
      { path: 'marketing', element: <MarketingPage /> },
      { path: 'contracts', element: <ContractsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
]);