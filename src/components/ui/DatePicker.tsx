import { useState } from 'react';
import { clsx } from 'clsx';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  disabled = false,
  className,
  clearable = true
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = value || today;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { days, currentMonth: firstDay, lastDay };
  };

  const { days, currentMonth } = generateCalendarDays();

  return (
    <div className={clsx('relative', className)}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2 border rounded-lg',
          'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600',
          'text-gray-900 dark:text-white cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-gray-400 dark:hover:border-gray-500'
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className={!value ? 'text-gray-500 dark:text-gray-400' : ''}>
            {value ? formatDate(value) : placeholder}
          </span>
        </div>
        {clearable && value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isSelected = value && day.toDateString() === value.toDateString();
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    onChange(day);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'h-8 w-8 flex items-center justify-center text-sm rounded',
                    isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500',
                    isSelected && 'bg-primary-600 text-white',
                    !isSelected && isToday && 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
                    !isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-600'
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}