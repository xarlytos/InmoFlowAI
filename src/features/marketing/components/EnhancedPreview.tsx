import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { 
  Copy, 
  Printer, 
  Download, 
  Share, 
  Image as ImageIcon, 
  FileText,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Send
} from 'lucide-react';
import type { ContentType, ExportFormat, ContentMetrics, MultimediaContent } from '../types/marketing';

interface EnhancedPreviewProps {
  content: string;
  contentType: ContentType;
  metrics?: ContentMetrics;
  multimedia?: MultimediaContent;
  onExport: (format: ExportFormat) => void;
  onShare: (platform: string) => void;
  onSave: () => void;
}

export function EnhancedPreview({
  content,
  contentType,
  metrics,
  multimedia,
  onExport,
  onShare,
  onSave
}: EnhancedPreviewProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [previewMode, setPreviewMode] = useState<'text' | 'mockup'>('text');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  const exportOptions = [
    { value: 'text', label: 'Plain Text' },
    { value: 'html', label: 'HTML' },
    { value: 'pdf', label: 'PDF' },
    { value: 'image', label: 'Image' }
  ];

  const platformOptions = [
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'twitter', label: 'Twitter', icon: Twitter },
    { value: 'email', label: 'Email', icon: Mail }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
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
            <pre style="white-space: pre-wrap; font-family: inherit;">${content}</pre>
            ${multimedia?.images ? `
              <h2>Images</h2>
              ${multimedia.images.map(img => `<img src="${img.url}" alt="${img.alt}" style="max-width: 300px; margin: 10px;"/>`).join('')}
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const renderMockup = () => {
    switch (contentType) {
      case 'email':
        return (
          <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <Mail className="h-5 w-5" />
                <span className="text-sm">Email Preview</span>
              </div>
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-2">Subject: New Property Available</div>
              <div className="prose prose-sm">
                {content.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'social':
      case 'reel':
        return (
          <div className="bg-black rounded-xl max-w-sm mx-auto">
            {/* Instagram-like mockup */}
            <div className="bg-white rounded-t-xl">
              <div className="flex items-center p-3 border-b">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                <div>
                  <div className="font-semibold text-sm">your_realestate</div>
                  <div className="text-xs text-gray-500">Real Estate</div>
                </div>
              </div>
              
              {multimedia?.images?.[0] && (
                <img 
                  src={multimedia.images[0].url} 
                  alt={multimedia.images[0].alt}
                  className="w-full h-64 object-cover"
                />
              )}
              
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Heart className="h-6 w-6" />
                    <MessageCircle className="h-6 w-6" />
                    <Send className="h-6 w-6" />
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="font-semibold">1,234 likes</span>
                </div>
                
                <div className="text-sm mt-1">
                  <span className="font-semibold mr-1">your_realestate</span>
                  {content.substring(0, 150)}...
                </div>
              </div>
            </div>
          </div>
        );

      case 'ad':
        return (
          <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full mr-3 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">Ad</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Your Real Estate</div>
                  <div className="text-xs text-gray-500">Sponsored</div>
                </div>
              </div>
              
              {multimedia?.images?.[0] && (
                <img 
                  src={multimedia.images[0].url} 
                  alt={multimedia.images[0].alt}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              
              <div className="prose prose-sm">
                {content.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 text-sm">{line}</p>
                ))}
              </div>
              
              <Button className="w-full mt-3" size="sm">
                Learn More
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
              {content}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Enhanced Preview
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === 'text' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('text')}
          >
            <FileText className="h-4 w-4 mr-1" />
            Text
          </Button>
          <Button
            variant={previewMode === 'mockup' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('mockup')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Mockup
          </Button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.engagement && (
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.engagement}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Engagement</div>
            </div>
          )}
          {metrics.reach && (
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.reach.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Reach</div>
            </div>
          )}
          {metrics.seoScore && (
            <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.seoScore}/100
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">SEO Score</div>
            </div>
          )}
          {metrics.sentiment && (
            <div className={`${
              metrics.sentiment === 'positive' ? 'bg-green-50 dark:bg-green-900' :
              metrics.sentiment === 'negative' ? 'bg-red-50 dark:bg-red-900' :
              'bg-yellow-50 dark:bg-yellow-900'
            } rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${
                metrics.sentiment === 'positive' ? 'text-green-600 dark:text-green-400' :
                metrics.sentiment === 'negative' ? 'text-red-600 dark:text-red-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {metrics.sentiment}
              </div>
              <div className={`text-sm ${
                metrics.sentiment === 'positive' ? 'text-green-600 dark:text-green-400' :
                metrics.sentiment === 'negative' ? 'text-red-600 dark:text-red-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>Sentiment</div>
            </div>
          )}
        </div>
      )}

      {/* Content Preview */}
      <div className="mb-6">
        {previewMode === 'text' ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
              {content}
            </pre>
          </div>
        ) : (
          <div className="flex justify-center py-6">
            {renderMockup()}
          </div>
        )}
      </div>

      {/* Multimedia Content */}
      {multimedia && (
        <div className="mb-6">
          {multimedia.images && multimedia.images.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Generated Images
              </h4>
              <div className="flex gap-2 overflow-x-auto">
                {multimedia.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={printContent}
        >
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>

        <Select
          value=""
          onChange={(e) => onExport(e.target.value as ExportFormat)}
          options={[{ value: '', label: 'Export as...' }, ...exportOptions]}
          className="w-32"
        />

        <Select
          value=""
          onChange={(e) => onShare(e.target.value)}
          options={[{ value: '', label: 'Share to...' }, ...platformOptions]}
          className="w-32"
        />

        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
        >
          Save Content
        </Button>
      </div>
    </div>
  );
}