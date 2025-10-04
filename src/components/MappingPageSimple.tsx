import React, { useState, useEffect } from 'react';
import { SimpleWorkingMap } from './SimpleWorkingMap';
import { FastaFile, AnalysisReport, fetchFastaFiles, fetchAnalysisReports } from '../services/api';

export const MappingPageSimple: React.FC = () => {
  const [fastaFiles, setFastaFiles] = useState<FastaFile[]>([]);
  const [analysisReports, setAnalysisReports] = useState<Record<string, AnalysisReport>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('MappingPageSimple: Loading data...');
        
        // Fetch FASTA files and analysis reports
        const [files, reports] = await Promise.all([
          fetchFastaFiles(),
          fetchAnalysisReports()
        ]);
        
        setFastaFiles(files);
        setAnalysisReports(reports);
        setDebug({
          files: files,
          reports,
        });
        console.log('✅ MappingPageSimple: Data loaded successfully');
        console.log('📍 Files:', files.length);
        console.log('📋 Reports:', Object.keys(reports).length);
        
      } catch (err) {
        console.error('MappingPageSimple: Error loading data:', err);
        setError('Failed to load mapping data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-panel p-8 rounded-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading mapping data...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to eDNA analysis backend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-panel p-8 rounded-2xl text-center">
          <div className="text-red-400 mb-4 text-2xl">⚠️</div>
          <h3 className="text-white font-semibold mb-2">Connection Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Dummy data fallback if no backend data
  // 10 dummy sites with required fields
  const dummyFastaFiles: FastaFile[] = [
    {
      id: 'site_1', name: 'Site 1', location: 'A', collection_date: '2025-09-30', sample_type: 'seawater', coordinates: { lat: 36.7783, lng: -119.4179 }, depth: 12, species_count: 120, novel_species: 8, novelty_percentage: 6.7, biodiversity_index: 2.9, environmental_score: 80.5 },
    { id: 'site_2', name: 'Site 2', location: 'B', collection_date: '2025-09-29', sample_type: 'freshwater', coordinates: { lat: 39.0968, lng: -120.0324 }, depth: 8, species_count: 90, novel_species: 5, novelty_percentage: 5.5, biodiversity_index: 2.5, environmental_score: 75.2 },
    { id: 'site_3', name: 'Site 3', location: 'C', collection_date: '2025-09-28', sample_type: 'soil', coordinates: { lat: 41.2132, lng: -124.0046 }, depth: 3, species_count: 150, novel_species: 12, novelty_percentage: 8.0, biodiversity_index: 3.1, environmental_score: 78.9 },
    { id: 'site_4', name: 'Site 4', location: 'D', collection_date: '2025-09-27', sample_type: 'river_water', coordinates: { lat: 38.0293, lng: -121.3018 }, depth: 7, species_count: 110, novel_species: 7, novelty_percentage: 6.3, biodiversity_index: 2.7, environmental_score: 67.3 },
    { id: 'site_5', name: 'Site 5', location: 'E', collection_date: '2025-09-26', sample_type: 'seawater', coordinates: { lat: 36.6002, lng: -121.8947 }, depth: 15, species_count: 180, novel_species: 10, novelty_percentage: 5.6, biodiversity_index: 3.2, environmental_score: 94.2 },
    { id: 'site_6', name: 'Site 6', location: 'F', collection_date: '2025-09-25', sample_type: 'marsh_water', coordinates: { lat: 37.7749, lng: -122.4194 }, depth: 4, species_count: 130, novel_species: 6, novelty_percentage: 4.9, biodiversity_index: 3.0, environmental_score: 71.8 },
    { id: 'site_7', name: 'Site 7', location: 'G', collection_date: '2025-09-24', sample_type: 'deep_seawater', coordinates: { lat: 36.7014, lng: -122.1861 }, depth: 50, species_count: 67, novel_species: 3, novelty_percentage: 2.9, biodiversity_index: 2.1, environmental_score: 88.7 },
    { id: 'site_8', name: 'Site 8', location: 'H', collection_date: '2025-09-23', sample_type: 'urban_water', coordinates: { lat: 34.0522, lng: -118.2437 }, depth: 2, species_count: 45, novel_species: 2, novelty_percentage: 4.4, biodiversity_index: 1.8, environmental_score: 42.1 },
    { id: 'site_9', name: 'Site 9', location: 'I', collection_date: '2025-09-22', sample_type: 'alpine_water', coordinates: { lat: 37.8651, lng: -119.5383 }, depth: 20, species_count: 112, novel_species: 9, novelty_percentage: 8.0, biodiversity_index: 2.7, environmental_score: 89.3 },
    { id: 'site_10', name: 'Site 10', location: 'J', collection_date: '2025-09-21', sample_type: 'estuary_water', coordinates: { lat: 40.8021, lng: -124.1637 }, depth: 6, species_count: 198, novel_species: 16, novelty_percentage: 8.1, biodiversity_index: 3.3, environmental_score: 83.5 },
  ];

  const dummyAnalysisReports: Record<string, AnalysisReport> = {
    dummy_1: {
      file_info: dummyFastaFiles[0],
      analysis_metadata: {
        analysis_id: 'analysis_dummy_1',
        processed_date: '2025-09-30T12:00:00Z',
        processing_time: '60 seconds',
        pipeline_version: 'v2.1.3',
        database_version: 'NCBI_nt_2024.1',
      },
      summary_statistics: {
        total_species_detected: 120,
        total_sequences_analyzed: 1000,
        total_biomass_estimate: 50.2,
        average_confidence_score: 0.95,
        shannon_diversity_index: 2.9,
        simpson_diversity_index: 0.85,
      },
      species_composition: [],
      environmental_parameters: {
        temperature: 18.5,
        ph: 7.2,
        dissolved_oxygen: 8.1,
        turbidity: 2.5,
        conductivity: 300,
        salinity: 32.1,
        depth: 10,
        flow_rate: 1.2,
      },
      taxonomic_breakdown: {
        kingdoms: { Animalia: 80, Plantae: 20, Bacteria: 20, Fungi: 0 },
        phylums: { Chordata: 50, Arthropoda: 30, Chlorophyta: 20, Cyanobacteria: 20 },
      },
      quality_metrics: {
        sequence_quality_score: 0.97,
        contamination_level: 0.02,
        coverage_depth: '120x',
        gc_content: 45.2,
      },
      temporal_analysis: {
        seasonal_variation: 0.2,
        stability_index: 0.8,
        trend_direction: 'stable',
      },
    },
    dummy_2: {
      file_info: dummyFastaFiles[1],
      analysis_metadata: {
        analysis_id: 'analysis_dummy_2',
        processed_date: '2025-09-29T12:00:00Z',
        processing_time: '55 seconds',
        pipeline_version: 'v2.1.3',
        database_version: 'NCBI_nt_2024.1',
      },
      summary_statistics: {
        total_species_detected: 90,
        total_sequences_analyzed: 800,
        total_biomass_estimate: 40.1,
        average_confidence_score: 0.93,
        shannon_diversity_index: 2.5,
        simpson_diversity_index: 0.8,
      },
      species_composition: [],
      environmental_parameters: {
        temperature: 15.2,
        ph: 7.5,
        dissolved_oxygen: 9.0,
        turbidity: 1.8,
        conductivity: 200,
        salinity: 0.5,
        depth: 5,
        flow_rate: 0.8,
      },
      taxonomic_breakdown: {
        kingdoms: { Animalia: 60, Plantae: 15, Bacteria: 15, Fungi: 0 },
        phylums: { Chordata: 30, Arthropoda: 30, Chlorophyta: 15, Cyanobacteria: 15 },
      },
      quality_metrics: {
        sequence_quality_score: 0.95,
        contamination_level: 0.03,
        coverage_depth: '100x',
        gc_content: 43.8,
      },
      temporal_analysis: {
        seasonal_variation: 0.15,
        stability_index: 0.75,
        trend_direction: 'increasing',
      },
    },
  };

  const useDummy = fastaFiles.length === 0;

  return (
    <div className="h-screen pt-20">
      <div className="h-full p-6">
        <div className="h-full glass-panel rounded-2xl overflow-hidden">
          {useDummy && (
            <div className="text-center text-yellow-400 p-4">
              <div className="mb-2 font-bold">Showing dummy data (no backend data available)</div>
            </div>
          )}
          <SimpleWorkingMap
            fastaFiles={useDummy ? dummyFastaFiles : fastaFiles}
            analysisReports={useDummy ? dummyAnalysisReports : analysisReports}
            onLocationSelect={(location) => console.log('Location selected:', location)}
          />
        </div>
      </div>
    </div>
  );
};