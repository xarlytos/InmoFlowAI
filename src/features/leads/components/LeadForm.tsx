import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { leadSchema, type LeadFormData } from '../schemas/lead';

interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<LeadFormData>;
}

export function LeadForm({ onSubmit, onCancel, isLoading, defaultValues }: LeadFormProps) {
  const { t } = useTranslation();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      stage: 'new',
      budget: undefined,
      source: '',
      note: '',
      preferences: {
        city: '',
        type: [],
        minRooms: undefined,
        minArea: undefined,
        maxPrice: undefined,
        mustHave: []
      },
      ...defaultValues
    }
  });

  const stageOptions = [
    { value: 'new', label: t('leads.new') },
    { value: 'qualified', label: t('leads.qualified') },
    { value: 'visiting', label: t('leads.visiting') },
    { value: 'offer', label: t('leads.offer') },
    { value: 'won', label: t('leads.won') },
    { value: 'lost', label: t('leads.lost') }
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register('name')}
          label={t('leads.name')}
          error={form.formState.errors.name?.message}
        />
        
        <Select
          {...form.register('stage')}
          label={t('leads.stage')}
          options={stageOptions}
          error={form.formState.errors.stage?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register('email')}
          type="email"
          label={t('leads.email')}
          error={form.formState.errors.email?.message}
        />
        
        <Input
          {...form.register('phone')}
          label={t('leads.phone')}
          error={form.formState.errors.phone?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register('budget', { valueAsNumber: true })}
          type="number"
          label={t('leads.budget')}
          error={form.formState.errors.budget?.message}
        />
        
        <Input
          {...form.register('source')}
          label={t('leads.source')}
          error={form.formState.errors.source?.message}
        />
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('leads.preferences')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...form.register('preferences.city')}
            label="Preferred City"
            error={form.formState.errors.preferences?.city?.message}
          />
          
          <Input
            {...form.register('preferences.maxPrice', { valueAsNumber: true })}
            type="number"
            label="Max Price"
            error={form.formState.errors.preferences?.maxPrice?.message}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            {...form.register('preferences.minRooms', { valueAsNumber: true })}
            type="number"
            label="Min Rooms"
            error={form.formState.errors.preferences?.minRooms?.message}
          />
          
          <Input
            {...form.register('preferences.minArea', { valueAsNumber: true })}
            type="number"
            label="Min Area"
            error={form.formState.errors.preferences?.minArea?.message}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('leads.note')}
        </label>
        <textarea
          {...form.register('note')}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="Additional notes..."
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