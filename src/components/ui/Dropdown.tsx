import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export function Dropdown({ 
  options, 
  value, 
  placeholder = "Select an option", 
  onChange, 
  disabled = false,
  className,
  size = 'md',
  children
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      {children ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)}>
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            'w-full flex items-center justify-between border rounded-lg bg-white dark:bg-gray-700',
            'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            sizeClasses[size],
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'hover:border-gray-400 dark:hover:border-gray-500'
          )}
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className={!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''}>
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronDown 
            className={clsx(
              'h-4 w-4 transition-transform',
              isOpen && 'transform rotate-180'
            )} 
          />
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-left text-sm',
                'hover:bg-gray-50 dark:hover:bg-gray-600',
                'text-gray-900 dark:text-white',
                value === option.value && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}