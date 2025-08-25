import { useState, useMemo } from 'react';
import { Lead } from '@/features/core/types';
import { LeadFilters, LeadSortConfig } from '../types';

export function useLeadFilters(leads: Lead[]) {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [sortConfig, setSortConfig] = useState<LeadSortConfig>({
    field: 'createdAt',
    direction: 'desc'
  });

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = [...leads];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(filters.search!) ||
        lead.source?.toLowerCase().includes(searchLower)
      );
    }

    // Apply stage filter
    if (filters.stage && filters.stage.length > 0) {
      filtered = filtered.filter(lead => filters.stage!.includes(lead.stage));
    }

    // Apply source filter
    if (filters.source && filters.source.length > 0 && filters.source[0] !== '') {
      filtered = filtered.filter(lead => 
        lead.source && filters.source!.includes(lead.source)
      );
    }

    // Apply budget range filter
    if (filters.budgetRange) {
      const [min, max] = filters.budgetRange;
      filtered = filtered.filter(lead => 
        lead.budget && lead.budget >= min && lead.budget <= max
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= startDate && leadDate <= endDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.field];
      let bValue: any = b[sortConfig.field];

      // Handle different data types
      if (sortConfig.field === 'createdAt' || sortConfig.field === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig.field === 'budget') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [leads, filters, sortConfig]);

  const updateFilter = (key: keyof LeadFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const updateSort = (field: LeadSortConfig['field']) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return {
    filters,
    sortConfig,
    filteredAndSortedLeads,
    updateFilter,
    clearFilters,
    updateSort,
    hasActiveFilters: Object.keys(filters).some(key => {
      const value = filters[key as keyof LeadFilters];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    })
  };
}