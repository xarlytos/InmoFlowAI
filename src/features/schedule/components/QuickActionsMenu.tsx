import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MoreVertical, 
  RefreshCw, 
  Bell, 
  FileText, 
  Download,
  Calendar,
  Users,
  MapPin,
  Clock,
  Copy,
  Trash2,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Visit } from '@/features/core/types';

interface QuickActionsMenuProps {
  selectedVisits: string[];
  visits: Visit[];
  onBulkReschedule: (visitIds: string[]) => void;
  onBulkStatusChange: (visitIds: string[], status: Visit['status']) => void;
  onBulkDelete: (visitIds: string[]) => void;
  onSendReminders: (visitIds: string[]) => void;
  onExportVisits: (visitIds: string[], format: 'ics' | 'pdf' | 'csv') => void;
  onDuplicateVisits: (visitIds: string[]) => void;
}

export function QuickActionsMenu({
  selectedVisits,
  visits,
  onBulkReschedule,
  onBulkStatusChange,
  onBulkDelete,
  onSendReminders,
  onExportVisits,
  onDuplicateVisits
}: QuickActionsMenuProps) {
  const { t } = useTranslation();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedCount = selectedVisits.length;
  const selectedVisitObjects = visits.filter(v => selectedVisits.includes(v.id));
  const scheduledCount = selectedVisitObjects.filter(v => v.status === 'scheduled').length;
  const hasReminders = selectedVisitObjects.some(v => v.reminderMins);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="solid" className="px-2 py-1">
            {selectedCount} selected
          </Badge>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {scheduledCount} scheduled
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Actions */}
          {scheduledCount > 0 && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkStatusChange(selectedVisits, 'done')}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <Clock className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkStatusChange(selectedVisits, 'canceled')}
                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                Cancel
              </Button>
            </>
          )}

          {/* Reschedule */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRescheduleModal(true)}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reschedule
          </Button>

          {/* Send Reminders */}
          {hasReminders && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSendReminders(selectedVisits)}
            >
              <Bell className="h-4 w-4 mr-1" />
              Send Reminders
            </Button>
          )}

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Export Options */}
              <DropdownMenuItem onClick={() => onExportVisits(selectedVisits, 'ics')}>
                <Calendar className="h-4 w-4 mr-2" />
                Export as ICS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportVisits(selectedVisits, 'pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportVisits(selectedVisits, 'csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Duplicate */}
              <DropdownMenuItem onClick={() => onDuplicateVisits(selectedVisits)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Visits
              </DropdownMenuItem>

              {/* Archive */}
              <DropdownMenuItem onClick={() => onBulkStatusChange(selectedVisits, 'canceled')}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Delete */}
              <DropdownMenuItem 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Visits
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Visits"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Reschedule {selectedCount} selected visit{selectedCount !== 1 ? 's' : ''}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Date
              </label>
              <input
                type="date"
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Time
              </label>
              <input
                type="time"
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reschedule Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="reschedule-type" value="same-time" className="mr-2" defaultChecked />
                Keep same time, change date only
              </label>
              <label className="flex items-center">
                <input type="radio" name="reschedule-type" value="same-date" className="mr-2" />
                Keep same date, change time only
              </label>
              <label className="flex items-center">
                <input type="radio" name="reschedule-type" value="both" className="mr-2" />
                Change both date and time
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => {
                onBulkReschedule(selectedVisits);
                setShowRescheduleModal(false);
              }}
            >
              Reschedule Visits
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRescheduleModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Visits"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete {selectedCount} selected visit{selectedCount !== 1 ? 's' : ''}? 
            This action cannot be undone.
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Warning
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Deleting visits will remove all associated data and cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="destructive"
              onClick={() => {
                onBulkDelete(selectedVisits);
                setShowDeleteConfirm(false);
              }}
            >
              Delete Visits
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}