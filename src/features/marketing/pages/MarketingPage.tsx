import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { getAiDriver } from '@/ai/llm';
import { useToast } from '@/components/ui/Toast';
import { Copy, Printer, Wand2 } from 'lucide-react';
import type { Property } from '@/features/core/types';

type ContentType = 'ad' | 'email' | 'reel';
type Style = 'friendly' | 'luxury' | 'investor';

export function MarketingPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [contentType, setContentType] = useState<ContentType>('ad');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [style, setStyle] = useState<Style>('friendly');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  
  // Email specific fields
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailGoal, setEmailGoal] = useState<string>('');
  const [emailBullets, setEmailBullets] = useState<string>('');
  
  // Reel specific fields
  const [reelDuration, setReelDuration] = useState<number>(30);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      return response.json();
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const aiDriver = await getAiDriver();
      const property = properties.find((p: Property) => p.id === selectedPropertyId);
      
      if (!property) throw new Error('Property not found');

      switch (contentType) {
        case 'ad':
          return aiDriver.writeAd(property, style);
        case 'email':
          return aiDriver.writeEmail({
            to: emailTo,
            subject: emailSubject,
            goal: emailGoal,
            bullets: emailBullets.split('\n').filter(b => b.trim())
          });
        case 'reel':
          return aiDriver.writeReelScript(property, reelDuration);
        default:
          throw new Error('Invalid content type');
      }
    },
    onSuccess: (content) => {
      setGeneratedContent(content);
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

  const contentTypeOptions = [
    { value: 'ad', label: t('marketing.generateAd') },
    { value: 'email', label: t('marketing.generateEmail') },
    { value: 'reel', label: t('marketing.generateReel') }
  ];

  const styleOptions = [
    { value: 'friendly', label: t('marketing.friendly') },
    { value: 'luxury', label: t('marketing.luxury') },
    { value: 'investor', label: t('marketing.investor') }
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

  const canGenerate = () => {
    if (contentType === 'email') {
      return emailTo && emailSubject && emailGoal;
    }
    return selectedPropertyId;
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('marketing.title')}
        subtitle="AI-powered content generation for marketing campaigns"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Generator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Generator
          </h3>
          
          <div className="space-y-4">
            <Select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              label="Content Type"
              options={contentTypeOptions}
            />

            {(contentType === 'ad' || contentType === 'reel') && (
              <Select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                label="Property"
                options={[{ value: '', label: 'Select property...' }, ...propertyOptions]}
              />
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

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!canGenerate()}
              loading={generateMutation.isPending}
              className="w-full"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {t('marketing.generate')}
            </Button>
          </div>
        </div>

        {/* Generated Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('marketing.preview')}
            </h3>
            
            {generatedContent && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {t('common.copy')}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={printContent}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  {t('common.print')}
                </Button>
              </div>
            )}
          </div>
          
          {generatedContent ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                {generatedContent}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Generated content will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}