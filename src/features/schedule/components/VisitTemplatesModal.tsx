import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Clock, 
  MapPin, 
  User,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Property, Lead, Visit } from '@/features/core/types';

interface VisitTemplate {
  id: string;
  name: string;
  description?: string;
  propertyId?: string;
  leadId?: string;
  duration: number; // in minutes
  note?: string;
  status: Visit['status'];
  reminderMins?: number;
  tags: string[];
  isDefault: boolean;
}

interface VisitTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  leads: Lead[];
  onUseTemplate: (template: VisitTemplate, customData?: Partial<Visit>) => void;
}

const defaultTemplates: VisitTemplate[] = [
  {
    id: 'initial-showing',
    name: 'Initial Property Showing',
    description: 'First-time property viewing with potential buyer',
    duration: 60,
    note: 'Initial property tour and assessment',
    status: 'scheduled',
    reminderMins: 60,
    tags: ['initial', 'showing'],
    isDefault: true
  },
  {
    id: 'follow-up',
    name: 'Follow-up Visit',
    description: 'Second visit for interested buyers',
    duration: 45,
    note: 'Follow-up visit to address questions and concerns',
    status: 'scheduled',
    reminderMins: 30,
    tags: ['follow-up'],
    isDefault: true
  },
  {
    id: 'inspection',
    name: 'Property Inspection',
    description: 'Professional property inspection',
    duration: 120,
    note: 'Comprehensive property inspection',
    status: 'scheduled',
    reminderMins: 120,
    tags: ['inspection'],
    isDefault: true
  },
  {
    id: 'appraisal',
    name: 'Property Appraisal',
    description: 'Property value assessment',
    duration: 90,
    note: 'Professional property appraisal',
    status: 'scheduled',
    reminderMins: 60,
    tags: ['appraisal'],
    isDefault: true
  }
];

export function VisitTemplatesModal({
  isOpen,
  onClose,
  properties,
  leads,
  onUseTemplate
}: VisitTemplatesModalProps) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<VisitTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<VisitTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<VisitTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = Array.from(new Set(templates.flatMap(t => t.tags))).sort();

  // Filter templates based on search and tags
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => template.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const handleCreateTemplate = (templateData: Omit<VisitTemplate, 'id'>) => {
    const newTemplate: VisitTemplate = {
      ...templateData,
      id: `custom-${Date.now()}`
    };
    setTemplates([...templates, newTemplate]);
    setShowCreateForm(false);
  };

  const handleEditTemplate = (templateData: VisitTemplate) => {
    setTemplates(templates.map(t => t.id === templateData.id ? templateData : t));
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const handleDuplicateTemplate = (template: VisitTemplate) => {
    const duplicated: VisitTemplate = {
      ...template,
      id: `copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false
    };
    setTemplates([...templates, duplicated]);
  };

  const propertyOptions = properties.map(p => ({
    value: p.id,
    label: `${p.title} - ${p.address?.city || ''}`
  }));

  const leadOptions = leads.map(l => ({
    value: l.id,
    label: `${l.name} - ${l.email}`
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Visit Templates"
      size="xl"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by tags:
            </span>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'solid' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="h-6 px-2"
              >
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                selectedTemplate?.id === template.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                  )}
                </div>
                
                {template.isDefault && (
                  <Badge variant="outline" size="sm">
                    Default
                  </Badge>
                )}
              </div>

              {/* Template Details */}
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {template.duration} minutes
                </div>
                
                {template.reminderMins && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Reminder: {template.reminderMins} min before
                  </div>
                )}

                {template.propertyId && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {properties.find(p => p.id === template.propertyId)?.title || 'Property'}
                  </div>
                )}

                {template.leadId && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {leads.find(l => l.id === template.leadId)?.name || 'Lead'}
                  </div>
                )}
              </div>

              {/* Tags */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="outline" size="sm" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUseTemplate(template);
                    onClose();
                  }}
                >
                  Use Template
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTemplate(template);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateTemplate(template);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                
                {!template.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              No templates found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <TemplateForm
          onSave={handleCreateTemplate}
          onCancel={() => setShowCreateForm(false)}
          properties={properties}
          leads={leads}
        />
      )}

      {/* Edit Template Form */}
      {editingTemplate && (
        <TemplateForm
          template={editingTemplate}
          onSave={handleEditTemplate}
          onCancel={() => setEditingTemplate(null)}
          properties={properties}
          leads={leads}
        />
      )}
    </Modal>
  );
}

// Template Form Component
function TemplateForm({
  template,
  onSave,
  onCancel,
  properties,
  leads
}: {
  template?: VisitTemplate;
  onSave: (template: any) => void;
  onCancel: () => void;
  properties: Property[];
  leads: Lead[];
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    propertyId: template?.propertyId || '',
    leadId: template?.leadId || '',
    duration: template?.duration || 60,
    note: template?.note || '',
    status: template?.status || 'scheduled' as Visit['status'],
    reminderMins: template?.reminderMins || 60,
    tags: template?.tags || [],
    isDefault: template?.isDefault || false
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(template ? { ...template, ...formData } : formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {template ? 'Edit Template' : 'Create Template'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Duration (minutes)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              min="15"
              required
            />

            <Input
              type="number"
              label="Reminder (minutes)"
              value={formData.reminderMins || ''}
              onChange={(e) => setFormData({ ...formData, reminderMins: e.target.value ? parseInt(e.target.value) : undefined })}
              min="0"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Notes
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={2}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit">
              <Save className="h-4 w-4 mr-1" />
              {template ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}