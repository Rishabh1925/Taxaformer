from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta
import random
import uuid

app = FastAPI(title="eDNA Analysis API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:3001",
        "https://shaurya-sinha3301.github.io",
        "https://taxaformer.vercel.app",
        "https://*.vercel.app",
        "https://*.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced FASTA files data with depth, species count, and novelty information
FASTA_FILES = [
    {
        "id": "fasta_001",
        "name": "Marine_Sample_Site_A.fasta",
        "location": "Pacific Ocean - Site A",
        "collection_date": "2024-01-15",
        "sample_type": "seawater",
        "coordinates": {"lat": 36.7783, "lng": -119.4179},
        "depth": 25.5,
        "species_count": 156,
        "novel_species": 12,
        "novelty_percentage": 7.7,
        "biodiversity_index": 3.2,
        "environmental_score": 85.4
    },
    {
        "id": "fasta_002", 
        "name": "Freshwater_Lake_B.fasta",
        "location": "Lake Tahoe - Site B",
        "collection_date": "2024-01-20",
        "sample_type": "freshwater",
        "coordinates": {"lat": 39.0968, "lng": -120.0324},
        "depth": 15.2,
        "species_count": 89,
        "novel_species": 8,
        "novelty_percentage": 9.0,
        "biodiversity_index": 2.8,
        "environmental_score": 92.1
    },
    {
        "id": "fasta_003",
        "name": "Soil_Forest_C.fasta", 
        "location": "Redwood Forest - Site C",
        "collection_date": "2024-02-01",
        "sample_type": "soil",
        "coordinates": {"lat": 41.2132, "lng": -124.0046},
        "depth": 0.5,
        "species_count": 203,
        "novel_species": 15,
        "novelty_percentage": 7.4,
        "biodiversity_index": 3.5,
        "environmental_score": 78.9
    },
    {
        "id": "fasta_004",
        "name": "River_Delta_D.fasta",
        "location": "Sacramento Delta - Site D", 
        "collection_date": "2024-02-10",
        "sample_type": "river_water",
        "coordinates": {"lat": 38.0293, "lng": -121.3018},
        "depth": 8.7,
        "species_count": 134,
        "novel_species": 6,
        "novelty_percentage": 4.5,
        "biodiversity_index": 2.9,
        "environmental_score": 67.3
    },
    {
        "id": "fasta_005",
        "name": "Coral_Reef_E.fasta",
        "location": "Monterey Bay - Site E",
        "collection_date": "2024-02-15",
        "sample_type": "seawater",
        "coordinates": {"lat": 36.6002, "lng": -121.8947},
        "depth": 12.3,
        "species_count": 287,
        "novel_species": 23,
        "novelty_percentage": 8.0,
        "biodiversity_index": 3.8,
        "environmental_score": 94.2
    },
    {
        "id": "fasta_006",
        "name": "Wetland_Marsh_F.fasta",
        "location": "San Francisco Bay - Site F",
        "collection_date": "2024-02-20",
        "sample_type": "marsh_water",
        "coordinates": {"lat": 37.7749, "lng": -122.4194},
        "depth": 3.1,
        "species_count": 178,
        "novel_species": 14,
        "novelty_percentage": 7.9,
        "biodiversity_index": 3.1,
        "environmental_score": 71.8
    },
    {
        "id": "fasta_007",
        "name": "Deep_Ocean_G.fasta",
        "location": "Monterey Canyon - Site G",
        "collection_date": "2024-03-01",
        "sample_type": "deep_seawater",
        "coordinates": {"lat": 36.7014, "lng": -122.1861},
        "depth": 450.8,
        "species_count": 67,
        "novel_species": 18,
        "novelty_percentage": 26.9,
        "biodiversity_index": 2.1,
        "environmental_score": 88.7
    },
    {
        "id": "fasta_008",
        "name": "Urban_Stream_H.fasta",
        "location": "Los Angeles River - Site H",
        "collection_date": "2024-03-05",
        "sample_type": "urban_water",
        "coordinates": {"lat": 34.0522, "lng": -118.2437},
        "depth": 2.4,
        "species_count": 45,
        "novel_species": 3,
        "novelty_percentage": 6.7,
        "biodiversity_index": 1.8,
        "environmental_score": 42.1
    },
    {
        "id": "fasta_009",
        "name": "Mountain_Lake_I.fasta",
        "location": "Sierra Nevada - Site I",
        "collection_date": "2024-03-10",
        "sample_type": "alpine_water",
        "coordinates": {"lat": 37.8651, "lng": -119.5383},
        "depth": 28.9,
        "species_count": 112,
        "novel_species": 9,
        "novelty_percentage": 8.0,
        "biodiversity_index": 2.7,
        "environmental_score": 89.3
    },
    {
        "id": "fasta_010",
        "name": "Estuary_J.fasta",
        "location": "Humboldt Bay - Site J",
        "collection_date": "2024-03-15",
        "sample_type": "estuary_water",
        "coordinates": {"lat": 40.8021, "lng": -124.1637},
        "depth": 6.8,
        "species_count": 198,
        "novel_species": 16,
        "novelty_percentage": 8.1,
        "biodiversity_index": 3.3,
        "environmental_score": 83.5
    },
    # Additional sites for better coverage
    {
        "id": "fasta_011",
        "name": "Coastal_Kelp_K.fasta",
        "location": "Big Sur Coast - Site K",
        "collection_date": "2024-03-20",
        "sample_type": "seawater",
        "coordinates": {"lat": 36.2704, "lng": -121.8081},
        "depth": 18.7,
        "species_count": 234,
        "novel_species": 19,
        "novelty_percentage": 8.1,
        "biodiversity_index": 3.6,
        "environmental_score": 91.2
    },
    {
        "id": "fasta_012",
        "name": "Desert_Spring_L.fasta",
        "location": "Mojave Desert - Site L",
        "collection_date": "2024-03-25",
        "sample_type": "freshwater",
        "coordinates": {"lat": 35.0178, "lng": -117.6897},
        "depth": 4.2,
        "species_count": 67,
        "novel_species": 11,
        "novelty_percentage": 16.4,
        "biodiversity_index": 2.3,
        "environmental_score": 76.8
    },
    {
        "id": "fasta_013",
        "name": "Volcanic_Lake_M.fasta",
        "location": "Crater Lake - Site M",
        "collection_date": "2024-04-01",
        "sample_type": "freshwater",
        "coordinates": {"lat": 42.9446, "lng": -122.1090},
        "depth": 89.3,
        "species_count": 78,
        "novel_species": 7,
        "novelty_percentage": 9.0,
        "biodiversity_index": 2.4,
        "environmental_score": 95.7
    },
    {
        "id": "fasta_014",
        "name": "Tidal_Pool_N.fasta",
        "location": "Point Reyes - Site N",
        "collection_date": "2024-04-05",
        "sample_type": "seawater",
        "coordinates": {"lat": 38.0293, "lng": -122.8694},
        "depth": 1.8,
        "species_count": 189,
        "novel_species": 13,
        "novelty_percentage": 6.9,
        "biodiversity_index": 3.4,
        "environmental_score": 87.4
    },
    {
        "id": "fasta_015",
        "name": "Geothermal_Spring_O.fasta",
        "location": "Yellowstone - Site O",
        "collection_date": "2024-04-10",
        "sample_type": "freshwater",
        "coordinates": {"lat": 44.4280, "lng": -110.5885},
        "depth": 3.5,
        "species_count": 34,
        "novel_species": 8,
        "novelty_percentage": 23.5,
        "biodiversity_index": 1.9,
        "environmental_score": 68.2
    }
]

def generate_species_data():
    """Generate realistic species detection data"""
    species_list = [
        {"name": "Salmo trutta", "common_name": "Brown Trout", "kingdom": "Animalia", "phylum": "Chordata"},
        {"name": "Oncorhynchus mykiss", "common_name": "Rainbow Trout", "kingdom": "Animalia", "phylum": "Chordata"},
        {"name": "Micropterus salmoides", "common_name": "Largemouth Bass", "kingdom": "Animalia", "phylum": "Chordata"},
        {"name": "Cyprinus carpio", "common_name": "Common Carp", "kingdom": "Animalia", "phylum": "Chordata"},
        {"name": "Daphnia magna", "common_name": "Water Flea", "kingdom": "Animalia", "phylum": "Arthropoda"},
        {"name": "Chironomus plumosus", "common_name": "Midge Larva", "kingdom": "Animalia", "phylum": "Arthropoda"},
        {"name": "Chlorella vulgaris", "common_name": "Green Algae", "kingdom": "Plantae", "phylum": "Chlorophyta"},
        {"name": "Anabaena spiroides", "common_name": "Blue-green Algae", "kingdom": "Bacteria", "phylum": "Cyanobacteria"},
        {"name": "Escherichia coli", "common_name": "E. coli", "kingdom": "Bacteria", "phylum": "Proteobacteria"},
        {"name": "Pseudomonas aeruginosa", "common_name": "Pseudomonas", "kingdom": "Bacteria", "phylum": "Proteobacteria"}
    ]
    
    detected_species = []
    num_species = random.randint(5, 8)
    
    for i in range(num_species):
        species = random.choice(species_list)
        detected_species.append({
            "species_id": f"sp_{uuid.uuid4().hex[:8]}",
            "scientific_name": species["name"],
            "common_name": species["common_name"],
            "kingdom": species["kingdom"],
            "phylum": species["phylum"],
            "abundance": round(random.uniform(0.1, 15.0), 2),
            "confidence_score": round(random.uniform(0.75, 0.99), 3),
            "sequence_count": random.randint(10, 500),
            "biomass_estimate": round(random.uniform(0.01, 2.5), 3)
        })
    
    return detected_species

def generate_environmental_data():
    """Generate environmental parameters"""
    return {
        "temperature": round(random.uniform(8.0, 25.0), 1),
        "ph": round(random.uniform(6.5, 8.5), 1),
        "dissolved_oxygen": round(random.uniform(4.0, 12.0), 1),
        "turbidity": round(random.uniform(0.5, 15.0), 1),
        "conductivity": random.randint(50, 800),
        "salinity": round(random.uniform(0.0, 35.0), 1),
        "depth": round(random.uniform(0.5, 50.0), 1),
        "flow_rate": round(random.uniform(0.1, 3.0), 2)
    }

@app.get("/")
async def root():
    return {"message": "eDNA Analysis API", "version": "1.0.0"}

@app.get("/fasta-files")
async def get_fasta_files():
    """Get list of available FASTA files"""
    return {"files": FASTA_FILES}

@app.get("/analysis/{file_id}")
async def get_analysis_report(file_id: str):
    """Get detailed analysis report for a specific FASTA file"""
    
    # Find the file
    file_info = next((f for f in FASTA_FILES if f["id"] == file_id), None)
    if not file_info:
        raise HTTPException(status_code=404, detail="FASTA file not found")
    
    # Generate analysis report
    species_data = generate_species_data()
    environmental_data = generate_environmental_data()
    
    # Calculate summary statistics
    total_species = len(species_data)
    total_sequences = sum(s["sequence_count"] for s in species_data)
    total_biomass = sum(s["biomass_estimate"] for s in species_data)
    avg_confidence = sum(s["confidence_score"] for s in species_data) / total_species
    
    # Biodiversity indices
    shannon_diversity = round(random.uniform(1.5, 3.2), 3)
    simpson_diversity = round(random.uniform(0.6, 0.9), 3)
    
    analysis_report = {
        "file_info": file_info,
        "analysis_metadata": {
            "analysis_id": f"analysis_{uuid.uuid4().hex[:12]}",
            "processed_date": datetime.now().isoformat(),
            "processing_time": f"{random.randint(45, 180)} seconds",
            "pipeline_version": "v2.1.3",
            "database_version": "NCBI_nt_2024.1"
        },
        "summary_statistics": {
            "total_species_detected": total_species,
            "total_sequences_analyzed": total_sequences,
            "total_biomass_estimate": round(total_biomass, 3),
            "average_confidence_score": round(avg_confidence, 3),
            "shannon_diversity_index": shannon_diversity,
            "simpson_diversity_index": simpson_diversity
        },
        "species_composition": species_data,
        "environmental_parameters": environmental_data,
        "taxonomic_breakdown": {
            "kingdoms": {
                "Animalia": len([s for s in species_data if s["kingdom"] == "Animalia"]),
                "Plantae": len([s for s in species_data if s["kingdom"] == "Plantae"]),
                "Bacteria": len([s for s in species_data if s["kingdom"] == "Bacteria"]),
                "Fungi": len([s for s in species_data if s["kingdom"] == "Fungi"])
            },
            "phylums": {}
        },
        "quality_metrics": {
            "sequence_quality_score": round(random.uniform(0.85, 0.98), 3),
            "contamination_level": round(random.uniform(0.01, 0.05), 3),
            "coverage_depth": f"{random.randint(50, 200)}x",
            "gc_content": round(random.uniform(40.0, 60.0), 1)
        },
        "temporal_analysis": {
            "seasonal_variation": round(random.uniform(0.1, 0.4), 2),
            "stability_index": round(random.uniform(0.6, 0.9), 2),
            "trend_direction": random.choice(["increasing", "decreasing", "stable"])
        }
    }
    
    # Calculate phylum breakdown
    phylum_counts = {}
    for species in species_data:
        phylum = species["phylum"]
        phylum_counts[phylum] = phylum_counts.get(phylum, 0) + 1
    analysis_report["taxonomic_breakdown"]["phylums"] = phylum_counts
    
    return analysis_report

@app.get("/analysis/{file_id}/species")
async def get_species_details(file_id: str, species_id: Optional[str] = None):
    """Get detailed species information"""
    
    file_info = next((f for f in FASTA_FILES if f["id"] == file_id), None)
    if not file_info:
        raise HTTPException(status_code=404, detail="FASTA file not found")
    
    if species_id:
        # Return specific species details
        return {
            "species_id": species_id,
            "detailed_analysis": {
                "genetic_markers": ["COI", "16S rRNA", "18S rRNA"],
                "sequence_alignment_score": round(random.uniform(0.85, 0.99), 3),
                "phylogenetic_position": "Well-supported clade",
                "ecological_role": random.choice(["Primary producer", "Primary consumer", "Secondary consumer", "Decomposer"]),
                "habitat_preferences": ["Freshwater", "Temperate zones", "Shallow waters"],
                "conservation_status": random.choice(["Least Concern", "Near Threatened", "Vulnerable", "Data Deficient"])
            }
        }
    else:
        # Return all species for the file
        return {"species": generate_species_data()}

@app.get("/analysis/{file_id}/environmental")
async def get_environmental_analysis(file_id: str):
    """Get environmental correlation analysis"""
    
    file_info = next((f for f in FASTA_FILES if f["id"] == file_id), None)
    if not file_info:
        raise HTTPException(status_code=404, detail="FASTA file not found")
    
    return {
        "environmental_correlations": {
            "temperature_species_correlation": round(random.uniform(-0.5, 0.8), 3),
            "ph_diversity_correlation": round(random.uniform(-0.3, 0.6), 3),
            "oxygen_biomass_correlation": round(random.uniform(0.2, 0.9), 3)
        },
        "habitat_suitability": {
            "optimal_conditions": generate_environmental_data(),
            "stress_indicators": {
                "pollution_markers": random.randint(0, 3),
                "invasive_species_count": random.randint(0, 2),
                "ecosystem_health_score": round(random.uniform(0.6, 0.95), 2)
            }
        }
    }

@app.get("/comparison")
async def compare_samples(file_ids: str):
    """Compare multiple samples"""
    
    file_id_list = file_ids.split(",")
    if len(file_id_list) < 2:
        raise HTTPException(status_code=400, detail="At least 2 file IDs required for comparison")
    
    comparison_data = {
        "comparison_id": f"comp_{uuid.uuid4().hex[:8]}",
        "samples": [],
        "similarity_matrix": {},
        "shared_species": [],
        "unique_species": {},
        "diversity_comparison": {}
    }
    
    for file_id in file_id_list:
        file_info = next((f for f in FASTA_FILES if f["id"] == file_id), None)
        if file_info:
            comparison_data["samples"].append({
                "file_id": file_id,
                "name": file_info["name"],
                "species_count": random.randint(5, 12),
                "diversity_index": round(random.uniform(1.5, 3.2), 3)
            })
    
    return comparison_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)