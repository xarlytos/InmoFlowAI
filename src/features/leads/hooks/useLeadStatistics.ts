import { useMemo } from 'react';
import { Lead, LeadStage } from '@/features/core/types';
import { LeadStatistics } from '../types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export function useLeadStatistics(leads: Lead[]): LeadStatistics {
  return useMemo(() => {
    const total = leads.length;
    
    // Count by stage
    const byStage = leads.reduce((acc, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    }, {} as Record<LeadStage, number>);

    // Ensure all stages are present
    const stages: LeadStage[] = ['new', 'qualified', 'visiting', 'offer', 'won', 'lost'];
    stages.forEach(stage => {
      if (!byStage[stage]) {
        byStage[stage] = 0;
      }
    });

    // Calculate conversion rates (stage to next stage)
    const conversionRates: Record<LeadStage, number> = {} as Record<LeadStage, number>;
    conversionRates.new = byStage.qualified > 0 ? (byStage.qualified / (byStage.new + byStage.qualified)) * 100 : 0;
    conversionRates.qualified = byStage.visiting > 0 ? (byStage.visiting / (byStage.qualified + byStage.visiting)) * 100 : 0;
    conversionRates.visiting = byStage.offer > 0 ? (byStage.offer / (byStage.visiting + byStage.offer)) * 100 : 0;
    conversionRates.offer = byStage.won > 0 ? (byStage.won / (byStage.offer + byStage.won)) * 100 : 0;
    conversionRates.won = 100;
    conversionRates.lost = 0;

    // Calculate average days to convert (from new to won)
    const convertedLeads = leads.filter(lead => lead.stage === 'won');
    const averageDaysToConvert = convertedLeads.length > 0
      ? convertedLeads.reduce((acc, lead) => {
          const created = new Date(lead.createdAt);
          const updated = new Date(lead.updatedAt);
          const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0) / convertedLeads.length
      : 0;

    // Generate monthly trend for last 6 months
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthLeads = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= monthStart && leadDate <= monthEnd;
      });

      const converted = monthLeads.filter(lead => lead.stage === 'won').length;

      monthlyTrend.push({
        month: format(date, 'MMM yyyy'),
        count: monthLeads.length,
        converted
      });
    }

    return {
      total,
      byStage,
      conversionRates,
      averageDaysToConvert,
      monthlyTrend
    };
  }, [leads]);
}