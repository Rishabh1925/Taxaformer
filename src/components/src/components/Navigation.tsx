import { motion, useScroll, useTransform } from 'motion/react';
import { Dna, BarChart3, MapPin, Zap } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { scrollY } = useScroll();
  const backdropBlur = useTransform(scrollY, [0, 100], [20, 30]);
  const navOpacity = useTransform(scrollY, [0, 50, 100], [0.9, 0.95, 1]);
  
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Dna },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'mapping', label: 'Mapping', icon: MapPin },
  ];

  return (
    <motion.nav 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      style={{ opacity: navOpacity }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="glass-panel-enhanced px-6 py-3 rounded-2xl"
        style={{ backdropFilter: `blur(${backdropBlur}px)` }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-6">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2 mr-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-gray-200 flex items-center justify-center"
              animate={{ 
                background: [
                  "linear-gradient(135deg, #ffffff, #e5e7eb)",
                  "linear-gradient(135deg, #60a5fa, #3b82f6)",
                  "linear-gradient(135deg, #ffffff, #e5e7eb)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4 text-black" />
              </motion.div>
            </motion.div>
            <span className="font-display text-white font-medium">eDNA Lab</span>
          </motion.div>
          
          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  currentPage === item.id
                    ? 'text-white'
                    : 'text-white/70 hover:text-white/90'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-white/15 to-white/10 rounded-xl border border-white/25 pulse-glow"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="w-4 h-4" />
                </motion.div>
                <span className="text-sm relative z-10 font-display">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}