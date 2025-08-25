import { Lead, LeadStage } from '@/features/core/types';

export interface LeadFilters {
  search?: string;
  stage?: LeadStage[];
  source?: string[];
  budgetRange?: [number, number];
  dateRange?: [Date, Date];
  tags?: string[];
}

export interface LeadSortConfig {
  field: 'name' | 'email' | 'stage' | 'budget' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface LeadTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  visible: boolean;
}

export interface LeadListSettings {
  view: 'kanban' | 'list' | 'cards';
  columns: LeadTableColumn[];
  pageSize: number;
  savedFilters: { name: string; filters: LeadFilters }[];
}

export interface LeadBulkAction {
  type: 'updateStage' | 'delete' | 'export' | 'addTags' | 'removeTags';
  payload?: any;
}

export interface LeadStatistics {
  total: number;
  byStage: Record<LeadStage, number>;
  conversionRates: Record<LeadStage, number>;
  averageDaysToConvert: number;
  monthlyTrend: Array<{
    month: string;
    count: number;
    converted: number;
  }>;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (lead: Lead) => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export interface LeadPriority {
  level: 'low' | 'medium' | 'high' | 'urgent';
  score: number;
  factors: string[];
}

export interface EnrichedLead extends Lead {
  priority?: LeadPriority;
  tags?: string[];
  lastActivity?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  companyInfo?: {
    name?: string;
    size?: string;
    industry?: string;
  };
}

export type ViewMode = 'kanban' | 'list' | 'cards';