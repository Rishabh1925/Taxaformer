import { motion } from "framer-motion";
import { Dna, BarChart3, Zap, MapPin } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: "overview", label: "Overview", icon: Dna },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "mapping", label: "Mapping", icon: MapPin },
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-panel px-6 py-3 rounded-2xl">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="text-white font-medium">eDNA Lab</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  currentPage === item.id
                    ? "text-white"
                    : "text-white/70 hover:text-white/90"
                }`}
              >
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-xl border border-white/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="w-4 h-4" />
                <span className="text-sm relative z-10">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
