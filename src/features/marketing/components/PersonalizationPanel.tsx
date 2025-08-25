import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { 
  Users,
  Target,
  MapPin,
  DollarSign,
  Heart,
  Calendar,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Globe,
  Home,
  Briefcase
} from 'lucide-react';
import type { AudienceSegment, BrandSettings } from '../types/marketing';

interface PersonalizationPanelProps {
  segments: AudienceSegment[];
  brandSettings: BrandSettings;
  selectedSegment?: string;
  onCreateSegment: (segment: Omit<AudienceSegment, 'id' | 'size'>) => void;
  onUpdateSegment: (id: string, segment: Partial<AudienceSegment>) => void;
  onDeleteSegment: (id: string) => void;
  onSelectSegment: (id: string) => void;
  onUpdateBrandSettings: (settings: Partial<BrandSettings>) => void;
  onPersonalizeContent: (content: string, segmentId: string) => Promise<string>;
}

export function PersonalizationPanel({
  segments,
  brandSettings,
  selectedSegment,
  onCreateSegment,
  onUpdateSegment,
  onDeleteSegment,
  onSelectSegment,
  onUpdateBrandSettings,
  onPersonalizeContent
}: PersonalizationPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'segments' | 'brand'>('segments');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ageMin: '',
    ageMax: '',
    locations: [] as string[],
    interests: [] as string[],
    propertyTypes: [] as string[],
    budgetMin: '',
    budgetMax: ''
  });

  const propertyTypeOptions = [
    'Single Family Home',
    'Condo',
    'Townhouse',
    'Luxury Home',
    'Investment Property',
    'Commercial',
    'Land'
  ];

  const interestOptions = [
    'First Time Buyer',
    'Luxury Living',
    'Investment',
    'Family Friendly',
    'Modern Design',
    'Historic Properties',
    'Waterfront',
    'Golf Course',
    'City Living',
    'Suburban',
    'Rural'
  ];

  const locationSuggestions = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose'
  ];

  const handleCreateSegment = () => {
    if (!formData.name.trim()) {
      showToast({
        type: 'error',
        title: 'Please enter a segment name'
      });
      return;
    }

    const newSegment = {
      name: formData.name,
      description: formData.description,
      criteria: {
        ageRange: formData.ageMin && formData.ageMax 
          ? [parseInt(formData.ageMin), parseInt(formData.ageMax)] as [number, number]
          : undefined,
        location: formData.locations.length > 0 ? formData.locations : undefined,
        interests: formData.interests.length > 0 ? formData.interests : undefined,
        propertyTypes: formData.propertyTypes.length > 0 ? formData.propertyTypes : undefined,
        budget: formData.budgetMin && formData.budgetMax
          ? [parseInt(formData.budgetMin), parseInt(formData.budgetMax)] as [number, number]
          : undefined
      }
    };

    onCreateSegment(newSegment);
    resetForm();
    showToast({
      type: 'success',
      title: 'Audience segment created successfully'
    });
  };

  const handleUpdateSegment = () => {
    if (!editingSegment || !formData.name.trim()) return;

    const updatedSegment = {
      name: formData.name,
      description: formData.description,
      criteria: {
        ageRange: formData.ageMin && formData.ageMax 
          ? [parseInt(formData.ageMin), parseInt(formData.ageMax)] as [number, number]
          : undefined,
        location: formData.locations.length > 0 ? formData.locations : undefined,
        interests: formData.interests.length > 0 ? formData.interests : undefined,
        propertyTypes: formData.propertyTypes.length > 0 ? formData.propertyTypes : undefined,
        budget: formData.budgetMin && formData.budgetMax
          ? [parseInt(formData.budgetMin), parseInt(formData.budgetMax)] as [number, number]
          : undefined
      }
    };

    onUpdateSegment(editingSegment, updatedSegment);
    resetForm();
    showToast({
      type: 'success',
      title: 'Audience segment updated successfully'
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ageMin: '',
      ageMax: '',
      locations: [],
      interests: [],
      propertyTypes: [],
      budgetMin: '',
      budgetMax: ''
    });
    setShowCreateForm(false);
    setEditingSegment(null);
  };

  const startEditing = (segment: AudienceSegment) => {
    setFormData({
      name: segment.name,
      description: segment.description,
      ageMin: segment.criteria.ageRange?.[0]?.toString() || '',
      ageMax: segment.criteria.ageRange?.[1]?.toString() || '',
      locations: segment.criteria.location || [],
      interests: segment.criteria.interests || [],
      propertyTypes: segment.criteria.propertyTypes || [],
      budgetMin: segment.criteria.budget?.[0]?.toString() || '',
      budgetMax: segment.criteria.budget?.[1]?.toString() || ''
    });
    setEditingSegment(segment.id);
    setShowCreateForm(true);
  };

  const addItem = (field: 'locations' | 'interests' | 'propertyTypes', value: string) => {
    if (value && !formData[field].includes(value)) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value]
      });
    }
  };

  const removeItem = (field: 'locations' | 'interests' | 'propertyTypes', value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter(item => item !== value)
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personalization & Targeting
        </h3>
        
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('segments')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'segments'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Users className="h-4 w-4 mr-1 inline" />
            Segments
          </button>
          <button
            onClick={() => setActiveTab('brand')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'brand'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Heart className="h-4 w-4 mr-1 inline" />
            Brand
          </button>
        </div>
      </div>

      {/* Audience Segments Tab */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {segments.length} audience segments configured
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              disabled={showCreateForm}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Segment
            </Button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                {editingSegment ? 'Edit Segment' : 'Create New Segment'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Segment Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Young Professionals"
                />

                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tech-savvy millennials looking for modern condos"
                />

                <div className="flex gap-2">
                  <Input
                    label="Min Age"
                    type="number"
                    value={formData.ageMin}
                    onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })}
                    placeholder="25"
                  />
                  <Input
                    label="Max Age"
                    type="number"
                    value={formData.ageMax}
                    onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })}
                    placeholder="40"
                  />
                </div>

                <div className="flex gap-2">
                  <Input
                    label="Min Budget ($)"
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                    placeholder="200000"
                  />
                  <Input
                    label="Max Budget ($)"
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    placeholder="500000"
                  />
                </div>

                {/* Locations */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Locations
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.locations.map((location) => (
                      <span
                        key={location}
                        className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {location}
                        <button
                          onClick={() => removeItem('locations', location)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <Select
                    value=""
                    onChange={(e) => e.target.value && addItem('locations', e.target.value)}
                    options={[{ value: '', label: 'Add location...' }, ...locationSuggestions.map(l => ({ value: l, label: l }))]}
                  />
                </div>

                {/* Interests */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interests & Preferences
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        {interest}
                        <button
                          onClick={() => removeItem('interests', interest)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <Select
                    value=""
                    onChange={(e) => e.target.value && addItem('interests', e.target.value)}
                    options={[{ value: '', label: 'Add interest...' }, ...interestOptions.map(i => ({ value: i, label: i }))]}
                  />
                </div>

                {/* Property Types */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Types
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.propertyTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      >
                        <Home className="h-3 w-3 mr-1" />
                        {type}
                        <button
                          onClick={() => removeItem('propertyTypes', type)}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <Select
                    value=""
                    onChange={(e) => e.target.value && addItem('propertyTypes', e.target.value)}
                    options={[{ value: '', label: 'Add property type...' }, ...propertyTypeOptions.map(p => ({ value: p, label: p }))]}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={editingSegment ? handleUpdateSegment : handleCreateSegment}>
                  {editingSegment ? 'Update Segment' : 'Create Segment'}
                </Button>
              </div>
            </div>
          )}

          {/* Segments List */}
          <div className="space-y-3">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedSegment === segment.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {segment.name}
                      </h4>
                      {selectedSegment === segment.id && (
                        <UserCheck className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {segment.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {segment.size.toLocaleString()} people
                      </span>
                      
                      {segment.criteria.ageRange && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {segment.criteria.ageRange[0]}-{segment.criteria.ageRange[1]} years
                        </span>
                      )}

                      {segment.criteria.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${segment.criteria.budget[0].toLocaleString()}-${segment.criteria.budget[1].toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      {segment.criteria.location && segment.criteria.location.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {segment.criteria.location.map((location) => (
                            <span
                              key={location}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            >
                              <MapPin className="h-2 w-2 mr-1" />
                              {location}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectSegment(segment.id)}
                      title="Select Segment"
                    >
                      <Target className="h-4 w-4 text-blue-500" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(segment)}
                      title="Edit Segment"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSegment(segment.id)}
                      title="Delete Segment"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {segments.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audience segments created yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Your First Segment
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Brand Settings Tab */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Brand Colors
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandSettings.primaryColor}
                      onChange={(e) => onUpdateBrandSettings({ primaryColor: e.target.value })}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <Input
                      value={brandSettings.primaryColor}
                      onChange={(e) => onUpdateBrandSettings({ primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandSettings.secondaryColor}
                      onChange={(e) => onUpdateBrandSettings({ secondaryColor: e.target.value })}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <Input
                      value={brandSettings.secondaryColor}
                      onChange={(e) => onUpdateBrandSettings({ secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Typography
              </h4>
              <div className="space-y-3">
                <Input
                  label="Primary Font"
                  value={brandSettings.fonts.primary}
                  onChange={(e) => onUpdateBrandSettings({
                    fonts: { ...brandSettings.fonts, primary: e.target.value }
                  })}
                  placeholder="Arial, Helvetica"
                />

                <Input
                  label="Secondary Font"
                  value={brandSettings.fonts.secondary}
                  onChange={(e) => onUpdateBrandSettings({
                    fonts: { ...brandSettings.fonts, secondary: e.target.value }
                  })}
                  placeholder="Georgia, serif"
                />
              </div>
            </div>
          </div>

          {/* Brand Voice */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Brand Voice & Personality
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tone"
                value={brandSettings.voice.tone}
                onChange={(e) => onUpdateBrandSettings({
                  voice: { ...brandSettings.voice, tone: e.target.value }
                })}
                placeholder="Professional, Friendly, Luxury..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personality Traits
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {brandSettings.voice.personality.map((trait, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    >
                      {trait}
                      <button
                        onClick={() => {
                          const newPersonality = brandSettings.voice.personality.filter((_, i) => i !== index);
                          onUpdateBrandSettings({
                            voice: { ...brandSettings.voice, personality: newPersonality }
                          });
                        }}
                        className="ml-1 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Words to Avoid
              </label>
              <textarea
                value={brandSettings.voice.avoidWords.join(', ')}
                onChange={(e) => onUpdateBrandSettings({
                  voice: {
                    ...brandSettings.voice,
                    avoidWords: e.target.value.split(',').map(w => w.trim()).filter(w => w)
                  }
                })}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="cheap, basic, outdated..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}