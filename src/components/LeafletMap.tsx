import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FastaFile, AnalysisReport } from '../services/api';

// Fix default marker icons (needed for Vite/Webpack builds)
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom bubble markers
const createBubbleIcon = (site: FastaFile, analysisReports?: Record<string, AnalysisReport>) => {
  const size = Math.max(20, Math.min(60, (site.species_count || 50) / 5));
  const color = getSampleTypeColor(site.sample_type);
  const hasAnalysis = analysisReports?.[site.id];
  
  return L.divIcon({
    className: 'custom-bubble-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 40 ? '12px' : '10px'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        position: relative;
      ">
        ${site.species_count || 0}
        ${!hasAnalysis ? `
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            background: orange;
            border-radius: 50%;
            border: 1px solid white;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Sample type colors
const getSampleTypeColor = (sampleType: string) => {
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

type LeafletMapProps = {
  // For MappingPageSimple
  sites?: FastaFile[];
  // For MappingPageWithLeaflet
  fastaFiles?: FastaFile[];
  analysisReports?: Record<string, AnalysisReport>;
  onLocationSelect?: (location: any) => void;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  sites,
  fastaFiles,
  analysisReports,
  onLocationSelect,
}) => {
  const [mapLayer, setMapLayer] = useState('satellite');
  
  // Decide which dataset to use
  const data = sites || fastaFiles || [];
  const center: [number, number] = [37.0, -120.0]; // California center
  
  // Get tile layer URL based on selection
  const getTileLayerUrl = () => {
    switch (mapLayer) {
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

  return (
    <div className="relative w-full h-full">
      {/* Enhanced CSS for custom markers */}
      <style>{`
        .custom-bubble-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #1a1a1a !important;
          z-index: 1 !important;
          position: relative !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        .leaflet-popup-pane {
          z-index: 10 !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9) !important;
          color: white !important;
          border-radius: 8px !important;
        }
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9) !important;
        }
      `}</style>

      <MapContainer 
        center={center} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; Map contributors'
          url={getTileLayerUrl()}
        />

        {data.map((site) => {
          const position: [number, number] = [site.coordinates.lat, site.coordinates.lng];

          return (
            <Marker
              key={site.id}
              position={position}
              icon={createBubbleIcon(site, analysisReports)}
              eventHandlers={
                onLocationSelect
                  ? {
                      click: () =>
                        onLocationSelect({
                          id: site.id,
                          name: site.name,
                          coordinates: position,
                          sampleType: site.sample_type,
                          speciesCount: site.species_count,
                          novelSpecies: site.novel_species,
                          noveltyPercentage: site.novelty_percentage,
                          depth: site.depth,
                          status: analysisReports?.[site.id] ? 'completed' : 'processing',
                        }),
                    }
                  : undefined
              }
            >
              <Popup>
                <div className="text-white">
                  <div className="font-bold text-lg mb-2">{site.name}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Species:</span>
                      <span className="font-semibold">{site.species_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Novel species:</span>
                      <span className="font-semibold text-yellow-400">{site.novel_species}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Depth:</span>
                      <span className="font-semibold">{site.depth}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sample type:</span>
                      <span className="font-semibold capitalize">{site.sample_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-semibold ${
                        analysisReports?.[site.id] ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {analysisReports?.[site.id] ? 'Completed' : 'Processing'}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Layer Controls */}
      <div className="absolute top-4 left-4 z-40 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3">
        <div className="text-white text-sm font-medium mb-2">Map Layer</div>
        <div className="space-y-1">
          {[
            { id: 'satellite', name: 'Satellite' },
            { id: 'terrain', name: 'Terrain' },
            { id: 'dark', name: 'Dark' },
            { id: 'street', name: 'Street' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setMapLayer(layer.id)}
              className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                mapLayer === layer.id 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-40 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-4">
        <div className="text-white text-sm font-medium mb-3">Sample Types</div>
        <div className="space-y-2">
          {[
            { type: 'seawater', name: 'Seawater', color: '#06b6d4' },
            { type: 'freshwater', name: 'Freshwater', color: '#3b82f6' },
            { type: 'soil', name: 'Soil', color: '#84cc16' },
            { type: 'deep_seawater', name: 'Deep Sea', color: '#1e40af' }
          ].map(({ type, name, color }) => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border border-white/50" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-gray-300 text-xs">{name}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-white/20">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
