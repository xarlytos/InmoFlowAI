import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Settings, DollarSign, FileText, Star } from 'lucide-react';
import type { Portal } from '@/features/core/types';

interface PortalSettings {
  autoPublish: boolean;
  priceAdjustment: number;
  adjustmentType: 'percentage' | 'fixed';
  customDescription: string;
  useCustomDescription: boolean;
  features: string[];
  priority: number;
  autoRenewal: boolean;
  renewalDays: number;
}

interface PortalConfigProps {
  portal: Portal;
  isOpen: boolean;
  onClose: () => void;
  onSave: (portal: Portal, settings: PortalSettings) => void;
  currentSettings?: PortalSettings;
}

const DEFAULT_SETTINGS: PortalSettings = {
  autoPublish: false,
  priceAdjustment: 0,
  adjustmentType: 'percentage',
  customDescription: '',
  useCustomDescription: false,
  features: [],
  priority: 1,
  autoRenewal: false,
  renewalDays: 30
};

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Baja' },
  { value: 2, label: 'Media' },
  { value: 3, label: 'Alta' },
  { value: 4, label: 'Crítica' }
];

const COMMON_FEATURES = [
  'Aire acondicionado',
  'Calefacción',
  'Parking',
  'Jardín',
  'Piscina',
  'Ascensor',
  'Terraza',
  'Balcón'
];

export function PortalConfig({ portal, isOpen, onClose, onSave, currentSettings }: PortalConfigProps) {
  const [settings, setSettings] = useState<PortalSettings>(currentSettings || DEFAULT_SETTINGS);

  const handleSave = () => {
    onSave(portal, settings);
    onClose();
  };

  const handleFeatureToggle = (feature: string) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Settings className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configuración de {portal}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personaliza la configuración para este portal
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-4 w-4" />
              Configuración General
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publicación Automática
                  </span>
                  <Switch
                    checked={settings.autoPublish}
                    onChange={(checked) => setSettings(prev => ({ ...prev, autoPublish: checked }))}
                  />
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridad
                </label>
                <Select
                  value={settings.priority.toString()}
                  onChange={(e) => setSettings(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  options={PRIORITY_OPTIONS.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                />
              </div>
            </div>
          </div>

          {/* Price Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ajuste de Precio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Ajuste
                </label>
                <Select
                  value={settings.adjustmentType}
                  onChange={(e) => setSettings(prev => ({ ...prev, adjustmentType: e.target.value as 'percentage' | 'fixed' }))}
                  options={[
                    { value: 'percentage', label: 'Porcentaje (%)' },
                    { value: 'fixed', label: 'Cantidad fija (€)' }
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ajuste {settings.adjustmentType === 'percentage' ? '(%)' : '(€)'}
                </label>
                <Input
                  type="number"
                  value={settings.priceAdjustment}
                  onChange={(e) => setSettings(prev => ({ ...prev, priceAdjustment: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Description Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descripción Personalizada
            </h3>
            
            <div>
              <label className="flex items-center gap-2 mb-3">
                <Switch
                  checked={settings.useCustomDescription}
                  onChange={(checked) => setSettings(prev => ({ ...prev, useCustomDescription: checked }))}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Usar descripción personalizada para {portal}
                </span>
              </label>
              
              {settings.useCustomDescription && (
                <TextArea
                  value={settings.customDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, customDescription: e.target.value }))}
                  placeholder={`Descripción personalizada para ${portal}...`}
                  rows={4}
                />
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Características Destacadas
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {COMMON_FEATURES.map(feature => (
                <label key={feature} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Auto Renewal */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Renovación Automática
                  </span>
                  <Switch
                    checked={settings.autoRenewal}
                    onChange={(checked) => setSettings(prev => ({ ...prev, autoRenewal: checked }))}
                  />
                </label>
              </div>
              
              {settings.autoRenewal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Renovar cada (días)
                  </label>
                  <Input
                    type="number"
                    value={settings.renewalDays}
                    onChange={(e) => setSettings(prev => ({ ...prev, renewalDays: parseInt(e.target.value) || 30 }))}
                    min="1"
                    max="365"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </Modal>
  );
}