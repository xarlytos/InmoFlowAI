import { useState } from 'react';
import { Search, Filter, X, Calendar, MapPin, Home, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

interface Filters {
  search: string;
  propertyType: string;
  status: string[];
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  dateRange: {
    from: string;
    to: string;
  };
  portals: string[];
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

const PROPERTY_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'apartment', label: 'Piso' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'office', label: 'Oficina' },
  { value: 'land', label: 'Terreno' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'published', label: 'Publicado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'error', label: 'Error' },
  { value: 'draft', label: 'Borrador' }
];

const PORTAL_OPTIONS = [
  { value: 'Idealista', label: 'Idealista' },
  { value: 'Fotocasa', label: 'Fotocasa' },
  { value: 'Habitaclia', label: 'Habitaclia' },
  { value: 'OwnSite', label: 'Web Propia' }
];

export function FilterBar({ filters, onFiltersChange, onReset }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter('status', newStatuses);
  };

  const togglePortal = (portal: string) => {
    const newPortals = filters.portals.includes(portal)
      ? filters.portals.filter(p => p !== portal)
      : [...filters.portals, portal];
    updateFilter('portals', newPortals);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.propertyType) count++;
    if (filters.status.length > 0) count++;
    if (filters.location) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000000) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.portals.length > 0) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Main search bar */}
      <div className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar propiedades por título, referencia o dirección..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeCount > 0 && (
              <Badge variant="primary" className="ml-1">
                {activeCount}
              </Badge>
            )}
          </Button>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Home className="h-4 w-4 inline mr-1" />
                Tipo de Propiedad
              </label>
              <Select
                value={filters.propertyType}
                onChange={(e) => updateFilter('propertyType', e.target.value)}
                options={PROPERTY_TYPES}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Ubicación
              </label>
              <Input
                placeholder="Ciudad, código postal..."
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Precio Mínimo
              </label>
              <Input
                type="number"
                placeholder="€ Min"
                value={filters.priceRange.min || ''}
                onChange={(e) => updateFilter('priceRange', { 
                  ...filters.priceRange, 
                  min: parseInt(e.target.value) || 0 
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Precio Máximo
              </label>
              <Input
                type="number"
                placeholder="€ Max"
                value={filters.priceRange.max || ''}
                onChange={(e) => updateFilter('priceRange', { 
                  ...filters.priceRange, 
                  max: parseInt(e.target.value) || 1000000 
                })}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado de Publicación
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(status => (
                <button
                  key={status.value}
                  onClick={() => toggleStatus(status.value)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.status.includes(status.value)
                      ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900/20'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Portal Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Portales
            </label>
            <div className="flex flex-wrap gap-2">
              {PORTAL_OPTIONS.map(portal => (
                <button
                  key={portal.value}
                  onClick={() => togglePortal(portal.value)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.portals.includes(portal.value)
                      ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900/20'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                  }`}
                >
                  {portal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha Desde
              </label>
              <Input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => updateFilter('dateRange', { 
                  ...filters.dateRange, 
                  from: e.target.value 
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha Hasta
              </label>
              <Input
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => updateFilter('dateRange', { 
                  ...filters.dateRange, 
                  to: e.target.value 
                })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}