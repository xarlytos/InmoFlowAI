import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { KpiCards } from '../components/KpiCards';
import { FunnelChart } from '../components/FunnelChart';
import { ActivityChart } from '../components/ActivityChart';
import { RecentPublications } from '../components/RecentPublications';
import { TimeRangeSelector, type TimeRange } from '../components/TimeRangeSelector';
import { QuickActions } from '../components/QuickActions';
import { NotificationCenter } from '../components/NotificationCenter';
import { GoalsProgress } from '../components/GoalsProgress';
import { TopPerformers } from '../components/TopPerformers';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { PropertyDistribution } from '../components/PropertyDistribution';
import { RevenueAreaChart } from '../components/RevenueAreaChart';

export function DashboardPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [customRange, setCustomRange] = useState<{ start?: Date; end?: Date }>({});

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['analytics', 'kpis', timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({ range: timeRange });
      if (timeRange === 'custom' && customRange.start && customRange.end) {
        params.append('start', customRange.start.toISOString());
        params.append('end', customRange.end.toISOString());
      }
      // Mock data with trends
      return {
        activeProperties: 127,
        previousActiveProperties: 115,
        newLeads: 48,
        previousNewLeads: 42,
        weeklyVisits: 23,
        previousWeeklyVisits: 19,
        conversionRate: 12.5,
        previousConversionRate: 11.2,
        revenue: 84500,
        previousRevenue: 72300,
        avgDaysToClose: 28,
        previousAvgDaysToClose: 32
      };
    }
  });

  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['analytics', 'funnel', timeRange],
    queryFn: async () => {
      // Mock funnel data
      return [
        { stage: 'inquiry', count: 150 },
        { stage: 'qualified', count: 89 },
        { stage: 'viewing', count: 54 },
        { stage: 'negotiating', count: 28 },
        { stage: 'closed', count: 15 }
      ];
    }
  });

  const handleTimeRangeChange = (range: TimeRange, start?: Date, end?: Date) => {
    setTimeRange(range);
    if (range === 'custom' && start && end) {
      setCustomRange({ start, end });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header with Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('navigation.dashboard')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('misc.dashboardOverview')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <TimeRangeSelector
                value={timeRange}
                onChange={handleTimeRangeChange}
              />
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* KPI Cards with Animations */}
        <div className="animate-fadeIn">
          <KpiCards data={kpis} loading={kpisLoading} />
        </div>

        {/* First Row: Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="xl:col-span-2">
            <RevenueAreaChart />
          </div>
          <div>
            <PropertyDistribution />
          </div>
        </div>

        {/* Second Row: Funnel and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <FunnelChart data={funnelData} loading={funnelLoading} />
          <ActivityChart />
        </div>

        {/* Third Row: Goals and Top Performers */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <GoalsProgress />
          <TopPerformers />
        </div>

        {/* Fourth Row: Heatmap and Recent Publications */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '800ms' }}>
          <div className="xl:col-span-2">
            <ActivityHeatmap />
          </div>
          <div>
            <RecentPublications />
          </div>
        </div>
      </div>

      {/* Quick Actions FAB */}
      <QuickActions />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}