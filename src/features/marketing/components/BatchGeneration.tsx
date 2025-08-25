import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { 
  Play, 
  Pause, 
  Square,
  Calendar,
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import type { 
  BatchGenerationJob, 
  Template, 
  Property, 
  ContentType,
  AudienceSegment 
} from '../types/marketing';

interface BatchGenerationProps {
  jobs: BatchGenerationJob[];
  templates: Template[];
  properties: Property[];
  audienceSegments: AudienceSegment[];
  onCreateJob: (job: Partial<BatchGenerationJob>) => void;
  onStartJob: (id: string) => void;
  onPauseJob: (id: string) => void;
  onCancelJob: (id: string) => void;
  onDeleteJob: (id: string) => void;
  onViewResults: (job: BatchGenerationJob) => void;
  onScheduleJob: (id: string, date: Date) => void;
}

export function BatchGeneration({
  jobs,
  templates,
  properties,
  audienceSegments,
  onCreateJob,
  onStartJob,
  onPauseJob,
  onCancelJob,
  onDeleteJob,
  onViewResults,
  onScheduleJob
}: BatchGenerationProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    propertyIds: [] as string[],
    audienceSegmentId: '',
    variations: 3,
    scheduleDate: '',
    scheduleTime: ''
  });

  const handleCreateJob = () => {
    if (!formData.name || !formData.templateId) {
      showToast({
        type: 'error',
        title: 'Please fill in required fields'
      });
      return;
    }

    const selectedTemplate = templates.find(t => t.id === formData.templateId);
    const selectedProperties = properties.filter(p => formData.propertyIds.includes(p.id));
    
    if (!selectedTemplate || selectedProperties.length === 0) {
      showToast({
        type: 'error',
        title: 'Please select template and properties'
      });
      return;
    }

    const scheduleDateTime = formData.scheduleDate && formData.scheduleTime
      ? new Date(`${formData.scheduleDate}T${formData.scheduleTime}`)
      : undefined;

    const newJob: Partial<BatchGenerationJob> = {
      name: formData.name,
      status: 'pending',
      progress: 0,
      properties: selectedProperties,
      template: selectedTemplate,
      options: {
        variations: formData.variations,
        schedule: scheduleDateTime
      },
      results: [],
      createdAt: new Date()
    };

    onCreateJob(newJob);
    setShowCreateForm(false);
    setFormData({
      name: '',
      templateId: '',
      propertyIds: [],
      audienceSegmentId: '',
      variations: 3,
      scheduleDate: '',
      scheduleTime: ''
    });

    showToast({
      type: 'success',
      title: 'Batch job created successfully'
    });
  };

  const getStatusIcon = (status: BatchGenerationJob['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: BatchGenerationJob['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const templateOptions = templates.map(t => ({
    value: t.id,
    label: `${t.name} (${t.type})`
  }));

  const propertyOptions = properties.map(p => ({
    value: p.id,
    label: `${p.title} - ${p.ref}`
  }));

  const segmentOptions = audienceSegments.map(s => ({
    value: s.id,
    label: `${s.name} (${s.size} people)`
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Batch Content Generation
        </h3>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
        >
          <Play className="h-4 w-4 mr-2" />
          New Batch Job
        </Button>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Create Batch Generation Job
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter job name..."
            />

            <Select
              label="Template"
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              options={[{ value: '', label: 'Select template...' }, ...templateOptions]}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Properties
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                {properties.map(property => (
                  <label key={property.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={formData.propertyIds.includes(property.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            propertyIds: [...formData.propertyIds, property.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            propertyIds: formData.propertyIds.filter(id => id !== property.id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{property.title} - {property.ref}</span>
                  </label>
                ))}
              </div>
            </div>

            <Select
              label="Audience Segment (Optional)"
              value={formData.audienceSegmentId}
              onChange={(e) => setFormData({ ...formData, audienceSegmentId: e.target.value })}
              options={[{ value: '', label: 'No specific segment' }, ...segmentOptions]}
            />

            <Input
              label="Variations per Property"
              type="number"
              min={1}
              max={10}
              value={formData.variations}
              onChange={(e) => setFormData({ ...formData, variations: parseInt(e.target.value) || 1 })}
            />

            <Input
              label="Schedule Date (Optional)"
              type="date"
              value={formData.scheduleDate}
              onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
            />

            <Input
              label="Schedule Time (Optional)"
              type="time"
              value={formData.scheduleTime}
              onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateJob}>
              Create Job
            </Button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {job.name}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    <span className="ml-1 capitalize">{job.status}</span>
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Template: {job.template.name}</div>
                  <div>Properties: {job.properties.length}</div>
                  <div>Variations: {job.options.variations} per property</div>
                  <div>Created: {new Date(job.createdAt).toLocaleString()}</div>
                  {job.options.schedule && (
                    <div>Scheduled: {new Date(job.options.schedule).toLocaleString()}</div>
                  )}
                  {job.completedAt && (
                    <div>Completed: {new Date(job.completedAt).toLocaleString()}</div>
                  )}
                </div>

                {/* Progress Bar */}
                {(job.status === 'running' || job.status === 'completed') && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {job.error && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-sm text-red-800 dark:text-red-200">
                    {job.error}
                  </div>
                )}

                {/* Results Summary */}
                {job.results.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        {job.results.length} pieces of content generated
                      </span>
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                      Ready for review and approval
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-4">
                {job.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStartJob(job.id)}
                    title="Start Job"
                  >
                    <Play className="h-4 w-4 text-green-500" />
                  </Button>
                )}

                {job.status === 'running' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPauseJob(job.id)}
                    title="Pause Job"
                  >
                    <Pause className="h-4 w-4 text-yellow-500" />
                  </Button>
                )}

                {(job.status === 'running' || job.status === 'pending') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancelJob(job.id)}
                    title="Cancel Job"
                  >
                    <Square className="h-4 w-4 text-red-500" />
                  </Button>
                )}

                {job.results.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewResults(job)}
                    title="View Results"
                  >
                    <Eye className="h-4 w-4 text-blue-500" />
                  </Button>
                )}

                {job.status === 'pending' && job.options.schedule && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onScheduleJob(job.id, new Date())}
                    title="Reschedule"
                  >
                    <Calendar className="h-4 w-4 text-purple-500" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteJob(job.id)}
                  title="Delete Job"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No batch jobs created yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Batch Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}