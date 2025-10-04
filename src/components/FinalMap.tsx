import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  MapPin, 
  Layers, 
  Zap, 
  Droplet, 
  Fish, 
  Activity,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { FastaFile, AnalysisReport } from '../services/api';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface FinalMapProps {
  fastaFiles: FastaFile[];
  analysisReports: Record<string, AnalysisReport>;
  onLocationSelect?: (location: MapLocation) => void;
}

// Determine bubble color based on sample type
const getBubbleColor = (sampleType: string) => {
  const colors = {
    seawater: '#06b6d4',
    freshwater: '#3b82f6',
    soil: '#84cc16',
    river_water: '#10b981',
    marsh_water: '#8b5cf6',
    deep_seawater: '#1e40af',
    urban_water: '#f59e0b',
    alpine_water: '#06b6d4',
    estuary_water: '#ec4899',
  };
  return colors[sampleType as keyof typeof colors] || '#6b7280';
};

// Enhanced bubble marker component
const EnhancedBubbleMarker: React.FC<{
  location: MapLocation;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ location, isSelected, onSelect }) => {
  const createAdvancedBubbleIcon = (location: MapLocation, isActive: boolean) => {
    const baseSize = Math.max(35, Math.min(85, location.speciesCount / 2.5));
    const opacity = 0.6 + (location.environmentalScore / 100) * 0.4;
    const color = getBubbleColor(location.sampleType);
    
    // Novelty ring
    const hasNoveltyRing = location.noveltyPercentage > 10;
    const ringSize = hasNoveltyRing ? baseSize + 10 : baseSize + 4;
    
    return L.divIcon({
      className: 'enhanced-bubble-marker',
      html: `
        <div class="bubble-wrapper" style="
          width: ${ringSize}px;
          height: ${ringSize}px;
          position: relative;
        ">
          ${hasNoveltyRing ? `
            <div class="novelty-ring" style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 2px dashed #fbbf24;
              opacity: 0.8;
              animation: ${isActive ? 'spin 3s linear infinite' : 'spin 8s linear infinite'};
            "></div>
          ` : ''}
          
          <div class="bubble-main" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${baseSize}px;
            height: ${baseSize}px;
            border-radius: 50%;
            background: ${color};
            opacity: ${opacity};
            border: 3px solid rgba(255,255,255,0.6);
            box-shadow: 
              0 0 25px ${color}70, 
              0 0 50px ${color}40,
              0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            ${isActive ? 'transform: translate(-50%, -50%) scale(1.1);' : ''}
          ">
            <div class="bubble-content" style="
              color: white;
              font-weight: bold;
              font-size: ${baseSize > 60 ? '14px' : '12px'};
              text-shadow: 0 2px 4px rgba(0,0,0,0.8);
              text-align: center;
              line-height: 1.2;
            ">
              <div>${location.speciesCount}</div>
              ${location.novelSpecies > 0 ? `<div style="font-size: 8px; color: #fbbf24;">+${location.novelSpecies}</div>` : ''}
            </div>
            
            ${location.status === 'processing' ? `
              <div class="status-indicator" style="
                position: absolute;
                top: 2px;
                right: 2px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #f59e0b;
                animation: blink 1.5s infinite;
              "></div>
            ` : ''}
            
            <div class="depth-indicator" style="
              position: absolute;
              bottom: 2px;
              right: 2px;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${location.depth > 100 ? '#1e40af' : location.depth > 20 ? '#3b82f6' : '#60a5fa'};
              border: 1px solid rgba(255,255,255,0.8);
            "></div>
          </div>
        </div>
      `,
      iconSize: [ringSize, ringSize],
      iconAnchor: [ringSize / 2, ringSize / 2],
    });
  };

  const bubbleIcon = createAdvancedBubbleIcon(location, isSelected);

  return (
    <Marker
      position={location.coordinates}
      icon={bubbleIcon}
      eventHandlers={{
        click: onSelect,
        mouseover: (e) => {
          const marker = e.target;
          marker.openPopup();
        },
      }}
    >
      <Popup closeButton={false} offset={[0, -10]}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/95 backdrop-blur-md border border-white/20 rounded-lg p-4 min-w-[300px]"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold text-lg">{location.name}</h3>
              <p className="text-gray-400 text-sm">{location.collectionDate}</p>
            </div>
            <Badge 
              className={`
                ${location.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                ${location.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                ${location.status === 'active' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
              `}
            >
              {location.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Fish className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-xs">Species</span>
              </div>
              <p className="text-white font-semibold">{location.speciesCount}</p>
              {location.novelSpecies > 0 && (
                <p className="text-yellow-400 text-xs">+{location.novelSpecies} novel</p>
              )}
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-xs">Diversity</span>
              </div>
              <p className="text-white font-semibold">{location.biodiversityIndex.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400 text-xs">Depth</span>
              </div>
              <p className="text-white font-semibold">{location.depth}m</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-xs">Novelty</span>
              </div>
              <p className="text-white font-semibold">{location.noveltyPercentage.toFixed(1)}%</p>
            </div>
          </div>

          {location.noveltyPercentage > 15 && (
            <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">Ultra High Novelty Site!</span>
              </div>
            </div>
          )}

          <Button 
            onClick={onSelect}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </motion.div>
      </Popup>
    </Marker>
  );
};

// Map controls component
const MapControls: React.FC<{
  onFilterChange: (filter: string) => void;
  onLayerChange: (layer: string) => void;
  onSearchChange: (search: string) => void;
  currentFilter: string;
  currentLayer: string;
  searchTerm: string;
  locations: MapLocation[];
}> = ({ onFilterChange, onLayerChange, onSearchChange, currentFilter, currentLayer, searchTerm, locations }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
  className="absolute top-4 left-4 z-50 space-y-3"
    >
      {/* Search Control */}
      <Card className="glass-panel p-3 border-0">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm font-medium">Search</span>
        </div>
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-2 py-1 text-sm bg-black/30 border border-white/20 rounded text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-400/50"
        />
      </Card>

      {/* Layer Control */}
      <Card className="glass-panel p-3 border-0">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm font-medium">Map Layer</span>
        </div>
        <div className="space-y-1">
          {[
            { id: 'satellite', name: 'Satellite' },
            { id: 'terrain', name: 'Terrain' },
            { id: 'dark', name: 'Dark' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                currentLayer === layer.id 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Filter Control */}
      <Card className="glass-panel p-3 border-0">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-green-400" />
          <span className="text-white text-sm font-medium">Sample Type</span>
        </div>
        <div className="space-y-1">
          {[
            { id: 'all', name: 'All Types', count: locations.length },
            { id: 'seawater', name: 'Seawater', count: locations.filter(l => l.sampleType.includes('seawater')).length },
            { id: 'freshwater', name: 'Freshwater', count: locations.filter(l => l.sampleType.includes('freshwater')).length },
            { id: 'soil', name: 'Soil', count: locations.filter(l => l.sampleType === 'soil').length },
            { id: 'high_novelty', name: 'High Novelty (>15%)', count: locations.filter(l => l.noveltyPercentage > 15).length }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`w-full flex items-center justify-between px-2 py-1 rounded text-sm transition-colors ${
                currentFilter === filter.id 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{filter.name}</span>
              <span className="text-xs opacity-70">{filter.count}</span>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export const FinalMap: React.FC<FinalMapProps> = ({
  fastaFiles,
  analysisReports,
  onLocationSelect
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState('satellite');
  const [sampleFilter, setSampleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [mapReady, setMapReady] = useState(false);



  // Convert FASTA files to map locations
  useEffect(() => {

    
    // Always include test data for immediate display
    const testLocations: MapLocation[] = [
      {
        id: 'test_1',
        name: 'San Francisco Bay Test',
        coordinates: [37.7749, -122.4194],
        sampleType: 'seawater',
        speciesCount: 234,
        novelSpecies: 19,
        noveltyPercentage: 8.1,
        biodiversityIndex: 3.6,
        environmentalScore: 91.2,
        depth: 18.7,
        collectionDate: '2024-03-20',
        status: 'completed'
      },
      {
        id: 'test_2',
        name: 'Central Valley Test',
        coordinates: [36.7783, -119.4179],
        sampleType: 'freshwater',
        speciesCount: 156,
        novelSpecies: 12,
        noveltyPercentage: 7.7,
        biodiversityIndex: 3.2,
        environmentalScore: 85.4,
        depth: 25.5,
        collectionDate: '2024-01-15',
        status: 'processing'
      },
      {
        id: 'test_3',
        name: 'Lake Tahoe Test',
        coordinates: [39.0968, -120.0324],
        sampleType: 'soil',
        speciesCount: 89,
        novelSpecies: 8,
        noveltyPercentage: 9.0,
        biodiversityIndex: 2.8,
        environmentalScore: 92.1,
        depth: 15.2,
        collectionDate: '2024-01-20',
        status: 'completed'
      }
    ];

    // Add backend data
    const backendLocations: MapLocation[] = fastaFiles.map((file) => {
      const analysis = analysisReports[file.id];
      return {
        id: file.id,
        name: file.name.replace('.fasta', ''),
        coordinates: [file.coordinates.lat, file.coordinates.lng],
        sampleType: file.sample_type,
        speciesCount: file.species_count || 100,
        novelSpecies: file.novel_species || 0,
        noveltyPercentage: file.novelty_percentage || 0,
        biodiversityIndex: file.biodiversity_index || 0,
        environmentalScore: file.environmental_score || 0,
        depth: file.depth || 0,
        collectionDate: file.collection_date,
        status: analysis ? 'completed' : 'processing',
        analysisData: analysis
      };
    });

    const allLocations = [...testLocations, ...backendLocations];
    setLocations(allLocations);
    setMapReady(true);
    

  }, [fastaFiles, analysisReports]);

  // Filter locations based on various criteria and search
  const filteredLocations = locations.filter(location => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.sampleType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Category filter
    switch (sampleFilter) {
      case 'all':
        return true;
      case 'high_novelty':
        return location.noveltyPercentage > 15;
      default:
        return location.sampleType.includes(sampleFilter);
    }
  });

  // Get tile layer URL
  const getTileLayerUrl = (layer: string) => {
    switch (layer) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location.id);
    onLocationSelect?.(location);
  };

  if (!mapReady) {

    return (
      <div className="flex items-center justify-center h-full bg-gray-900/50 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Initializing map...</p>
          <p className="text-gray-400 text-sm mt-2">Loading {locations.length} locations</p>
        </div>
      </div>
    );
  }



  return (
    <div className="relative w-full h-full min-h-[600px]" style={{ height: '100%' }}>
      {/* Enhanced CSS */}
      <style>{`
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          background: #1a1a1a !important;
          z-index: 1 !important;
        }
        
        .enhanced-bubble-marker {
          background: transparent !important;
          border: none !important;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        
        .bubble-main:hover {
          transform: translate(-50%, -50%) scale(1.15) !important;
        }
        
        /* Force map visibility */
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
      `}</style>

      <div className="w-full h-full rounded-xl overflow-hidden bg-gray-900" style={{ height: '100%', minHeight: '500px' }}>
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          className="w-full h-full"
          zoomControl={false}
          whenCreated={(mapInstance) => {
            // Force a resize after creation
            setTimeout(() => {
              mapInstance.invalidateSize();
            }, 100);
          }}
        >
          <TileLayer
            url={getTileLayerUrl(mapLayer)}
            attribution='&copy; Map contributors'
          />
          
          {/* Debug: Add simple test markers first */}
          <Marker position={[37.7749, -122.4194]}>
            <Popup>
              <div className="text-black">
                Test marker - San Francisco
                <br />
                Filtered locations: {filteredLocations.length}
              </div>
            </Popup>
          </Marker>
          
          {/* Simple markers for each location */}
          {filteredLocations.map((location) => {
            return (
              <Marker 
                key={location.id} 
                position={[location.coordinates[0], location.coordinates[1]]}
              >
                <Popup>
                  <div className="text-black">
                    <h3 className="font-bold">{location.name}</h3>
                    <p>Species: {location.speciesCount}</p>
                    <p>Type: {location.sampleType}</p>
                    <p>Novel: {location.novelSpecies}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Original enhanced markers - commented out for now */}
          {/* {filteredLocations.map((location) => (
            <EnhancedBubbleMarker
              key={location.id}
              location={location}
              isSelected={selectedLocation === location.id}
              onSelect={() => handleLocationSelect(location)}
            />
          ))} */}
        </MapContainer>
      </div>



      <MapControls
        onFilterChange={setSampleFilter}
        onLayerChange={setMapLayer}
        onSearchChange={setSearchTerm}
        currentFilter={sampleFilter}
        currentLayer={mapLayer}
        searchTerm={searchTerm}
        locations={locations}
      />

      {/* Stats Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
  className="absolute top-4 right-4 z-50"
      >
        <Card className="glass-panel p-3 border-0">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm font-medium">Live Stats</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Visible:</span>
              <span className="text-white font-medium">{filteredLocations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Species:</span>
              <span className="text-white font-medium">
                {filteredLocations.reduce((sum, loc) => sum + loc.speciesCount, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Novel:</span>
              <span className="text-yellow-400 font-medium">
                {filteredLocations.reduce((sum, loc) => sum + loc.novelSpecies, 0)}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Legend */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
  className="absolute bottom-4 right-4 z-50"
      >
        <Card className="glass-panel p-4 border-0">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="text-white text-sm font-medium">Legend</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-300 text-xs mb-2">Sample Types</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-gray-400 text-xs">Seawater</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-400 text-xs">Freshwater</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                  <span className="text-gray-400 text-xs">Soil</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-gray-300 text-xs mb-2">Indicators</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-dashed border-yellow-400"></div>
                  <span className="text-gray-400 text-xs">High Novelty</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-gray-400 text-xs">Processing</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};