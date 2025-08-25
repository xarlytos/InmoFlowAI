import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { visitSchema, type VisitFormData } from '../schemas/visit';
import type { Property, Lead } from '@/features/core/types';

interface VisitFormProps {
  properties: Property[];
  leads: Lead[];
  onSubmit: (data: VisitFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<VisitFormData>;
}

export function VisitForm({ 
  properties, 
  leads, 
  onSubmit, 
  onCancel, 
  isLoading, 
  defaultValues 
}: VisitFormProps) {
  const { t } = useTranslation();

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      propertyId: '',
      leadId: '',
      when: '',
      note: '',
      status: 'scheduled',
      reminderMins: 60,
      ...defaultValues
    }
  });

  const propertyOptions = properties.map(property => ({
    value: property.id,
    label: `${property.title} - ${property.address.city}`
  }));

  const leadOptions = leads.map(lead => ({
    value: lead.id,
    label: `${lead.name} - ${lead.email}`
  }));

  const statusOptions = [
    { value: 'scheduled', label: t('schedule.scheduled') },
    { value: 'done', label: t('schedule.done') },
    { value: 'no_show', label: t('schedule.noShow') },
    { value: 'canceled', label: t('schedule.canceled') }
  ];

  const reminderOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
    { value: '1440', label: '1 day' }
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          {...form.register('propertyId')}
          label={t('schedule.property')}
          options={[{ value: '', label: 'Select property...' }, ...propertyOptions]}
          error={form.formState.errors.propertyId?.message}
        />
        
        <Select
          {...form.register('leadId')}
          label={t('schedule.lead')}
          options={[{ value: '', label: 'Select lead...' }, ...leadOptions]}
          error={form.formState.errors.leadId?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register('when')}
          type="datetime-local"
          label={t('schedule.dateTime')}
          error={form.formState.errors.when?.message}
        />
        
        <Select
          {...form.register('status')}
          label="Status"
          options={statusOptions}
          error={form.formState.errors.status?.message}
        />
      </div>

      <Select
        {...form.register('reminderMins', { valueAsNumber: true })}
        label={t('schedule.reminder')}
        options={reminderOptions}
        error={form.formState.errors.reminderMins?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('schedule.notes')}
        </label>
        <textarea
          {...form.register('note')}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="Visit notes..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          loading={isLoading}
          className="min-w-[120px]"
        >
          {t('common.save')}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}