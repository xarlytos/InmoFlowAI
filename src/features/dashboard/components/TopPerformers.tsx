import { Trophy, Home, Users, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface TopPerformer {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  change: number;
  rank: number;
  category: 'property' | 'agent' | 'location' | 'client';
  actionUrl?: string;
}

interface TopPerformersProps {
  className?: string;
}

export function TopPerformers({ className = '' }: TopPerformersProps) {
  const { t } = useTranslation();

  const mockPerformers: TopPerformer[] = [
    {
      id: '1',
      title: 'Luxury Penthouse - Downtown',
      subtitle: 'Most viewed property',
      value: '2,847 views',
      change: 23.5,
      rank: 1,
      category: 'property',
      actionUrl: '/properties/luxury-penthouse-downtown'
    },
    {
      id: '2',
      title: 'Sarah Martinez',
      subtitle: 'Top performing agent',
      value: '€347K revenue',
      change: 18.2,
      rank: 1,
      category: 'agent',
      actionUrl: '/agents/sarah-martinez'
    },
    {
      id: '3',
      title: 'City Center District',
      subtitle: 'Highest demand area',
      value: '45 inquiries',
      change: 31.8,
      rank: 1,
      category: 'location',
      actionUrl: '/analytics/locations/city-center'
    },
    {
      id: '4',
      title: 'Elena Rodriguez',
      subtitle: 'VIP client - highest budget',
      value: '€2.5M budget',
      change: 0,
      rank: 1,
      category: 'client',
      actionUrl: '/leads/elena-rodriguez'
    },
    {
      id: '5',
      title: 'Modern Apartment - Seaside',
      subtitle: '2nd most inquiries',
      value: '1,234 inquiries',
      change: 15.7,
      rank: 2,
      category: 'property',
      actionUrl: '/properties/modern-apartment-seaside'
    }
  ];

  const { data: performers = mockPerformers } = useQuery({
    queryKey: ['topPerformers'],
    queryFn: async () => {
      // In real app: const response = await fetch('/api/analytics/top-performers');
      // return response.json();
      return mockPerformers;
    }
  });

  const getCategoryIcon = (category: TopPerformer['category']) => {
    switch (category) {
      case 'property':
        return <Home className="h-4 w-4" />;
      case 'agent':
        return <Users className="h-4 w-4" />;
      case 'location':
        return <TrendingUp className="h-4 w-4" />;
      case 'client':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: TopPerformer['category']) => {
    switch (category) {
      case 'property':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'agent':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'location':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'client':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleItemClick = (performer: TopPerformer) => {
    if (performer.actionUrl) {
      window.location.href = performer.actionUrl;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Performers
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/analytics/leaderboard'}
          className="text-sm"
        >
          View All
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {performers.map((performer, index) => (
          <div
            key={performer.id}
            className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200"
            onClick={() => handleItemClick(performer)}
          >
            {/* Rank Badge */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadgeColor(performer.rank)}`}>
              #{performer.rank}
            </div>

            {/* Category Icon */}
            <div className={`p-2 rounded-lg ${getCategoryColor(performer.category)}`}>
              {getCategoryIcon(performer.category)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {performer.title}
                </h4>
                <div className="flex items-center gap-2 ml-2">
                  {performer.change > 0 && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        +{performer.change.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {performer.subtitle}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {performer.value}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs capitalize"
                >
                  {performer.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <Trophy className="h-4 w-4 mr-1" />
          Updated in real-time based on performance metrics
        </div>
      </div>
    </div>
  );
}