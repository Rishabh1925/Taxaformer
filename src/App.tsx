import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LandingPage } from './components/LandingPage';
import { ReportsPage } from './components/ReportsPage';
import { MappingPage } from './components/MappingPage';
import { Navigation } from './components/Navigation';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { apiService, FastaFile, AnalysisReport } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [fastaFiles, setFastaFiles] = useState<FastaFile[]>([]);
  const [analysisReports, setAnalysisReports] = useState<Record<string, AnalysisReport>>({});
  const [dataLoading, setDataLoading] = useState(false);



  // Load data when app starts
  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      setDataLoading(true);
      
      // Load FASTA files
      const filesResponse = await apiService.getFastaFiles();
      setFastaFiles(filesResponse.files);
      
      // Load analysis reports for each file
      const reports: Record<string, AnalysisReport> = {};
      for (const file of filesResponse.files) {
        try {
          const report = await apiService.getAnalysisReport(file.id);
          reports[file.id] = report;
        } catch (err) {
          console.warn(`Failed to load analysis for ${file.id}:`, err);
        }
      }
      setAnalysisReports(reports);
      
    } catch (err) {
      console.error('Failed to load app data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handlePageChange = (newPage: string) => {
    setCurrentPage(newPage);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'reports':
        return <ReportsPage />;
      case 'mapping':
        return (
          <MappingPage 
            fastaFiles={fastaFiles}
            analysisReports={analysisReports}
            dataLoading={dataLoading}
            onLocationSelect={(location) => {
              // Handle location selection - could navigate to reports or show modal
            }}
          />
        );
      case 'overview':
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Grainy texture overlay */}
      <div className="absolute inset-0 grainy-bg opacity-40"></div>
      
      <BackgroundAnimation />
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-orange-500/5 to-cyan-500/5 backdrop-blur-sm"></div>
      
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      

      
      <motion.main
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10"
      >
        {renderPage()}
      </motion.main>
    </div>
  );
}