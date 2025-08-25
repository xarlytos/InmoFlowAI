import { useState } from 'react';
import { Lead, LeadStage } from '@/features/core/types';
import { LeadBulkAction } from '../types';

export function useBulkActions() {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const toggleLead = (leadId: string) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const toggleAll = (leads: Lead[]) => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    }
  };

  const clearSelection = () => {
    setSelectedLeads(new Set());
  };

  const isSelected = (leadId: string) => selectedLeads.has(leadId);
  
  const isAllSelected = (leads: Lead[]) => 
    leads.length > 0 && leads.every(lead => selectedLeads.has(lead.id));
  
  const isIndeterminate = (leads: Lead[]) => 
    selectedLeads.size > 0 && selectedLeads.size < leads.length;

  const executeBulkAction = async (
    action: LeadBulkAction,
    leads: Lead[],
    onUpdate: (updates: Partial<Lead>[]) => void
  ) => {
    const selectedLeadsList = leads.filter(lead => selectedLeads.has(lead.id));

    switch (action.type) {
      case 'updateStage':
        const stageUpdates = selectedLeadsList.map(lead => ({
          id: lead.id,
          stage: action.payload.stage as LeadStage,
          updatedAt: new Date().toISOString()
        }));
        onUpdate(stageUpdates);
        break;

      case 'addTags':
        const addTagsUpdates = selectedLeadsList.map(lead => ({
          id: lead.id,
          tags: [...(lead.tags || []), ...action.payload.tags],
          updatedAt: new Date().toISOString()
        }));
        onUpdate(addTagsUpdates);
        break;

      case 'removeTags':
        const removeTagsUpdates = selectedLeadsList.map(lead => ({
          id: lead.id,
          tags: (lead.tags || []).filter(tag => !action.payload.tags.includes(tag)),
          updatedAt: new Date().toISOString()
        }));
        onUpdate(removeTagsUpdates);
        break;

      case 'export':
        exportLeads(selectedLeadsList, action.payload.format);
        break;

      case 'delete':
        // This would typically call an API
        console.log('Deleting leads:', selectedLeadsList.map(l => l.id));
        break;
    }

    clearSelection();
  };

  const exportLeads = (leads: Lead[], format: 'csv' | 'excel') => {
    const csvContent = leads.map(lead => [
      lead.id,
      lead.name,
      lead.email || '',
      lead.phone || '',
      lead.stage,
      lead.budget || '',
      lead.source || '',
      lead.createdAt,
      lead.updatedAt
    ].join(',')).join('\n');

    const headers = 'ID,Name,Email,Phone,Stage,Budget,Source,Created,Updated\n';
    const content = headers + csvContent;

    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    selectedLeads,
    toggleLead,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    executeBulkAction,
    hasSelection: selectedLeads.size > 0,
    selectionCount: selectedLeads.size
  };
}