import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Kanban } from '@/components/Kanban';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dropdown } from '@/components/ui/Dropdown';
import { DatePicker } from '@/components/ui/DatePicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Tag } from '@/components/ui/Tag';
import { Pagination } from '@/components/ui/Pagination';
import { Tooltip } from '@/components/ui/Tooltip';
import { LeadForm } from '../components/LeadForm';
import { useToast } from '@/components/ui/Toast';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useLeadStatistics } from '../hooks/useLeadStatistics';
import { useBulkActions } from '../hooks/useBulkActions';
import { 
  Users, Plus, List, Columns, Search, Filter, Download, 
  Mail, Phone, Calendar, Star, Settings, MoreHorizontal,
  ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2,
  BarChart3, PieChart, TrendingUp, Activity, Clock,
  Linkedin, Twitter, Facebook, Building2
} from 'lucide-react';
import type { Lead, LeadStage } from '@/features/core/types';
import type { ViewMode, LeadTableColumn, PaginationConfig, QuickAction, EnrichedLead } from '../types';

export function LeadsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [view, setView] = useState<ViewMode>('kanban');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 20,
    total: 0
  });
  const [columns, setColumns] = useState<LeadTableColumn[]>([
    { key: 'select', label: '', visible: true },
    { key: 'avatar', label: '', visible: true },
    { key: 'name', label: 'Name', sortable: true, visible: true },
    { key: 'email', label: 'Email', sortable: true, visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'stage', label: 'Stage', sortable: true, visible: true },
    { key: 'budget', label: 'Budget', sortable: true, visible: true },
    { key: 'source', label: 'Source', sortable: true, visible: true },
    { key: 'createdAt', label: 'Created', sortable: true, visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch('/api/leads');
      const data = await response.json();
      // Enrich leads with mock data for demo
      return data.map((lead: Lead): EnrichedLead => ({
        ...lead,
        priority: {
          level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          score: Math.floor(Math.random() * 100),
          factors: ['Budget match', 'Quick response']
        },
        tags: ['VIP', 'Investor', 'First-time buyer'].slice(0, Math.floor(Math.random() * 3)),
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        socialProfiles: {
          linkedin: Math.random() > 0.5 ? `https://linkedin.com/in/${lead.name.toLowerCase().replace(' ', '')}` : undefined
        }
      }));
    }
  });

  // Hooks
  const {
    filters,
    sortConfig,
    filteredAndSortedLeads,
    updateFilter,
    clearFilters,
    updateSort,
    hasActiveFilters
  } = useLeadFilters(leads);
  
  const statistics = useLeadStatistics(leads);
  
  const {
    selectedLeads,
    toggleLead,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    executeBulkAction,
    hasSelection,
    selectionCount
  } = useBulkActions();

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, stage, lostReason }: { id: string; stage: LeadStage; lostReason?: string }) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, lostReason })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lead');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      clearSelection();
      showToast({
        type: 'success',
        title: 'Lead updated successfully'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to update lead',
        message: error.message
      });
    }
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create lead');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowNewLeadModal(false);
      showToast({
        type: 'success',
        title: 'Lead created successfully'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to create lead',
        message: error.message
      });
    }
  });

  // Pagination
  const paginatedLeads = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredAndSortedLeads.slice(startIndex, endIndex);
  }, [filteredAndSortedLeads, pagination]);

  // Update total when filtered leads change
  useMemo(() => {
    setPagination(prev => ({ ...prev, total: filteredAndSortedLeads.length }));
  }, [filteredAndSortedLeads.length]);

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'call',
      label: 'Call',
      icon: <Phone className="h-4 w-4" />,
      action: (lead) => {
        if (lead.phone) {
          window.open(`tel:${lead.phone}`);
        }
      }
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="h-4 w-4" />,
      action: (lead) => {
        if (lead.email) {
          window.open(`mailto:${lead.email}`);
        }
      }
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      action: (lead) => {
        // Open scheduling modal
        console.log('Schedule meeting with', lead.name);
      },
      variant: 'primary'
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      action: (lead) => {
        navigate(`/leads/${lead.id}/edit`);
      }
    }
  ];

  // Event Handlers
  const handleLeadMove = (leadId: string, newStage: LeadStage, lostReason?: string) => {
    updateLeadMutation.mutate({ id: leadId, stage: newStage, lostReason });
  };

  const handleLeadClick = (lead: Lead) => {
    navigate(`/leads/${lead.id}`);
  };

  const handleBulkStageChange = (stage: LeadStage) => {
    executeBulkAction(
      { type: 'updateStage', payload: { stage } },
      paginatedLeads,
      (updates) => {
        // In a real app, this would batch update via API
        updates.forEach(update => {
          updateLeadMutation.mutate({ 
            id: update.id!, 
            stage: update.stage! 
          });
        });
      }
    );
  };

  const handleExport = (format: 'csv' | 'excel') => {
    const leadsToExport = hasSelection ? 
      paginatedLeads.filter(lead => isSelected(lead.id)) :
      filteredAndSortedLeads;
    
    executeBulkAction(
      { type: 'export', payload: { format } },
      leadsToExport,
      () => {}
    );
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('leads.title')} />
        
        {/* Statistics skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Main content skeleton */}
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('leads.title')}
        action={{
          label: t('leads.newLead'),
          onClick: () => setShowNewLeadModal(true),
          icon: <Plus className="h-4 w-4" />
        }}
      />

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Won Deals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.byStage.won}</p>
            </div>
            <Star className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">
            {statistics.conversionRates.offer.toFixed(1)}% conversion rate
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Pipeline</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics.byStage.qualified + statistics.byStage.visiting + statistics.byStage.offer}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Days to Close</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.averageDaysToConvert.toFixed(0)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue Pipeline</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{filteredAndSortedLeads.reduce((sum, lead) => sum + (lead.budget || 0), 0).toLocaleString()}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, email, or phone..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stage Filter */}
          <Dropdown
            options={[
              { value: '', label: 'All Stages' },
              { value: 'new', label: 'New' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'visiting', label: 'Visiting' },
              { value: 'offer', label: 'Offer' },
              { value: 'won', label: 'Won' },
              { value: 'lost', label: 'Lost' }
            ]}
            value={filters.stage?.[0] || ''}
            onChange={(value) => updateFilter('stage', value ? [value as LeadStage] : [])}
            placeholder="Filter by stage"
            className="w-40"
          />

          {/* Budget Filter */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min budget"
              value={filters.budgetRange?.[0] || ''}
              onChange={(e) => {
                const min = parseInt(e.target.value) || 0;
                const max = filters.budgetRange?.[1] || 1000000;
                updateFilter('budgetRange', [min, max]);
              }}
              className="w-32"
            />
            <Input
              type="number"
              placeholder="Max budget"
              value={filters.budgetRange?.[1] || ''}
              onChange={(e) => {
                const min = filters.budgetRange?.[0] || 0;
                const max = parseInt(e.target.value) || 1000000;
                updateFilter('budgetRange', [min, max]);
              }}
              className="w-32"
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-2">
            <DatePicker
              value={filters.dateRange?.[0]}
              onChange={(date) => {
                const end = filters.dateRange?.[1] || new Date();
                updateFilter('dateRange', date ? [date, end] : undefined);
              }}
              placeholder="Start date"
              className="w-36"
            />
            <DatePicker
              value={filters.dateRange?.[1]}
              onChange={(date) => {
                const start = filters.dateRange?.[0] || new Date();
                updateFilter('dateRange', date ? [start, date] : undefined);
              }}
              placeholder="End date"
              className="w-36"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {selectionCount} lead{selectionCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Dropdown
                options={[
                  { value: 'new', label: 'Mark as New' },
                  { value: 'qualified', label: 'Mark as Qualified' },
                  { value: 'visiting', label: 'Mark as Visiting' },
                  { value: 'offer', label: 'Mark as Offer' },
                  { value: 'won', label: 'Mark as Won' },
                  { value: 'lost', label: 'Mark as Lost' }
                ]}
                value=""
                onChange={(value) => handleBulkStageChange(value as LeadStage)}
                placeholder="Change stage"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'kanban' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('kanban')}
          >
            <Columns className="h-4 w-4 mr-2" />
            Kanban
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={view === 'cards' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('cards')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Cards
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedLeads.length} of {filteredAndSortedLeads.length} leads
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Based on View */}
      {view === 'kanban' ? (
        <Kanban
          leads={filteredAndSortedLeads}
          onLeadMove={handleLeadMove}
          onLeadClick={handleLeadClick}
        />
      ) : view === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <Checkbox
                      checked={isAllSelected(paginatedLeads)}
                      onChange={() => toggleAll(paginatedLeads)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lead
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => updateSort('stage')}
                  >
                    <div className="flex items-center gap-1">
                      Stage
                      {sortConfig.field === 'stage' && (
                        sortConfig.direction === 'asc' ? 
                        <ArrowUp className="h-4 w-4" /> : 
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => updateSort('budget')}
                  >
                    <div className="flex items-center gap-1">
                      Budget
                      {sortConfig.field === 'budget' && (
                        sortConfig.direction === 'asc' ? 
                        <ArrowUp className="h-4 w-4" /> : 
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => updateSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {sortConfig.field === 'createdAt' && (
                        sortConfig.direction === 'asc' ? 
                        <ArrowUp className="h-4 w-4" /> : 
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedLeads.map((lead: EnrichedLead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={isSelected(lead.id)}
                        onChange={() => toggleLead(lead.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={lead.name}
                          size="sm"
                          fallbackColor={getPriorityColor(lead.priority?.level || 'low') as any}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {lead.name}
                            </h3>
                            {lead.priority && (
                              <Tag
                                variant={getPriorityColor(lead.priority.level) as any}
                                size="sm"
                              >
                                {lead.priority.level}
                              </Tag>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{lead.email}</span>
                            {lead.phone && (
                              <>
                                <span>•</span>
                                <span>{lead.phone}</span>
                              </>
                            )}
                          </div>
                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {lead.tags.map(tag => (
                                <Tag key={tag} size="sm" variant="secondary">
                                  {tag}
                                </Tag>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={lead.stage}>
                        {t(`leads.${lead.stage}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {lead.budget ? `€${lead.budget.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {lead.source || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {quickActions.map((action) => (
                          <Tooltip key={action.id} content={action.label}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => action.action(lead)}
                              className="p-2"
                            >
                              {action.icon}
                            </Button>
                          </Tooltip>
                        ))}
                        <Dropdown
                          options={[
                            { value: 'view', label: 'View Details', icon: <Eye className="h-4 w-4" /> },
                            { value: 'edit', label: 'Edit', icon: <Edit className="h-4 w-4" /> },
                            { value: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" /> }
                          ]}
                          value=""
                          onChange={(value) => {
                            if (value === 'view') handleLeadClick(lead);
                            else if (value === 'edit') navigate(`/leads/${lead.id}/edit`);
                            else if (value === 'delete') console.log('Delete lead:', lead.id);
                          }}
                          className="w-10"
                        >
                          <Button variant="outline" size="sm" className="p-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Cards View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedLeads.map((lead: EnrichedLead) => (
            <div
              key={lead.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={lead.name}
                      size="lg"
                      fallbackColor={getPriorityColor(lead.priority?.level || 'low') as any}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lead.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={lead.stage}>
                          {t(`leads.${lead.stage}`)}
                        </Badge>
                        {lead.priority && (
                          <Tag
                            variant={getPriorityColor(lead.priority.level) as any}
                            size="sm"
                          >
                            {lead.priority.level}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                  <Checkbox
                    checked={isSelected(lead.id)}
                    onChange={() => toggleLead(lead.id)}
                  />
                </div>

                <div className="space-y-3">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.budget && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        €{lead.budget.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {lead.source && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Source: {lead.source}
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {lead.socialProfiles && (
                  <div className="flex gap-2 mt-4">
                    {lead.socialProfiles.linkedin && (
                      <a
                        href={lead.socialProfiles.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* Tags */}
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {lead.tags.map(tag => (
                      <Tag key={tag} size="sm" variant="secondary">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1">
                    {quickActions.slice(0, 3).map((action) => (
                      <Tooltip key={action.id} content={action.label}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => action.action(lead)}
                          className="p-2"
                        >
                          {action.icon}
                        </Button>
                      </Tooltip>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLeadClick(lead)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.pageSize && (
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.pageSize)}
          onPageChange={handlePageChange}
        />
      )}

      {/* New Lead Modal */}
      <Modal
        isOpen={showNewLeadModal}
        onClose={() => setShowNewLeadModal(false)}
        title={t('leads.newLead')}
        size="lg"
      >
        <LeadForm
          onSubmit={(data) => createLeadMutation.mutate(data)}
          onCancel={() => setShowNewLeadModal(false)}
          isLoading={createLeadMutation.isPending}
        />
      </Modal>
    </div>
  );
}