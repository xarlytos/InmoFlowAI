import { useState } from 'react';
import { format, isToday, isYesterday, isTomorrow, isThisWeek } from 'date-fns';
import { CheckCircle, Clock, MapPin, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Visit, Property, Lead } from '@/features/core/types';

interface VisitsListProps {
  visits: Visit[];
  properties: Property[];
  leads: Lead[];
  selectedVisits: string[];
  onVisitSelect: (visitId: string, selected: boolean) => void;
  onVisitEdit: (visit: Visit) => void;
  onVisitUpdate: (visit: Partial<Visit> & { id: string }) => void;
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'MMM dd, yyyy');
}

export function VisitsList({ 
  visits, 
  properties, 
  leads, 
  selectedVisits,
  onVisitSelect,
  onVisitEdit,
  onVisitUpdate
}: VisitsListProps) {
  // Group visits by date
  const groupedVisits = visits.reduce((groups, visit) => {
    const date = format(new Date(visit.when), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(visit);
    return groups;
  }, {} as Record<string, Visit[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedVisits).sort();

  const getPropertyTitle = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.title || 'Unknown Property';
  };

  const getLeadName = (leadId: string) => {
    return leads.find(l => l.id === leadId)?.name || 'Unknown Lead';
  };

  const getLeadEmail = (leadId: string) => {
    return leads.find(l => l.id === leadId)?.email || '';
  };

  const getPropertyAddress = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.address ? `${property.address.street}, ${property.address.city}` : '';
  };

  return (
    <div className="space-y-6">
      {sortedDates.map(date => {
        const dateObj = new Date(date);
        const dateVisits = groupedVisits[date].sort((a, b) => 
          new Date(a.when).getTime() - new Date(b.when).getTime()
        );

        return (
          <div key={date} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* Date Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getDateLabel(dateObj)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    {format(dateObj, 'MMMM dd, yyyy')}
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">
                    {dateVisits.length} visit{dateVisits.length !== 1 ? 's' : ''}
                  </Badge>
                  <Checkbox
                    checked={dateVisits.every(visit => selectedVisits.includes(visit.id))}
                    onCheckedChange={(checked) => {
                      dateVisits.forEach(visit => {
                        onVisitSelect(visit.id, !!checked);
                      });
                    }}
                    indeterminate={
                      dateVisits.some(visit => selectedVisits.includes(visit.id)) &&
                      !dateVisits.every(visit => selectedVisits.includes(visit.id))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Visits List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dateVisits.map(visit => (
                <div 
                  key={visit.id} 
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <Checkbox
                      checked={selectedVisits.includes(visit.id)}
                      onCheckedChange={(checked) => onVisitSelect(visit.id, !!checked)}
                    />

                    {/* Time */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(visit.when), 'HH:mm')}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Lead Info */}
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {getLeadName(visit.leadId)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {getLeadEmail(visit.leadId)}
                            </span>
                          </div>

                          {/* Property Info */}
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {getPropertyTitle(visit.propertyId)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {getPropertyAddress(visit.propertyId)}
                            </span>
                          </div>

                          {/* Notes */}
                          {visit.note && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {visit.note}
                            </p>
                          )}
                        </div>

                        {/* Status and Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge variant={visit.status}>
                            {visit.status.replace('_', ' ')}
                          </Badge>

                          {/* Quick Actions */}
                          {visit.status === 'scheduled' && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onVisitUpdate({ id: visit.id, status: 'done' })}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            </div>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onVisitEdit(visit)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Reminder */}
                      {visit.reminderMins && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          Reminder: {visit.reminderMins} minutes before
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {visits.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No visits scheduled
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Schedule your first visit to get started.
          </p>
        </div>
      )}
    </div>
  );
}