import { motion } from 'motion/react';
import { useState } from 'react';
import { MapPin, Layers, Search, Filter, Zap, Droplet, Fish, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export function MappingPage() {
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [mapView, setMapView] = useState('satellite');

  // Mock sample data
  const samples = [
    {
      id: 1,
      lat: 45.523,
      lng: -122.676,
      location: "Columbia River, OR",
      species: 23,
      novelSpecies: 2,
      dominantSpecies: "Oncorhynchus tshawytscha",
      environment: "freshwater",
      date: "2024-01-15",
      biodiversityIndex: 0.85
    },
    {
      id: 2,
      lat: 47.608,
      lng: -122.335,
      location: "Puget Sound, WA",
      species: 41,
      novelSpecies: 5,
      dominantSpecies: "Gadus macrocephalus",
      environment: "marine",
      date: "2024-01-18",
      biodiversityIndex: 0.92
    },
    {
      id: 3,
      lat: 37.774,
      lng: -122.419,
      location: "San Francisco Bay, CA",
      species: 35,
      novelSpecies: 3,
      dominantSpecies: "Engraulis mordax",
      environment: "brackish",
      date: "2024-01-20",
      biodiversityIndex: 0.78
    },
    {
      id: 4,
      lat: 33.768,
      lng: -118.195,
      location: "Los Angeles Harbor, CA",
      species: 28,
      novelSpecies: 1,
      dominantSpecies: "Sardinops sagax",
      environment: "marine",
      date: "2024-01-22",
      biodiversityIndex: 0.71
    },
    {
      id: 5,
      lat: 41.878,
      lng: -87.636,
      location: "Lake Michigan, IL",
      species: 19,
      novelSpecies: 4,
      dominantSpecies: "Coregonus clupeaformis",
      environment: "freshwater",
      date: "2024-01-25",
      biodiversityIndex: 0.89
    }
  ];

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'freshwater': return 'bg-cyan-500';
      case 'marine': return 'bg-blue-500';
      case 'brackish': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getEnvironmentIcon = (env: string) => {
    switch (env) {
      case 'freshwater': return Droplet;
      case 'marine': return Fish;
      case 'brackish': return Leaf;
      default: return MapPin;
    }
  };

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
            <h1 className="text-3xl text-white mb-2">Geospatial Mapping</h1>
            <p className="text-gray-400">Interactive visualization of sample locations and species distribution</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Layers className="w-4 h-4 mr-2" />
              Layers
            </Button>
          </div>
        </motion.div>

        {/* Search and Controls */}
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
                placeholder="Search locations, species, or environments..." 
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div className="flex gap-2">
              {['satellite', 'terrain', 'hybrid'].map((view) => (
                <Button
                  key={view}
                  variant={mapView === view ? "default" : "outline"}
                  onClick={() => setMapView(view)}
                  className={mapView === view 
                    ? "bg-white text-black hover:bg-gray-100 border-0" 
                    : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Visualization */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glass-panel p-6 border-0 h-[600px]">
              <div className="relative w-full h-full bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl overflow-hidden">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 via-blue-900 to-slate-700"></div>
                  {/* Grid overlay to simulate map */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }}></div>
                </div>

                {/* Sample Points */}
                {samples.map((sample, index) => {
                  const Icon = getEnvironmentIcon(sample.environment);
                  return (
                    <motion.div
                      key={sample.id}
                      className="absolute cursor-pointer group"
                      style={{
                        left: `${20 + index * 15}%`,
                        top: `${25 + index * 12}%`
                      }}
                      onClick={() => setSelectedSample(selectedSample === sample.id ? null : sample.id)}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.2 }}
                    >
                      <div className={`w-6 h-6 rounded-full ${getEnvironmentColor(sample.environment)} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      
                      {/* Pulse animation */}
                      <motion.div
                        className={`absolute inset-0 rounded-full ${getEnvironmentColor(sample.environment)} opacity-30`}
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />

                      {/* Tooltip */}
                      {selectedSample === sample.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-8 left-1/2 -translate-x-1/2 glass-panel p-3 rounded-lg min-w-48 z-10"
                        >
                          <div className="text-sm text-white">
                            <div className="font-medium mb-1">{sample.location}</div>
                            <div className="text-white/70 mb-2">{sample.date}</div>
                            <div className="space-y-1 text-xs">
                              <div>Species: {sample.species}</div>
                              <div className="flex items-center gap-2">
                                <span>Novel:</span>
                                <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                                  {sample.novelSpecies}
                                </Badge>
                              </div>
                              <div>Diversity: {sample.biodiversityIndex}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 w-10 h-10 p-0">
                    +
                  </Button>
                  <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 w-10 h-10 p-0">
                    -
                  </Button>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 glass-panel p-3 rounded-lg">
                  <div className="text-white text-sm mb-2">Environment Types</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <span className="text-white/80">Freshwater</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-white/80">Marine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-white/80">Brackish</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Sample Details Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-4"
          >
            <Card className="glass-panel p-4 border-0">
              <h3 className="text-white mb-4">Sample Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Samples</span>
                  <span className="text-white">{samples.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Avg. Species/Sample</span>
                  <span className="text-white">{Math.round(samples.reduce((acc, s) => acc + s.species, 0) / samples.length)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Novel Discoveries</span>
                  <span className="text-white">{samples.reduce((acc, s) => acc + s.novelSpecies, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Avg. Diversity</span>
                  <span className="text-white">{(samples.reduce((acc, s) => acc + s.biodiversityIndex, 0) / samples.length).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Sample List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {samples.map((sample) => (
                <motion.div
                  key={sample.id}
                  layoutId={`sample-${sample.id}`}
                  className={`glass-panel p-4 rounded-lg cursor-pointer transition-all ${
                    selectedSample === sample.id ? 'ring-2 ring-cyan-500' : ''
                  }`}
                  onClick={() => setSelectedSample(selectedSample === sample.id ? null : sample.id)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getEnvironmentColor(sample.environment)}`}></div>
                      <span className="text-white text-sm">{sample.location}</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300">
                      {sample.novelSpecies} new
                    </Badge>
                  </div>
                  <div className="text-xs text-white/70 space-y-1">
                    <div>Species: {sample.species}</div>
                    <div>Diversity: {sample.biodiversityIndex}</div>
                    <div>{sample.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}