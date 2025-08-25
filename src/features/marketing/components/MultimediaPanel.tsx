import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { 
  Image as ImageIcon,
  Music,
  Video,
  Palette,
  Wand2,
  Download,
  Eye,
  Trash2,
  Plus,
  Play,
  Volume2,
  Sparkles,
  Camera,
  Film
} from 'lucide-react';
import type { MultimediaContent, ContentType } from '../types/marketing';

interface MultimediaPanelProps {
  contentType: ContentType;
  propertyData?: any;
  onGenerateImages: (prompt: string, style: string, count: number) => void;
  onGenerateMusic: (mood: string, duration: number, genre: string) => void;
  onGenerateEffects: (contentType: ContentType, theme: string) => void;
  multimedia?: MultimediaContent;
  isGenerating: boolean;
}

export function MultimediaPanel({
  contentType,
  propertyData,
  onGenerateImages,
  onGenerateMusic,
  onGenerateEffects,
  multimedia,
  isGenerating
}: MultimediaPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [imageCount, setImageCount] = useState(3);
  const [musicMood, setMusicMood] = useState('upbeat');
  const [musicDuration, setMusicDuration] = useState(30);
  const [musicGenre, setMusicGenre] = useState('corporate');
  const [effectsTheme, setEffectsTheme] = useState('modern');
  const [activeTab, setActiveTab] = useState<'images' | 'music' | 'effects'>('images');

  const imageStyleOptions = [
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'illustration', label: 'Illustration' },
    { value: 'sketch', label: 'Sketch' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'modern', label: 'Modern' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'minimalist', label: 'Minimalist' }
  ];

  const musicMoodOptions = [
    { value: 'upbeat', label: 'Upbeat' },
    { value: 'calm', label: 'Calm' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'professional', label: 'Professional' },
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'friendly', label: 'Friendly' }
  ];

  const musicGenreOptions = [
    { value: 'corporate', label: 'Corporate' },
    { value: 'ambient', label: 'Ambient' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'acoustic', label: 'Acoustic' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'pop', label: 'Pop' },
    { value: 'jazz', label: 'Jazz' }
  ];

  const effectsThemeOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'playful', label: 'Playful' },
    { value: 'professional', label: 'Professional' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'bold', label: 'Bold' },
    { value: 'minimal', label: 'Minimal' }
  ];

  const durationOptions = [
    { value: '15', label: '15 seconds' },
    { value: '30', label: '30 seconds' },
    { value: '60', label: '60 seconds' },
    { value: '90', label: '90 seconds' }
  ];

  const handleGenerateImages = () => {
    if (!imagePrompt.trim()) {
      showToast({
        type: 'error',
        title: 'Please enter an image prompt'
      });
      return;
    }
    
    onGenerateImages(imagePrompt, imageStyle, imageCount);
  };

  const handleGenerateMusic = () => {
    onGenerateMusic(musicMood, musicDuration, musicGenre);
  };

  const handleGenerateEffects = () => {
    onGenerateEffects(contentType, effectsTheme);
  };

  const generateSuggestedPrompt = () => {
    const prompts = {
      ad: [
        'Modern real estate property exterior with professional lighting',
        'Luxury home interior with elegant furniture and natural light',
        'Happy family in front of their new home',
        'Real estate agent showing property to clients'
      ],
      email: [
        'Professional real estate newsletter header design',
        'Modern property showcase layout',
        'Elegant email template background',
        'Real estate branding elements'
      ],
      reel: [
        'Dynamic property walkthrough scenes',
        'Before and after home renovation',
        'Aerial view of residential neighborhood',
        'Modern kitchen with lifestyle elements'
      ],
      social: [
        'Instagram-style property photos with natural lighting',
        'Social media story template for real estate',
        'Property listing card design',
        'Real estate agent headshots'
      ]
    };

    const suggestions = prompts[contentType as keyof typeof prompts] || prompts.ad;
    const randomPrompt = suggestions[Math.floor(Math.random() * suggestions.length)];
    setImagePrompt(randomPrompt);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Multimedia Content
        </h3>
        
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'images'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <ImageIcon className="h-4 w-4 mr-1 inline" />
            Images
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'music'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Music className="h-4 w-4 mr-1 inline" />
            Music
          </button>
          <button
            onClick={() => setActiveTab('effects')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'effects'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Sparkles className="h-4 w-4 mr-1 inline" />
            Effects
          </button>
        </div>
      </div>

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="Image Description"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSuggestedPrompt}
                  className="self-end"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Select
              label="Style"
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value)}
              options={imageStyleOptions}
            />

            <Input
              label="Number of Images"
              type="number"
              min={1}
              max={6}
              value={imageCount}
              onChange={(e) => setImageCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <Button
            onClick={handleGenerateImages}
            disabled={!imagePrompt.trim() || isGenerating}
            loading={isGenerating}
            className="w-full"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Generate Images
          </Button>

          {/* Generated Images */}
          {multimedia?.images && multimedia.images.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Generated Images
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {multimedia.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all duration-200">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {image.prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Music Tab */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Mood"
              value={musicMood}
              onChange={(e) => setMusicMood(e.target.value)}
              options={musicMoodOptions}
            />

            <Select
              label="Genre"
              value={musicGenre}
              onChange={(e) => setMusicGenre(e.target.value)}
              options={musicGenreOptions}
            />

            <Select
              label="Duration"
              value={musicDuration.toString()}
              onChange={(e) => setMusicDuration(parseInt(e.target.value))}
              options={durationOptions}
            />
          </div>

          <Button
            onClick={handleGenerateMusic}
            disabled={isGenerating}
            loading={isGenerating}
            className="w-full"
          >
            <Music className="h-4 w-4 mr-2" />
            Generate Background Music
          </Button>

          {/* Generated Music */}
          {multimedia?.music && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Generated Music
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {multimedia.music.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {multimedia.music.duration}s • {musicGenre} • {musicMood}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <audio 
                  controls 
                  className="w-full h-8"
                  src={multimedia.music.url}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Theme"
              value={effectsTheme}
              onChange={(e) => setEffectsTheme(e.target.value)}
              options={effectsThemeOptions}
            />

            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Content type: <span className="capitalize font-medium">{contentType}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateEffects}
            disabled={isGenerating}
            loading={isGenerating}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Visual Effects
          </Button>

          {/* Generated Effects */}
          {multimedia?.effects && multimedia.effects.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Suggested Effects
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {multimedia.effects.map((effect, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg p-3 text-center"
                  >
                    <Film className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {effect}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Effect Suggestions by Content Type */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Recommended for {contentType === 'reel' ? 'Reels' : 'Content'}
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {contentType === 'reel' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Quick cuts and transitions</li>
                    <li>Text overlays with property details</li>
                    <li>Before/after reveal effects</li>
                    <li>Property feature highlights</li>
                  </ul>
                )}
                {contentType === 'social' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Instagram story templates</li>
                    <li>Property carousel layouts</li>
                    <li>Call-to-action overlays</li>
                    <li>Brand consistency elements</li>
                  </ul>
                )}
                {contentType === 'ad' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Professional property frames</li>
                    <li>Logo watermarks</li>
                    <li>Contact information overlays</li>
                    <li>Price and feature callouts</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}