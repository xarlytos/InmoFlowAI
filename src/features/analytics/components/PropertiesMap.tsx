import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import type { Property } from '@/features/core/types';

interface PropertiesMapProps {
  properties: Property[];
}

export function PropertiesMap({ properties }: PropertiesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Fallback SVG map when Leaflet is not available
  const FallbackMap = () => {
    const propertiesWithCoords = properties.filter(p => p.address.lat && p.address.lng);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Properties Map
        </h3>
        
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
          <div className="grid grid-cols-8 gap-2 mb-6">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-sm"
              />
            ))}
          </div>
          
          <div className="space-y-2">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">
              Map visualization ({propertiesWithCoords.length} properties)
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Interactive map would show property locations
            </p>
          </div>
        </div>

        {/* Properties List */}
        <div className="mt-6 space-y-2">
          {properties.slice(0, 5).map(property => (
            <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {property.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {property.address.city}
                  </p>
                </div>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                €{property.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return <FallbackMap />;
}