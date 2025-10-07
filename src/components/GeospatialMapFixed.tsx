import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  MapPin,
  Layers,
  Zap,
  Droplet,
  Fish,
  Activity,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { FastaFile, AnalysisReport } from "../services/api";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
  status: "active" | "processing" | "completed";
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
    seawater: "#06b6d4",
    freshwater: "#3b82f6",
    soil: "#84cc16",
    river_water: "#10b981",
    marsh_water: "#8b5cf6",
    deep_seawater: "#1e40af",
    urban_water: "#f59e0b",
    alpine_water: "#06b6d4",
    estuary_water: "#ec4899",
  };
  return colors[sampleType as keyof typeof colors] || "#6b7280";
};

// Custom bubble marker component
const BubbleMarker: React.FC<{
  location: MapLocation;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ location, isSelected, onSelect }) => {
  const markerRef = useRef<L.Marker>(null);

  const createBubbleIcon = (location: MapLocation, isActive: boolean) => {
    const baseSize = Math.max(30, Math.min(80, location.speciesCount / 3));
    const opacity = 0.7 + (location.environmentalScore / 100) * 0.3;
    const color = getBubbleColor(location.sampleType);

    return L.divIcon({
      className: "custom-bubble-marker",
      html: `
        <div style="
          width: ${baseSize}px;
          height: ${baseSize}px;
          position: relative;
          border-radius: 50%;
          background: ${color};
          opacity: ${opacity};
          border: 2px solid rgba(255,255,255,0.4);
          box-shadow: 0 0 20px ${color}60;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${baseSize > 50 ? "12px" : "10px"};
          text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        ">
          ${location.speciesCount}
        </div>
      `,
      iconSize: [baseSize, baseSize],
      iconAnchor: [baseSize / 2, baseSize / 2],
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
      }}
    >
      <Popup closeButton={false}>
        <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 min-w-[280px]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold text-lg">
                {location.name}
              </h3>
              <p className="text-gray-400 text-sm">{location.collectionDate}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {location.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Fish className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-xs">Species</span>
              </div>
              <p className="text-white font-semibold">
                {location.speciesCount}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-xs">Diversity</span>
              </div>
              <p className="text-white font-semibold">
                {location.biodiversityIndex.toFixed(2)}
              </p>
            </div>
          </div>

          <Button
            onClick={onSelect}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </Popup>
    </Marker>
  );
};

export const GeospatialMapFixed: React.FC<GeospatialMapProps> = ({
  fastaFiles,
  analysisReports,
  onLocationSelect,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState("satellite");
  const [sampleFilter, setSampleFilter] = useState("seawater");
  const [locations, setLocations] = useState<MapLocation[]>([]);

  // Convert FASTA files to map locations
  useEffect(() => {
    if (fastaFiles.length === 0) {
      // Test data
      const testLocations: MapLocation[] = [
        {
          id: "test_1",
          name: "Test Location 1",
          coordinates: [37.7749, -122.4194],
          sampleType: "seawater",
          speciesCount: 150,
          novelSpecies: 10,
          noveltyPercentage: 6.7,
          biodiversityIndex: 3.2,
          environmentalScore: 85,
          depth: 25,
          collectionDate: "2024-01-15",
          status: "completed",
        },
        {
          id: "test_2",
          name: "Test Location 2",
          coordinates: [36.7783, -119.4179],
          sampleType: "freshwater",
          speciesCount: 89,
          novelSpecies: 15,
          noveltyPercentage: 16.9,
          biodiversityIndex: 2.8,
          environmentalScore: 92,
          depth: 15,
          collectionDate: "2024-01-20",
          status: "processing",
        },
        {
          id: "test_3",
          name: "Test Location 3",
          coordinates: [39.0968, -120.0324],
          sampleType: "soil",
          speciesCount: 203,
          novelSpecies: 25,
          noveltyPercentage: 12.3,
          biodiversityIndex: 3.5,
          environmentalScore: 78,
          depth: 0.5,
          collectionDate: "2024-02-01",
          status: "completed",
        },
      ];
      setLocations(testLocations);
      return;
    }

    const mapLocations: MapLocation[] = fastaFiles.map((file) => {
      const analysis = analysisReports[file.id];
      return {
        id: file.id,
        name: file.name.replace(".fasta", ""),
        coordinates: [file.coordinates.lat, file.coordinates.lng],
        sampleType: file.sample_type,
        speciesCount: file.species_count || 0,
        novelSpecies: file.novel_species || 0,
        noveltyPercentage: file.novelty_percentage || 0,
        biodiversityIndex: file.biodiversity_index || 0,
        environmentalScore: file.environmental_score || 0,
        depth: file.depth || 0,
        collectionDate: file.collection_date,
        status: analysis ? "completed" : "processing",
        analysisData: analysis,
      };
    });
    setLocations(mapLocations);
  }, [fastaFiles, analysisReports]);

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location.id);
    onLocationSelect?.(location);
  };

  // Get tile layer URL based on selected layer
  const getTileLayerUrl = (layer: string) => {
    switch (layer) {
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case "terrain":
        return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      case "dark":
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  // Filter locations based on sample type
  const filteredLocations = locations.filter(
    (location) =>
      sampleFilter === "all" || location.sampleType.includes(sampleFilter)
  );

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <style>{`
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          background: #1a1a1a !important;
        }
        .custom-bubble-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        className="w-full h-full rounded-xl overflow-hidden"
        zoomControl={false}
      >
        <TileLayer
          url={getTileLayerUrl(mapLayer)}
          attribution="&copy; OpenStreetMap contributors"
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

      {/* Map Controls */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-[1000] space-y-3"
      >
        {/* Layer Control */}
        <Card className="glass-panel p-3 border-0">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm font-medium">Map Layer</span>
          </div>
          <div className="space-y-1">
            {[
              { id: "satellite", name: "Satellite" },
              { id: "terrain", name: "Terrain" },
              { id: "dark", name: "Dark" },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setMapLayer(layer.id)}
                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                  mapLayer === layer.id
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </Card>

        {/* Sample Type Filter */}
        <Card className="glass-panel p-3 border-0">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm font-medium">Sample Type</span>
          </div>
          <div className="space-y-1">
            {[
              { id: "all", name: "All Types" },
              { id: "seawater", name: "Seawater" },
              { id: "freshwater", name: "Freshwater" },
              { id: "soil", name: "Soil" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSampleFilter(filter.id)}
                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                  sampleFilter === filter.id
                    ? "bg-green-500/20 text-green-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Simple Legend */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-4 right-4 z-[1000]"
      >
        <Card className="glass-panel p-4 border-0">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="text-white text-sm font-medium">Sample Sites</span>
          </div>
          <div className="space-y-2">
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
        </Card>
      </motion.div>

      {/* Stats Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 z-[1000]"
      >
        <Card className="glass-panel p-3 border-0">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm font-medium">Stats</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Visible Sites:</span>
              <span className="text-white font-medium">
                {filteredLocations.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Species:</span>
              <span className="text-white font-medium">
                {filteredLocations.reduce(
                  (sum, loc) => sum + loc.speciesCount,
                  0
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Filter:</span>
              <span className="text-blue-400 font-medium capitalize">
                {sampleFilter}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
