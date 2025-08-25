import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { 
  Heart, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import type { ContentHistory, ContentType, ApprovalStatus } from '../types/marketing';

interface ContentHistoryProps {
  history: ContentHistory[];
  onSelect: (content: ContentHistory) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ContentHistory({ 
  history, 
  onSelect, 
  onFavorite, 
  onDelete, 
  onApprove, 
  onReject 
}: ContentHistoryProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('all');
  const [showFavorites, setShowFavorites] = useState(false);

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.approvalStatus === filterStatus;
    const matchesFavorites = !showFavorites || item.isFavorite;

    return matchesSearch && matchesType && matchesStatus && matchesFavorites;
  });

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'ad', label: 'Ads' },
    { value: 'email', label: 'Emails' },
    { value: 'reel', label: 'Reels' },
    { value: 'social', label: 'Social Media' },
    { value: 'blog', label: 'Blog Posts' },
    { value: 'flyer', label: 'Flyers' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Edit className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Content History
        </h3>
        <Button
          variant={showFavorites ? "primary" : "outline"}
          size="sm"
          onClick={() => setShowFavorites(!showFavorites)}
        >
          <Heart className={`h-4 w-4 mr-1 ${showFavorites ? 'fill-current' : ''}`} />
          Favorites
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search content..."
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
            options={typeOptions}
            className="flex-1"
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ApprovalStatus | 'all')}
            options={statusOptions}
            className="flex-1"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.title}
                  </h4>
                  {getStatusIcon(item.approvalStatus)}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="capitalize">{item.type}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.comments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {item.comments.length}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                  {item.content.substring(0, 100)}...
                </p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {item.metrics && (
                  <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {item.metrics.engagement && (
                      <span>Engagement: {item.metrics.engagement}%</span>
                    )}
                    {item.metrics.reach && (
                      <span>Reach: {item.metrics.reach.toLocaleString()}</span>
                    )}
                    {item.metrics.seoScore && (
                      <span>SEO: {item.metrics.seoScore}/100</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFavorite(item.id)}
                >
                  <Heart className={`h-4 w-4 ${item.isFavorite ? 'fill-current text-red-500' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(item)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {item.approvalStatus === 'pending' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onApprove(item.id)}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReject(item.id)}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No content found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}