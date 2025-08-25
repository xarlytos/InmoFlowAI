import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { 
  Share, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  CheckCircle,
  X,
  Settings
} from 'lucide-react';
import type { Property, Portal } from '@/features/core/types';

interface BulkActionsProps {
  selectedProperties: Property[];
  onClearSelection: () => void;
  onBulkPublish: (propertyIds: string[], portals: Portal[]) => void;
  onBulkPriceUpdate: (propertyIds: string[], adjustment: number, type: 'percentage' | 'fixed') => void;
  onBulkSchedule: (propertyIds: string[], date: string, portals: Portal[]) => void;
}

const PORTALS: Portal[] = ['Idealista', 'Fotocasa', 'Habitaclia', 'OwnSite'];

export function BulkActions({ 
  selectedProperties, 
  onClearSelection, 
  onBulkPublish, 
  onBulkPriceUpdate,
  onBulkSchedule 
}: BulkActionsProps) {
  const [activeModal, setActiveModal] = useState<'publish' | 'price' | 'schedule' | null>(null);
  const [selectedPortals, setSelectedPortals] = useState<Portal[]>([]);
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'percentage' | 'fixed'>('percentage');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const { showToast } = useToast();

  const handlePortalToggle = (portal: Portal) => {
    setSelectedPortals(prev => 
      prev.includes(portal)
        ? prev.filter(p => p !== portal)
        : [...prev, portal]
    );
  };

  const handleBulkPublish = () => {
    if (selectedPortals.length === 0) {
      showToast({
        type: 'warning',
        title: 'Selecciona portales',
        message: 'Debes seleccionar al menos un portal'
      });
      return;
    }

    const propertyIds = selectedProperties.map(p => p.id);
    onBulkPublish(propertyIds, selectedPortals);
    setActiveModal(null);
    setSelectedPortals([]);
    onClearSelection();
  };

  const handleBulkPriceUpdate = () => {
    if (priceAdjustment === 0) {
      showToast({
        type: 'warning',
        title: 'Ajuste de precio',
        message: 'Debes especificar un ajuste de precio'
      });
      return;
    }

    const propertyIds = selectedProperties.map(p => p.id);
    onBulkPriceUpdate(propertyIds, priceAdjustment, adjustmentType);
    setActiveModal(null);
    setPriceAdjustment(0);
    onClearSelection();
  };

  const handleBulkSchedule = () => {
    if (!scheduleDate || selectedPortals.length === 0) {
      showToast({
        type: 'warning',
        title: 'Datos incompletos',
        message: 'Debes seleccionar fecha, hora y portales'
      });
      return;
    }

    const propertyIds = selectedProperties.map(p => p.id);
    const fullDate = `${scheduleDate}T${scheduleTime}`;
    onBulkSchedule(propertyIds, fullDate, selectedPortals);
    setActiveModal(null);
    setScheduleDate('');
    setSelectedPortals([]);
    onClearSelection();
  };

  if (selectedProperties.length === 0) return null;

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedProperties.length} propiedades seleccionadas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setActiveModal('publish')}
              className="flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              Publicar
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveModal('price')}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Precios
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveModal('schedule')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Programar
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Properties Preview */}
        <div className="mt-3 flex flex-wrap gap-1 max-w-96">
          {selectedProperties.slice(0, 3).map(property => (
            <Badge key={property.id} variant="secondary" size="sm">
              {property.title}
            </Badge>
          ))}
          {selectedProperties.length > 3 && (
            <Badge variant="secondary" size="sm">
              +{selectedProperties.length - 3} más
            </Badge>
          )}
        </div>
      </div>

      {/* Bulk Publish Modal */}
      <Modal 
        isOpen={activeModal === 'publish'} 
        onClose={() => setActiveModal(null)}
        title="Publicación Masiva"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Publicar {selectedProperties.length} propiedades en los portales seleccionados
          </p>

          <div className="grid grid-cols-2 gap-3">
            {PORTALS.map(portal => (
              <label
                key={portal}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPortals.includes(portal)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Checkbox
                  checked={selectedPortals.includes(portal)}
                  onChange={() => handlePortalToggle(portal)}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {portal}
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleBulkPublish}>
              Publicar en {selectedPortals.length} portales
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Price Update Modal */}
      <Modal 
        isOpen={activeModal === 'price'} 
        onClose={() => setActiveModal(null)}
        title="Actualización Masiva de Precios"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Ajustar precios de {selectedProperties.length} propiedades
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Ajuste
              </label>
              <Select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as 'percentage' | 'fixed')}
                options={[
                  { value: 'percentage', label: 'Porcentaje (%)' },
                  { value: 'fixed', label: 'Cantidad fija (€)' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ajuste {adjustmentType === 'percentage' ? '(%)' : '(€)'}
              </label>
              <Input
                type="number"
                value={priceAdjustment}
                onChange={(e) => setPriceAdjustment(parseFloat(e.target.value) || 0)}
                placeholder={adjustmentType === 'percentage' ? 'ej: 5' : 'ej: 1000'}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Vista previa del cambio:</strong>
              {adjustmentType === 'percentage' 
                ? ` ${priceAdjustment > 0 ? '+' : ''}${priceAdjustment}%`
                : ` ${priceAdjustment > 0 ? '+' : ''}€${Math.abs(priceAdjustment)}`
              }
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleBulkPriceUpdate}>
              Actualizar Precios
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Schedule Modal */}
      <Modal 
        isOpen={activeModal === 'schedule'} 
        onClose={() => setActiveModal(null)}
        title="Programar Publicaciones"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Programar la publicación de {selectedProperties.length} propiedades
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha
              </label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora
              </label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Portales
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PORTALS.map(portal => (
                <label
                  key={portal}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedPortals.includes(portal)}
                    onChange={() => handlePortalToggle(portal)}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {portal}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleBulkSchedule}>
              Programar Publicaciones
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}