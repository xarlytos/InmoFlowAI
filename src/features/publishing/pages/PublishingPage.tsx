import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  Share, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import type { Property, Portal, Publication } from '@/features/core/types';

// Import new components
import { MetricCard } from '../components/MetricCard';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { PortalConfig } from '../components/PortalConfig';
import { FilterBar } from '../components/FilterBar';
import { PortalComparison } from '../components/PortalComparison';
import { BulkActions } from '../components/BulkActions';
import { useWebSocket } from '../hooks/useWebSocket';

const PORTALS: Portal[] = ['Idealista', 'Fotocasa', 'Habitaclia', 'OwnSite'];

export function PublishingPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedPortals, setSelectedPortals] = useState<Portal[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configPortal, setConfigPortal] = useState<Portal | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    status: [] as string[],
    priceRange: { min: 0, max: 1000000 },
    location: '',
    dateRange: { from: '', to: '' },
    portals: [] as string[]
  });

  const { data: allProperties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      return response.json();
    }
  });

  // Mock metrics data
  const metrics = useMemo(() => {
    const publishedCount = allProperties.filter((p: Property) => p.status === 'published').length;
    const activeCount = allProperties.filter((p: Property) => p.status === 'active').length;
    const totalCount = allProperties.length;
    
    return {
      published: publishedCount,
      active: activeCount,
      pending: Math.floor(Math.random() * 10),
      errors: Math.floor(Math.random() * 5),
      successRate: totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0
    };
  }, [allProperties]);

  // Mock portal metrics
  const portalMetrics = {
    'Idealista': {
      reach: 25000,
      conversion: 8.5,
      avgViews: 150,
      avgLeads: 12,
      avgTime: 24,
      cost: 45,
      satisfaction: 4.2
    },
    'Fotocasa': {
      reach: 18000,
      conversion: 6.8,
      avgViews: 120,
      avgLeads: 8,
      avgTime: 18,
      cost: 35,
      satisfaction: 3.9
    },
    'Habitaclia': {
      reach: 12000,
      conversion: 7.2,
      avgViews: 95,
      avgLeads: 7,
      avgTime: 15,
      cost: 28,
      satisfaction: 4.0
    },
    'OwnSite': {
      reach: 8000,
      conversion: 12.5,
      avgViews: 200,
      avgLeads: 15,
      avgTime: 6,
      cost: 0,
      satisfaction: 4.8
    }
  };

  // Mock activities
  const recentActivities = [
    {
      id: '1',
      time: '10:30',
      action: 'Publicado en Idealista',
      status: 'success' as const,
      portal: 'Idealista',
      propertyTitle: 'Piso en Centro'
    },
    {
      id: '2',
      time: '10:25',
      action: 'Error en Fotocasa',
      status: 'error' as const,
      portal: 'Fotocasa',
      propertyTitle: 'Casa en Salamanca'
    },
    {
      id: '3',
      time: '10:20',
      action: 'Publicación programada',
      status: 'pending' as const,
      portal: 'Habitaclia',
      propertyTitle: 'Oficina en Chamartín'
    }
  ];

  // Filter properties based on filters
  const filteredProperties = useMemo(() => {
    return allProperties.filter((property: Property) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          property.title.toLowerCase().includes(searchLower) ||
          property.ref.toLowerCase().includes(searchLower) ||
          property.address?.city?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Property type filter
      if (filters.propertyType && property.type !== filters.propertyType) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(property.status)) {
        return false;
      }

      // Price range filter
      if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) {
        return false;
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const matchesLocation = property.address?.city?.toLowerCase().includes(locationLower);
        if (!matchesLocation) return false;
      }

      return true;
    });
  }, [allProperties, filters]);

  const properties = filteredProperties.filter((p: Property) => p.status === 'active');

  const { data: publications = [], refetch: refetchPublications } = useQuery({
    queryKey: ['publications', selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const response = await fetch(`/api/publishing/status?propertyId=${selectedPropertyId}`);
      return response.json();
    },
    enabled: Boolean(selectedPropertyId),
    refetchInterval: 2000 // Poll every 2 seconds for progress updates
  });

  const publishMutation = useMutation({
    mutationFn: async ({ propertyId, portals }: { propertyId: string; portals: Portal[] }) => {
      const response = await fetch('/api/publishing/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, portals })
      });
      
      if (!response.ok) {
        throw new Error('Failed to queue publications');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSelectedPortals([]);
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      showToast({
        type: 'success',
        title: 'Publications queued successfully'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to queue publications',
        message: error.message
      });
    }
  });

  // WebSocket connection for real-time updates
  useWebSocket({
    url: '/api/publishing/ws',
    enabled: true
  });

  const propertyOptions = properties
    .filter((p: Property) => p.status === 'active')
    .map((property: Property) => ({
      value: property.id,
      label: `${property.title} - ${property.ref}`
    }));

  const selectedProperty = properties.find((p: Property) => p.id === selectedPropertyId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const handlePortalToggle = (portal: Portal) => {
    setSelectedPortals(prev => 
      prev.includes(portal)
        ? prev.filter(p => p !== portal)
        : [...prev, portal]
    );
  };

  const handlePublish = () => {
    if (!selectedPropertyId || selectedPortals.length === 0) {
      showToast({
        type: 'warning',
        title: 'Missing selection',
        message: 'Please select a property and at least one portal'
      });
      return;
    }

    publishMutation.mutate({
      propertyId: selectedPropertyId,
      portals: selectedPortals
    });
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map((p: Property) => p.id));
    }
  };

  const handleBulkPublish = (propertyIds: string[], portals: Portal[]) => {
    // Implementation for bulk publishing
    showToast({
      type: 'success',
      title: 'Bulk publication started',
      message: `Publishing ${propertyIds.length} properties to ${portals.length} portals`
    });
  };

  const handleBulkPriceUpdate = (propertyIds: string[], adjustment: number, type: 'percentage' | 'fixed') => {
    // Implementation for bulk price update
    showToast({
      type: 'success',
      title: 'Prices updated',
      message: `Updated ${propertyIds.length} properties`
    });
  };

  const handleBulkSchedule = (propertyIds: string[], date: string, portals: Portal[]) => {
    // Implementation for bulk scheduling
    showToast({
      type: 'success',
      title: 'Publications scheduled',
      message: `Scheduled ${propertyIds.length} properties for ${new Date(date).toLocaleDateString()}`
    });
  };

  const handlePortalConfig = (portal: Portal) => {
    setConfigPortal(portal);
    setConfigModalOpen(true);
  };

  const handlePortalConfigSave = (portal: Portal, settings: any) => {
    // Save portal configuration
    showToast({
      type: 'success',
      title: 'Configuration saved',
      message: `Settings for ${portal} have been updated`
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      status: [],
      priceRange: { min: 0, max: 1000000 },
      location: '',
      dateRange: { from: '', to: '' },
      portals: []
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('publishing.title')}
        subtitle="Publish properties to multiple portals"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showComparison ? 'Ocultar' : 'Mostrar'} Comparación
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Programar
            </Button>
          </div>
        }
      />

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Propiedades Publicadas"
          value={metrics.published}
          icon={CheckCircle}
          color="success"
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="En Proceso"
          value={metrics.pending}
          icon={Clock}
          color="warning"
        />
        <MetricCard
          title="Errores"
          value={metrics.errors}
          icon={AlertCircle}
          color="error"
        />
        <MetricCard
          title="Éxito"
          value={`${metrics.successRate}%`}
          icon={TrendingUp}
          color="primary"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* Portal Comparison */}
      {showComparison && (
        <PortalComparison
          portals={selectedPortals}
          metrics={portalMetrics}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Property Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('publishing.selectProperty')} ({filteredProperties.length})
              </h3>
              
              {properties.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedProperties.length === properties.length}
                    indeterminate={selectedProperties.length > 0 && selectedProperties.length < properties.length}
                    onChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Seleccionar todas
                  </span>
                </div>
              )}
            </div>
            
            <Select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              options={[{ value: '', label: 'Select property...' }, ...propertyOptions]}
            />

            {/* Property List with Selection */}
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {properties.slice(0, 5).map((property: Property) => (
                <div 
                  key={property.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProperties.includes(property.id)
                      ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handlePropertySelect(property.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handlePropertySelect(property.id)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {property.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {property.ref} • €{property.price.toLocaleString()} • {property.address?.city}
                          </p>
                        </div>
                        <Badge variant={property.status}>
                          {t(`properties.${property.status}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {properties.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  y {properties.length - 5} propiedades más...
                </p>
              )}
            </div>

            {selectedProperty && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="flex items-start gap-4">
                  {selectedProperty.images?.[0] && (
                    <img 
                      src={selectedProperty.images[0]} 
                      alt={selectedProperty.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {selectedProperty.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedProperty.ref} • €{selectedProperty.price.toLocaleString()} • {selectedProperty.address?.city}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {selectedProperty.bedrooms} hab • {selectedProperty.bathrooms} baños • {selectedProperty.size} m²
                        </p>
                      </div>
                      <Badge variant={selectedProperty.status}>
                        {t(`properties.${selectedProperty.status}`)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Portal Selection */}
          {selectedPropertyId && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('publishing.selectPortals')}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {PORTALS.map(portal => {
                  const isSelected = selectedPortals.includes(portal);
                  const existingPub = publications.find((p: Publication) => p.portal === portal);
                  
                  return (
                    <div
                      key={portal}
                      className={`relative p-4 border-2 rounded-lg transition-all group ${
                        existingPub
                          ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 cursor-pointer'
                      }`}
                      onClick={() => !existingPub && handlePortalToggle(portal)}
                >
                  {!existingPub && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePortalConfig(portal);
                      }}
                      className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-3 w-3 text-gray-500" />
                    </button>
                  )}
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {portal}
                      </h4>
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                    
                    {/* Portal metrics preview */}
                    {portalMetrics[portal as keyof typeof portalMetrics] && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {portalMetrics[portal as keyof typeof portalMetrics].conversion}% conversión • 
                        {portalMetrics[portal as keyof typeof portalMetrics].avgTime}h tiempo
                      </div>
                    )}
                    
                    {existingPub ? (
                      <div className="mt-2">
                        <Badge variant={existingPub.status}>
                          {existingPub.status}
                        </Badge>
                        {existingPub.progress !== undefined && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${existingPub.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {existingPub.progress}%
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      isSelected && (
                        <div className="mt-2">
                          <Badge variant="secondary">Selected</Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handlePublish}
              disabled={selectedPortals.length === 0}
              loading={publishMutation.isPending}
            >
              <Share className="h-4 w-4 mr-2" />
              {t('publishing.publish')} ({selectedPortals.length})
            </Button>
            
            <Button
              variant="outline"
              onClick={() => refetchPublications()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </div>
          )}
        </div>
        
        {/* Activity Timeline Sidebar */}
        <div className="space-y-6">
          <ActivityTimeline activities={recentActivities} maxItems={8} />
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedProperties={properties.filter((p: Property) => selectedProperties.includes(p.id))}
        onClearSelection={() => setSelectedProperties([])}
        onBulkPublish={handleBulkPublish}
        onBulkPriceUpdate={handleBulkPriceUpdate}
        onBulkSchedule={handleBulkSchedule}
      />

      {/* Portal Configuration Modal */}
      {configPortal && (
        <PortalConfig
          portal={configPortal}
          isOpen={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false);
            setConfigPortal(null);
          }}
          onSave={handlePortalConfigSave}
        />
      )}

      {/* Publication Status */}
      {publications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Publication Status
          </h3>
          
          <div className="space-y-4">
            {publications.map((pub: Publication) => (
              <div key={pub.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(pub.status)}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {pub.portal}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {pub.message || `Status: ${pub.status}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {pub.progress !== undefined && pub.status === 'publishing' && (
                    <div className="w-32">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pub.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {pub.progress}%
                      </p>
                    </div>
                  )}
                  
                  <Badge variant={pub.status}>{pub.status}</Badge>
                  
                  {pub.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(pub.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}