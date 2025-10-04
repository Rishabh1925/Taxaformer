import { useState } from 'react';
import { motion } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import { ReportsPage } from './components/ReportsPage';
import { MappingPage } from './components/MappingPage';
import { Navigation } from './components/Navigation';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'reports':
        return <ReportsPage />;
      case 'mapping':
        return <MappingPage />;
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
      
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
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
      
      <Toaster 
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            color: 'white'
          }
        }}
      />
    </div>
  );
}