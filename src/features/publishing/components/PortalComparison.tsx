import { TrendingUp, Users, DollarSign, Clock, Target, Eye, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Portal } from '@/features/core/types';

interface PortalMetrics {
  reach: number;
  conversion: number;
  avgViews: number;
  avgLeads: number;
  avgTime: number;
  cost: number;
  satisfaction: number;
}

interface PortalComparisonProps {
  portals: Portal[];
  metrics: Record<Portal, PortalMetrics>;
}

const METRIC_CONFIG = {
  reach: {
    label: 'Alcance',
    icon: Users,
    format: (value: number) => `${(value / 1000).toFixed(1)}K`,
    color: 'text-blue-600'
  },
  conversion: {
    label: 'Conversión',
    icon: Target,
    format: (value: number) => `${value.toFixed(1)}%`,
    color: 'text-green-600'
  },
  avgViews: {
    label: 'Visitas Med.',
    icon: Eye,
    format: (value: number) => value.toLocaleString(),
    color: 'text-purple-600'
  },
  avgLeads: {
    label: 'Leads Med.',
    icon: Heart,
    format: (value: number) => value.toString(),
    color: 'text-pink-600'
  },
  avgTime: {
    label: 'Tiempo Med.',
    icon: Clock,
    format: (value: number) => `${value}h`,
    color: 'text-yellow-600'
  },
  cost: {
    label: 'Coste',
    icon: DollarSign,
    format: (value: number) => `€${value}`,
    color: 'text-red-600'
  },
  satisfaction: {
    label: 'Satisfacción',
    icon: TrendingUp,
    format: (value: number) => `${value}/5`,
    color: 'text-indigo-600'
  }
};

export function PortalComparison({ portals, metrics }: PortalComparisonProps) {
  if (portals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Selecciona portales para ver la comparación
        </p>
      </div>
    );
  }

  const getBestPortalForMetric = (metric: keyof PortalMetrics) => {
    let best = portals[0];
    let bestValue = metrics[best]?.[metric] || 0;
    
    portals.forEach(portal => {
      const value = metrics[portal]?.[metric] || 0;
      if (metric === 'cost' || metric === 'avgTime') {
        // Para coste y tiempo, menor es mejor
        if (value < bestValue) {
          best = portal;
          bestValue = value;
        }
      } else {
        // Para el resto, mayor es mejor
        if (value > bestValue) {
          best = portal;
          bestValue = value;
        }
      }
    });
    
    return best;
  };

  const getScoreColor = (portal: Portal, metric: keyof PortalMetrics) => {
    const best = getBestPortalForMetric(metric);
    if (portal === best) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
    
    const value = metrics[portal]?.[metric] || 0;
    const bestValue = metrics[best]?.[metric] || 0;
    const ratio = bestValue === 0 ? 0 : value / bestValue;
    
    if (ratio >= 0.8) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comparación de Portales
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Rendimiento y métricas de cada portal
        </p>
      </div>

      {/* Header con nombres de portales */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                Métrica
              </th>
              {portals.map(portal => (
                <th key={portal} className="text-center p-4 font-medium text-gray-900 dark:text-white min-w-32">
                  <div className="flex flex-col items-center gap-1">
                    <span>{portal}</span>
                    {getBestPortalForMetric('conversion') === portal && (
                      <Badge variant="success" size="sm">Top</Badge>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {Object.entries(METRIC_CONFIG).map(([metricKey, config]) => {
              const Icon = config.icon;
              return (
                <tr key={metricKey} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {config.label}
                      </span>
                    </div>
                  </td>
                  
                  {portals.map(portal => {
                    const value = metrics[portal]?.[metricKey as keyof PortalMetrics] || 0;
                    return (
                      <td key={portal} className="p-4 text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(portal, metricKey as keyof PortalMetrics)}`}>
                          {config.format(value)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen y recomendaciones */}
      <div className="p-6 bg-gray-50 dark:bg-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Recomendaciones
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portals.map(portal => {
            const portalMetrics = metrics[portal];
            if (!portalMetrics) return null;

            // Calcular puntuación general
            const score = (
              (portalMetrics.conversion / 10) * 0.3 +
              (portalMetrics.reach / 10000) * 0.2 +
              (portalMetrics.avgViews / 1000) * 0.2 +
              (portalMetrics.avgLeads / 10) * 0.2 +
              (portalMetrics.satisfaction / 5) * 0.1
            ) * 100;

            let recommendation = '';
            if (score >= 80) {
              recommendation = 'Excelente opción para propiedades premium';
            } else if (score >= 60) {
              recommendation = 'Buena opción para la mayoría de propiedades';
            } else if (score >= 40) {
              recommendation = 'Adecuado para propiedades específicas';
            } else {
              recommendation = 'Considerar otros portales principales';
            }

            return (
              <div key={portal} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {portal}
                  </h5>
                  <Badge 
                    variant={score >= 70 ? 'success' : score >= 50 ? 'warning' : 'secondary'}
                  >
                    {Math.round(score)}/100
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {recommendation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}