import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import type { Contract, Property, Lead } from '@/features/core/types';

interface ContractFormProps {
  properties: Property[];
  leads: Lead[];
  onSubmit: (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DEFAULT_TEMPLATE = `PROPERTY PURCHASE AGREEMENT

Property: {{propertyTitle}}
Address: {{propertyAddress}}
Price: €{{propertyPrice}}

Buyer: {{clientName}}
Email: {{clientEmail}}
Phone: {{clientPhone}}

Terms and Conditions:
1. The buyer agrees to purchase the above property for the stated price.
2. A deposit of 10% is required upon signing this agreement.
3. The completion date is set for {{completionDate}}.
4. The property is sold as seen with no warranties.

Signatures:
Buyer: _________________________ Date: _________
Seller: ________________________ Date: _________`;

export function ContractForm({ properties, leads, onSubmit, onCancel, isLoading }: ContractFormProps) {
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      propertyId: '',
      leadId: '',
      template: DEFAULT_TEMPLATE,
      variables: {} as Record<string, string>
    }
  });

  const propertyOptions = properties.map(property => ({
    value: property.id,
    label: `${property.title} - ${property.ref}`
  }));

  const leadOptions = leads.map(lead => ({
    value: lead.id,
    label: `${lead.name} - ${lead.email}`
  }));

  const selectedProperty = properties.find(p => p.id === form.watch('propertyId'));
  const selectedLead = leads.find(l => l.id === form.watch('leadId'));

  const handleSubmit = (data: any) => {
    const variables: Record<string, string> = {};
    
    if (selectedProperty) {
      variables.propertyTitle = selectedProperty.title || '';
      variables.propertyAddress = selectedProperty.address ? `${selectedProperty.address.street || ''}, ${selectedProperty.address.city || ''}` : '';
      variables.propertyPrice = selectedProperty.price ? selectedProperty.price.toLocaleString() : '';
    }
    
    if (selectedLead) {
      variables.clientName = selectedLead.name || '';
      variables.clientEmail = selectedLead.email || '';
      variables.clientPhone = selectedLead.phone || '';
    }
    
    variables.completionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

    onSubmit({
      propertyId: data.propertyId,
      leadId: data.leadId,
      template: data.template,
      variables,
      status: 'draft'
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          {...form.register('propertyId')}
          label={t('contracts.property')}
          options={[{ value: '', label: 'Select property...' }, ...propertyOptions]}
        />
        
        <Select
          {...form.register('leadId')}
          label="Client"
          options={[{ value: '', label: 'Select client...' }, ...leadOptions]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('contracts.template')}
        </label>
        <textarea
          {...form.register('template')}
          rows={12}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Use variables like {{propertyTitle}}, {{clientName}}, etc.
        </p>
      </div>

      {/* Preview */}
      {selectedProperty && selectedLead && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {t('contracts.preview')}
          </h4>
          <div className="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
            {form.watch('template')
              .replace(/\{\{propertyTitle\}\}/g, selectedProperty?.title || '')
              .replace(/\{\{propertyAddress\}\}/g, selectedProperty?.address ? `${selectedProperty.address.street}, ${selectedProperty.address.city}` : '')
              .replace(/\{\{propertyPrice\}\}/g, selectedProperty?.price?.toLocaleString() || '')
              .replace(/\{\{clientName\}\}/g, selectedLead?.name || '')
              .replace(/\{\{clientEmail\}\}/g, selectedLead?.email || '')
              .replace(/\{\{clientPhone\}\}/g, selectedLead?.phone || '')
              .replace(/\{\{completionDate\}\}/g, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString())
            }
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          loading={isLoading}
          disabled={!form.watch('propertyId') || !form.watch('leadId')}
          className="min-w-[120px]"
        >
          {t('common.create')}
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