import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, MapPin, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Visit, Property, Lead } from '@/features/core/types';

interface VisitsCalendarProps {
  visits: Visit[];
  properties: Property[];
  leads: Lead[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onVisitUpdate: (visit: Partial<Visit> & { id: string }) => void;
  selectedVisits: string[];
  onVisitSelect: (visitId: string, selected: boolean) => void;
  onVisitEdit: (visit: Visit) => void;
}

export function VisitsCalendar({ 
  visits, 
  properties, 
  leads, 
  selectedDate, 
  onDateChange,
  onVisitUpdate,
  selectedVisits,
  onVisitSelect,
  onVisitEdit
}: VisitsCalendarProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getVisitsForDay = (date: Date) => {
    return visits.filter(visit => isSameDay(new Date(visit.when), date));
  };

  const getPropertyTitle = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.title || 'Unknown Property';
  };

  const getLeadName = (leadId: string) => {
    return leads.find(l => l.id === leadId)?.name || 'Unknown Lead';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(newDate);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(weekStart, 'MMMM yyyy')} - Week {format(weekStart, 'w')}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDateChange(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {days.map((day, dayIndex) => {
          const dayVisits = getVisitsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={dayIndex}
              className={`bg-white dark:bg-gray-800 min-h-[200px] p-2 ${
                isToday ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="text-center mb-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {format(day, 'EEE')}
                </p>
                <p className={`text-lg font-semibold ${
                  isToday 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {format(day, 'd')}
                </p>
              </div>
              
              <div className="space-y-1">
                {dayVisits.map((visit: Visit) => (
                  <div
                    key={visit.id}
                    className={`border rounded p-2 text-xs cursor-pointer hover:shadow-sm transition-all relative group ${
                      selectedVisits.includes(visit.id)
                        ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/30'
                        : 'bg-primary-100 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                    }`}
                    onClick={() => onVisitEdit(visit)}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Checkbox
                        checked={selectedVisits.includes(visit.id)}
                        onCheckedChange={(checked) => {
                          onVisitSelect(visit.id, !!checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium text-primary-700 dark:text-primary-300">
                        {format(new Date(visit.when), 'HH:mm')}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 truncate">
                      {getLeadName(visit.leadId)}
                    </p>
                    
                    <p className="text-gray-600 dark:text-gray-400 truncate">
                      {getPropertyTitle(visit.propertyId)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant={visit.status} className="text-xs">
                        {visit.status}
                      </Badge>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onVisitEdit(visit);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}