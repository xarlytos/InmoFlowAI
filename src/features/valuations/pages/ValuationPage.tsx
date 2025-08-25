import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MapView } from '@/components/MapView';
import { getAiDriver } from '@/ai/llm';
import { useToast } from '@/components/ui/Toast';
import { DollarSign, TrendingUp, MapPin, FileDown, Share, History } from 'lucide-react';
import { z } from 'zod';
import type { ValuationResult, Property } from '@/features/core/types';

const valuationInputSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  rooms: z.number().min(0, 'Rooms must be 0 or more'),
  baths: z.number().min(0, 'Bathrooms must be 0 or more'),
  area: z.number().min(1, 'Area must be greater than 0'),
  floor: z.number().optional(),
  hasElevator: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  heating: z.enum(['none', 'gas', 'electric', 'central']).optional(),
  parking: z.boolean().optional(),
  year: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  energyLabel: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  priceHint: z.number().min(0).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'needs_renovation']).optional(),
  neighborhoodType: z.enum(['residential', 'commercial', 'mixed']).optional(),
  budgetRange: z.number().min(0).optional(),
});

type ValuationInputForm = z.infer<typeof valuationInputSchema>;

interface SavedValuation extends ValuationResult {
  savedAt: string;
  formData: ValuationInputForm;
}

