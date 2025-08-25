import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Property } from '@/features/core/types';
import { X, MapPin, Calendar, TrendingUp, Home } from 'lucide-react';

interface PropertyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onRemoveProperty?: (propertyId: string) => void;
}

export function PropertyComparisonModal({ 
  isOpen, 
  onClose, 
  properties, 
  onRemoveProperty 
}: PropertyComparisonModalProps) {
  const getDaysOnMarket = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPricePerSqm = (price: number, area: number) => {
    return Math.round(price / area);
  };

  const getComparisonValue = (value: number, values: number[], isHigherBetter = true) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    if (value === max && isHigherBetter) return 'best';
    if (value === min && !isHigherBetter) return 'best';
    if (value === max && !isHigherBetter) return 'worst';
    if (value === min && isHigherBetter) return 'worst';
    return 'neutral';
  };

  const prices = properties.map(p => p.price);
  const pricesPerSqm = properties.map(p => getPricePerSqm(p.price, p.features.area));
  const areas = properties.map(p => p.features.area);
  const rooms = properties.map(p => p.features.rooms);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Compare Properties (${properties.length})`}
      size="xl"
    >
      <div className="space-y-6">
        {properties.length === 0 ? (
          <div className="text-center py-8">
            <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No properties selected for comparison</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                    Property
                  </th>
                  {properties.map((property) => (
                    <th key={property.id} className="text-center p-3 min-w-[200px] relative">
                      {onRemoveProperty && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveProperty(property.id)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      <div className="space-y-2">
                        {property.media[0] && (
                          <img
                            src={property.media[0].url}
                            alt={property.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                            {property.title}
                          </h3>
                          <p className="text-xs text-gray-500">Ref: {property.ref}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Price */}
                <tr>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Price
                  </td>
                  {properties.map((property) => {
                    const comparison = getComparisonValue(property.price, prices, false);
                    return (
                      <td key={property.id} className="p-3 text-center">
                        <span className={`font-semibold ${
                          comparison === 'best' ? 'text-green-600' :
                          comparison === 'worst' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          €{property.price.toLocaleString()}
                        </span>
                        {comparison === 'best' && (
                          <div className="text-xs text-green-600 mt-1">{t('comparison.bestPrice')}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Price per m² */}
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Price per m²
                  </td>
                  {properties.map((property) => {
                    const pricePerSqm = getPricePerSqm(property.price, property.features.area);
                    const comparison = getComparisonValue(pricePerSqm, pricesPerSqm, false);
                    return (
                      <td key={property.id} className="p-3 text-center">
                        <span className={`font-medium ${
                          comparison === 'best' ? 'text-green-600' :
                          comparison === 'worst' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          €{pricePerSqm}
                        </span>
                        {comparison === 'best' && (
                          <div className="text-xs text-green-600 mt-1">{t('comparison.bestValue')}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Area */}
                <tr>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Area
                  </td>
                  {properties.map((property) => {
                    const comparison = getComparisonValue(property.features.area, areas, true);
                    return (
                      <td key={property.id} className="p-3 text-center">
                        <span className={`font-medium ${
                          comparison === 'best' ? 'text-green-600' :
                          comparison === 'worst' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {property.features.area}m²
                        </span>
                        {comparison === 'best' && (
                          <div className="text-xs text-green-600 mt-1">Largest</div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Rooms */}
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Rooms
                  </td>
                  {properties.map((property) => {
                    const comparison = getComparisonValue(property.features.rooms, rooms, true);
                    return (
                      <td key={property.id} className="p-3 text-center">
                        <span className={`font-medium ${
                          comparison === 'best' ? 'text-green-600' :
                          comparison === 'worst' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {property.features.rooms}
                        </span>
                        {comparison === 'best' && (
                          <div className="text-xs text-green-600 mt-1">{t('comparison.mostRooms')}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Bathrooms */}
                <tr>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Bathrooms
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-gray-900 dark:text-white">
                      {property.features.baths}
                    </td>
                  ))}
                </tr>

                {/* Floor */}
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Floor
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-gray-900 dark:text-white">
                      {property.features.floor || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Status */}
                <tr>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Status
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3 text-center">
                      <Badge variant={property.status}>{property.status}</Badge>
                    </td>
                  ))}
                </tr>

                {/* Location */}
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Location
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{property.address.city}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Days on Market */}
                <tr>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Days on Market
                  </td>
                  {properties.map((property) => {
                    const days = getDaysOnMarket(property.createdAt);
                    return (
                      <td key={property.id} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{days} days</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Amenities */}
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Amenities
                  </td>
                  {properties.map((property) => {
                    const amenities = [];
                    if (property.features.hasElevator) amenities.push('Elevator');
                    if (property.features.parking) amenities.push('Parking');
                    if (property.features.hasBalcony) amenities.push('Balcony');
                    
                    return (
                      <td key={property.id} className="p-3 text-center">
                        <div className="space-y-1">
                          {amenities.length > 0 ? (
                            amenities.map((amenity) => (
                              <span 
                                key={amenity}
                                className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-1 mb-1"
                              >
                                {amenity}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Energy Label */}
                <tr>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Energy Label
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-gray-900 dark:text-white">
                      {property.features.energyLabel || 'N/A'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {properties.length > 0 && (
            <Button 
              onClick={() => {
                // Here you could implement print or export functionality
                window.print();
              }}
            >
              Print Comparison
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}