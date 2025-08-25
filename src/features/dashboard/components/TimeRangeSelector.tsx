import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useTranslation } from 'react-i18next';

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange, customStart?: Date, customEnd?: Date) => void;
  className?: string;
}

export function TimeRangeSelector({ value, onChange, className = '' }: TimeRangeSelectorProps) {
  const { t } = useTranslation();
  const [showCustom, setShowCustom] = useState(false);

  const ranges = [
    { value: '7d' as TimeRange, label: 'Last 7 days' },
    { value: '30d' as TimeRange, label: 'Last 30 days' },
    { value: '90d' as TimeRange, label: 'Last 90 days' },
    { value: '1y' as TimeRange, label: 'Last year' },
    { value: 'custom' as TimeRange, label: 'Custom range' },
  ];

  const handleRangeChange = (newRange: TimeRange) => {
    if (newRange === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onChange(newRange);
    }
  };

  const handleCustomRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    onChange('custom', startDate, endDate);
    setShowCustom(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      
      <Select
        value={value}
        onChange={(e) => handleRangeChange(e.target.value as TimeRange)}
        className="min-w-32"
      >
        {ranges.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </Select>

      {showCustom && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            onChange={(e) => {
              const endInput = e.target.parentElement?.querySelector('input[type="date"]:last-child') as HTMLInputElement;
              if (endInput?.value) {
                handleCustomRange(e.target.value, endInput.value);
              }
            }}
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            onChange={(e) => {
              const startInput = e.target.parentElement?.querySelector('input[type="date"]:first-child') as HTMLInputElement;
              if (startInput?.value) {
                handleCustomRange(startInput.value, e.target.value);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}