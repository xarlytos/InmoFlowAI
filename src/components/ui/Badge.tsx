import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'solid' | 'active' | 'draft' | 'reserved' | 'sold' | 'rented' | 'new' | 'qualified' | 'visiting' | 'offer' | 'won' | 'lost' | 'scheduled' | 'done' | 'no_show' | 'canceled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-300',
    outline: 'border border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    solid: 'bg-primary-600 text-white dark:bg-primary-500',
    
    // Property statuses
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    sold: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    rented: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    
    // Lead stages
    new: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    qualified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    visiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    offer: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    won: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    
    // Visit statuses
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    done: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    no_show: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    canceled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-medium',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
}