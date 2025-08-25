import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function MetricCard({ title, value, icon: Icon, trend, color = 'primary' }: MetricCardProps) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100 dark:bg-primary-900/20',
    success: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    error: 'text-red-600 bg-red-100 dark:bg-red-900/20'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className={trend.isPositive ? '↗' : '↘'}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}