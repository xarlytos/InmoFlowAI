import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function RecentPublications() {
  const { t } = useTranslation();

  const { data: publications = [] } = useQuery({
    queryKey: ['publications', 'recent'],
    queryFn: async () => {
      const response = await fetch('/api/publishing/status');
      return response.json();
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Publications
      </h3>
      
      {publications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No recent publications
        </p>
      ) : (
        <div className="space-y-3">
          {publications.slice(0, 5).map((pub: any) => (
            <div key={pub.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(pub.status)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {pub.portal}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Property {pub.propertyId.slice(0, 8)}...
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getStatusColor(pub.status)}`}>
                  {pub.status}
                </span>
                {pub.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(pub.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}