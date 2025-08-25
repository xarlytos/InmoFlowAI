import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { MapView } from '@/components/MapView';
import { PropertyComparisonModal } from '@/components/PropertyComparisonModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';
import { CONTACT_CONFIG, createWhatsAppUrl } from '@/config/contacts';
import { mockProperties } from '@/data/mockProperties';
import { 
  Eye, Edit, Trash2, MapPin, Grid3X3, List, Filter, 
  SortDesc, Heart, Share2, Phone, MessageCircle,
  Camera, Calendar, TrendingUp, Download, Map,
  Search, BarChart3, Users, Building2, Home
} from 'lucide-react';
import type { Property, PropertyStatus } from '@/features/core/types';

type ViewMode = 'table' | 'cards' | 'map';
type SortOption = 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'area_desc' | 'rooms_desc';

interface AdvancedFilters {
  city: string;
  status: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  minRooms: string;
  maxRooms: string;
  minArea: string;
  maxArea: string;
  hasParking: boolean;
  hasElevator: boolean;
  hasBalcony: boolean;
}

export function PropertiesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AdvancedFilters>({
    city: '',
    status: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    maxRooms: '',
    minArea: '',
    maxArea: '',
    hasParking: false,
    hasElevator: false,
    hasBalcony: false
  });

  // For demo purposes, use mock data. In production, replace with actual API call
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties', filters, sortBy, currentPage],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredProperties = [...mockProperties];
      
      // Apply filters
      if (filters.city) {
        filteredProperties = filteredProperties.filter(p => 
          p.address.city.toLowerCase().includes(filters.city.toLowerCase()) ||
          p.title.toLowerCase().includes(filters.city.toLowerCase())
        );
      }
      if (filters.status) {
        filteredProperties = filteredProperties.filter(p => p.status === filters.status);
      }
      if (filters.type) {
        filteredProperties = filteredProperties.filter(p => p.type === filters.type);
      }
      if (filters.minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price <= parseInt(filters.maxPrice));
      }
      if (filters.minRooms) {
        filteredProperties = filteredProperties.filter(p => p.features.rooms >= parseInt(filters.minRooms));
      }
      if (filters.maxRooms) {
        filteredProperties = filteredProperties.filter(p => p.features.rooms <= parseInt(filters.maxRooms));
      }
      if (filters.minArea) {
        filteredProperties = filteredProperties.filter(p => p.features.area >= parseInt(filters.minArea));
      }
      if (filters.maxArea) {
        filteredProperties = filteredProperties.filter(p => p.features.area <= parseInt(filters.maxArea));
      }
      if (filters.hasParking) {
        filteredProperties = filteredProperties.filter(p => p.features.parking);
      }
      if (filters.hasElevator) {
        filteredProperties = filteredProperties.filter(p => p.features.hasElevator);
      }
      if (filters.hasBalcony) {
        filteredProperties = filteredProperties.filter(p => p.features.hasBalcony);
      }
      
      // Apply sorting
      filteredProperties.sort((a, b) => {
        switch (sortBy) {
          case 'price_asc': return a.price - b.price;
          case 'price_desc': return b.price - a.price;
          case 'date_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'date_desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'area_desc': return b.features.area - a.features.area;
          case 'rooms_desc': return b.features.rooms - a.features.rooms;
          default: return 0;
        }
      });
      
      // Apply pagination
      const startIndex = (currentPage - 1) * 12;
      const endIndex = startIndex + 12;
      
      return {
        properties: filteredProperties.slice(startIndex, endIndex),
        total: filteredProperties.length
      };
    }
  });

  const properties = propertiesData?.properties || [];
  const totalProperties = propertiesData?.total || 0;
  const totalPages = Math.ceil(totalProperties / 12);

  // Statistics calculation
  const statistics = useMemo(() => {
    if (!properties.length) return null;
    
    const avgPrice = properties.reduce((sum: number, p: Property) => sum + p.price, 0) / properties.length;
    const statusCounts = properties.reduce((acc: Record<string, number>, p: Property) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: properties.length,
      avgPrice,
      statusCounts,
      priceRange: {
        min: Math.min(...properties.map((p: Property) => p.price)),
        max: Math.max(...properties.map((p: Property) => p.price))
      }
    };
  }, [properties]);

  // Utility functions
  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const shareProperty = (property: Property) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - €${property.price.toLocaleString()}`,
        url: `${window.location.origin}/properties/${property.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/properties/${property.id}`);
    }
  };

  const exportProperties = async (format: 'pdf' | 'excel') => {
    const selectedProps = selectedProperties.length > 0 
      ? properties.filter((p: Property) => selectedProperties.includes(p.id))
      : properties;
    
    const filename = `properties_${new Date().toISOString().split('T')[0]}`;
    
    try {
      if (format === 'pdf') {
        await exportToPDF(selectedProps, `${filename}.pdf`);
      } else {
        await exportToExcel(selectedProps, `${filename}.xlsx`);
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
    }
  };

  const getDaysOnMarket = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPricePerSqm = (price: number, area: number) => {
    return Math.round(price / area);
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      status: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      minRooms: '',
      maxRooms: '',
      minArea: '',
      maxArea: '',
      hasParking: false,
      hasElevator: false,
      hasBalcony: false
    });
  };

  const columns: ColumnDef<Property>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={selectedProperties.length === properties.length && properties.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProperties(properties.map((p: Property) => p.id));
            } else {
              setSelectedProperties([]);
            }
          }}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedProperties.includes(row.original.id)}
          onChange={() => togglePropertySelection(row.original.id)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
    },
    {
      accessorKey: 'ref',
      header: t('properties.reference'),
    },
    {
      accessorKey: 'title',
      header: t('properties.name'),
      cell: ({ row }) => {
        const property = row.original;
        const daysOnMarket = getDaysOnMarket(property.createdAt);
        const isNew = daysOnMarket <= 7;
        const pricePerSqm = getPricePerSqm(property.price, property.features.area);
        
        return (
          <div className="flex items-center gap-3">
            {property.media[0] && (
              <img
                src={property.media[0].url}
                alt={property.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white">{property.title}</p>
                {isNew && <Badge variant="success">New</Badge>}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {property.address.city} • €{pricePerSqm}/m²
              </p>
              <p className="text-xs text-gray-400">
                {daysOnMarket} days on market
              </p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'price',
      header: t('properties.price'),
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-gray-900 dark:text-white">
            €{row.original.price.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>+2.5%</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'features',
      header: t('properties.features'),
      cell: ({ row }) => {
        const features = row.original.features;
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div>{features.rooms}H • {features.baths}B • {features.area}m²</div>
            <div className="flex items-center gap-2 mt-1">
              {features.hasElevator && <span className="text-xs bg-gray-100 px-1 rounded">Elevator</span>}
              {features.parking && <span className="text-xs bg-gray-100 px-1 rounded">Parking</span>}
              {features.hasBalcony && <span className="text-xs bg-gray-100 px-1 rounded">Balcony</span>}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: t('properties.status'),
      cell: ({ row }) => <Badge variant={row.original.status}>{t(`properties.${row.original.status}`)}</Badge>
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const property = row.original;
        const isFavorite = favorites.includes(property.id);
        
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewProperty(property)}
              title="Quick preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/properties/${property.id}/edit`)}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(property.id)}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={isFavorite ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareProperty(property)}
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`tel:${CONTACT_CONFIG.phone.number}`)}
              title="Call agent"
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  const renderSkeletonLoading = () => (
    <div className="space-y-6">
      <PageHeader title={t('properties.title')} />
      
      {/* Statistics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
          </div>
        ))}
      </div>
      
      {/* Filters skeleton */}
      <div className="animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="animate-pulse space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Building2 className="mx-auto h-24 w-24 text-gray-300" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        No properties found
      </h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Try adjusting your filters or create a new property.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Button variant="outline" onClick={resetFilters}>
          Clear Filters
        </Button>
        <Button onClick={() => navigate('/properties/new')}>
          Add Property
        </Button>
      </div>
    </div>
  );

  const renderAdvancedFilters = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
        <Button variant="ghost" onClick={() => setShowFilters(false)}>
          ×
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Input
          label="City"
          value={filters.city}
          onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          placeholder="Enter city"
        />
        
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'sold', label: 'Sold' },
            { value: 'rented', label: 'Rented' },
            { value: 'reserved', label: 'Reserved' },
          ]}
        />
        
        <Select
          label="Property Type"
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          options={[
            { value: '', label: 'All Types' },
            { value: 'flat', label: 'Apartment' },
            { value: 'house', label: 'House' },
            { value: 'studio', label: 'Studio' },
            { value: 'office', label: 'Office' },
          ]}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Min Price"
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
            placeholder="0"
          />
          <Input
            label="Max Price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            placeholder="∞"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Min Rooms"
            type="number"
            value={filters.minRooms}
            onChange={(e) => setFilters(prev => ({ ...prev, minRooms: e.target.value }))}
            placeholder="1"
          />
          <Input
            label="Max Rooms"
            type="number"
            value={filters.maxRooms}
            onChange={(e) => setFilters(prev => ({ ...prev, maxRooms: e.target.value }))}
            placeholder="∞"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Min Area (m²)"
            type="number"
            value={filters.minArea}
            onChange={(e) => setFilters(prev => ({ ...prev, minArea: e.target.value }))}
            placeholder="0"
          />
          <Input
            label="Max Area (m²)"
            type="number"
            value={filters.maxArea}
            onChange={(e) => setFilters(prev => ({ ...prev, maxArea: e.target.value }))}
            placeholder="∞"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amenities
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hasParking}
                onChange={(e) => setFilters(prev => ({ ...prev, hasParking: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Parking</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hasElevator}
                onChange={(e) => setFilters(prev => ({ ...prev, hasElevator: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Elevator</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hasBalcony}
                onChange={(e) => setFilters(prev => ({ ...prev, hasBalcony: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Balcony</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
        <Button onClick={() => setShowFilters(false)}>
          Apply Filters
        </Button>
      </div>
    </div>
  );

  const renderPropertyCard = (property: Property) => {
    const isFavorite = favorites.includes(property.id);
    const isSelected = selectedProperties.includes(property.id);
    const daysOnMarket = getDaysOnMarket(property.createdAt);
    const pricePerSqm = getPricePerSqm(property.price, property.features.area);
    
    return (
      <div key={property.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={property.media[0]?.url || '/placeholder-property.jpg'}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            {daysOnMarket <= 7 && <Badge variant="success">New</Badge>}
            <Badge variant={property.status}>{property.status}</Badge>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => togglePropertySelection(property.id)}
              className="rounded border-gray-300"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(property.id)}
              className={`${isFavorite ? 'text-red-500' : 'text-white'} bg-black bg-opacity-50 hover:bg-opacity-75`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
              {property.media.length} photos
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              €{property.price.toLocaleString()}
            </h3>
            <span className="text-sm text-gray-500">€{pricePerSqm}/m²</span>
          </div>
          
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            {property.title}
          </h4>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {property.address.city} • Ref: {property.ref}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span>{property.features.rooms} rooms</span>
            <span>{property.features.baths} baths</span>
            <span>{property.features.area}m²</span>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            {property.features.hasElevator && <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Elevator</span>}
            {property.features.parking && <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Parking</span>}
            {property.features.hasBalcony && <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Balcony</span>}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>{daysOnMarket} days on market</span>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+2.5%</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setPreviewProperty(property)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`tel:${CONTACT_CONFIG.phone.number}`)}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => shareProperty(property)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map(renderPropertyCard)}
    </div>
  );

  const renderMapView = () => (
    <MapView 
      properties={properties} 
      onPropertySelect={(property) => setPreviewProperty(property)}
      height="500px"
    />
  );

  const renderQuickPreview = () => {
    if (!previewProperty) return null;
    
    return (
      <Modal
        isOpen={!!previewProperty}
        onClose={() => setPreviewProperty(null)}
        title={previewProperty.title}
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <img
              src={previewProperty.media[0]?.url || '/placeholder-property.jpg'}
              alt={previewProperty.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="flex gap-2 mt-2">
              {previewProperty.media.slice(1, 4).map((media, index) => (
                <img
                  key={index}
                  src={media.url}
                  alt={`${previewProperty.title} ${index + 2}`}
                  className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75"
                />
              ))}
              {previewProperty.media.length > 4 && (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  +{previewProperty.media.length - 4}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                €{previewProperty.price.toLocaleString()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                €{getPricePerSqm(previewProperty.price, previewProperty.features.area)}/m² • Ref: {previewProperty.ref}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Rooms: {previewProperty.features.rooms}</div>
                <div>Bathrooms: {previewProperty.features.baths}</div>
                <div>Area: {previewProperty.features.area}m²</div>
                <div>Floor: {previewProperty.features.floor || 'N/A'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Location</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {previewProperty.address.street}, {previewProperty.address.city}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                {previewProperty.description || 'No description available.'}
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1"
                onClick={() => {
                  setPreviewProperty(null);
                  navigate(`/properties/${previewProperty.id}`);
                }}
              >
                View Full Details
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(`tel:${CONTACT_CONFIG.phone.number}`)}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(createWhatsAppUrl(previewProperty.title, previewProperty.ref))}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, totalProperties)} of {totalProperties} properties
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return renderSkeletonLoading();
  }

  if (!isLoading && properties.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('properties.title')} />
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('properties.title')}
        action={{
          label: t('properties.newProperty'),
          onClick: () => navigate('/properties/new')
        }}
      />

      {/* Statistics Panel */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.total}
                </p>
                <p className="text-sm text-gray-500">Total Properties</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  €{Math.round(statistics.avgPrice).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Avg Price</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  €{statistics.priceRange.min.toLocaleString()} - €{statistics.priceRange.max.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Price Range</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  {statistics.statusCounts.active || 0}
                </p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-1 gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search properties..."
                className="pl-10"
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center gap-4">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              options={[
                { value: 'date_desc', label: 'Newest First' },
                { value: 'date_asc', label: 'Oldest First' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'area_desc', label: 'Largest Area' },
                { value: 'rooms_desc', label: 'Most Rooms' },
              ]}
            />
            
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-none border-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-l-none border-0"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Export and Bulk Actions */}
        {selectedProperties.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProperties.length} properties selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportProperties('pdf')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportProperties('excel')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(true)}
              >
                Compare
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && renderAdvancedFilters()}

      {/* Content */}
      {viewMode === 'table' && (
        <DataTable
          data={properties}
          columns={columns}
          searchPlaceholder="Search properties..."
        />
      )}
      
      {viewMode === 'cards' && renderCardsView()}
      
      {viewMode === 'map' && renderMapView()}
      
      {/* Pagination */}
      {renderPagination()}
      
      {/* Quick Preview Modal */}
      {renderQuickPreview()}
      
      {/* Comparison Modal */}
      <PropertyComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        properties={properties.filter(p => selectedProperties.includes(p.id))}
        onRemoveProperty={(propertyId) => {
          setSelectedProperties(prev => prev.filter(id => id !== propertyId));
        }}
      />
    </div>
  );
}