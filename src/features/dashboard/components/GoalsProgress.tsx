import { Target, TrendingUp, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  period: string;
  unit: string;
  category: 'revenue' | 'properties' | 'leads' | 'visits';
}

interface GoalsProgressProps {
  className?: string;
}

export function GoalsProgress({ className = '' }: GoalsProgressProps) {
  const { t } = useTranslation();

  const mockGoals: Goal[] = [
    {
      id: '1',
      title: 'Monthly Revenue',
      target: 50000,
      current: 32000,
      period: 'December 2024',
      unit: '€',
      category: 'revenue'
    },
    {
      id: '2',
      title: 'Properties Listed',
      target: 25,
      current: 18,
      period: 'This Month',
      unit: 'properties',
      category: 'properties'
    },
    {
      id: '3',
      title: 'New Leads',
      target: 100,
      current: 67,
      period: 'This Month',
      unit: 'leads',
      category: 'leads'
    },
    {
      id: '4',
      title: 'Property Visits',
      target: 80,
      current: 54,
      period: 'This Month',
      unit: 'visits',
      category: 'visits'
    }
  ];

  const { data: goals = mockGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      // In real app: const response = await fetch('/api/analytics/goals');
      // return response.json();
      return mockGoals;
    }
  });

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'revenue':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
      case 'properties':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'leads':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'visits':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '€') {
      return `€${value.toLocaleString()}`;
    }
    return `${value} ${unit}`;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Goals Progress
        </h3>
      </div>

      <div className="space-y-6">
        {goals.map((goal) => {
          const progressPercentage = getProgressPercentage(goal.current, goal.target);
          const isOnTrack = progressPercentage >= 70;

          return (
            <div key={goal.id} className="space-y-3">
              {/* Goal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                    <div className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {goal.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {goal.period}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatValue(goal.current, goal.unit)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      / {formatValue(goal.target, goal.unit)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp 
                      className={`h-3 w-3 ${
                        isOnTrack ? 'text-green-500' : 'text-red-500'
                      }`} 
                    />
                    <span 
                      className={`text-sm font-medium ${
                        isOnTrack 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0</span>
                  <span className="flex items-center gap-1">
                    Target: {formatValue(goal.target, goal.unit)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Goals on track:
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {goals.filter(g => getProgressPercentage(g.current, g.target) >= 70).length} / {goals.length}
          </span>
        </div>
      </div>
    </div>
  );
}