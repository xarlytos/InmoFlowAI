import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      
      {action && (
        <Button
          onClick={action.onClick}
          className="inline-flex items-center gap-2"
        >
          {action.icon || <Plus className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}