export function ValuationPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [savedValuations, setSavedValuations] = useState<SavedValuation[]>([]);
  const [estimatedBudget, setEstimatedBudget] = useState(500000);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);

  const form = useForm<ValuationInputForm>({
    resolver: zodResolver(valuationInputSchema),
    defaultValues: {
      street: '',
      city: '',
      country: 'España',
      rooms: 2,
      baths: 1,
      area: 80,
      hasElevator: false,
      hasBalcony: false,
      parking: false,
      heating: 'none',
      condition: 'good',
      neighborhoodType: 'residential',
      budgetRange: 500000
    }
  });

  const valuationMutation = useMutation({
    mutationFn: async (data: ValuationInputForm) => {
      const aiDriver = await getAiDriver();
      return aiDriver.estimatePrice({
        address: {
          street: data.street,
          city: data.city,
          country: data.country
        },
        features: {
          rooms: data.rooms,
          baths: data.baths,
          area: data.area,
          floor: data.floor,
          hasElevator: data.hasElevator,
          hasBalcony: data.hasBalcony,
          heating: data.heating,
          parking: data.parking,
          year: data.year,
          energyLabel: data.energyLabel
        },
        priceHint: data.priceHint
      });
    },
    onSuccess: (data) => {
      setResult(data);
      showToast({
        type: 'success',
        title: 'Valuation completed'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Valuation failed',
        message: error.message
      });
    }
  });

  const onSubmit = (data: ValuationInputForm) => {
    valuationMutation.mutate(data);
  };

  const saveValuation = () => {
    if (result) {
      const savedValuation: SavedValuation = {
        ...result,
        savedAt: new Date().toISOString(),
        formData: form.getValues()
      };
      setSavedValuations(prev => [savedValuation, ...prev]);
      showToast({
        type: 'success',
        title: 'Valuation saved'
      });
    }
  };

  const exportReport = () => {
    showToast({
      type: 'info',
      title: 'Export functionality coming soon'
    });
  };

  const shareValuation = () => {
    if (navigator.share && result) {
      navigator.share({
        title: 'Property Valuation',
        text: `Property valued at €${result.suggestedPrice.toLocaleString()}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast({
        type: 'success',
        title: 'Link copied to clipboard'
      });
    }
  };

  const validateAddress = async (address: string) => {
    // Mock address validation
    if (address.length > 3) {
      setAddressSuggestions([
        address + ', Madrid',
        address + ', Barcelona',
        address + ', Valencia'
      ]);
    } else {
      setAddressSuggestions([]);
    }
  };

  const heatingOptions = [
    { value: 'none', label: 'None' },
    { value: 'gas', label: 'Gas' },
    { value: 'electric', label: 'Electric' },
    { value: 'central', label: 'Central' }
  ];

  const energyOptions = [
    { value: '', label: 'Not specified' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
    { value: 'G', label: 'G' }
  ];

  const conditionOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_renovation', label: 'Needs Renovation' }
  ];

  const neighborhoodOptions = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'mixed', label: 'Mixed Use' }
  ];

  // Convert comparables to properties for map display
  const mapProperties: Property[] = result?.comps.map((comp, index) => ({
    id: comp.ref,
    ref: comp.ref,
    title: comp.ref,
    price: comp.price,
    currency: 'EUR' as const,
    status: 'active' as const,
    type: 'flat' as const,
    address: {
      street: '',
      city: form.watch('city') || 'Madrid',
      country: form.watch('country') || 'España',
      lat: 40.4168 + (Math.random() - 0.5) * 0.1,
      lng: -3.7038 + (Math.random() - 0.5) * 0.1
    },
    features: {
      rooms: comp.rooms,
      area: comp.area,
      baths: 1
    },
    media: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })) || [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('valuations.title')}
        subtitle="AI-powered property valuation based on market data"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-lg">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">AI Property Valuation</h2>
            <p className="text-primary-100">Get instant market-based property valuations powered by advanced AI</p>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Badge variant="active">1</Badge>
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Property Details</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-4"></div>
          <div className="flex items-center">
            <Badge variant={result ? "active" : "default"}>2</Badge>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Valuation Results</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Valuation Form */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Property Information
            </h3>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'basic', label: 'Basic Info' },
                  { id: 'features', label: 'Features' },
                  { id: 'advanced', label: 'Advanced' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                {/* Address */}
                <div className="relative">
                  <Input
                    {...form.register('street')}
                    label="Street Address"
                    error={form.formState.errors.street?.message}
                    onBlur={async (e) => {
                      await validateAddress(e.target.value);
                    }}
                  />
                  {addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            form.setValue('street', suggestion);
                            setAddressSuggestions([]);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...form.register('city')}
                    label="City"
                    error={form.formState.errors.city?.message}
                  />
                  
                  <Input
                    {...form.register('country')}
                    label="Country"
                    error={form.formState.errors.country?.message}
                  />
                </div>

                {/* Basic Features */}
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    {...form.register('rooms', { valueAsNumber: true })}
                    type="number"
                    label="Rooms"
                    error={form.formState.errors.rooms?.message}
                  />
                  
                  <Input
                    {...form.register('baths', { valueAsNumber: true })}
                    type="number"
                    label="Bathrooms"
                    error={form.formState.errors.baths?.message}
                  />
                  
                  <Input
                    {...form.register('area', { valueAsNumber: true })}
                    type="number"
                    label="Area (m²)"
                    error={form.formState.errors.area?.message}
                  />
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Property Features</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...form.register('floor', { valueAsNumber: true })}
                    type="number"
                    label="Floor"
                    error={form.formState.errors.floor?.message}
                  />
                  
                  <Input
                    {...form.register('year', { valueAsNumber: true })}
                    type="number"
                    label="Year Built"
                    error={form.formState.errors.year?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    {...form.register('heating')}
                    label="Heating"
                    options={heatingOptions}
                    error={form.formState.errors.heating?.message}
                  />
                  
                  <Select
                    {...form.register('energyLabel')}
                    label="Energy Label"
                    options={energyOptions}
                    error={form.formState.errors.energyLabel?.message}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      {...form.register('hasElevator')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Elevator</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      {...form.register('hasBalcony')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Balcony</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      {...form.register('parking')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Parking</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Advanced Options</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    {...form.register('condition')}
                    label="Property Condition"
                    options={conditionOptions}
                    error={form.formState.errors.condition?.message}
                  />
                  
                  <Select
                    {...form.register('neighborhoodType')}
                    label="Neighborhood Type"
                    options={neighborhoodOptions}
                    error={form.formState.errors.neighborhoodType?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Range
                  </label>
                  <input
                    {...form.register('budgetRange', { valueAsNumber: true })}
                    type="range"
                    min={50000}
                    max={2000000}
                    step={10000}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    value={estimatedBudget}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setEstimatedBudget(value);
                      form.setValue('budgetRange', value);
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>€50K</span>
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      €{estimatedBudget.toLocaleString()}
                    </span>
                    <span>€2M</span>
                  </div>
                </div>

                <Input
                  {...form.register('priceHint', { valueAsNumber: true })}
                  type="number"
                  label={t('valuations.priceHint')}
                  helper="Optional: Current asking price or price expectation"
                  error={form.formState.errors.priceHint?.message}
                />
              </div>
            )}

            <Button
              type="submit"
              loading={valuationMutation.isPending}
              className="w-full"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Get Valuation
            </Button>
          </form>
        </div>

        {/* Saved Valuations Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Valuations
            </h3>
            {savedValuations.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
                No saved valuations yet
              </p>
            ) : (
              <div className="space-y-3">
                {savedValuations.slice(0, 3).map((val, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        €{val.suggestedPrice.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(val.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {result && (
          <>
            {/* Price Result */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('valuations.suggestedPrice')}
                </h3>
                <Button onClick={saveValuation} size="sm" variant="outline">
                  Save
                </Button>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  €{result.suggestedPrice.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Range: €{result.range[0].toLocaleString()} - €{result.range[1].toLocaleString()}
                </p>
              </div>

              {/* Export and Share Buttons */}
              <div className="flex gap-3">
                <Button onClick={exportReport} variant="outline" className="flex-1">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={shareValuation} variant="outline" className="flex-1">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Market Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+5.2%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">YoY Growth</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">28</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days on Market</div>
                </div>
              </div>
            </div>

            {/* Rationale */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('valuations.rationale')}
              </h3>
              <ul className="space-y-2">
                {result.rationale.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Comparables with Visual Charts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Price Comparison
              </h3>
              
              <div className="space-y-4">
                {result.comps.map((comp, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Avatar name={comp.ref} size="sm" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comp.ref}
                          </span>
                          <Badge variant="outline">
                            €{comp.price.toLocaleString()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {comp.rooms} rooms • {comp.area}m² • {comp.distanceKm}km away
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((comp.price / result.suggestedPrice) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Comparables Map */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Comparables
              </h3>
              <MapView 
                properties={mapProperties}
                height="400px"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}