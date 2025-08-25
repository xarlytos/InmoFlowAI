import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit, Phone, Mail, DollarSign, MapPin, Calendar } from 'lucide-react';

export function LeadDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}`);
      return response.json();
    }
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits', 'lead', id],
    queryFn: async () => {
      const response = await fetch(`/api/visits?leadId=${id}`);
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

  if (!lead) {
    return (
      <div className="space-y-6">
        <PageHeader title="Lead not found" />
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            The lead you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/leads')} className="mt-4">
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={lead.name}
        subtitle={`${lead.email} • ${lead.phone}`}
        action={{
          label: 'Edit Lead',
          onClick: () => {}, // Could open edit modal
          icon: <Edit className="h-4 w-4" />
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{lead.phone}</span>
                </div>
              )}
              {lead.source && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Source:</span>
                  <Badge variant="outline">{lead.source}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          {lead.preferences && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('leads.preferences')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lead.preferences.city && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                    <p className="font-medium text-gray-900 dark:text-white">{lead.preferences.city}</p>
                  </div>
                )}
                {lead.preferences.minRooms && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Min Rooms</p>
                    <p className="font-medium text-gray-900 dark:text-white">{lead.preferences.minRooms}</p>
                  </div>
                )}
                {lead.preferences.minArea && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Min Area</p>
                    <p className="font-medium text-gray-900 dark:text-white">{lead.preferences.minArea}m²</p>
                  </div>
                )}
                {lead.preferences.maxPrice && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Max Price</p>
                    <p className="font-medium text-gray-900 dark:text-white">€{lead.preferences.maxPrice.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Visits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Visits
            </h3>
            {visits.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No visits scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {visits.map((visit: any) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(visit.when).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Property {visit.propertyId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Badge variant={visit.status}>{visit.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center">
              <Badge variant={lead.stage} className="text-lg px-4 py-2">
                {t(`leads.${lead.stage}`)}
              </Badge>
              {lead.budget && (
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    €{lead.budget.toLocaleString()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Budget</p>
                </div>
              )}
              {lead.lostReason && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <strong>Lost reason:</strong> {lead.lostReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/matching')}
                className="w-full"
                variant="secondary"
              >
                Find Matches
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

          {/* Notes */}
          {lead.note && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('leads.note')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {lead.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}