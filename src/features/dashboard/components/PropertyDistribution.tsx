import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Home, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

interface PropertyType {
  name: string;
  value: number;
  color: string;
  change: number;
}

interface PropertyDistributionProps {
  className?: string;
}

export function PropertyDistribution({ className = '' }: PropertyDistributionProps) {
  const { t } = useTranslation();

  const mockData: PropertyType[] = [
    {
      name: 'Apartments',
      value: 45,
      color: '#3B82F6', // Blue
      change: 12.5
    },
    {
      name: 'Houses',
      value: 25,
      color: '#10B981', // Green
      change: -5.2
    },
    {
      name: 'Condos',
      value: 15,
      color: '#F59E0B', // Yellow
      change: 8.7
    },
    {
      name: 'Penthouses',
      value: 8,
      color: '#EF4444', // Red
      change: 15.3
    },
    {
      name: 'Studios',
      value: 7,
      color: '#8B5CF6', // Purple
      change: -2.1
    }
  ];

  const { data: distributionData = mockData } = useQuery({
    queryKey: ['propertyDistribution'],
    queryFn: async () => {
      // In real app: const response = await fetch('/api/analytics/property-distribution');
      // return response.json();
      return mockData;
    }
  });

  const totalProperties = distributionData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-gray-300">
            {data.value} properties ({((data.value / totalProperties) * 100).toFixed(1)}%)
          </p>
          <p className={`text-xs ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}% vs last month
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('misc.properties')}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with Details */}
        <div className="space-y-4">
          <div className="text-center lg:text-left">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalProperties}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('misc.totalProperties')}
            </div>
          </div>

          <div className="space-y-3">
            {distributionData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.value} properties
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {((item.value / totalProperties) * 100).toFixed(1)}%
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    item.change >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    <TrendingUp className={`h-3 w-3 ${
                      item.change < 0 ? 'rotate-180' : ''
                    }`} />
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {distributionData.filter(item => item.change > 0).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('misc.growingSegments')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('misc.studios')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('misc.topCategory')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}