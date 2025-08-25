import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, Calendar, User, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import type { Property, Lead, Visit } from '@/features/core/types';

interface FiltersState {
  status: string;
  property: string;
  lead: string;
  dateRange: {
    start: string;
    end: string;
  };
  reminder: string;
}

interface FiltersPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  properties: Property[];
  leads: Lead[];
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function FiltersPanel({
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
  properties,
  leads,
  onClearFilters,
  activeFiltersCount
}: FiltersPanelProps) {
  const { t } = useTranslation();

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: t('schedule.scheduled') },
    { value: 'done', label: t('schedule.done') },
    { value: 'no_show', label: t('schedule.noShow') },
    { value: 'canceled', label: t('schedule.canceled') }
  ];

  const propertyOptions = [
    { value: '', label: 'All Properties' },
    ...properties.map(property => ({
      value: property.id,
      label: `${property.title} - ${property.address?.city || ''}`
    }))
  ];

  const leadOptions = [
    { value: '', label: 'All Leads' },
    ...leads.map(lead => ({
      value: lead.id,
      label: `${lead.name} - ${lead.email}`
    }))
  ];

  const reminderOptions = [
    { value: 'all', label: 'All Reminders' },
    { value: 'with_reminder', label: 'With Reminder' },
    { value: 'no_reminder', label: 'No Reminder' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
    { value: '1440', label: '1 day' }
  ];

  const handleFilterChange = (key: keyof FiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggle}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="solid" size="sm" className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.property && (
            <Badge variant="outline" className="flex items-center gap-1">
              Property: {properties.find(p => p.id === filters.property)?.title || 'Selected'}
              <button
                onClick={() => handleFilterChange('property', '')}
                className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.lead && (
            <Badge variant="outline" className="flex items-center gap-1">
              Lead: {leads.find(l => l.id === filters.lead)?.name || 'Selected'}
              <button
                onClick={() => handleFilterChange('lead', '')}
                className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <Badge variant="outline" className="flex items-center gap-1">
              Date Range
              <button
                onClick={() => handleDateRangeChange('start', '')}
                className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="h-4 w-4" />
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
                options={statusOptions}
              />
            </div>

            {/* Property Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="h-4 w-4" />
                Property
              </label>
              <Select
                value={filters.property}
                onValueChange={(value) => handleFilterChange('property', value)}
                options={propertyOptions}
              />
            </div>

            {/* Lead Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4" />
                Lead
              </label>
              <Select
                value={filters.lead}
                onValueChange={(value) => handleFilterChange('lead', value)}
                options={leadOptions}
              />
            </div>

            {/* Reminder Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="h-4 w-4" />
                Reminder
              </label>
              <Select
                value={filters.reminder}
                onValueChange={(value) => handleFilterChange('reminder', value)}
                options={reminderOptions}
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                placeholder="End date"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  handleDateRangeChange('start', today);
                  handleDateRangeChange('end', today);
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                  const weekEnd = new Date(today.setDate(weekStart.getDate() + 6));
                  handleDateRangeChange('start', weekStart.toISOString().split('T')[0]);
                  handleDateRangeChange('end', weekEnd.toISOString().split('T')[0]);
                }}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                  handleDateRangeChange('start', monthStart.toISOString().split('T')[0]);
                  handleDateRangeChange('end', monthEnd.toISOString().split('T')[0]);
                }}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('status', 'scheduled')}
              >
                Scheduled Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('reminder', 'with_reminder')}
              >
                With Reminders
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}