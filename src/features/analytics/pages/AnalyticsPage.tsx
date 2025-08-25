import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { KpiCards } from '@/features/dashboard/components/KpiCards';
import { FunnelChart } from '@/features/dashboard/components/FunnelChart';
import { ActivityChart } from '@/features/dashboard/components/ActivityChart';
import { PropertiesMap } from '../components/PropertiesMap';

export function AnalyticsPage() {
  const { t } = useTranslation();

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['analytics', 'kpis'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/kpis');
      return response.json();
    }
  });

  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/funnel');
      return response.json();
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('analytics.title')}
        subtitle="Comprehensive business analytics and insights"
      />

      <KpiCards data={kpis} loading={kpisLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart data={funnelData} loading={funnelLoading} />
        <ActivityChart />
      </div>

      <PropertiesMap properties={properties} />
    </div>
  );
}