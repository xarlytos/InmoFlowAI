import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { PropertyFormData } from '../schemas/property';

interface PropertyFormProps {
  form: UseFormReturn<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function PropertyForm({ form, onSubmit, isLoading, onCancel }: PropertyFormProps) {
  const { t } = useTranslation();

  const statusOptions = [
    { value: 'draft', label: t('properties.draft') },
    { value: 'active', label: t('properties.active') },
    { value: 'reserved', label: t('properties.reserved') },
    { value: 'sold', label: t('properties.sold') },
    { value: 'rented', label: t('properties.rented') }
  ];

  const typeOptions = [
    { value: 'flat', label: 'Flat' },
    { value: 'house', label: 'House' },
    { value: 'studio', label: 'Studio' },
    { value: 'office', label: 'Office' },
    { value: 'plot', label: 'Plot' }
  ];

  const currencyOptions = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' }
  ];

  const heatingOptions = [
    { value: 'none', label: 'None' },
    { value: 'gas', label: 'Gas' },
    { value: 'electric', label: 'Electric' },
    { value: 'central', label: 'Central' }
  ];

  const energyOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
    { value: 'G', label: 'G' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...form.register('ref')}
            label={t('properties.reference')}
            error={form.formState.errors.ref?.message}
          />
          
          <Input
            {...form.register('title')}
            label={t('properties.name')}
            error={form.formState.errors.title?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            {...form.register('price', { valueAsNumber: true })}
            type="number"
            label={t('properties.price')}
            error={form.formState.errors.price?.message}
          />
          
          <Select
            {...form.register('currency')}
            label={t('properties.currency')}
            options={currencyOptions}
            error={form.formState.errors.currency?.message}
          />
          
          <Select
            {...form.register('status')}
            label={t('properties.status')}
            options={statusOptions}
            error={form.formState.errors.status?.message}
          />
        </div>

        <Select
          {...form.register('type')}
          label={t('properties.type')}
          options={typeOptions}
          error={form.formState.errors.type?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('properties.description')}
          </label>
          <textarea
            {...form.register('description')}
            rows={4}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Property description..."
          />
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('properties.address')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...form.register('address.street')}
              label="Street"
              error={form.formState.errors.address?.street?.message}
            />
            
            <Input
              {...form.register('address.city')}
              label="City"
              error={form.formState.errors.address?.city?.message}
            />
            
            <Input
              {...form.register('address.zip')}
              label="ZIP Code"
              error={form.formState.errors.address?.zip?.message}
            />
            
            <Input
              {...form.register('address.country')}
              label="Country"
              error={form.formState.errors.address?.country?.message}
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('properties.features')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              {...form.register('features.rooms', { valueAsNumber: true })}
              type="number"
              label={t('properties.rooms')}
              error={form.formState.errors.features?.rooms?.message}
            />
            
            <Input
              {...form.register('features.baths', { valueAsNumber: true })}
              type="number"
              label={t('properties.baths')}
              error={form.formState.errors.features?.baths?.message}
            />
            
            <Input
              {...form.register('features.area', { valueAsNumber: true })}
              type="number"
              label={`${t('properties.area')} (m²)`}
              error={form.formState.errors.features?.area?.message}
            />
            
            <Input
              {...form.register('features.floor', { valueAsNumber: true })}
              type="number"
              label={t('properties.floor')}
              error={form.formState.errors.features?.floor?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              {...form.register('features.heating')}
              label={t('properties.heating')}
              options={heatingOptions}
              error={form.formState.errors.features?.heating?.message}
            />
            
            <Input
              {...form.register('features.year', { valueAsNumber: true })}
              type="number"
              label={t('properties.year')}
              error={form.formState.errors.features?.year?.message}
            />
            
            <Select
              {...form.register('features.energyLabel')}
              label={t('properties.energyLabel')}
              options={energyOptions}
              error={form.formState.errors.features?.energyLabel?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input
                {...form.register('features.hasElevator')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('properties.elevator')}
              </span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                {...form.register('features.hasBalcony')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('properties.balcony')}
              </span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                {...form.register('features.parking')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('properties.parking')}
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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
    </div>
  );
}