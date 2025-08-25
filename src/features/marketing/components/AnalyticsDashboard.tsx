import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share,
  DollarSign,
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import type { ContentHistory, ContentMetrics } from '../types/marketing';

interface AnalyticsDashboardProps {
  contentHistory: ContentHistory[];
  onRefresh: () => void;
  onExportReport: (format: 'pdf' | 'csv') => void;
}

export function AnalyticsDashboard({ 
  contentHistory, 
  onRefresh, 
  onExportReport 
}: AnalyticsDashboardProps) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [contentType, setContentType] = useState<'all' | 'ad' | 'email' | 'social'>('all');

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const contentTypeOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'ad', label: 'Ads' },
    { value: 'email', label: 'Emails' },
    { value: 'social', label: 'Social Media' }
  ];

  // Filter content based on time range and type
  const getFilterDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d': return new Date(now.setDate(now.getDate() - 7));
      case '30d': return new Date(now.setDate(now.getDate() - 30));
      case '90d': return new Date(now.setDate(now.getDate() - 90));
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(now.setDate(now.getDate() - 30));
    }
  };

  const filteredContent = contentHistory.filter(content => {
    const matchesTimeRange = new Date(content.createdAt) >= getFilterDate();
    const matchesType = contentType === 'all' || content.type === contentType;
    return matchesTimeRange && matchesType && content.metrics;
  });

  // Calculate aggregate metrics
  const totalContent = filteredContent.length;
  const totalEngagement = filteredContent.reduce((sum, content) => 
    sum + (content.metrics?.engagement || 0), 0);
  const avgEngagement = totalContent > 0 ? totalEngagement / totalContent : 0;
  
  const totalReach = filteredContent.reduce((sum, content) => 
    sum + (content.metrics?.reach || 0), 0);
  
  const totalConversions = filteredContent.reduce((sum, content) => 
    sum + (content.metrics?.conversions || 0), 0);
  
  const avgSeoScore = filteredContent.reduce((sum, content) => 
    sum + (content.metrics?.seoScore || 0), 0) / (totalContent || 1);

  // Calculate trends (simplified - would need historical data for real trends)
  const engagementTrend = avgEngagement > 5 ? 'up' : avgEngagement < 3 ? 'down' : 'stable';
  const reachTrend = totalReach > 10000 ? 'up' : totalReach < 5000 ? 'down' : 'stable';

  // Top performing content
  const topContent = filteredContent
    .sort((a, b) => (b.metrics?.engagement || 0) - (a.metrics?.engagement || 0))
    .slice(0, 5);

  // Content performance by type
  const performanceByType = contentTypeOptions.slice(1).map(option => {
    const typeContent = filteredContent.filter(c => c.type === option.value);
    const avgEng = typeContent.length > 0 
      ? typeContent.reduce((sum, c) => sum + (c.metrics?.engagement || 0), 0) / typeContent.length
      : 0;
    
    return {
      type: option.label,
      count: typeContent.length,
      avgEngagement: avgEng,
      totalReach: typeContent.reduce((sum, c) => sum + (c.metrics?.reach || 0), 0)
    };
  });

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    icon: Icon,
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
    icon: any;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400',
      purple: 'bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
    };

    return (
      <div className={`${colorClasses[color]} rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-6 w-6" />
          {trend && (
            <div className="flex items-center">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm font-medium">{title}</div>
        {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h3>
        
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            options={timeRangeOptions}
          />
          
          <Select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as 'all' | 'ad' | 'email' | 'social')}
            options={contentTypeOptions}
          />

          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onExportReport('pdf')}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Content"
          value={totalContent}
          subtitle="Pieces created"
          icon={BarChart3}
          color="blue"
        />
        
        <MetricCard
          title="Avg. Engagement"
          value={`${avgEngagement.toFixed(1)}%`}
          trend={engagementTrend}
          icon={Heart}
          color="green"
        />
        
        <MetricCard
          title="Total Reach"
          value={totalReach.toLocaleString()}
          trend={reachTrend}
          subtitle="People reached"
          icon={Users}
          color="purple"
        />
        
        <MetricCard
          title="Conversions"
          value={totalConversions}
          subtitle="Actions taken"
          icon={Target}
          color="orange"
        />
      </div>

      {/* Performance by Content Type */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Performance by Content Type
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceByType.map((item) => (
            <div
              key={item.type}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.type}
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 my-2">
                {item.count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Avg. Engagement: {item.avgEngagement.toFixed(1)}%</div>
                <div>Total Reach: {item.totalReach.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Content
        </h4>
        <div className="space-y-3">
          {topContent.map((content, index) => (
            <div
              key={content.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {content.title}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                    {content.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(content.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                {content.metrics?.engagement && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    {content.metrics.engagement}%
                  </div>
                )}
                {content.metrics?.reach && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-blue-500" />
                    {content.metrics.reach.toLocaleString()}
                  </div>
                )}
                {content.metrics?.conversions && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-green-500" />
                    {content.metrics.conversions}
                  </div>
                )}
              </div>
            </div>
          ))}

          {topContent.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No performance data available for the selected period</p>
            </div>
          )}
        </div>
      </div>

      {/* SEO Performance */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          SEO Performance
        </h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {avgSeoScore.toFixed(0)}/100
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average SEO Score
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Content optimized: {filteredContent.filter(c => (c.metrics?.seoScore || 0) > 70).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Needs improvement: {filteredContent.filter(c => (c.metrics?.seoScore || 0) < 50).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}