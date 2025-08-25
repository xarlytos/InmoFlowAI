import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  Globe,
  FileText,
  Eye,
  RefreshCw,
  Settings,
  Info,
  Zap
} from 'lucide-react';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'legal' | 'brand' | 'platform' | 'accessibility';
  severity: 'error' | 'warning' | 'info';
  isEnabled: boolean;
}

interface ValidationResult {
  ruleId: string;
  passed: boolean;
  message: string;
  suggestion?: string;
  line?: number;
  column?: number;
}

interface ValidationPanelProps {
  content: string;
  contentType: string;
  platform?: string;
  onValidate: (content: string, rules: ValidationRule[]) => Promise<ValidationResult[]>;
  isValidating: boolean;
}

export function ValidationPanel({
  content,
  contentType,
  platform = 'general',
  onValidate,
  isValidating
}: ValidationPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoValidate, setAutoValidate] = useState(true);

  // Default validation rules
  const defaultRules: ValidationRule[] = [
    // Legal compliance
    {
      id: 'fair-housing',
      name: 'Fair Housing Compliance',
      description: 'Ensures content complies with Fair Housing Act requirements',
      category: 'legal',
      severity: 'error',
      isEnabled: true
    },
    {
      id: 'truth-in-advertising',
      name: 'Truth in Advertising',
      description: 'Verifies claims are accurate and not misleading',
      category: 'legal',
      severity: 'error',
      isEnabled: true
    },
    {
      id: 'license-disclosure',
      name: 'License Disclosure',
      description: 'Checks for required real estate license information',
      category: 'legal',
      severity: 'warning',
      isEnabled: true
    },
    {
      id: 'equal-opportunity',
      name: 'Equal Opportunity',
      description: 'Ensures equal opportunity language is included',
      category: 'legal',
      severity: 'warning',
      isEnabled: true
    },

    // Brand compliance
    {
      id: 'brand-consistency',
      name: 'Brand Consistency',
      description: 'Verifies consistent use of brand voice and terminology',
      category: 'brand',
      severity: 'warning',
      isEnabled: true
    },
    {
      id: 'prohibited-words',
      name: 'Prohibited Words',
      description: 'Flags use of prohibited or brand-inconsistent language',
      category: 'brand',
      severity: 'warning',
      isEnabled: true
    },
    {
      id: 'contact-info',
      name: 'Contact Information',
      description: 'Ensures proper contact information is included',
      category: 'brand',
      severity: 'info',
      isEnabled: true
    },

    // Platform compliance
    {
      id: 'character-limit',
      name: 'Character Limits',
      description: 'Checks content length against platform limits',
      category: 'platform',
      severity: 'error',
      isEnabled: true
    },
    {
      id: 'hashtag-limit',
      name: 'Hashtag Limits',
      description: 'Validates hashtag count and format for platform',
      category: 'platform',
      severity: 'warning',
      isEnabled: true
    },
    {
      id: 'link-policy',
      name: 'Link Policy',
      description: 'Ensures links comply with platform policies',
      category: 'platform',
      severity: 'warning',
      isEnabled: true
    },

    // Accessibility
    {
      id: 'alt-text',
      name: 'Alt Text',
      description: 'Ensures images have descriptive alt text',
      category: 'accessibility',
      severity: 'warning',
      isEnabled: true
    },
    {
      id: 'readability',
      name: 'Readability',
      description: 'Checks content readability and comprehension level',
      category: 'accessibility',
      severity: 'info',
      isEnabled: true
    },
    {
      id: 'color-contrast',
      name: 'Color Contrast',
      description: 'Validates sufficient color contrast for accessibility',
      category: 'accessibility',
      severity: 'warning',
      isEnabled: true
    }
  ];

  useEffect(() => {
    setRules(defaultRules);
  }, []);

  const handleValidate = async () => {
    if (!content.trim()) {
      showToast({
        type: 'error',
        title: 'No content to validate'
      });
      return;
    }

    const enabledRules = rules.filter(rule => rule.isEnabled);
    
    try {
      const validationResults = await onValidate(content, enabledRules);
      setResults(validationResults);
      
      const errors = validationResults.filter(r => !r.passed && rules.find(rule => rule.id === r.ruleId)?.severity === 'error');
      const warnings = validationResults.filter(r => !r.passed && rules.find(rule => rule.id === r.ruleId)?.severity === 'warning');
      
      if (errors.length > 0) {
        showToast({
          type: 'error',
          title: `Validation failed with ${errors.length} error(s)`
        });
      } else if (warnings.length > 0) {
        showToast({
          type: 'warning',
          title: `Validation completed with ${warnings.length} warning(s)`
        });
      } else {
        showToast({
          type: 'success',
          title: 'All validation checks passed'
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Validation failed',
        message: 'Please try again'
      });
    }
  };

  // Auto-validate when content changes
  useEffect(() => {
    if (autoValidate && content.trim() && content.length > 50) {
      const timer = setTimeout(() => {
        handleValidate();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, autoValidate]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isEnabled: !rule.isEnabled }
          : rule
      )
    );
  };

  const getResultIcon = (result: ValidationResult) => {
    const rule = rules.find(r => r.id === result.ruleId);
    if (result.passed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      switch (rule?.severity) {
        case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
        case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        case 'info': return <Info className="h-4 w-4 text-blue-500" />;
        default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      }
    }
  };

  const getResultBg = (result: ValidationResult) => {
    const rule = rules.find(r => r.id === result.ruleId);
    if (result.passed) {
      return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700';
    } else {
      switch (rule?.severity) {
        case 'error': return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700';
        case 'warning': return 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700';
        case 'info': return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700';
        default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600';
      }
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'legal', label: 'Legal Compliance' },
    { value: 'brand', label: 'Brand Guidelines' },
    { value: 'platform', label: 'Platform Rules' },
    { value: 'accessibility', label: 'Accessibility' }
  ];

  const getCategoryIcon = (category: ValidationRule['category']) => {
    switch (category) {
      case 'legal': return <Scale className="h-4 w-4" />;
      case 'brand': return <Zap className="h-4 w-4" />;
      case 'platform': return <Globe className="h-4 w-4" />;
      case 'accessibility': return <Eye className="h-4 w-4" />;
    }
  };

  const filteredRules = selectedCategory === 'all' 
    ? rules 
    : rules.filter(rule => rule.category === selectedCategory);

  const filteredResults = selectedCategory === 'all'
    ? results
    : results.filter(result => {
        const rule = rules.find(r => r.id === result.ruleId);
        return rule && rule.category === selectedCategory;
      });

  const errorCount = results.filter(r => !r.passed && rules.find(rule => rule.id === r.ruleId)?.severity === 'error').length;
  const warningCount = results.filter(r => !r.passed && rules.find(rule => rule.id === r.ruleId)?.severity === 'warning').length;
  const passedCount = results.filter(r => r.passed).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Content Validation & Compliance
        </h3>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoValidate}
              onChange={(e) => setAutoValidate(e.target.checked)}
              className="rounded"
            />
            Auto-validate
          </label>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isValidating || !content.trim()}
            loading={isValidating}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Validate
          </Button>
        </div>
      </div>

      {/* Validation Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {passedCount}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Passed</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {warningCount}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Warnings</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {errorCount}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <Select
          label="Filter by Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={categoryOptions}
        />
      </div>

      {/* Validation Rules Configuration */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
          Validation Rules
        </h4>
        
        <div className="space-y-2">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={rule.isEnabled}
                  onChange={() => toggleRule(rule.id)}
                  className="rounded"
                />
                
                <div className="flex items-center gap-2">
                  {getCategoryIcon(rule.category)}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {rule.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {rule.description}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rule.severity === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  rule.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {rule.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Results */}
      {filteredResults.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Validation Results
          </h4>
          
          <div className="space-y-3">
            {filteredResults.map((result, index) => {
              const rule = rules.find(r => r.id === result.ruleId);
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getResultBg(result)}`}
                >
                  <div className="flex items-start gap-3">
                    {getResultIcon(result)}
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        {rule?.name || result.ruleId}
                      </div>
                      
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {result.message}
                      </div>
                      
                      {result.suggestion && (
                        <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded p-2">
                          <strong>Suggestion:</strong> {result.suggestion}
                        </div>
                      )}
                      
                      {(result.line || result.column) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {result.line && `Line ${result.line}`}
                          {result.line && result.column && ', '}
                          {result.column && `Column ${result.column}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform-specific Guidelines */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <h4 className="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Platform Guidelines: {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200">
          {platform === 'instagram' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Maximum 2,200 characters in captions</li>
              <li>Use 5-10 hashtags for optimal reach</li>
              <li>Include alt text for accessibility</li>
              <li>Avoid excessive promotional language</li>
            </ul>
          )}
          {platform === 'facebook' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Keep posts under 80 characters for better engagement</li>
              <li>Use minimal hashtags (1-3 maximum)</li>
              <li>Include clear call-to-action</li>
              <li>Comply with housing advertisement policies</li>
            </ul>
          )}
          {platform === 'general' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure all claims are truthful and verifiable</li>
              <li>Include required legal disclaimers</li>
              <li>Use inclusive and non-discriminatory language</li>
              <li>Maintain consistent brand voice</li>
            </ul>
          )}
        </div>
      </div>

      {!content.trim() && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Generate content first to see validation results</p>
        </div>
      )}
    </div>
  );
}