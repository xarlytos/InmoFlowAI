import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Calendar, FileText, Table, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { Modal } from '@/components/ui/Modal';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { generateICS } from '../utils/ics';
import type { Visit, Property, Lead } from '@/features/core/types';

interface ExportMenuProps {
  visits: Visit[];
  properties: Property[];
  leads: Lead[];
  selectedVisits?: string[];
  onExportComplete: (format: string, count: number) => void;
}

interface ExportOptions {
  format: 'ics' | 'pdf' | 'csv' | 'json';
  dateRange: 'all' | 'selected' | 'week' | 'month' | 'custom';
  fields: string[];
  includeNotes: boolean;
  includeReminders: boolean;
  groupBy: 'none' | 'date' | 'property' | 'lead' | 'status';
}

export function ExportMenu({
  visits,
  properties,
  leads,
  selectedVisits = [],
  onExportComplete
}: ExportMenuProps) {
  const { t } = useTranslation();
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'ics',
    dateRange: 'all',
    fields: ['when', 'leadId', 'propertyId', 'status', 'note'],
    includeNotes: true,
    includeReminders: true,
    groupBy: 'none'
  });

  const availableFields = [
    { id: 'when', label: 'Date & Time' },
    { id: 'leadId', label: 'Lead' },
    { id: 'propertyId', label: 'Property' },
    { id: 'status', label: 'Status' },
    { id: 'note', label: 'Notes' },
    { id: 'reminderMins', label: 'Reminder' }
  ];

  const getFilteredVisits = () => {
    let filteredVisits = visits;

    switch (exportOptions.dateRange) {
      case 'selected':
        filteredVisits = visits.filter(v => selectedVisits.includes(v.id));
        break;
      case 'week':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        filteredVisits = visits.filter(v => {
          const visitDate = new Date(v.when);
          return visitDate >= weekStart && visitDate <= weekEnd;
        });
        break;
      case 'month':
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        filteredVisits = visits.filter(v => {
          const visitDate = new Date(v.when);
          return visitDate >= monthStart && visitDate <= monthEnd;
        });
        break;
    }

    return filteredVisits;
  };

  const quickExport = (format: 'ics' | 'pdf' | 'csv') => {
    const visitsToExport = selectedVisits.length > 0 
      ? visits.filter(v => selectedVisits.includes(v.id))
      : visits;

    switch (format) {
      case 'ics':
        exportICS(visitsToExport);
        break;
      case 'pdf':
        exportPDF(visitsToExport);
        break;
      case 'csv':
        exportCSV(visitsToExport);
        break;
    }

    onExportComplete(format, visitsToExport.length);
  };

  const exportICS = (visitsToExport: Visit[]) => {
    const icsContent = generateICS(visitsToExport, properties, leads);
    downloadFile(icsContent, `visits-${new Date().toISOString().split('T')[0]}.ics`, 'text/calendar');
  };

  const exportPDF = (visitsToExport: Visit[]) => {
    // Generate PDF content (would need a PDF library like jsPDF)
    const content = generatePDFContent(visitsToExport);
    console.log('PDF export would generate:', content);
    // For now, just show a message
    alert(`PDF export with ${visitsToExport.length} visits would be generated here`);
  };

  const exportCSV = (visitsToExport: Visit[]) => {
    const headers = ['Date', 'Time', 'Lead', 'Property', 'Status', 'Notes', 'Reminder'];
    const rows = visitsToExport.map(visit => {
      const lead = leads.find(l => l.id === visit.leadId);
      const property = properties.find(p => p.id === visit.propertyId);
      const visitDate = new Date(visit.when);
      
      return [
        visitDate.toLocaleDateString(),
        visitDate.toLocaleTimeString(),
        lead?.name || 'Unknown',
        property?.title || 'Unknown',
        visit.status,
        visit.note || '',
        visit.reminderMins ? `${visit.reminderMins} minutes` : ''
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    downloadFile(csvContent, `visits-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const exportJSON = (visitsToExport: Visit[]) => {
    const data = visitsToExport.map(visit => ({
      ...visit,
      leadName: leads.find(l => l.id === visit.leadId)?.name,
      propertyTitle: properties.find(p => p.id === visit.propertyId)?.title
    }));

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `visits-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const generatePDFContent = (visitsToExport: Visit[]) => {
    // This would generate actual PDF content with a library like jsPDF
    return `PDF Report - ${visitsToExport.length} visits`;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdvancedExport = () => {
    const visitsToExport = getFilteredVisits();

    switch (exportOptions.format) {
      case 'ics':
        exportICS(visitsToExport);
        break;
      case 'pdf':
        exportPDF(visitsToExport);
        break;
      case 'csv':
        exportCSV(visitsToExport);
        break;
      case 'json':
        exportJSON(visitsToExport);
        break;
    }

    onExportComplete(exportOptions.format, visitsToExport.length);
    setShowAdvancedExport(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Quick Export Options */}
          <DropdownMenuItem onClick={() => quickExport('ics')}>
            <Calendar className="h-4 w-4 mr-2" />
            Export as ICS
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => quickExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => quickExport('csv')}>
            <Table className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Advanced Export */}
          <DropdownMenuItem onClick={() => setShowAdvancedExport(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Advanced Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Advanced Export Modal */}
      <Modal
        isOpen={showAdvancedExport}
        onClose={() => setShowAdvancedExport(false)}
        title="Advanced Export Options"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </label>
              <Select
                value={exportOptions.format}
                onValueChange={(value: 'ics' | 'pdf' | 'csv' | 'json') =>
                  setExportOptions({ ...exportOptions, format: value })
                }
                options={[
                  { value: 'ics', label: 'Calendar (ICS)' },
                  { value: 'pdf', label: 'PDF Report' },
                  { value: 'csv', label: 'CSV Spreadsheet' },
                  { value: 'json', label: 'JSON Data' }
                ]}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <Select
                value={exportOptions.dateRange}
                onValueChange={(value: 'all' | 'selected' | 'week' | 'month' | 'custom') =>
                  setExportOptions({ ...exportOptions, dateRange: value })
                }
                options={[
                  { value: 'all', label: 'All Visits' },
                  { value: 'selected', label: `Selected (${selectedVisits.length})` },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'custom', label: 'Custom Range' }
                ]}
              />
            </div>
          </div>

          {/* Fields Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Include Fields
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFields.map(field => (
                <label key={field.id} className="flex items-center">
                  <Checkbox
                    checked={exportOptions.fields.includes(field.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setExportOptions({
                          ...exportOptions,
                          fields: [...exportOptions.fields, field.id]
                        });
                      } else {
                        setExportOptions({
                          ...exportOptions,
                          fields: exportOptions.fields.filter(f => f !== field.id)
                        });
                      }
                    }}
                  />
                  <span className="ml-2 text-sm">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <Checkbox
                checked={exportOptions.includeNotes}
                onCheckedChange={(checked) =>
                  setExportOptions({ ...exportOptions, includeNotes: !!checked })
                }
              />
              <span className="ml-2 text-sm">Include visit notes</span>
            </label>

            <label className="flex items-center">
              <Checkbox
                checked={exportOptions.includeReminders}
                onCheckedChange={(checked) =>
                  setExportOptions({ ...exportOptions, includeReminders: !!checked })
                }
              />
              <span className="ml-2 text-sm">Include reminder settings</span>
            </label>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group By
            </label>
            <Select
              value={exportOptions.groupBy}
              onValueChange={(value: 'none' | 'date' | 'property' | 'lead' | 'status') =>
                setExportOptions({ ...exportOptions, groupBy: value })
              }
              options={[
                { value: 'none', label: 'No Grouping' },
                { value: 'date', label: 'Date' },
                { value: 'property', label: 'Property' },
                { value: 'lead', label: 'Lead' },
                { value: 'status', label: 'Status' }
              ]}
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Export Preview
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getFilteredVisits().length} visits will be exported as {exportOptions.format.toUpperCase()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleAdvancedExport}>
              Export {getFilteredVisits().length} Visits
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedExport(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}