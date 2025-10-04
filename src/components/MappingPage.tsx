import React from 'react';
import { motion } from 'framer-motion';
import { FinalMap } from './FinalMap';

import { FastaFile, AnalysisReport } from '../services/api';
import { MapPin } from 'lucide-react';

interface MappingPageProps {
  fastaFiles: FastaFile[];
  analysisReports: Record<string, AnalysisReport>;
  dataLoading: boolean;
  onLocationSelect?: (location: any) => void;
}

export function MappingPage({ fastaFiles, analysisReports, dataLoading, onLocationSelect }: MappingPageProps) {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 max-w-[1600px]">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl text-white mb-2">Geospatial Analysis</h1>
          <p className="text-gray-400">Interactive mapping of eDNA sampling locations and biodiversity insights</p>
        </motion.div>
        
        <motion.div
          className="h-[calc(100vh-200px)] rounded-2xl overflow-hidden"
          style={{ minHeight: '600px', height: 'calc(100vh - 200px)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {dataLoading ? (
            <div className="flex items-center justify-center h-full bg-black/20 rounded-2xl border border-white/10">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-400 animate-pulse mx-auto mb-4" />
                <p className="text-white font-medium">Loading mapping data...</p>
                <p className="text-gray-400 text-sm mt-2">Fetching sample locations and analysis results...</p>
              </div>
            </div>
          ) : (
            <FinalMap 
              fastaFiles={fastaFiles} 
              analysisReports={analysisReports}
              onLocationSelect={onLocationSelect}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

