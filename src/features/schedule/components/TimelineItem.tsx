import { format } from 'date-fns';
import { Clock, MapPin, User, CheckCircle, XCircle, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Visit, Property, Lead } from '@/features/core/types';

interface TimelineItemProps {
  visit: Visit;
  property?: Property;
  lead?: Lead;
  onStatusChange?: (visitId: string, status: Visit['status']) => void;
  onEdit?: (visit: Visit) => void;
}

const statusIcons = {
  scheduled: Circle,
  done: CheckCircle,
  no_show: XCircle,
  canceled: XCircle
};

const statusColors = {
  scheduled: 'blue',
  done: 'green',
  no_show: 'red',
  canceled: 'yellow'
} as const;

export function TimelineItem({ 
  visit, 
  property, 
  lead, 
  onStatusChange, 
  onEdit 
}: TimelineItemProps) {
  const StatusIcon = statusIcons[visit.status];
  const visitTime = new Date(visit.when);
  const now = new Date();
  const isPast = visitTime < now;
  const isUpcoming = !isPast && visitTime.getTime() - now.getTime() < 2 * 60 * 60 * 1000; // Next 2 hours

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
      isUpcoming ? 'border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/10' : 
      'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className={`rounded-full p-2 ${
          visit.status === 'done' ? 'bg-green-100 text-green-600' :
          visit.status === 'no_show' || visit.status === 'canceled' ? 'bg-red-100 text-red-600' :
          isUpcoming ? 'bg-primary-100 text-primary-600' :
          'bg-gray-100 text-gray-400'
        }`}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mt-2"></div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Time and Status */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className={isPast ? 'text-gray-500' : 'text-gray-900 dark:text-white'}>
                  {format(visitTime, 'HH:mm')}
                </span>
              </div>
              <Badge variant={visit.status} size="sm">
                {visit.status.replace('_', ' ')}
              </Badge>
              {isUpcoming && (
                <Badge variant="outline" size="sm" className="text-xs">
                  Upcoming
                </Badge>
              )}
            </div>

            {/* Lead and Property */}
            <div className="space-y-1 mb-3">
              {lead && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium truncate">
                    {lead.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">
                    {lead.email}
                  </span>
                </div>
              )}
              {property && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {property.title}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">
                    {property.address?.city}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            {visit.note && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {visit.note}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {visit.status === 'scheduled' && !isPast && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange?.(visit.id, 'done')}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange?.(visit.id, 'no_show')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  No Show
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit?.(visit)}
            >
              Edit
            </Button>
          </div>
        </div>

        {/* Reminder */}
        {visit.reminderMins && visit.status === 'scheduled' && !isPast && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Reminder: {visit.reminderMins} minutes before
          </div>
        )}
      </div>
    </div>
  );
}