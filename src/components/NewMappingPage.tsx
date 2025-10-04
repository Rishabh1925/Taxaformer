import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Filter, Globe, BarChart3, Activity, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { LeafletMapComponent } from './LeafletMapComponent';
import { apiService, FastaFile, AnalysisReport } from '../services/api';

interface MapLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  sampleType: string;
  speciesCount: number;
  novelSpecies: number;
  noveltyPercentage: number;
  biodiversityIndex: number;
  environmentalScore: number;
  depth: number;
  collectionDate: string;
  status: 'active' | 'processing' | 'completed';
  analysisData?: AnalysisReport;
}

export function NewMappingPage() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [fastaFiles, setFastaFiles] = useState<FastaFile[]>([]);
  const [analysisReports, setAnalysisReports] = useState<Record<string, AnalysisReport>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load FASTA files and analysis data
  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading FASTA files...');
      const response = await apiService.getFastaFiles();
      console.log('✅ FASTA files response:', response);
      setFastaFiles(response.files);
      
      // Load analysis reports for each file
      const reports: Record<string, AnalysisReport> = {};
      for (const file of response.files.slice(0, 5)) {
        try {
          const report = await apiService.getAnalysisReport(file.id);
          reports[file.id] = report;
        } catch (err) {
          console.error(`Failed to load analysis for ${file.id}:`, err);
        }
      }
      setAnalysisReports(reports);
      console.log('✅ Analysis reports loaded:', Object.keys(reports).length);
    } catch (err) {
      console.error('❌ Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  // Filter files based on search term
  const filteredFiles = fastaFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.sample_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Geospatial Analysis</h1>
            <p className="text-gray-400">Interactive mapping of eDNA sample locations with real-time analysis data</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="glass-panel p-4 rounded-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <Input 
                placeholder="Search locations, species, or sample types..." 
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {filteredFiles.length} locations
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Visualization */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glass-panel p-0 border-0 h-[700px] overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Loading map data...</p>
                  </div>
                </div>
              ) : (
                <LeafletMapComponent
                  fastaFiles={filteredFiles}
                  analysisReports={analysisReports}
                  onLocationSelect={handleLocationSelect}
                />
              )}
            </Card>
          </motion.div>

          {/* Location Details Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            {selectedLocation ? (
              <>
                {/* Selected Location Details */}
                <Card className="glass-panel p-6 border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{selectedLocation.name}</h3>
                      <p className="text-gray-400 text-sm">{selectedLocation.collectionDate}</p>
                    </div>
                    <Badge 
                      className={`
                        ${selectedLocation.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                        ${selectedLocation.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                        ${selectedLocation.status === 'active' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                      `}
                    >
                      {selectedLocation.status}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400 text-xs">Species</span>
                        </div>
                        <p className="text-white font-semibold text-lg">{selectedLocation.speciesCount}</p>
                        {selectedLocation.novelSpecies > 0 && (
                          <p className="text-yellow-400 text-xs">+{selectedLocation.novelSpecies} novel</p>
                        )}
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400 text-xs">Diversity</span>
                        </div>
                        <p className="text-white font-semibold text-lg">{selectedLocation.biodiversityIndex.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span className="text-gray-400 text-xs">Depth</span>
                        </div>
                        <p className="text-white font-semibold text-lg">{selectedLocation.depth}m</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400 text-xs">Novelty</span>
                        </div>
                        <p className="text-white font-semibold text-lg">{selectedLocation.noveltyPercentage.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="text-gray-300 text-sm capitalize">{selectedLocation.sampleType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="glass-panel p-6 border-0 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Select a Location</h3>
                <p className="text-gray-400 text-sm">Click on a bubble marker to view detailed analysis data for that sampling location.</p>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="glass-panel p-6 border-0">
              <h4 className="text-white font-medium mb-4">Global Overview</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">Total Locations</span>
                  </div>
                  <span className="text-white font-semibold">{fastaFiles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">Analyzed</span>
                  </div>
                  <span className="text-white font-semibold">{Object.keys(analysisReports).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 text-sm">Processing</span>
                  </div>
                  <span className="text-white font-semibold">{fastaFiles.length - Object.keys(analysisReports).length}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}