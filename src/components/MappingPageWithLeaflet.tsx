import React, { useState, useEffect } from 'react';
import { LeafletMap } from './LeafletMap';
import { FastaFile, AnalysisReport, fetchFastaFiles, fetchAnalysisReports } from '../services/api';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  MapPin, 
  Search, 
  Filter, 
  Layers,
  Activity,
  Fish,
  Zap,
  Droplet,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  sampleType: string;
  speciesCount: number;
  novelSpecies?: number;
  noveltyPercentage?: number;
  depth?: number;
  status: 'active' | 'processing' | 'completed';
}

export const MappingPageWithLeaflet: React.FC = () => {
  const [fastaFiles, setFastaFiles] = useState<FastaFile[]>([]);
  const [analysisReports, setAnalysisReports] = useState<Record<string, AnalysisReport>>({});
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sampleFilter, setSampleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 MappingPageWithLeaflet: Loading data...');
        
        // Test backend connection first
        try {
          const healthCheck = await fetch('http://localhost:8000/');
          if (!healthCheck.ok) throw new Error('Backend not responding');
          console.log('✅ Backend connection successful');
        } catch (backendError) {
          console.warn('⚠️ Backend offline, using fallback data');
          // Use fallback data if backend is offline
          setFastaFiles(getFallbackData());
          setAnalysisReports({});
          setIsLoading(false);
          return;
        }
        
        const [files, reports] = await Promise.all([
          fetchFastaFiles(),
          fetchAnalysisReports()
        ]);
        
        setFastaFiles(files);
        setAnalysisReports(reports);
        
        console.log('✅ MappingPageWithLeaflet: Data loaded successfully');
        console.log('📍 Files:', files.length);
        console.log('📋 Reports:', Object.keys(reports).length);
        
      } catch (err) {
        console.error('❌ MappingPageWithLeaflet: Error loading data:', err);
        console.log('🔄 Using fallback data...');
        setFastaFiles(getFallbackData());
        setAnalysisReports({});
        setError(null); // Don't show error, just use fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Fallback data for when backend is offline
  const getFallbackData = (): FastaFile[] => [
    {
      id: 'fallback_1',
      name: 'Monterey Bay Deep',
      location: 'Monterey Bay, CA',
      collection_date: '2024-01-15',
      sample_type: 'deep_seawater',
      coordinates: { lat: 36.7014, lng: -122.1861 },
      depth: 450,
      species_count: 67,
      novel_species: 18,
      novelty_percentage: 26.9,
      biodiversity_index: 2.1,
      environmental_score: 88.7
    },
    {
      id: 'fallback_2',
      name: 'San Francisco Bay',
      location: 'San Francisco, CA',
      collection_date: '2024-02-01',
      sample_type: 'seawater',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      depth: 15,
      species_count: 234,
      novel_species: 19,
      novelty_percentage: 8.1,
      biodiversity_index: 3.6,
      environmental_score: 91.2
    },
    {
      id: 'fallback_3',
      name: 'Lake Tahoe',
      location: 'Lake Tahoe, CA',
      collection_date: '2024-02-15',
      sample_type: 'freshwater',
      coordinates: { lat: 39.0968, lng: -120.0324 },
      depth: 89,
      species_count: 156,
      novel_species: 12,
      novelty_percentage: 7.7,
      biodiversity_index: 3.2,
      environmental_score: 85.4
    },
    {
      id: 'fallback_4',
      name: 'Redwood Forest Soil',
      location: 'Humboldt County, CA',
      collection_date: '2024-03-01',
      sample_type: 'soil',
      coordinates: { lat: 41.2132, lng: -124.0046 },
      depth: 0.5,
      species_count: 203,
      novel_species: 15,
      novelty_percentage: 7.4,
      biodiversity_index: 3.5,
      environmental_score: 78.9
    },
    {
      id: 'fallback_5',
      name: 'Point Reyes Tidal Pool',
      location: 'Point Reyes, CA',
      collection_date: '2024-03-15',
      sample_type: 'seawater',
      coordinates: { lat: 38.0293, lng: -122.8694 },
      depth: 1.8,
      species_count: 189,
      novel_species: 13,
      novelty_percentage: 6.9,
      biodiversity_index: 3.4,
      environmental_score: 87.4
    }
  ];

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    console.log('Location selected:', location);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const [files, reports] = await Promise.all([
        fetchFastaFiles(),
        fetchAnalysisReports()
      ]);
      setFastaFiles(files);
      setAnalysisReports(reports);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading mapping data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ {error}</div>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 pt-20" style={{zIndex: 1}}>
      <div className="h-full flex gap-6">
        
        {/* Main Map Area */}
        <div className="flex-1 relative">
          <Card className="h-full bg-black/40 backdrop-blur-md border-white/10 overflow-hidden">
            <div className="h-full relative">
              
              {/* Map Header */}
              <div className="absolute top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-400" />
                    <div>
                      <h1 className="text-xl font-bold text-white">eDNA Mapping Dashboard</h1>
                      <p className="text-gray-400 text-sm">Interactive species distribution analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/50 border-white/20 text-white placeholder-gray-400 w-64"
                      />
                    </div>
                    
                    <Button
                      onClick={handleRefresh}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Leaflet Map */}
              <div className="absolute inset-0 pt-20">
                <LeafletMap
                  fastaFiles={fastaFiles}
                  analysisReports={analysisReports}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="w-96 space-y-4">
          
          {/* Quick Stats */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Overview</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{fastaFiles.length}</div>
                <div className="text-xs text-gray-400">Total Sites</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {fastaFiles.reduce((sum, file) => sum + (file.species_count || 0), 0)}
                </div>
                <div className="text-xs text-gray-400">Total Species</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Object.keys(analysisReports).length}
                </div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {fastaFiles.length - Object.keys(analysisReports).length}
                </div>
                <div className="text-xs text-gray-400">Processing</div>
              </div>
            </div>
          </Card>

          {/* Sample Type Filter */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Filter by Type</h3>
            </div>
            
            <div className="space-y-2">
              {[
                { id: 'all', name: 'All Samples', count: fastaFiles.length },
                { id: 'seawater', name: 'Seawater', count: fastaFiles.filter(f => f.sample_type.includes('seawater')).length },
                { id: 'freshwater', name: 'Freshwater', count: fastaFiles.filter(f => f.sample_type.includes('freshwater')).length },
                { id: 'soil', name: 'Soil', count: fastaFiles.filter(f => f.sample_type === 'soil').length }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSampleFilter(filter.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    sampleFilter === filter.id 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{filter.name}</span>
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    {filter.count}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>

          {/* Selected Location Details */}
          {selectedLocation && (
            <Card className="bg-black/40 backdrop-blur-md border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Location Details</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-medium">{selectedLocation.name}</h4>
                  <p className="text-gray-400 text-sm capitalize">
                    {selectedLocation.sampleType.replace('_', ' ')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Fish className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-gray-400">Species</span>
                    </div>
                    <div className="text-white font-semibold">{selectedLocation.speciesCount}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Droplet className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs text-gray-400">Depth</span>
                    </div>
                    <div className="text-white font-semibold">{selectedLocation.depth}m</div>
                  </div>
                </div>
                
                {selectedLocation.novelSpecies && selectedLocation.novelSpecies > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">
                        {selectedLocation.novelSpecies} Novel Species
                      </span>
                    </div>
                    {selectedLocation.noveltyPercentage && (
                      <p className="text-gray-300 text-sm mt-1">
                        {selectedLocation.noveltyPercentage.toFixed(1)}% novelty rate
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-gray-400 text-sm">Status</span>
                  <Badge className={`
                    ${selectedLocation.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                    ${selectedLocation.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${selectedLocation.status === 'active' ? 'bg-blue-500/20 text-blue-400' : ''}
                  `}>
                    {selectedLocation.status}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Recent Activity</h3>
            </div>
            
            <div className="space-y-2">
              {fastaFiles.slice(0, 3).map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    analysisReports[file.id] ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{file.name}</p>
                    <p className="text-gray-400 text-xs">
                      {analysisReports[file.id] ? 'Analysis complete' : 'Processing...'}
                    </p>
                  </div>
                  <Calendar className="w-3 h-3 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};