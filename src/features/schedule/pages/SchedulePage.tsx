import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { VisitForm } from '../components/VisitForm';
import { VisitsCalendar } from '../components/VisitsCalendar';
import { VisitsList } from '../components/VisitsList';
import { StatCard } from '../components/StatCard';
import { TimelineItem } from '../components/TimelineItem';
import { FiltersPanel } from '../components/FiltersPanel';
import { QuickActionsMenu } from '../components/QuickActionsMenu';
import { NotificationBadge } from '../components/NotificationBadge';
import { ExportMenu } from '../components/ExportMenu';
import { VisitTemplatesModal } from '../components/VisitTemplatesModal';
import { useToast } from '@/components/ui/Toast';
import { 
  Calendar, 
  Download, 
  Plus, 
  List, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  FileText,
  BarChart3,
  Bell
} from 'lucide-react';
import { generateICS } from '../utils/ics';
import type { Visit } from '@/features/core/types';

export function SchedulePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  // View and UI State
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    property: '',
    lead: '',
    dateRange: { start: '', end: '' },
    reminder: 'all'
  });
  
  // Multi-select
  const [selectedVisits, setSelectedVisits] = useState<string[]>([]);
  
  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn: async () => {
      const response = await fetch('/api/visits');
      return response.json();
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      return response.json();
    }
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch('/api/leads');
      return response.json();
    }
  });

  // Event handlers
  const handleVisitSelect = (visitId: string, selected: boolean) => {
    if (selected) {
      setSelectedVisits([...selectedVisits, visitId]);
    } else {
      setSelectedVisits(selectedVisits.filter(id => id !== visitId));
    }
  };
  
  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      property: '',
      lead: '',
      dateRange: { start: '', end: '' },
      reminder: 'all'
    });
    setSearchTerm('');
  };
  
  const handleUseTemplate = (template: any, customData?: Partial<Visit>) => {
    // Pre-fill the form with template data
    setShowNewVisitModal(true);
    // You would pass template data to the form
  };
  
  const handleBulkReschedule = (visitIds: string[]) => {
    // Implement bulk reschedule logic
    showToast({ type: 'success', title: `Rescheduled ${visitIds.length} visits` });
  };
  
  const handleBulkStatusChange = (visitIds: string[], status: Visit['status']) => {
    visitIds.forEach(id => {
      updateVisitMutation.mutate({ id, status });
    });
    setSelectedVisits([]);
  };
  
  const handleBulkDelete = (visitIds: string[]) => {
    // Implement bulk delete logic
    setSelectedVisits([]);
    showToast({ type: 'success', title: `Deleted ${visitIds.length} visits` });
  };
  
  const handleSendReminders = (visitIds: string[]) => {
    // Implement send reminders logic
    showToast({ type: 'success', title: `Sent reminders for ${visitIds.length} visits` });
  };
  
  const handleExportVisits = (visitIds: string[], format: 'ics' | 'pdf' | 'csv') => {
    const visitsToExport = visits.filter(v => visitIds.includes(v.id));
    // Implement export logic based on format
    showToast({ type: 'success', title: `Exported ${visitsToExport.length} visits as ${format.toUpperCase()}` });
  };
  
  const handleDuplicateVisits = (visitIds: string[]) => {
    // Implement duplicate logic
    showToast({ type: 'success', title: `Duplicated ${visitIds.length} visits` });
  };
  
  const handleNotificationMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };
  
  const handleNotificationMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const createVisitMutation = useMutation({
    mutationFn: async (data: Omit<Visit, 'id'>) => {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create visit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setShowNewVisitModal(false);
      setEditingVisit(null);
      showToast({
        type: 'success',
        title: editingVisit ? 'Visit updated successfully' : 'Visit scheduled successfully'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: editingVisit ? 'Failed to update visit' : 'Failed to schedule visit',
        message: error.message
      });
    }
  });

  const updateVisitMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Visit> & { id: string }) => {
      const response = await fetch(`/api/visits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update visit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      showToast({
        type: 'success',
        title: 'Visit updated successfully'
      });
    }
  });
  
  // Get today's visits for timeline
  const todayVisits = useMemo(() => {
    return visits.filter(visit => isToday(new Date(visit.when)))
      .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
  }, [visits]);

  // Filtered and processed data
  const filteredVisits = useMemo(() => {
    let filtered = visits;
    
    // Text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(visit => {
        const lead = leads.find(l => l.id === visit.leadId);
        const property = properties.find(p => p.id === visit.propertyId);
        return (
          lead?.name?.toLowerCase().includes(search) ||
          lead?.email?.toLowerCase().includes(search) ||
          property?.title?.toLowerCase().includes(search) ||
          visit.note?.toLowerCase().includes(search)
        );
      });
    }
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(visit => visit.status === filters.status);
    }
    
    // Property filter
    if (filters.property) {
      filtered = filtered.filter(visit => visit.propertyId === filters.property);
    }
    
    // Lead filter
    if (filters.lead) {
      filtered = filtered.filter(visit => visit.leadId === filters.lead);
    }
    
    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(visit => {
        const visitDate = new Date(visit.when);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && visitDate < startDate) return false;
        if (endDate && visitDate > endDate) return false;
        return true;
      });
    }
    
    // Reminder filter
    if (filters.reminder !== 'all') {
      if (filters.reminder === 'with_reminder') {
        filtered = filtered.filter(visit => visit.reminderMins);
      } else if (filters.reminder === 'no_reminder') {
        filtered = filtered.filter(visit => !visit.reminderMins);
      } else {
        filtered = filtered.filter(visit => visit.reminderMins?.toString() === filters.reminder);
      }
    }
    
    return filtered;
  }, [visits, searchTerm, filters, leads, properties]);
  
  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    const todayVisits = visits.filter(v => isToday(new Date(v.when)));
    const completedVisits = visits.filter(v => v.status === 'done');
    const noShowVisits = visits.filter(v => v.status === 'no_show');
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const weekVisits = visits.filter(v => {
      const visitDate = new Date(v.when);
      return visitDate >= weekStart && visitDate <= weekEnd;
    });
    
    return {
      todayVisits: todayVisits.length,
      completedVisits: completedVisits.length,
      noShowVisits: noShowVisits.length,
      weekVisits: weekVisits.length,
      completionRate: visits.length > 0 ? Math.round((completedVisits.length / visits.length) * 100) : 0
    };
  }, [visits]);
  
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.property) count++;
    if (filters.lead) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.reminder !== 'all') count++;
    return count;
  }, [filters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('schedule.title')} />
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('schedule.title')}
        action={{
          label: t('schedule.newVisit'),
          onClick: () => setShowNewVisitModal(true),
          icon: <Plus className="h-4 w-4" />
        }}
      />

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Visits" 
          value={stats.todayVisits}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
          subtitle={`${todayVisits.filter(v => v.status === 'scheduled').length} pending`}
        />
        <StatCard 
          title="Completed" 
          value={stats.completedVisits}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
          subtitle={`${stats.completionRate}% completion rate`}
        />
        <StatCard 
          title="No Shows" 
          value={stats.noShowVisits}
          icon={<XCircle className="h-5 w-5" />}
          color="red"
        />
        <StatCard 
          title="This Week" 
          value={stats.weekVisits}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Today's Timeline */}
      {todayVisits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Timeline
            </h3>
            <Badge variant="outline">{todayVisits.length} visits</Badge>
          </div>
          <div className="space-y-3">
            {todayVisits.slice(0, 3).map(visit => {
              const property = properties.find(p => p.id === visit.propertyId);
              const lead = leads.find(l => l.id === visit.leadId);
              return (
                <TimelineItem
                  key={visit.id}
                  visit={visit}
                  property={property}
                  lead={lead}
                  onStatusChange={(visitId, status) => updateVisitMutation.mutate({ id: visitId, status })}
                  onEdit={setEditingVisit}
                />
              );
            })}
            {todayVisits.length > 3 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
                +{todayVisits.length - 3} more visits today
              </p>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search visits, properties, or leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <NotificationBadge
            visits={visits}
            properties={properties}
            leads={leads}
            onMarkAsRead={handleNotificationMarkAsRead}
            onMarkAllAsRead={handleNotificationMarkAllAsRead}
          />
          <Button
            variant="outline"
            onClick={() => setShowTemplatesModal(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
          <ExportMenu
            visits={filteredVisits}
            properties={properties}
            leads={leads}
            selectedVisits={selectedVisits}
            onExportComplete={(format, count) => 
              showToast({ 
                type: 'success', 
                title: 'Export completed', 
                message: `Exported ${count} visits as ${format.toUpperCase()}` 
              })
            }
          />
        </div>
      </div>

      {/* Filters Panel */}
      <FiltersPanel
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        filters={filters}
        onFiltersChange={setFilters}
        properties={properties}
        leads={leads}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* View Mode Toggle and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''}
          </Badge>
          {activeFiltersCount > 0 && (
            <Badge variant="solid" size="sm">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </Badge>
          )}
        </div>
      </div>

      {/* Selected Visits Actions */}
      <QuickActionsMenu
        selectedVisits={selectedVisits}
        visits={visits}
        onBulkReschedule={handleBulkReschedule}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={handleBulkDelete}
        onSendReminders={handleSendReminders}
        onExportVisits={handleExportVisits}
        onDuplicateVisits={handleDuplicateVisits}
      />

      {/* Map Placeholder */}
      {showMap && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Map View
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Interactive map showing visit locations would be integrated here
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'calendar' ? (
        <VisitsCalendar
          visits={filteredVisits}
          properties={properties}
          leads={leads}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onVisitUpdate={(visit) => updateVisitMutation.mutate(visit)}
          selectedVisits={selectedVisits}
          onVisitSelect={handleVisitSelect}
          onVisitEdit={setEditingVisit}
        />
      ) : (
        <VisitsList
          visits={filteredVisits}
          properties={properties}
          leads={leads}
          selectedVisits={selectedVisits}
          onVisitSelect={handleVisitSelect}
          onVisitEdit={setEditingVisit}
          onVisitUpdate={(visit) => updateVisitMutation.mutate(visit)}
        />
      )}

      {/* New Visit Modal */}
      <Modal
        isOpen={showNewVisitModal}
        onClose={() => {
          setShowNewVisitModal(false);
          setEditingVisit(null);
        }}
        title={editingVisit ? 'Edit Visit' : t('schedule.newVisit')}
        size="lg"
      >
        <VisitForm
          properties={properties}
          leads={leads}
          onSubmit={(data) => {
            if (editingVisit) {
              updateVisitMutation.mutate({ id: editingVisit.id, ...data });
            } else {
              createVisitMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setShowNewVisitModal(false);
            setEditingVisit(null);
          }}
          isLoading={createVisitMutation.isPending || updateVisitMutation.isPending}
          defaultValues={editingVisit ? {
            propertyId: editingVisit.propertyId,
            leadId: editingVisit.leadId,
            when: format(new Date(editingVisit.when), "yyyy-MM-dd'T'HH:mm"),
            note: editingVisit.note,
            status: editingVisit.status,
            reminderMins: editingVisit.reminderMins
          } : undefined}
        />
      </Modal>

      {/* Visit Templates Modal */}
      <VisitTemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        properties={properties}
        leads={leads}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}