import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit, MapPin, Calendar, Share } from 'lucide-react';

export function PropertyDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery({
    queryKey: ['properties', id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading..." />
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-6">
        <PageHeader title="Property not found" />
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            The property you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate('/properties')}
            className="mt-4"
          >
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={property.title}
        subtitle={`${property.ref} • ${property.address.city}`}
        action={{
          label: 'Edit Property',
          onClick: () => navigate(`/properties/${id}/edit`),
          icon: <Edit className="h-4 w-4" />
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Gallery */}
          {property.media.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Media Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.media.map((media: any) => (
                  <div key={media.id} className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('properties.features')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {property.features.rooms}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('properties.rooms')}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {property.features.baths}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('properties.baths')}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {property.features.area}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  m²
                </p>
              </div>
              {property.features.floor && (
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {property.features.floor}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('properties.floor')}
                  </p>
                </div>
              )}
            </div>

            {/* Additional features */}
            <div className="mt-4 flex flex-wrap gap-2">
              {property.features.hasElevator && (
                <Badge variant="secondary">{t('properties.elevator')}</Badge>
              )}
              {property.features.hasBalcony && (
                <Badge variant="secondary">{t('properties.balcony')}</Badge>
              )}
              {property.features.parking && (
                <Badge variant="secondary">{t('properties.parking')}</Badge>
              )}
              {property.features.heating && property.features.heating !== 'none' && (
                <Badge variant="secondary">{property.features.heating} heating</Badge>
              )}
              {property.features.energyLabel && (
                <Badge variant="secondary">Energy: {property.features.energyLabel}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price & Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                €{property.price.toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {property.currency}
              </p>
              <div className="mt-4">
                <Badge variant={property.status}>{t(`properties.${property.status}`)}</Badge>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">{property.address.street}</p>
              <p className="text-gray-700 dark:text-gray-300">{property.address.city}</p>
              {property.address.zip && (
                <p className="text-gray-700 dark:text-gray-300">{property.address.zip}</p>
              )}
              <p className="text-gray-700 dark:text-gray-300">{property.address.country}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/publishing')}
                className="w-full"
                variant="secondary"
              >
                <Share className="h-4 w-4 mr-2" />
                Publish to Portals
              </Button>
              
              <Button
                onClick={() => navigate('/schedule')}
                className="w-full"
                variant="outline"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Visit
              </Button>
            </div>
          </div>

          {/* Tags */}
          {property.tags && property.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('properties.tags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}