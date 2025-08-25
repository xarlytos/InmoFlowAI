import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { getAiDriver } from '@/ai/llm';
import { useToast } from '@/components/ui/Toast';
import { 
  Copy, 
  Printer, 
  Wand2, 
  History, 
  Template, 
  BarChart3, 
  Users, 
  Layers, 
  Shield,
  Palette,
  Search,
  Settings,
  Save,
  Clock
} from 'lucide-react';
import type { Property } from '@/features/core/types';

// Import all new components
import { ContentHistory } from '../components/ContentHistory';
import { EnhancedPreview } from '../components/EnhancedPreview';
import { TemplateLibrary } from '../components/TemplateLibrary';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { BatchGeneration } from '../components/BatchGeneration';
import { CollaborationPanel } from '../components/CollaborationPanel';
import { MultimediaPanel } from '../components/MultimediaPanel';
import { SEOPanel } from '../components/SEOPanel';
import { PersonalizationPanel } from '../components/PersonalizationPanel';
import { ValidationPanel } from '../components/ValidationPanel';

// Import types and hooks
import type {
  ContentType,
  Style,
  ContentHistory as ContentHistoryType,
  Template,
  BatchGenerationJob,
  AudienceSegment,
  BrandSettings,
  SEOAnalysis,
  MultimediaContent,
  ExportFormat
} from '../types/marketing';
import { useAutoSave } from '../hooks/useAutoSave';

