import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import type { Lead, LeadStage } from '@/features/core/types';

interface KanbanProps {
  leads: Lead[];
  onLeadMove: (leadId: string, newStage: LeadStage, lostReason?: string) => void;
  onLeadClick: (lead: Lead) => void;
}

const STAGES: LeadStage[] = ['new', 'qualified', 'visiting', 'offer', 'won', 'lost'];

export function Kanban({ leads, onLeadMove, onLeadClick }: KanbanProps) {
  const { t } = useTranslation();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dropZone, setDropZone] = useState<LeadStage | null>(null);

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    setDropZone(stage);
  };

  const handleDragLeave = () => {
    setDropZone(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: LeadStage) => {
    e.preventDefault();
    setDropZone(null);
    
    if (draggedLead && draggedLead.stage !== newStage) {
      if (newStage === 'lost') {
        const reason = prompt(t('leads.lostReason'));
        if (reason) {
          onLeadMove(draggedLead.id, newStage, reason);
        }
      } else {
        onLeadMove(draggedLead.id, newStage);
      }
    }
    
    setDraggedLead(null);
  };

  const getStageColor = (stage: LeadStage): string => {
    const colors = {
      new: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
      qualified: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
      visiting: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
      offer: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
      won: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
      lost: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700'
    };
    return colors[stage];
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map(stage => {
        const stageLeads = leads.filter(lead => lead.stage === stage);
        
        return (
          <div
            key={stage}
            className={clsx(
              'flex-shrink-0 w-72 border-2 border-dashed rounded-lg p-4 transition-colors',
              dropZone === stage ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-transparent',
              getStageColor(stage)
            )}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t(`leads.${stage}`)}
              </h3>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {stageLeads.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {stageLeads.map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                  onClick={() => onLeadClick(lead)}
                  className={clsx(
                    'bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-shadow',
                    draggedLead?.id === lead.id && 'opacity-50'
                  )}
                >
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {lead.name}
                  </h4>
                  {lead.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {lead.email}
                    </p>
                  )}
                  {lead.budget && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                      €{lead.budget.toLocaleString()}
                    </p>
                  )}
                  {lead.lostReason && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {lead.lostReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}