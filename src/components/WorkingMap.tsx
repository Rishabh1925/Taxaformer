import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { FastaFile, AnalysisReport } from "../services/api";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface WorkingMapProps {
  fastaFiles: FastaFile[];
  analysisReports: Record<string, AnalysisReport>;
  onLocationSelect?: (location: any) => void;
}

export const WorkingMap: React.FC<WorkingMapProps> = ({
  fastaFiles,
  analysisReports,
  onLocationSelect,
}) => {
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    console.log("WorkingMap: Setting up locations");

    // Always show test data
    const testLocations = [
      {
        id: "test_1",
        name: "San Francisco Bay",
        coordinates: [37.7749, -122.4194] as [number, number],
        speciesCount: 234,
        sampleType: "seawater",
        status: "completed",
      },
      {
        id: "test_2",
        name: "Central Valley",
        coordinates: [36.7783, -119.4179] as [number, number],
        speciesCount: 156,
        sampleType: "freshwater",
        status: "processing",
      },
      {
        id: "test_3",
        name: "Lake Tahoe",
        coordinates: [39.0968, -120.0324] as [number, number],
        speciesCount: 89,
        sampleType: "soil",
        status: "completed",
      },
    ];

    // Add backend data if available
    const backendLocations = fastaFiles.map((file) => ({
      id: file.id,
      name: file.name.replace(".fasta", ""),
      coordinates: [file.coordinates.lat, file.coordinates.lng] as [
        number,
        number
      ],
      speciesCount: file.species_count || 100,
      sampleType: file.sample_type,
      status: "completed",
    }));

    const allLocations = [...testLocations, ...backendLocations];
    setLocations(allLocations);
    console.log("WorkingMap: Locations set:", allLocations.length);
  }, [fastaFiles]);

  const createBubbleIcon = (location: any) => {
    const colors = {
      seawater: "#06b6d4",
      freshwater: "#3b82f6",
      soil: "#84cc16",
    };

    const color =
      colors[location.sampleType as keyof typeof colors] || "#6b7280";
    const size = Math.max(30, Math.min(70, location.speciesCount / 4));

    return L.divIcon({
      className: "bubble-marker",
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid rgba(255,255,255,0.8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          opacity: 0.9;
        ">
          ${location.speciesCount}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Debug info */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "12px",
        }}
      >
        Locations: {locations.length}
      </div>

      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri"
        />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.coordinates}
            icon={createBubbleIcon(location)}
            eventHandlers={{
              click: () => {
                console.log("Marker clicked:", location);
                onLocationSelect?.(location);
              },
            }}
          >
            <Popup>
              <div style={{ padding: "10px", minWidth: "200px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                  {location.name}
                </h3>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  Species: {location.speciesCount}
                </p>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  Type: {location.sampleType}
                </p>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  Status: {location.status}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        .leaflet-container {
          background: #1a1a1a !important;
        }
        .bubble-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};
