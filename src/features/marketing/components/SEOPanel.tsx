import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { 
  Search,
  TrendingUp,
  Hash,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  Eye,
  Globe
} from 'lucide-react';
import type { SEOAnalysis, ContentType } from '../types/marketing';

interface SEOPanelProps {
  content: string;
  contentType: ContentType;
  onAnalyze: (content: string, contentType: ContentType) => Promise<SEOAnalysis>;
  onOptimize: (content: string, suggestions: string[]) => Promise<string>;
  isAnalyzing: boolean;
  isOptimizing: boolean;
}

export function SEOPanel({
  content,
  contentType,
  onAnalyze,
  onOptimize,
  isAnalyzing,
  isOptimizing
}: SEOPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [targetKeywords, setTargetKeywords] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [location, setLocation] = useState('');
  const [customHashtags, setCustomHashtags] = useState('');

  const platformOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'google', label: 'Google My Business' }
  ];

  const handleAnalyze = async () => {
    if (!content.trim()) {
      showToast({
        type: 'error',
        title: 'No content to analyze'
      });
      return;
    }

    try {
      const result = await onAnalyze(content, contentType);
      setAnalysis(result);
      showToast({
        type: 'success',
        title: 'SEO analysis completed'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Analysis failed',
        message: 'Please try again'
      });
    }
  };

  const handleOptimize = async () => {
    if (!analysis?.suggestions) {
      showToast({
        type: 'error',
        title: 'No suggestions available'
      });
      return;
    }

    try {
      const optimizedContent = await onOptimize(content, analysis.suggestions);
      showToast({
        type: 'success',
        title: 'Content optimized successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Optimization failed',
        message: 'Please try again'
      });
    }
  };

  const copyHashtags = () => {
    if (analysis?.hashtags) {
      navigator.clipboard.writeText(analysis.hashtags.join(' '));
      showToast({
        type: 'success',
        title: 'Hashtags copied to clipboard'
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  // Auto-analyze when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim() && content.length > 50) {
        handleAnalyze();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          SEO & Optimization
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !content.trim()}
            loading={isAnalyzing}
          >
            <Search className="h-4 w-4 mr-1" />
            Analyze
          </Button>
          
          {analysis && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOptimize}
              disabled={isOptimizing}
              loading={isOptimizing}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Optimize
            </Button>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          label="Target Keywords"
          value={targetKeywords}
          onChange={(e) => setTargetKeywords(e.target.value)}
          placeholder="real estate, luxury homes..."
        />

        <Select
          label="Platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          options={platformOptions}
        />

        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="New York, Miami..."
        />
      </div>

      {/* SEO Scores */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`${getScoreBg(analysis.score)} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">SEO Score</span>
              {getScoreIcon(analysis.score)}
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/100
            </div>
          </div>

          <div className={`${getScoreBg(analysis.readabilityScore)} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Readability</span>
              {getScoreIcon(analysis.readabilityScore)}
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.readabilityScore)}`}>
              {analysis.readabilityScore}/100
            </div>
          </div>

          <div className={`${getScoreBg(analysis.sentimentScore)} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sentiment</span>
              {getScoreIcon(analysis.sentimentScore)}
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.sentimentScore)}`}>
              {analysis.sentimentScore}/100
            </div>
          </div>
        </div>
      )}

      {/* Keywords Analysis */}
      {analysis?.keywords && analysis.keywords.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Detected Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                <Search className="h-3 w-3 mr-1" />
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hashtag Suggestions */}
      {analysis?.hashtags && analysis.hashtags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">
              Recommended Hashtags for {platform}
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={copyHashtags}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy All
            </Button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {analysis.hashtags.slice(0, 15).map((hashtag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800"
                  onClick={() => navigator.clipboard.writeText(hashtag)}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {hashtag.replace('#', '')}
                </span>
              ))}
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Click any hashtag to copy individually
            </div>
          </div>
        </div>
      )}

      {/* Custom Hashtags */}
      <div className="mb-6">
        <Input
          label="Add Custom Hashtags"
          value={customHashtags}
          onChange={(e) => setCustomHashtags(e.target.value)}
          placeholder="#realestate #dreamhome #luxury..."
        />
      </div>

      {/* SEO Suggestions */}
      {analysis?.suggestions && analysis.suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Optimization Suggestions
          </h4>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg"
              >
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  {suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform-specific Tips */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <h4 className="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">
          {platform.charAt(0).toUpperCase() + platform.slice(1)} Optimization Tips
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200">
          {platform === 'instagram' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Use 5-10 relevant hashtags in your caption</li>
              <li>Include location tags for local discovery</li>
              <li>Post during peak hours (11am-1pm, 7-9pm)</li>
              <li>Use Instagram Stories for behind-the-scenes content</li>
            </ul>
          )}
          {platform === 'facebook' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Write engaging captions that encourage comments</li>
              <li>Use 2-3 hashtags maximum</li>
              <li>Include a clear call-to-action</li>
              <li>Post when your audience is most active</li>
            </ul>
          )}
          {platform === 'linkedin' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Use professional language and industry terms</li>
              <li>Include relevant keywords for searchability</li>
              <li>Tag relevant people and companies</li>
              <li>Share valuable insights and market data</li>
            </ul>
          )}
          {platform === 'google' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Include local keywords and location</li>
              <li>Mention specific property features and amenities</li>
              <li>Use action words like "buy", "sell", "rent"</li>
              <li>Include contact information and website link</li>
            </ul>
          )}
        </div>
      </div>

      {!analysis && !isAnalyzing && content.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Click "Analyze" to get SEO insights and optimization suggestions</p>
        </div>
      )}

      {!content.trim() && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Generate content first to see SEO analysis</p>
        </div>
      )}
    </div>
  );
}