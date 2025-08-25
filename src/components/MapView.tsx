import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/features/core/types';
import { Button } from '@/components/ui/Button';
import { MapPin, X } from 'lucide-react';

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  height?: string;
}

export function MapView({ properties, onPropertySelect, height = '500px' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([40.4168, -3.7038], 12); // Madrid center
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    if (properties.length === 0) return;

    const map = mapInstanceRef.current;
    const bounds = L.latLngBounds([]);

    // Add markers for properties
    properties.forEach((property) => {
      // Use provided coordinates or generate mock ones for demo
      const lat = property.address.lat || (40.4168 + (Math.random() - 0.5) * 0.2);
      const lng = property.address.lng || (-3.7038 + (Math.random() - 0.5) * 0.3);

      const marker = L.marker([lat, lng]).addTo(map);
      
      // Create popup content
      const popupContent = `
        <div style="min-width: 250px;">
          <div style="display: flex; gap: 12px; margin-bottom: 8px;">
            ${property.media[0] ? `<img src="${property.media[0].url}" alt="${property.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;">` : ''}
            <div style="flex: 1;">
              <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${property.title}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">${property.address.city}</p>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <span style="font-size: 18px; font-weight: 700; color: #059669;">€${property.price.toLocaleString()}</span>
            <span style="color: #666; margin-left: 8px;">€${Math.round(property.price / property.features.area)}/m²</span>
          </div>
          <div style="font-size: 14px; color: #666; margin-bottom: 12px;">
            ${property.features.rooms} rooms • ${property.features.baths} baths • ${property.features.area}m²
          </div>
          <button 
            onclick="window.selectMapProperty('${property.id}')"
            style="
              background: #059669; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 6px; 
              cursor: pointer; 
              font-size: 14px;
              width: 100%;
            "
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'property-popup'
      });

      marker.on('click', () => {
        setSelectedProperty(property);
      });

      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    // Fit map to show all markers
    if (properties.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    // Global function for popup button clicks
    (window as any).selectMapProperty = (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId);
      if (property && onPropertySelect) {
        onPropertySelect(property);
      }
    };

    return () => {
      delete (window as any).selectMapProperty;
    };
  }, [properties, onPropertySelect]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200 dark:border-gray-700"
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white dark:bg-gray-800 shadow-lg"
          onClick={() => {
            if (mapInstanceRef.current && properties.length > 0) {
              const bounds = L.latLngBounds([]);
              properties.forEach(property => {
                const lat = property.address.lat || (40.4168 + (Math.random() - 0.5) * 0.2);
                const lng = property.address.lng || (-3.7038 + (Math.random() - 0.5) * 0.3);
                bounds.extend([lat, lng]);
              });
              mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
            }
          }}
        >
          <MapPin className="h-4 w-4" />
          Fit All
        </Button>
      </div>

      {/* Property Info Panel */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedProperty.title}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProperty(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-green-600">
                €{selectedProperty.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">
                €{Math.round(selectedProperty.price / selectedProperty.features.area)}/m²
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProperty.address.city}
            </p>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProperty.features.rooms} rooms • {selectedProperty.features.baths} baths • {selectedProperty.features.area}m²
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onPropertySelect?.(selectedProperty)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs border border-gray-200 dark:border-gray-700">
        <div className="font-semibold mb-2 text-gray-900 dark:text-white">Legend</div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Properties ({properties.length})</span>
        </div>
      </div>
    </div>
  );
}