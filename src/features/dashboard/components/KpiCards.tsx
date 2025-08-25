import { useTranslation } from 'react-i18next';
import { Building, Users, Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';
import type { KPIData } from '@/features/core/types';
import { TrendIndicator } from './TrendIndicator';

interface KPIDataWithTrends extends KPIData {
  previousActiveProperties?: number;
  previousNewLeads?: number;
  previousWeeklyVisits?: number;
  previousConversionRate?: number;
  previousRevenue?: number;
  previousAvgDaysToClose?: number;
}

interface KpiCardsProps {
  data?: KPIDataWithTrends;
  loading?: boolean;
}

export function KpiCards({ data, loading }: KpiCardsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      key: 'activeProperties',
      label: t('analytics.activeProperties'),
      value: data?.activeProperties || 0,
      previousValue: data?.previousActiveProperties || 0,
      icon: Building,
      color: 'text-blue-600 dark:text-blue-400',
      format: 'number' as const
    },
    {
      key: 'newLeads',
      label: t('analytics.newLeads'),
      value: data?.newLeads || 0,
      previousValue: data?.previousNewLeads || 0,
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      format: 'number' as const
    },
    {
      key: 'weeklyVisits',
      label: t('analytics.weeklyVisits'),
      value: data?.weeklyVisits || 0,
      previousValue: data?.previousWeeklyVisits || 0,
      icon: Calendar,
      color: 'text-orange-600 dark:text-orange-400',
      format: 'number' as const
    },
    {
      key: 'conversionRate',
      label: t('analytics.conversionRate'),
      value: data?.conversionRate || 0,
      previousValue: data?.previousConversionRate || 0,
      displayValue: `${data?.conversionRate || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      format: 'percentage' as const
    },
    {
      key: 'revenue',
      label: t('analytics.revenue'),
      value: data?.revenue || 0,
      previousValue: data?.previousRevenue || 0,
      displayValue: `€${(data?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      format: 'currency' as const
    },
    {
      key: 'avgDaysToClose',
      label: t('analytics.avgDaysToClose'),
      value: data?.avgDaysToClose || 0,
      previousValue: data?.previousAvgDaysToClose || 0,
      displayValue: `${data?.avgDaysToClose || 0} days`,
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      format: 'number' as const
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 dark:bg-gray-700 h-12 w-12 rounded-lg"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-6 w-16 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map(card => {
        const Icon = card.icon;
        
        return (
          <div 
            key={card.key} 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${card.color} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.displayValue || card.value}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <TrendIndicator
                  value={card.value}
                  previousValue={card.previousValue}
                  format={card.format}
                  className="justify-end"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}