export function EnhancedMarketingPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [contentType, setContentType] = useState<ContentType>('ad');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [style, setStyle] = useState<Style>('friendly');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'templates' | 'analytics' | 'batch' | 'collaboration' | 'multimedia' | 'seo' | 'personalization' | 'validation'>('generator');
  
  // Email specific fields
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailGoal, setEmailGoal] = useState<string>('');
  const [emailBullets, setEmailBullets] = useState<string>('');
  
  // Reel specific fields
  const [reelDuration, setReelDuration] = useState<number>(30);
  
  // New state for enhanced features
  const [contentHistory, setContentHistory] = useState<ContentHistoryType[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchGenerationJob[]>([]);
  const [audienceSegments, setAudienceSegments] = useState<AudienceSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fonts: { primary: 'Inter', secondary: 'Georgia' },
    voice: { tone: 'Professional', personality: ['Trustworthy', 'Expert'], avoidWords: [] }
  });
  const [multimedia, setMultimedia] = useState<MultimediaContent>();
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingMultimedia, setIsGeneratingMultimedia] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSessionRecovery, setShowSessionRecovery] = useState(false);

  // Auto-save functionality
  const autoSave = useAutoSave(
    generatedContent,
    currentContentId,
    async (content, version) => {
      // Mock save function - replace with actual API call
      console.log('Auto-saving content:', content, version);
      // await saveContentToAPI(currentContentId, content, version);
    },
    {
      interval: 30000, // 30 seconds
      maxVersions: 10,
      enableSessionRecovery: true
    }
  );

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      return response.json();
    }
  });

  // Check for session recovery on mount
  useEffect(() => {
    if (autoSave.hasSessionRecovery) {
      setShowSessionRecovery(true);
    }
  }, [autoSave.hasSessionRecovery]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const aiDriver = await getAiDriver();
      const property = properties.find((p: Property) => p.id === selectedPropertyId);
      
      if (!property && (contentType === 'ad' || contentType === 'reel')) {
        throw new Error('Property not found');
      }

      let content: string;
      switch (contentType) {
        case 'ad':
          content = await aiDriver.writeAd(property!, style);
          break;
        case 'email':
          content = await aiDriver.writeEmail({
            to: emailTo,
            subject: emailSubject,
            goal: emailGoal,
            bullets: emailBullets.split('\n').filter(b => b.trim())
          });
          break;
        case 'reel':
          content = await aiDriver.writeReelScript(property!, reelDuration);
          break;
        case 'social':
        case 'blog':
        case 'flyer':
          // Mock generation for new content types
          content = `Generated ${contentType} content for ${property?.title || 'your business'}`;
          break;
        default:
          throw new Error('Invalid content type');
      }
      
      // Apply personalization if segment is selected
      if (selectedSegment && content) {
        const segment = audienceSegments.find(s => s.id === selectedSegment);
        if (segment) {
          // Mock personalization - replace with actual AI call
          content = `[Personalized for ${segment.name}] ${content}`;
        }
      }
      
      return content;
    },
    onSuccess: (content) => {
      setGeneratedContent(content);
      
      // Create content history entry
      const newContentId = `content_${Date.now()}`;
      setCurrentContentId(newContentId);
      
      const newHistoryEntry: ContentHistoryType = {
        id: newContentId,
        title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} - ${new Date().toLocaleDateString()}`,
        content,
        type: contentType,
        style,
        propertyId: selectedPropertyId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        tags: [contentType, style],
        versions: [],
        approvalStatus: 'draft',
        comments: []
      };
      
      setContentHistory(prev => [newHistoryEntry, ...prev]);
      
      showToast({
        type: 'success',
        title: 'Content generated successfully'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to generate content',
        message: error.message
      });
    }
  });

  const propertyOptions = properties.map((property: Property) => ({
    value: property.id,
    label: `${property.title} - ${property.ref}`
  }));

  // Enhanced content type options
  const contentTypeOptions = [
    { value: 'ad', label: t('marketing.generateAd') },
    { value: 'email', label: t('marketing.generateEmail') },
    { value: 'reel', label: t('marketing.generateReel') },
    { value: 'social', label: 'Social Media Post' },
    { value: 'blog', label: 'Blog Post' },
    { value: 'flyer', label: 'Flyer/Brochure' }
  ];

  // Enhanced style options
  const styleOptions = [
    { value: 'friendly', label: t('marketing.friendly') },
    { value: 'luxury', label: t('marketing.luxury') },
    { value: 'investor', label: t('marketing.investor') },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const durationOptions = [
    { value: '15', label: '15 seconds' },
    { value: '30', label: '30 seconds' },
    { value: '60', label: '60 seconds' }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    showToast({
      type: 'success',
      title: 'Content copied to clipboard'
    });
  };
  
  const printContent = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Marketing Content</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Generated ${contentType.toUpperCase()}</h1>
            <pre style="white-space: pre-wrap; font-family: inherit;">${generatedContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  // Handler functions for new features
  const handleSelectFromHistory = (historyItem: ContentHistoryType) => {
    setGeneratedContent(historyItem.content);
    setContentType(historyItem.type);
    setStyle(historyItem.style);
    if (historyItem.propertyId) {
      setSelectedPropertyId(historyItem.propertyId);
    }
    setCurrentContentId(historyItem.id);
    setActiveTab('generator');
  };
  
  const handleFavoriteToggle = (id: string) => {
    setContentHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };
  
  const handleDeleteHistory = (id: string) => {
    setContentHistory(prev => prev.filter(item => item.id !== id));
    if (currentContentId === id) {
      setCurrentContentId(null);
      setGeneratedContent('');
    }
  };
  
  const handleSaveContent = async () => {
    await autoSave.saveNow('Manual save');
  };
  
  const handleExport = (format: ExportFormat) => {
    // Mock export functionality
    showToast({
      type: 'success',
      title: `Content exported as ${format.toUpperCase()}`
    });
  };
  
  const handleShare = (platform: string) => {
    // Mock share functionality
    showToast({
      type: 'success',
      title: `Content shared to ${platform}`
    });
  };
  
  const handleAnalyzeSEO = async (content: string, contentType: ContentType): Promise<SEOAnalysis> => {
    setIsAnalyzing(true);
    // Mock SEO analysis - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis: SEOAnalysis = {
      score: Math.floor(Math.random() * 40) + 60,
      keywords: ['real estate', 'property', 'home', 'investment'],
      suggestions: [
        'Include location-specific keywords',
        'Add more descriptive adjectives',
        'Include a clear call-to-action'
      ],
      hashtags: ['#realestate', '#property', '#dreamhome', '#investment', '#luxury'],
      readabilityScore: Math.floor(Math.random() * 30) + 70,
      sentimentScore: Math.floor(Math.random() * 20) + 80
    };
    
    setIsAnalyzing(false);
    setSeoAnalysis(analysis);
    return analysis;
  };
  
  const handleOptimizeContent = async (content: string, suggestions: string[]): Promise<string> => {
    setIsOptimizing(true);
    // Mock optimization - replace with actual AI call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const optimized = `[OPTIMIZED] ${content}`;
    setGeneratedContent(optimized);
    setIsOptimizing(false);
    return optimized;
  };
  
  const handleGenerateImages = async (prompt: string, style: string, count: number) => {
    setIsGeneratingMultimedia(true);
    // Mock image generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newMultimedia: MultimediaContent = {
      images: Array.from({ length: count }, (_, i) => ({
        url: `https://picsum.photos/400/300?random=${i}`,
        alt: `Generated image ${i + 1}`,
        prompt
      }))
    };
    
    setMultimedia(prev => ({
      ...prev,
      images: [...(prev?.images || []), ...newMultimedia.images]
    }));
    
    setIsGeneratingMultimedia(false);
  };
  
  const handleSessionRecoveryAccept = () => {
    const recoveredContent = autoSave.acceptSessionRecovery();
    if (recoveredContent) {
      setGeneratedContent(recoveredContent);
    }
    setShowSessionRecovery(false);
  };
  
  const handleSessionRecoveryReject = () => {
    autoSave.rejectSessionRecovery();
    setShowSessionRecovery(false);
  };
  
  const handleValidateContent = async (content: string, rules: any[]): Promise<any[]> => {
    setIsValidating(true);
    // Mock validation - replace with actual validation logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = rules.map(rule => ({
      ruleId: rule.id,
      passed: Math.random() > 0.3,
      message: Math.random() > 0.3 ? `${rule.name} check passed` : `${rule.name} needs attention`,
      suggestion: Math.random() <= 0.3 ? `Consider revising to comply with ${rule.name}` : undefined
    }));
    
    setIsValidating(false);
    return results;
  };

  const canGenerate = () => {
    if (contentType === 'email') {
      return emailTo && emailSubject && emailGoal;
    }
    if (contentType === 'social' || contentType === 'blog' || contentType === 'flyer') {
      return true; // These don't require a property
    }
    return selectedPropertyId;
  };
  
  // Tab navigation
  const tabs = [
    { id: 'generator', label: 'Generator', icon: Wand2 },
    { id: 'history', label: 'History', icon: History },
    { id: 'templates', label: 'Templates', icon: Template },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'batch', label: 'Batch', icon: Layers },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'multimedia', label: 'Multimedia', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'personalization', label: 'Targeting', icon: Users },
    { id: 'validation', label: 'Validation', icon: Shield }
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('marketing.title')}
        subtitle="AI-powered content generation for marketing campaigns with advanced features"
      />
      
      {/* Session Recovery Modal */}
      {showSessionRecovery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Unsaved Work Detected
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We found unsaved content from your previous session. Would you like to recover it?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleSessionRecoveryReject}>
                Discard
              </Button>
              <Button onClick={handleSessionRecoveryAccept}>
                Recover
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Generator */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Content Generator
                </h3>
                {autoSave.isDirty && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <Clock className="h-4 w-4" />
                    Unsaved changes • Last saved: {autoSave.getTimeSinceLastSave()}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  label="Content Type"
                  options={contentTypeOptions}
                />

                {(contentType === 'ad' || contentType === 'reel') && (
                  <div>
                    <Select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      label="Property"
                      options={[{ value: '', label: 'Select property...' }, ...propertyOptions]}
                    />
                    {selectedSegment && (
                      <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                        Targeting: {audienceSegments.find(s => s.id === selectedSegment)?.name}
                      </div>
                    )}
                  </div>
                )}

                {contentType === 'ad' && (
                  <Select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as Style)}
                    label={t('marketing.style')}
                    options={styleOptions}
                  />
                )}

                {contentType === 'email' && (
                  <div className="space-y-4">
                    <Input
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      label="To"
                      placeholder="Client name or email"
                    />
                    
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      label={t('marketing.subject')}
                      placeholder="Email subject line"
                    />
                    
                    <Input
                      value={emailGoal}
                      onChange={(e) => setEmailGoal(e.target.value)}
                      label={t('marketing.goal')}
                      placeholder="What do you want to achieve with this email?"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('marketing.bullets')}
                      </label>
                      <textarea
                        value={emailBullets}
                        onChange={(e) => setEmailBullets(e.target.value)}
                        rows={4}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        placeholder="Key points (one per line)..."
                      />
                    </div>
                  </div>
                )}

                {contentType === 'reel' && (
                  <Select
                    value={reelDuration.toString()}
                    onChange={(e) => setReelDuration(Number(e.target.value))}
                    label={t('marketing.duration')}
                    options={durationOptions}
                  />
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => generateMutation.mutate()}
                    disabled={!canGenerate()}
                    loading={generateMutation.isPending}
                    className="flex-1"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {t('marketing.generate')}
                  </Button>
                  {generatedContent && (
                    <Button
                      variant="outline"
                      onClick={handleSaveContent}
                      disabled={autoSave.isAutoSaving}
                      loading={autoSave.isAutoSaving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Preview */}
            {generatedContent ? (
              <EnhancedPreview
                content={generatedContent}
                contentType={contentType}
                multimedia={multimedia}
                onExport={handleExport}
                onShare={handleShare}
                onSave={handleSaveContent}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated content will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'history' && (
          <ContentHistory
            history={contentHistory}
            onSelect={handleSelectFromHistory}
            onFavorite={handleFavoriteToggle}
            onDelete={handleDeleteHistory}
            onApprove={(id) => console.log('Approve:', id)}
            onReject={(id) => console.log('Reject:', id)}
          />
        )}
        
        {activeTab === 'templates' && (
          <TemplateLibrary
            templates={templates}
            onSelect={(template) => {
              setGeneratedContent(template.content);
              setContentType(template.type);
              setStyle(template.style);
              setActiveTab('generator');
            }}
            onCreate={() => console.log('Create template')}
            onEdit={(template) => console.log('Edit template:', template)}
            onDelete={(id) => console.log('Delete template:', id)}
            onDuplicate={(template) => console.log('Duplicate template:', template)}
            onTogglePublic={(id) => console.log('Toggle public:', id)}
            onImport={(file) => console.log('Import template:', file)}
            onExport={(template) => console.log('Export template:', template)}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            contentHistory={contentHistory}
            onRefresh={() => console.log('Refresh analytics')}
            onExportReport={(format) => console.log('Export report:', format)}
          />
        )}
        
        {activeTab === 'batch' && (
          <BatchGeneration
            jobs={batchJobs}
            templates={templates}
            properties={properties}
            audienceSegments={audienceSegments}
            onCreateJob={(job) => console.log('Create job:', job)}
            onStartJob={(id) => console.log('Start job:', id)}
            onPauseJob={(id) => console.log('Pause job:', id)}
            onCancelJob={(id) => console.log('Cancel job:', id)}
            onDeleteJob={(id) => console.log('Delete job:', id)}
            onViewResults={(job) => console.log('View results:', job)}
            onScheduleJob={(id, date) => console.log('Schedule job:', id, date)}
          />
        )}
        
        {activeTab === 'collaboration' && currentContentId && (
          <CollaborationPanel
            content={contentHistory.find(c => c.id === currentContentId)!}
            currentUserId="current-user"
            currentUserName="Current User"
            onAddComment={(comment) => console.log('Add comment:', comment)}
            onReplyToComment={(commentId, reply) => console.log('Reply:', commentId, reply)}
            onDeleteComment={(commentId) => console.log('Delete comment:', commentId)}
            onResolveComment={(commentId) => console.log('Resolve comment:', commentId)}
            onApproveContent={() => console.log('Approve content')}
            onRejectContent={(reason) => console.log('Reject content:', reason)}
            onRequestApproval={() => console.log('Request approval')}
            onShareContent={(userIds) => console.log('Share content:', userIds)}
          />
        )}
        
        {activeTab === 'multimedia' && (
          <MultimediaPanel
            contentType={contentType}
            propertyData={properties.find(p => p.id === selectedPropertyId)}
            onGenerateImages={handleGenerateImages}
            onGenerateMusic={(mood, duration, genre) => console.log('Generate music:', { mood, duration, genre })}
            onGenerateEffects={(contentType, theme) => console.log('Generate effects:', { contentType, theme })}
            multimedia={multimedia}
            isGenerating={isGeneratingMultimedia}
          />
        )}
        
        {activeTab === 'seo' && (
          <SEOPanel
            content={generatedContent}
            contentType={contentType}
            onAnalyze={handleAnalyzeSEO}
            onOptimize={handleOptimizeContent}
            isAnalyzing={isAnalyzing}
            isOptimizing={isOptimizing}
          />
        )}
        
        {activeTab === 'personalization' && (
          <PersonalizationPanel
            segments={audienceSegments}
            brandSettings={brandSettings}
            selectedSegment={selectedSegment}
            onCreateSegment={(segment) => {
              const newSegment = { ...segment, id: `segment_${Date.now()}`, size: Math.floor(Math.random() * 10000) + 1000 };
              setAudienceSegments(prev => [...prev, newSegment]);
            }}
            onUpdateSegment={(id, updates) => {
              setAudienceSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
            }}
            onDeleteSegment={(id) => {
              setAudienceSegments(prev => prev.filter(s => s.id !== id));
            }}
            onSelectSegment={setSelectedSegment}
            onUpdateBrandSettings={(settings) => {
              setBrandSettings(prev => ({ ...prev, ...settings }));
            }}
            onPersonalizeContent={async (content, segmentId) => {
              // Mock personalization
              const segment = audienceSegments.find(s => s.id === segmentId);
              return `[Personalized for ${segment?.name}] ${content}`;
            }}
          />
        )}
        
        {activeTab === 'validation' && (
          <ValidationPanel
            content={generatedContent}
            contentType={contentType}
            onValidate={handleValidateContent}
            isValidating={isValidating}
          />
        )}
      </div>
    </div>
  );
}