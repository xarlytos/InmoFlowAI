import { clsx } from 'clsx';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  onClick?: (event: React.MouseEvent) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

export function Checkbox({ 
  checked, 
  onChange, 
  onCheckedChange,
  onClick,
  label, 
  disabled = false, 
  className,
  size = 'md',
  indeterminate = false
}: CheckboxProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const checkSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleChange = (newChecked: boolean) => {
    onChange?.(newChecked);
    onCheckedChange?.(newChecked);
  };

  return (
    <label className={clsx(
      'inline-flex items-center gap-2 cursor-pointer',
      disabled && 'cursor-not-allowed opacity-50',
      className
    )}
    onClick={onClick}
    >
      <div className={clsx(
        'relative flex items-center justify-center border-2 rounded transition-colors',
        sizeClasses[size],
        (checked || indeterminate)
          ? 'bg-primary-600 border-primary-600' 
          : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600',
        !disabled && 'hover:border-primary-500',
        disabled && 'cursor-not-allowed'
      )}>
        {indeterminate ? (
          <Minus 
            className={clsx(
              'text-white transition-opacity',
              checkSizeClasses[size]
            )} 
          />
        ) : checked && (
          <Check 
            className={clsx(
              'text-white transition-opacity',
              checkSizeClasses[size]
            )} 
          />
        )}
      </div>
      
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      
      {label && (
        <span className="text-sm text-gray-900 dark:text-white select-none">
          {label}
        </span>
      )}
    </label>
  );
}