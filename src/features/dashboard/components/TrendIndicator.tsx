import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  format?: 'number' | 'percentage' | 'currency';
  showIcon?: boolean;
  className?: string;
}

export function TrendIndicator({ 
  value, 
  previousValue, 
  format = 'number', 
  showIcon = true,
  className = ''
}: TrendIndicatorProps) {
  const change = value - previousValue;
  const percentageChange = previousValue === 0 ? 0 : (change / previousValue) * 100;
  const isPositive = change >= 0;

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `€${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendColor = () => {
    if (change === 0) return 'text-gray-500 dark:text-gray-400';
    return isPositive 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && change !== 0 && (
        isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        )
      )}
      <span className={`text-sm font-medium ${getTrendColor()}`}>
        {change === 0 ? '0%' : `${isPositive ? '+' : ''}${percentageChange.toFixed(1)}%`}
      </span>
    </div>
  );
}