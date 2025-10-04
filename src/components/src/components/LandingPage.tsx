import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Microscope, Zap, Globe, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useRef } from 'react';

export function LandingPage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [1, 1, 0.8, 0.6]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1.1]);
  
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y1Spring = useSpring(y1, springConfig);
  const y2Spring = useSpring(y2, springConfig);
  const y3Spring = useSpring(y3, springConfig);

  const features = [
    {
      icon: Microscope,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms process eDNA samples with 99.7% accuracy"
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
    <div ref={ref} className="min-h-screen pt-28 pb-16 parallax-element">
      <div className="container mx-auto px-6 max-w-6xl relative">
        {/* Parallax background elements */}
        <motion.div 
          className="absolute top-10 right-10 w-32 h-32 morphing-blob bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-xl"
          style={{ y: y3Spring }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-24 h-24 morphing-blob bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-lg"
          style={{ y: y2Spring }}
        />
        
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-20"
          style={{ y: y1Spring, opacity, scale }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glass-panel-enhanced p-12 rounded-3xl mb-12 float-animation">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 mb-6 pulse-glow"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-display">Next-Generation eDNA Analysis</span>
            </motion.div>
            
            <h1 className="font-display text-5xl md:text-7xl mb-6 leading-tight">
              <span className="neon-text">Decode Nature's</span>
              <br />
              <span className="gradient-text-enhanced neon-text-pink">
                Hidden Secrets
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to analyze environmental DNA samples, 
              discover new species, and monitor biodiversity with unprecedented precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="glass-button-primary px-8 py-3 rounded-xl">
                Start Analysis
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="glass-button px-8 py-3 rounded-xl">
                View Demo
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          style={{ y: y2Spring }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="glass-panel-enhanced p-6 rounded-2xl group hover:scale-105 transition-all duration-300 parallax-element"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/20"
                whileHover={{ 
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(96, 165, 250, 0.1))",
                  boxShadow: "0 0 20px rgba(96, 165, 250, 0.3)"
                }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
              <h3 className="font-display text-white mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="glass-panel-enhanced p-8 rounded-3xl relative overflow-hidden"
          style={{ y: y3Spring }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileInView={{ 
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))"
          }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 animate-gradient-xy bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 opacity-50"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
            {[
              { value: "10,000+", label: "Samples Analyzed" },
              { value: "500+", label: "Species Identified" },
              { value: "99.7%", label: "Accuracy Rate" },
              { value: "24/7", label: "Processing" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="font-display text-3xl text-white mb-2 neon-text"
                  whileInView={{
                    textShadow: [
                      "0 0 5px rgba(255, 255, 255, 0.3)",
                      "0 0 10px rgba(96, 165, 250, 0.5)",
                      "0 0 5px rgba(255, 255, 255, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}