import { motion } from 'framer-motion';
import { Microscope, Zap, Globe, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onNavigateToReports?: () => void;
}

export function LandingPage({ onNavigateToReports }: LandingPageProps) {
  const features = [
    {
      icon: Microscope,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms process eDNA samples with 85% accuracy"
    },
    {
      icon: Globe,
      title: "Global Biodiversity",
      description: "Monitor ecosystem health and species distribution across diverse environments"
    },
    {
      icon: TrendingUp,
      title: "Real-time Insights",
      description: "Instant analysis results with interactive visualizations and predictive modeling"
    },
    {
      icon: Sparkles,
      title: "Novel Discovery",
      description: "Identify new species and track biodiversity changes with cutting-edge technology"
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glass-panel p-12 rounded-3xl mb-12">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 mb-6"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Next-Generation eDNA Analysis</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl mb-6 text-white leading-tight">
              Decode Nature's
              <br />
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Hidden Secrets
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to analyze environmental DNA samples, 
              discover new species, and monitor biodiversity with unprecedented precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onNavigateToReports}
                className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-xl border-0 font-semibold"
              >
                Start Analysis
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-8 py-3 rounded-xl font-semibold backdrop-blur-md bg-white/5 shadow-lg"
              >
                View Demo
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="glass-panel p-6 rounded-2xl group hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/20">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="glass-panel p-8 rounded-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl text-white mb-2">10</div>
              <div className="text-gray-400 text-sm">FASTA Files</div>
            </div>
            <div>
              <div className="text-3xl text-white mb-2">25+</div>
              <div className="text-gray-400 text-sm">Species Identified</div>
            </div>
            <div>
              <div className="text-3xl text-white mb-2">85%</div>
              <div className="text-gray-400 text-sm">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl text-white mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Processing</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}