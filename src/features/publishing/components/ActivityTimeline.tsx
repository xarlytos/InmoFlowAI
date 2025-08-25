import { CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  action: string;
  status: 'success' | 'error' | 'pending' | 'info';
  portal?: string;
  propertyTitle?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/10';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/10';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10';
      default:
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Actividad Reciente
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayedActivities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay actividad reciente
          </p>
        ) : (
          displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(activity.status)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(activity.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
                
                {(activity.portal || activity.propertyTitle) && (
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                    {activity.portal && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {activity.portal}
                      </span>
                    )}
                    {activity.propertyTitle && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {activity.propertyTitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {activities.length > maxItems && (
        <div className="mt-3 text-center">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver todas las actividades ({activities.length})
          </button>
        </div>
      )}
    </div>
  );
}