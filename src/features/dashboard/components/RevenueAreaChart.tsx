import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DollarSign, TrendingUp, Target, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
  previousYear: number;
}

interface RevenueAreaChartProps {
  className?: string;
}

export function RevenueAreaChart({ className = '' }: RevenueAreaChartProps) {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | '24m'>('12m');

  const generateMockData = (months: number): RevenueData[] => {
    const data: RevenueData[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      
      // Generate realistic revenue patterns
      const baseRevenue = 30000 + Math.random() * 20000;
      const seasonality = Math.sin((monthIndex / 12) * Math.PI * 2) * 5000;
      const trend = (months - i) * 1000; // Growing trend
      const revenue = Math.max(0, baseRevenue + seasonality + trend + (Math.random() - 0.5) * 10000);
      
      data.push({
        month: `${monthNames[monthIndex]} ${year.toString().slice(-2)}`,
        revenue: Math.round(revenue),
        target: Math.round(baseRevenue + trend + 5000), // Target slightly above average
        previousYear: Math.round(revenue * (0.8 + Math.random() * 0.3)) // Previous year with some variation
      });
    }
    
    return data;
  };

  const periodMonths = {
    '6m': 6,
    '12m': 12,
    '24m': 24
  };

  const { data: revenueData = generateMockData(periodMonths[selectedPeriod]) } = useQuery({
    queryKey: ['revenueChart', selectedPeriod],
    queryFn: async () => {
      // In real app: const response = await fetch(`/api/analytics/revenue?period=${selectedPeriod}`);
      // return response.json();
      return generateMockData(periodMonths[selectedPeriod]);
    }
  });

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTarget = revenueData.reduce((sum, item) => sum + item.target, 0);
  const totalPreviousYear = revenueData.reduce((sum, item) => sum + item.previousYear, 0);
  const growthRate = ((totalRevenue - totalPreviousYear) / totalPreviousYear) * 100;
  const targetAchievement = (totalRevenue / totalTarget) * 100;

  const formatCurrency = (value: number) => {
    return `€${(value / 1000).toFixed(0)}k`;
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white rounded-lg px-4 py-3 shadow-lg border border-gray-700">
          <p className="font-medium text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-300 capitalize">
                  {entry.dataKey === 'previousYear' ? 'Previous Year' : entry.dataKey}
                </span>
              </div>
              <span className="font-medium">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('misc.revenueTrends')}
          </h3>
        </div>
        
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {Object.keys(periodMonths).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as any)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPeriod === period
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">{t('misc.totalRevenue')}</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(totalRevenue)}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">{t('misc.growthRate')}</span>
          </div>
          <div className={`text-2xl font-bold ${
            growthRate >= 0 
              ? 'text-blue-900 dark:text-blue-100' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-purple-700 dark:text-purple-300">{t('misc.targetAchievement')}</span>
          </div>
          <div className={`text-2xl font-bold ${
            targetAchievement >= 100 
              ? 'text-purple-900 dark:text-purple-100' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {targetAchievement.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280"
              fontSize={12}
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tick={{ fill: '#6B7280' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={customTooltip} />
            
            <Area
              type="monotone"
              dataKey="previousYear"
              stroke="#9CA3AF"
              fill="url(#targetGradient)"
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Previous Year"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#F59E0B"
              fill="url(#targetGradient)"
              strokeWidth={2}
              fillOpacity={0.1}
              name="Target"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              fill="url(#revenueGradient)"
              strokeWidth={3}
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>{t('misc.actualRevenue')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>{t('misc.target')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-gray-400 rounded-full border-dashed"></div>
              <span>{t('misc.previousYear')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{t('misc.updatedDaily')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}