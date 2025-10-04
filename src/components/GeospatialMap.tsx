import React, { useEffect, useState, useRef } from 'react';
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
  Filter
} from 'lucide-react';
import { FastaFile, AnalysisReport } from '../services/api';
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

interface GeospatialMapProps {
  fastaFiles: FastaFile[];
  analysisReports: Record<string, AnalysisReport>;
  onLocationSelect?: (location: MapLocation) => void;
}

// Determine bubble color based on sample type
const getBubbleColor = (sampleType: string) => {
  const colors = {
    seawater: '#06b6d4', // cyan
    freshwater: '#3b82f6', // blue
    soil: '#84cc16', // lime
    river_water: '#10b981', // emerald
    marsh_water: '#8b5cf6', // violet
    deep_seawater: '#1e40af', // blue-800
    urban_water: '#f59e0b', // amber
    alpine_water: '#06b6d4', // cyan
    estuary_water: '#ec4899', // pink
  };
  return colors[sampleType as keyof typeof colors] || '#6b7280';
};

// Custom bubble marker component
const BubbleMarker: React.FC<{
  location: MapLocation;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ location, isSelected, onSelect }) => {
  const markerRef = useRef<L.Marker>(null);

  // Create custom translucent bubble icon with enhanced effects
  const createBubbleIcon = (location: MapLocation, isActive: boolean) => {
    // Size based on species count (30-90px range for better visibility)
    const baseSize = Math.max(30, Math.min(90, location.speciesCount / 2.5));
    
    // Opacity based on environmental score (0.5-0.95 range)
    const opacity = 0.5 + (location.environmentalScore / 100) * 0.45;
    
    // Novelty ring size and effects
    const noveltyRingSize = location.noveltyPercentage > 15 ? baseSize + 12 : 
                           location.noveltyPercentage > 10 ? baseSize + 8 : baseSize + 4;
    
    const color = getBubbleColor(location.sampleType);
    
    // Enhanced color variations based on environmental score
    const enhancedColor = location.environmentalScore > 80 ? 
      `color-mix(in srgb, ${color} 80%, #10b981 20%)` : // Mix with green for high scores
      location.environmentalScore < 50 ? 
      `color-mix(in srgb, ${color} 80%, #ef4444 20%)` : // Mix with red for low scores
      color;
    
    return L.divIcon({
      className: 'custom-bubble-marker',
      html: `
        <div class="bubble-container ${isActive ? 'active' : ''}" style="
          width: ${noveltyRingSize}px;
          height: ${noveltyRingSize}px;
          position: relative;
        ">
          ${location.noveltyPercentage > 15 ? `
            <div class="high-novelty-ring" style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 3px dashed #f59e0b;
              opacity: 0.9;
              animation: ${isActive ? 'rotate 3s linear infinite' : 'rotate 8s linear infinite'};
            "></div>
          ` : location.noveltyPercentage > 10 ? `
            <div class="novelty-ring" style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 2px dashed #fbbf24;
              opacity: 0.8;
              animation: ${isActive ? 'rotate 4s linear infinite' : 'rotate 10s linear infinite'};
            "></div>
          ` : ''}
          
          ${location.environmentalScore > 90 ? `
            <div class="excellence-ring" style="
              position: absolute;
              top: -2px;
              left: -2px;
              width: calc(100% + 4px);
              height: calc(100% + 4px);
              border-radius: 50%;
              border: 2px solid #10b981;
              opacity: 0.6;
              animation: ${isActive ? 'pulse-glow 2s infinite' : 'pulse-glow 4s infinite'};
            "></div>
          ` : ''}
          
          <div class="bubble-outer" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${baseSize}px;
            height: ${baseSize}px;
            border-radius: 50%;
            background: ${enhancedColor};
            opacity: ${opacity};
            box-shadow: 
              0 0 25px ${color}70, 
              0 0 50px ${color}40,
              0 0 75px ${color}20,
              inset 0 3px 15px rgba(255,255,255,0.25),
              inset 0 -2px 10px rgba(0,0,0,0.1);
            border: 2px solid rgba(255,255,255,0.4);
            backdrop-filter: blur(8px);
            animation: ${isActive ? 'pulse-active 2s infinite' : 'gentle-pulse 6s infinite'};
            transition: all 0.3s ease;
          ">
            <div class="bubble-inner" style="
              position: absolute;
              top: 12%;
              left: 12%;
              width: 76%;
              height: 76%;
              border-radius: 50%;
              background: linear-gradient(135deg, 
                rgba(255,255,255,0.5) 0%, 
                rgba(255,255,255,0.2) 50%, 
                rgba(255,255,255,0.05) 100%);
              backdrop-filter: blur(12px);
            "></div>
            
            <div class="depth-indicator" style="
              position: absolute;
              bottom: 3px;
              right: 3px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${location.depth > 100 ? '#1e40af' : location.depth > 50 ? '#3b82f6' : location.depth > 20 ? '#60a5fa' : '#93c5fd'};
              border: 2px solid rgba(255,255,255,0.7);
              box-shadow: 0 0 8px rgba(0,0,0,0.3);
            "></div>
            
            ${location.status === 'processing' ? `
              <div class="processing-indicator" style="
                position: absolute;
                top: 3px;
                left: 3px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #f59e0b;
                animation: blink 1.5s infinite;
                box-shadow: 0 0 6px #f59e0b;
              "></div>
            ` : ''}
            
            <div class="species-count" style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: ${baseSize > 60 ? '12px' : baseSize > 45 ? '10px' : '9px'};
              font-weight: bold;
              text-shadow: 0 2px 4px rgba(0,0,0,0.8);
              text-align: center;
              line-height: 1.1;
              font-family: 'Inter', sans-serif;
            ">
              <div>${location.speciesCount}</div>
              ${location.novelSpecies > 0 ? `<div style="font-size: ${baseSize > 60 ? '8px' : '7px'}; color: #fbbf24; margin-top: 1px;">+${location.novelSpecies}</div>` : ''}
            </div>
          </div>
        </div>
      `,
      iconSize: [noveltyRingSize, noveltyRingSize],
      iconAnchor: [noveltyRingSize / 2, noveltyRingSize / 2],
    });
  };

  const bubbleIcon = createBubbleIcon(location, isSelected);

  return (
    <Marker
      ref={markerRef}
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
      <Popup
        className="custom-popup"
        closeButton={false}
        offset={[0, -10]}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 min-w-[280px]"
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

          <div className="flex items-center gap-2 mb-3">
            <Droplet className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 text-sm capitalize">{location.sampleType.replace('_', ' ')}</span>
          </div>

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
  currentFilter: string;
  currentLayer: string;
}> = ({ onFilterChange, onLayerChange, currentFilter, currentLayer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
  className="absolute top-4 left-4 z-40 space-y-3"
    >
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
            { id: 'all', name: 'All Types' },
            { id: 'seawater', name: 'Seawater' },
            { id: 'freshwater', name: 'Freshwater' },
            { id: 'soil', name: 'Soil' },
            { id: 'high_novelty', name: 'High Novelty (>10%)' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                currentFilter === filter.id 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  fastaFiles,
  analysisReports,
  onLocationSelect
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState('terrain');
  const [sampleFilter, setSampleFilter] = useState('all');
  const [locations, setLocations] = useState<MapLocation[]>([]);

  // Debug logging
  console.log('GeospatialMap rendered with:', {
    fastaFilesCount: fastaFiles.length,
    analysisReportsCount: Object.keys(analysisReports).length,
    locationsCount: locations.length
  });

  // Convert FASTA files to map locations
  useEffect(() => {
    // Add some test data if no files are available
    if (fastaFiles.length === 0) {
      const testLocations: MapLocation[] = [
        {
          id: 'test_1',
          name: 'Test Location 1',
          coordinates: [37.7749, -122.4194],
          sampleType: 'seawater',
          speciesCount: 150,
          novelSpecies: 10,
          noveltyPercentage: 6.7,
          biodiversityIndex: 3.2,
          environmentalScore: 85,
          depth: 25,
          collectionDate: '2024-01-15',
          status: 'completed'
        },
        {
          id: 'test_2',
          name: 'Test Location 2',
          coordinates: [36.7783, -119.4179],
          sampleType: 'freshwater',
          speciesCount: 89,
          novelSpecies: 15,
          noveltyPercentage: 16.9,
          biodiversityIndex: 2.8,
          environmentalScore: 92,
          depth: 15,
          collectionDate: '2024-01-20',
          status: 'processing'
        }
      ];
      setLocations(testLocations);
      return;
    }

    const mapLocations: MapLocation[] = fastaFiles.map((file) => {
      const analysis = analysisReports[file.id];
      return {
        id: file.id,
        name: file.name.replace('.fasta', ''),
        coordinates: [file.coordinates.lat, file.coordinates.lng],
        sampleType: file.sample_type,
        speciesCount: file.species_count || analysis?.summary_statistics.total_species_detected || 0,
        novelSpecies: file.novel_species || 0,
        noveltyPercentage: file.novelty_percentage || 0,
        biodiversityIndex: file.biodiversity_index || analysis?.summary_statistics.shannon_diversity_index || 0,
        environmentalScore: file.environmental_score || 0,
        depth: file.depth || 0,
        collectionDate: file.collection_date,
        status: analysis ? 'completed' : 'processing',
        analysisData: analysis
      };
    });
    setLocations(mapLocations);
  }, [fastaFiles, analysisReports]);

  // Filter locations based on sample type and novelty
  const filteredLocations = locations.filter(location => {
    if (sampleFilter === 'all') return true;
    if (sampleFilter === 'high_novelty') return location.noveltyPercentage > 10;
    return location.sampleType.includes(sampleFilter);
  });

  // Get tile layer URL based on selected layer
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

  // Debug: Log the data
  console.log('Filtered locations:', filteredLocations);
  console.log('Map layer:', mapLayer);
  console.log('Tile URL:', getTileLayerUrl(mapLayer));

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Add custom CSS for animations */}
      <style>{`
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          background: #1a1a1a !important;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .custom-bubble-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .bubble-container.active .bubble-outer {
          animation: pulse 2s infinite;
        }
        
        .bubble-container:hover .bubble-outer {
          transform: scale(1.1);
          transition: transform 0.3s ease;
        }
        
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>

      <MapContainer
        center={[37.7749, -122.4194]} // San Francisco Bay Area center
        zoom={6}
        style={{ height: '100%', width: '100%', minHeight: '600px' }}
        className="w-full h-full rounded-xl overflow-hidden"
        zoomControl={false}
      >
        <TileLayer
          url={getTileLayerUrl(mapLayer)}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {filteredLocations.map((location) => (
          <BubbleMarker
            key={location.id}
            location={location}
            isSelected={selectedLocation === location.id}
            onSelect={() => handleLocationSelect(location)}
          />
        ))}
      </MapContainer>

      {filteredLocations.length === 0 && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">No Locations Found</h3>
            <p className="text-gray-400">No sample locations match the current filter.</p>
          </div>
        </div>
      )}

      <MapControls
        onFilterChange={setSampleFilter}
        onLayerChange={setMapLayer}
        currentFilter={sampleFilter}
        currentLayer={mapLayer}
      />

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
  className="absolute bottom-4 right-4 z-40"
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
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-400 text-xs">River</span>
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
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-gray-400 text-xs">Depth Indicator</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-yellow-400 text-xs">+N</div>
                  <span className="text-gray-400 text-xs">Novel Species</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};