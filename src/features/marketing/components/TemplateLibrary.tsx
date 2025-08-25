import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { 
  Search, 
  Filter, 
  Star, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  Plus,
  Download,
  Upload,
  Heart,
  Users,
  Lock,
  Unlock
} from 'lucide-react';
import type { Template, ContentType, Style } from '../types/marketing';

interface TemplateLibraryProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  onCreate: () => void;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: Template) => void;
  onTogglePublic: (id: string) => void;
  onImport: (file: File) => void;
  onExport: (template: Template) => void;
}

export function TemplateLibrary({
  templates,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePublic,
  onImport,
  onExport
}: TemplateLibraryProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [filterStyle, setFilterStyle] = useState<Style | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'usage' | 'date'>('rating');
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesStyle = filterStyle === 'all' || template.style === filterStyle;
    const matchesVisibility = !showPublicOnly || template.isPublic;

    return matchesSearch && matchesType && matchesStyle && matchesVisibility;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'rating': return b.rating - a.rating;
      case 'usage': return b.usageCount - a.usageCount;
      case 'date': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default: return 0;
    }
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

  const styleOptions = [
    { value: 'all', label: 'All Styles' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'investor', label: 'Investor' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'usage', label: 'Most Used' },
    { value: 'date', label: 'Newest' },
    { value: 'name', label: 'Name' }
  ];

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Template Library
        </h3>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
            id="template-import"
          />
          <label htmlFor="template-import">
            <Button variant="outline" size="sm" as="span">
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          </label>
          
          <Button
            variant="primary"
            size="sm"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
            options={typeOptions}
            className="flex-1 min-w-32"
          />
          
          <Select
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value as Style | 'all')}
            options={styleOptions}
            className="flex-1 min-w-32"
          />
          
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'usage' | 'date')}
            options={sortOptions}
            className="flex-1 min-w-32"
          />

          <Button
            variant={showPublicOnly ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowPublicOnly(!showPublicOnly)}
          >
            <Users className="h-4 w-4 mr-1" />
            Public Only
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {template.name}
                  </h4>
                  {template.isPublic ? (
                    <Users className="h-3 w-3 text-blue-500" />
                  ) : (
                    <Lock className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(template.rating)}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({template.rating.toFixed(1)})
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                    {template.type}
                  </span>
                  <span className="capitalize bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                    {template.style}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  Used {template.usageCount} times • Created {new Date(template.createdAt).toLocaleDateString()}
                </div>

                {template.variables.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Variables:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <span
                          key={variable}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                        >
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{template.variables.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect(template)}
                title="Use Template"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(template)}
                title="Edit Template"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(template)}
                title="Duplicate Template"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExport(template)}
                title="Export Template"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTogglePublic(template.id)}
                title={template.isPublic ? "Make Private" : "Make Public"}
              >
                {template.isPublic ? (
                  <Unlock className="h-4 w-4 text-blue-500" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(template.id)}
                title="Delete Template"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No templates found matching your criteria</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onCreate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Your First Template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}