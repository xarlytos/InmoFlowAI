import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked = false, onChange, label, size = 'md', disabled, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    const sizeClasses = {
      sm: {
        switch: 'h-4 w-7',
        thumb: 'h-3 w-3',
        translate: 'translate-x-3'
      },
      md: {
        switch: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'translate-x-4'
      },
      lg: {
        switch: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'translate-x-5'
      }
    };

    const sizes = sizeClasses[size];

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.checked);
    };

    return (
      <div className="flex items-center">
        {label && (
          <label
            htmlFor={switchId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3 cursor-pointer"
          >
            {label}
          </label>
        )}
        <div className="relative inline-block">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              'relative rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 cursor-pointer',
              sizes.switch,
              checked 
                ? 'bg-primary-600' 
                : 'bg-gray-300 dark:bg-gray-600',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            onClick={() => !disabled && onChange?.(!checked)}
          >
            <span
              className={cn(
                'inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                sizes.thumb,
                checked ? sizes.translate : 'translate-x-0'
              )}
            />
          </div>
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';