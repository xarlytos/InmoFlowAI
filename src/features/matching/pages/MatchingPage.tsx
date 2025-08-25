import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { getAiDriver } from '@/ai/llm';
import { useToast } from '@/components/ui/Toast';
import { 
  Zap, Calendar, Star, Filter, MapPin, Eye, Heart, Share, 
  Download, Mail, MessageCircle, BarChart3, Clock, TrendingUp,
  ChevronDown, ChevronUp, Search, X, Maximize2, Home,
  DollarSign, Ruler, Car, Move3d, Lightbulb, Shield
} from 'lucide-react';
import type { Lead, Property, MatchResult } from '@/features/core/types';

interface MatchFilters {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  propertyTypes?: Property['type'][];
  minRooms?: number;
  minArea?: number;
  mustHave?: string[];
  minScore?: number;
}

interface SavedSearch {
  id: string;
  name: string;
  leadId: string;
  filters: MatchFilters;
  results: MatchResult[];
  createdAt: string;
}

interface MatchingStats {
  totalMatches: number;
  avgScore: number;
  topCriteria: string[];
  successfulVisits: number;
}

export function MatchingPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<MatchResult[]>([]);
  const [filters, setFilters] = useState<MatchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [matchingHistory, setMatchingHistory] = useState<Array<{leadId: string, results: MatchResult[], timestamp: string}>>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());
  const [hiddenProperties, setHiddenProperties] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'area' | 'rooms'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const [isLoadingImages, setIsLoadingImages] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<MatchingStats | null>(null);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch('/api/leads');
      return response.json();
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      return response.json();
    }
  });

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      applyFiltersAndSearch();
    }, 300);
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm, filters, results, sortBy, sortOrder]);

  const matchMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const lead = leads.find((l: Lead) => l.id === leadId);
      if (!lead) throw new Error('Lead not found');
      
      const aiDriver = await getAiDriver();
      const matchResults = await aiDriver.matchLeadToProperties(lead, properties);
      
      // Add to history
      setMatchingHistory(prev => [{
        leadId,
        results: matchResults,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);  // Keep last 10
      
      return matchResults;
    },
    onSuccess: (data) => {
      setResults(data);
      calculateStats(data);
      showToast({
        type: 'success',
        title: 'Matching completed',
        message: `Found ${data.length} potential matches`
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Matching failed',
        message: error.message
      });
    }
  });

  const createVisitMutation = useMutation({
    mutationFn: async ({ propertyId, leadId }: { propertyId: string; leadId: string }) => {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          leadId,
          when: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          status: 'scheduled',
          note: 'Generated from AI matching'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create visit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Visit scheduled successfully'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to schedule visit',
        message: error.message
      });
    }
  });


  // Utility functions
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const calculateStats = useCallback((matchResults: MatchResult[]) => {
    if (!matchResults.length) {
      setStats(null);
      return;
    }

    const avgScore = matchResults.reduce((sum, r) => sum + r.score, 0) / matchResults.length;
    const allReasons = matchResults.flatMap(r => r.reasons);
    const reasonCounts = allReasons.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCriteria = Object.entries(reasonCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([reason]) => reason);

    setStats({
      totalMatches: matchResults.length,
      avgScore: Math.round(avgScore),
      topCriteria,
      successfulVisits: 0 // This would come from API
    });
  }, []);

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...results];

    // Apply filters
    if (filters.minPrice) filtered = filtered.filter(r => {
      const property = properties.find(p => p.id === r.propertyId);
      return property && property.price >= filters.minPrice!;
    });

    if (filters.maxPrice) filtered = filtered.filter(r => {
      const property = properties.find(p => p.id === r.propertyId);
      return property && property.price <= filters.maxPrice!;
    });

    if (filters.city) filtered = filtered.filter(r => {
      const property = properties.find(p => p.id === r.propertyId);
      return property && property.address.city.toLowerCase().includes(filters.city!.toLowerCase());
    });

    if (filters.propertyTypes?.length) filtered = filtered.filter(r => {
      const property = properties.find(p => p.id === r.propertyId);
      return property && filters.propertyTypes!.includes(property.type);
    });

    if (filters.minRooms) filtered = filtered.filter(r => {
      const property = properties.find(p => p.id === r.propertyId);
      return property && property.features.rooms >= filters.minRooms!;
    });

    if (filters.minArea) filtered = filtered.filter(r => {
      const property = properties.find(p => p.id === r.propertyId);
      return property && property.features.area >= filters.minArea!;
    });

    if (filters.minScore) filtered = filtered.filter(r => r.score >= filters.minScore!);

    if (filters.mustHave?.length) filtered = filtered.filter(r => {
      const property = properties.find(p => p.id === r.propertyId);
      if (!property) return false;
      
      return filters.mustHave!.every(feature => {
        switch (feature) {
          case 'elevator': return property.features.hasElevator;
          case 'balcony': return property.features.hasBalcony;
          case 'parking': return property.features.parking;
          default: return true;
        }
      });
    });

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(r => {
        const property = properties.find(p => p.id === r.propertyId);
        if (!property) return false;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          property.title.toLowerCase().includes(searchLower) ||
          property.address.city.toLowerCase().includes(searchLower) ||
          property.description?.toLowerCase().includes(searchLower) ||
          r.reasons.some(reason => reason.toLowerCase().includes(searchLower))
        );
      });
    }

    // Filter out hidden properties
    filtered = filtered.filter(r => !hiddenProperties.has(r.propertyId));

    // Sort
    filtered.sort((a, b) => {
      const propertyA = properties.find(p => p.id === a.propertyId);
      const propertyB = properties.find(p => p.id === b.propertyId);
      
      if (!propertyA || !propertyB) return 0;
      
      let comparison = 0;
      
      switch (sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'price':
          comparison = propertyA.price - propertyB.price;
          break;
        case 'area':
          comparison = propertyA.features.area - propertyB.features.area;
          break;
        case 'rooms':
          comparison = propertyA.features.rooms - propertyB.features.rooms;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredResults(filtered);
  }, [results, filters, searchTerm, sortBy, sortOrder, properties, hiddenProperties]);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavoriteProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  }, []);

  const hideProperty = useCallback((propertyId: string) => {
    setHiddenProperties(prev => new Set([...prev, propertyId]));
    showToast({
      type: 'info',
      title: 'Property hidden',
      message: 'Property removed from results'
    });
  }, [showToast]);

  const saveSearch = useCallback(() => {
    const searchName = prompt('Enter search name:');
    if (!searchName || !selectedLeadId) return;
    
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      leadId: selectedLeadId,
      filters,
      results: filteredResults,
      createdAt: new Date().toISOString()
    };
    
    setSavedSearches(prev => [newSearch, ...prev]);
    showToast({
      type: 'success',
      title: 'Search saved',
      message: `Saved as "${searchName}"`
    });
  }, [selectedLeadId, filters, filteredResults, showToast]);

  const exportResults = useCallback(() => {
    const exportData = filteredResults.map(result => {
      const property = properties.find(p => p.id === result.propertyId);
      return {
        score: result.score,
        title: property?.title || '',
        price: property?.price || 0,
        city: property?.address.city || '',
        rooms: property?.features.rooms || 0,
        area: property?.features.area || 0,
        reasons: result.reasons.join(', ')
      };
    });
    
    const csv = [
      ['Score', 'Title', 'Price', 'City', 'Rooms', 'Area', 'Reasons'],
      ...exportData.map(row => [
        row.score, row.title, row.price, row.city, row.rooms, row.area, row.reasons
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matching-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredResults, properties]);

  const shareProperty = useCallback(async (propertyId: string, method: 'email' | 'whatsapp') => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    const message = `Check out this property: ${property.title} - €${property.price.toLocaleString()} in ${property.address.city}. View details: ${window.location.origin}/properties/${property.id}`;
    
    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    } else {
      window.location.href = `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(message)}`;
    }
  }, [properties]);

  // Memoized computed values
  const leadOptions = useMemo(() => 
    leads.map((lead: Lead) => ({
      value: lead.id,
      label: `${lead.name} - ${lead.email}`
    })), [leads]
  );

  const selectedLead = useMemo(() => 
    leads.find((l: Lead) => l.id === selectedLeadId), [leads, selectedLeadId]
  );

  const cityOptions = useMemo(() => {
    const cities = new Set(properties.map((p: Property) => p.address.city));
    return Array.from(cities).map(city => ({ value: city, label: city }));
  }, [properties]);

  const propertyTypeOptions = [
    { value: 'flat', label: 'Flat' },
    { value: 'house', label: 'House' },
    { value: 'studio', label: 'Studio' },
    { value: 'office', label: 'Office' },
    { value: 'plot', label: 'Plot' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('matching.title')}
        subtitle="AI-powered lead to property matching"
      >
        <div className="flex items-center gap-2">
          {stats && (
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {stats.totalMatches} matches
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {stats.avgScore}% avg score
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </PageHeader>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Price (€)
              </label>
              <Input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || undefined }))}
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Price (€)
              </label>
              <Input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))}
                placeholder="1000000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <Select
                value={filters.city || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value || undefined }))}
                options={[{ value: '', label: 'Any city' }, ...cityOptions]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Rooms
              </label>
              <Input
                type="number"
                value={filters.minRooms || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minRooms: Number(e.target.value) || undefined }))}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Area (m²)
              </label>
              <Input
                type="number"
                value={filters.minArea || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minArea: Number(e.target.value) || undefined }))}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Score (%)
              </label>
              <Input
                type="number"
                value={filters.minScore || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minScore: Number(e.target.value) || undefined }))}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Must Have Features
            </label>
            <div className="flex flex-wrap gap-2">
              {['elevator', 'balcony', 'parking'].map((feature) => (
                <label key={feature} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.mustHave?.includes(feature) || false}
                    onChange={(e) => {
                      const mustHave = filters.mustHave || [];
                      if (e.target.checked) {
                        setFilters(prev => ({ ...prev, mustHave: [...mustHave, feature] }));
                      } else {
                        setFilters(prev => ({ ...prev, mustHave: mustHave.filter(f => f !== feature) }));
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="capitalize text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredResults.length} of {results.length} results
            </div>
          </div>
        </div>
      )}

      {/* Lead Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('matching.selectLead')}
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              options={[{ value: '', label: 'Select a lead...' }, ...leadOptions]}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => matchMutation.mutate(selectedLeadId)}
              disabled={!selectedLeadId}
              loading={matchMutation.isPending}
            >
              <Zap className="h-4 w-4 mr-2" />
              Find Matches
            </Button>
            
            {results.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveSearch}
                  disabled={!selectedLeadId}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportResults}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Lead info */}
        {selectedLead && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stage</p>
                <Badge variant={selectedLead.stage}>{t(`leads.${selectedLead.stage}`)}</Badge>
              </div>
              {selectedLead.budget && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    €{selectedLead.budget.toLocaleString()}
                  </p>
                </div>
              )}
              {selectedLead.preferences?.city && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preferred City</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLead.preferences.city}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search and Sort Controls */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search properties, cities, features..."
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'score', label: 'Sort by Score' },
                  { value: 'price', label: 'Sort by Price' },
                  { value: 'area', label: 'Sort by Area' },
                  { value: 'rooms', label: 'Sort by Rooms' }
                ]}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Matching Results */}
      {filteredResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Home className="h-5 w-5" />
              {t('matching.matchingResults')} ({filteredResults.length})
            </h3>
            
            {stats && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Star className="h-4 w-4" />
                  Avg: {stats.avgScore}%
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Top: {stats.topCriteria[0]}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid gap-6">
            {filteredResults.map((result) => {
              const property = properties.find((p: Property) => p.id === result.propertyId);
              if (!property) return null;
              
              const isFavorite = favoriteProperties.has(property.id);
              const mainImage = property.media.find(m => m.kind === 'photo');

              return (
                <div 
                  key={result.propertyId} 
                  className="group border border-gray-200 dark:border-gray-700 rounded-xl p-0 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Property Image */}
                    <div className="lg:w-80 h-48 lg:h-auto relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {mainImage ? (
                        <img
                          src={mainImage.url}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onLoad={() => setIsLoadingImages(prev => {
                            const next = new Set(prev);
                            next.delete(property.id);
                            return next;
                          })}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Home className="h-12 w-12" />
                        </div>
                      )}
                      
                      {/* Score Badge */}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full ${getScoreBgColor(result.score)} backdrop-blur-sm`}>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={`font-bold ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(property.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors ${
                          isFavorite 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Property Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {property.title}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {property.address.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              €{property.price.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Home className="h-4 w-4" />
                              {property.features.rooms}H/{property.features.baths}B
                            </span>
                            <span className="flex items-center gap-1">
                              <Ruler className="h-4 w-4" />
                              {property.features.area}m²
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Feature Icons */}
                      <div className="flex items-center gap-3 mb-4">
                        {property.features.hasElevator && (
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            <Move3d className="h-3 w-3" />
                            Elevator
                          </div>
                        )}
                        {property.features.hasBalcony && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                            <Lightbulb className="h-3 w-3" />
                            Balcony
                          </div>
                        )}
                        {property.features.parking && (
                          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                            <Car className="h-3 w-3" />
                            Parking
                          </div>
                        )}
                      </div>
                      
                      {/* Matching Reasons */}
                      <div className="space-y-2 mb-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Why it matches:
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {result.reasons.slice(0, 4).map((reason, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                              <div className="w-1 h-1 bg-green-500 rounded-full" />
                              {reason}
                            </div>
                          ))}
                          {result.reasons.length > 4 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{result.reasons.length - 4} more reasons
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowPropertyModal(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createVisitMutation.mutate({ 
                            propertyId: property.id, 
                            leadId: result.leadId 
                          })}
                          loading={createVisitMutation.isPending}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Visit
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareProperty(property.id, 'email')}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareProperty(property.id, 'whatsapp')}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => hideProperty(property.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Property Detail Modal */}
      <Modal
        isOpen={showPropertyModal}
        onClose={() => {
          setShowPropertyModal(false);
          setSelectedProperty(null);
        }}
        title={selectedProperty?.title || ''}
        size="xl"
      >
        {selectedProperty && (
          <div className="space-y-6">
            {/* Property Images Gallery */}
            {selectedProperty.media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedProperty.media.filter(m => m.kind === 'photo').map((media, index) => (
                  <img
                    key={media.id}
                    src={media.url}
                    alt={`${selectedProperty.title} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            )}
            
            {/* Property Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  €{selectedProperty.price.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedProperty.features.area}m²
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Rooms</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedProperty.features.rooms}H / {selectedProperty.features.baths}B
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                  {selectedProperty.type}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Floor</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedProperty.features.floor || 'N/A'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedProperty.features.year || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Description */}
            {selectedProperty.description && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {selectedProperty.description}
                </p>
              </div>
            )}
            
            {/* Address */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Location</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedProperty.address.street}, {selectedProperty.address.city}
                {selectedProperty.address.state && `, ${selectedProperty.address.state}`}
                {selectedProperty.address.zip && ` ${selectedProperty.address.zip}`}
              </p>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => window.open(`/properties/${selectedProperty.id}`, '_blank')}
                className="flex-1"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Open Full View
              </Button>
              <Button
                variant="outline"
                onClick={() => createVisitMutation.mutate({ 
                  propertyId: selectedProperty.id, 
                  leadId: selectedLeadId 
                })}
                loading={createVisitMutation.isPending}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Visit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* No Results State */}
      {results.length === 0 && selectedLeadId && !matchMutation.isPending && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No matches found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your filters or selecting a different lead
            </p>
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Adjust Filters
            </Button>
          </div>
        </div>
      )}
      
      {/* No Results After Filtering */}
      {results.length > 0 && filteredResults.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No results match your filters
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {results.length} properties were found but none match your current filters
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
              >
                Clear All Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Adjust Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Saved Searches ({savedSearches.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSearches.slice(0, 6).map((search) => (
              <div key={search.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {search.name}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {search.results.length} results
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {new Date(search.createdAt).toLocaleDateString()}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedLeadId(search.leadId);
                    setFilters(search.filters);
                    setResults(search.results);
                  }}
                  className="w-full"
                >
                  Load Search
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}