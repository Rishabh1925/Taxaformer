from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta
import random
import uuid
import math

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
        "https://taxaformer-main.vercel.app",
        "https://taxaformer-git-main-shaurya-sinha3301s-projects.vercel.app",
        "https://taxaformer-shaurya-sinha3301s-projects.vercel.app"
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

def generate_species_data_by_environment(sample_type: str, depth: float = 0, seed: int = None):
    """Generate environment-specific species detection data"""
    
    # Set seed if provided for consistent data generation
    if seed is not None:
        random.seed(seed)
    
    # Deep Sea Species (depth > 200m or deep_seawater type)
    deep_sea_species = [
        {"name": "Pyrococcus furiosus", "common_name": "Hyperthermophile Archaea", "kingdom": "Archaea", "phylum": "Euryarchaeota", "habitat": "Deep hydrothermal vents"},
        {"name": "Calyptogena magnifica", "common_name": "Giant Clam", "kingdom": "Animalia", "phylum": "Mollusca", "habitat": "Deep sea vents"},
        {"name": "Riftia pachyptila", "common_name": "Giant Tube Worm", "kingdom": "Animalia", "phylum": "Annelida", "habitat": "Hydrothermal vents"},
        {"name": "Bathymodiolus thermophilus", "common_name": "Deep Sea Mussel", "kingdom": "Animalia", "phylum": "Mollusca", "habitat": "Cold seeps"},
        {"name": "Methanocaldococcus jannaschii", "common_name": "Methanogenic Archaea", "kingdom": "Archaea", "phylum": "Euryarchaeota", "habitat": "Deep sea sediments"},
        {"name": "Thermotoga maritima", "common_name": "Thermophilic Bacteria", "kingdom": "Bacteria", "phylum": "Thermotogae", "habitat": "Deep marine environments"},
        {"name": "Alvinella pompejana", "common_name": "Pompeii Worm", "kingdom": "Animalia", "phylum": "Annelida", "habitat": "Hydrothermal vents"},
        {"name": "Pyrodictium occultum", "common_name": "Extreme Thermophile", "kingdom": "Archaea", "phylum": "Crenarchaeota", "habitat": "Deep sea volcanic vents"},
        {"name": "Colwellia psychrerythraea", "common_name": "Psychrophilic Bacteria", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Deep cold waters"},
        {"name": "Shewanella piezotolerans", "common_name": "Pressure-tolerant Bacteria", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Deep sea trenches"}
    ]
    
    # Marine/Seawater Species
    marine_species = [
        {"name": "Prochlorococcus marinus", "common_name": "Marine Cyanobacteria", "kingdom": "Bacteria", "phylum": "Cyanobacteria", "habitat": "Surface waters"},
        {"name": "Synechococcus sp.", "common_name": "Marine Cyanobacteria", "kingdom": "Bacteria", "phylum": "Cyanobacteria", "habitat": "Coastal waters"},
        {"name": "Thalassiosira pseudonana", "common_name": "Marine Diatom", "kingdom": "Chromista", "phylum": "Bacillariophyta", "habitat": "Photic zone"},
        {"name": "Emiliania huxleyi", "common_name": "Coccolithophore", "kingdom": "Chromista", "phylum": "Haptophyta", "habitat": "Open ocean"},
        {"name": "Vibrio fischeri", "common_name": "Bioluminescent Bacteria", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Marine symbiont"},
        {"name": "Alteromonas macleodii", "common_name": "Marine Bacteria", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Coastal waters"},
        {"name": "Pelagibacter ubique", "common_name": "SAR11 Bacteria", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Open ocean"},
        {"name": "Trichodesmium erythraeum", "common_name": "Sea Sawdust", "kingdom": "Bacteria", "phylum": "Cyanobacteria", "habitat": "Tropical oceans"}
    ]
    
    # Freshwater Species
    freshwater_species = [
        {"name": "Salmo trutta", "common_name": "Brown Trout", "kingdom": "Animalia", "phylum": "Chordata", "habitat": "Cold freshwater"},
        {"name": "Oncorhynchus mykiss", "common_name": "Rainbow Trout", "kingdom": "Animalia", "phylum": "Chordata", "habitat": "Freshwater streams"},
        {"name": "Daphnia magna", "common_name": "Water Flea", "kingdom": "Animalia", "phylum": "Arthropoda", "habitat": "Freshwater lakes"},
        {"name": "Chlorella vulgaris", "common_name": "Green Algae", "kingdom": "Plantae", "phylum": "Chlorophyta", "habitat": "Freshwater"},
        {"name": "Anabaena spiroides", "common_name": "Blue-green Algae", "kingdom": "Bacteria", "phylum": "Cyanobacteria", "habitat": "Eutrophic lakes"},
        {"name": "Microcystis aeruginosa", "common_name": "Toxic Blue-green Algae", "kingdom": "Bacteria", "phylum": "Cyanobacteria", "habitat": "Nutrient-rich lakes"},
        {"name": "Chironomus plumosus", "common_name": "Midge Larva", "kingdom": "Animalia", "phylum": "Arthropoda", "habitat": "Lake sediments"},
        {"name": "Cyclops sp.", "common_name": "Copepod", "kingdom": "Animalia", "phylum": "Arthropoda", "habitat": "Freshwater plankton"}
    ]
    
    # Soil Species
    soil_species = [
        {"name": "Rhizobium leguminosarum", "common_name": "Nitrogen-fixing Bacteria", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Root nodules"},
        {"name": "Mycorrhiza sp.", "common_name": "Mycorrhizal Fungi", "kingdom": "Fungi", "phylum": "Glomeromycota", "habitat": "Plant roots"},
        {"name": "Bacillus subtilis", "common_name": "Soil Bacteria", "kingdom": "Bacteria", "phylum": "Firmicutes", "habitat": "Soil"},
        {"name": "Streptomyces coelicolor", "common_name": "Antibiotic-producing Bacteria", "kingdom": "Bacteria", "phylum": "Actinobacteria", "habitat": "Soil"},
        {"name": "Trichoderma harzianum", "common_name": "Biocontrol Fungi", "kingdom": "Fungi", "phylum": "Ascomycota", "habitat": "Soil"},
        {"name": "Pseudomonas fluorescens", "common_name": "Plant Growth Promoter", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Rhizosphere"},
        {"name": "Azotobacter vinelandii", "common_name": "Free-living N-fixer", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Soil"},
        {"name": "Glomus intraradices", "common_name": "Arbuscular Mycorrhiza", "kingdom": "Fungi", "phylum": "Glomeromycota", "habitat": "Plant roots"}
    ]
    
    # River/Urban Water Species
    river_species = [
        {"name": "Escherichia coli", "common_name": "E. coli", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Indicator organism"},
        {"name": "Pseudomonas aeruginosa", "common_name": "Opportunistic Pathogen", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Water systems"},
        {"name": "Enterococcus faecalis", "common_name": "Fecal Indicator", "kingdom": "Bacteria", "phylum": "Firmicutes", "habitat": "Polluted water"},
        {"name": "Nitrosomonas europaea", "common_name": "Ammonia Oxidizer", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Nitrogen cycle"},
        {"name": "Nitrobacter winogradskyi", "common_name": "Nitrite Oxidizer", "kingdom": "Bacteria", "phylum": "Proteobacteria", "habitat": "Nitrogen cycle"},
        {"name": "Lemna minor", "common_name": "Duckweed", "kingdom": "Plantae", "phylum": "Tracheophyta", "habitat": "Surface water"},
        {"name": "Tubifex tubifex", "common_name": "Sludge Worm", "kingdom": "Animalia", "phylum": "Annelida", "habitat": "Polluted sediments"}
    ]
    
    # Select species based on environment type and depth
    if sample_type == "deep_seawater" or depth > 200:
        species_pool = deep_sea_species
        num_species = random.randint(4, 7)  # Fewer species in extreme environments
        novel_chance = 0.4  # Higher chance of novel species in deep sea
    elif sample_type in ["seawater", "estuary_water", "marsh_water"]:
        species_pool = marine_species
        num_species = random.randint(6, 10)
        novel_chance = 0.2
    elif sample_type in ["freshwater", "alpine_water"]:
        species_pool = freshwater_species
        num_species = random.randint(5, 8)
        novel_chance = 0.15
    elif sample_type == "soil":
        species_pool = soil_species
        num_species = random.randint(7, 12)  # High diversity in soil
        novel_chance = 0.25
    elif sample_type in ["river_water", "urban_water"]:
        species_pool = river_species
        num_species = random.randint(4, 7)  # Lower diversity in polluted water
        novel_chance = 0.1
    else:
        species_pool = marine_species  # Default
        num_species = random.randint(5, 8)
        novel_chance = 0.2
    
    detected_species = []
    
    # Add known species
    selected_species = random.sample(species_pool, min(num_species, len(species_pool)))
    
    for species in selected_species:
        # Adjust abundance based on environment
        if sample_type == "deep_seawater":
            abundance = round(random.uniform(0.05, 5.0), 2)  # Lower abundance in deep sea
            confidence = round(random.uniform(0.65, 0.95), 3)  # Lower confidence for extreme environments
        elif sample_type == "soil":
            abundance = round(random.uniform(0.5, 25.0), 2)  # Higher abundance in soil
            confidence = round(random.uniform(0.80, 0.98), 3)
        else:
            abundance = round(random.uniform(0.1, 15.0), 2)
            confidence = round(random.uniform(0.75, 0.99), 3)
        
        detected_species.append({
            "species_id": f"sp_{uuid.uuid4().hex[:8]}",
            "scientific_name": species["name"],
            "common_name": species["common_name"],
            "kingdom": species["kingdom"],
            "phylum": species["phylum"],
            "habitat": species["habitat"],
            "abundance": abundance,
            "confidence_score": confidence,
            "sequence_count": random.randint(5, 300),
            "biomass_estimate": round(random.uniform(0.001, 2.0), 3),
            "is_novel": False
        })
    
    # Add novel species based on environment
    novel_count = int(num_species * novel_chance)
    for i in range(novel_count):
        if sample_type == "deep_seawater":
            novel_names = [
                "Unknown extremophile sp. A",
                "Novel thermophilic archaea sp. B", 
                "Unidentified pressure-adapted bacteria sp. C",
                "Deep-sea chemosynthetic bacteria sp. D"
            ]
            habitat = "Deep sea environment"
        elif sample_type == "soil":
            novel_names = [
                "Novel rhizosphere bacteria sp. A",
                "Unknown mycorrhizal fungi sp. B",
                "Unidentified soil actinomycete sp. C"
            ]
            habitat = "Soil microbiome"
        else:
            novel_names = [
                "Unknown marine bacteria sp. A",
                "Novel freshwater microorganism sp. B",
                "Unidentified environmental bacteria sp. C"
            ]
            habitat = "Environmental sample"
        
        novel_name = random.choice(novel_names)
        detected_species.append({
            "species_id": f"novel_{uuid.uuid4().hex[:8]}",
            "scientific_name": novel_name,
            "common_name": "Novel Species",
            "kingdom": "Unknown",
            "phylum": "Unknown",
            "habitat": habitat,
            "abundance": round(random.uniform(0.01, 2.0), 2),
            "confidence_score": round(random.uniform(0.45, 0.75), 3),  # Lower confidence for novel
            "sequence_count": random.randint(1, 50),
            "biomass_estimate": round(random.uniform(0.001, 0.5), 3),
            "is_novel": True
        })
    
    return detected_species

def get_analysis_type(sample_type: str, depth: float) -> str:
    """Determine the analysis type based on sample characteristics"""
    if sample_type == "deep_seawater" or depth > 200:
        return "Deep Sea Extremophile Analysis"
    elif sample_type in ["seawater", "estuary_water", "marsh_water"]:
        return "Marine Biodiversity Analysis"
    elif sample_type in ["freshwater", "alpine_water"]:
        return "Freshwater Ecosystem Analysis"
    elif sample_type == "soil":
        return "Soil Microbiome Analysis"
    elif sample_type in ["river_water", "urban_water"]:
        return "Water Quality & Pollution Assessment"
    else:
        return "General Environmental Analysis"

def generate_specialized_analysis(sample_type: str, species_data: list, environmental_data: dict, depth: float) -> dict:
    """Generate specialized analysis based on environment type"""
    
    if sample_type == "deep_seawater" or depth > 200:
        return generate_deep_sea_analysis(species_data, environmental_data, depth)
    elif sample_type in ["seawater", "estuary_water", "marsh_water"]:
        return generate_marine_analysis(species_data, environmental_data)
    elif sample_type in ["freshwater", "alpine_water"]:
        return generate_freshwater_analysis(species_data, environmental_data)
    elif sample_type == "soil":
        return generate_soil_analysis(species_data, environmental_data)
    elif sample_type in ["river_water", "urban_water"]:
        return generate_water_quality_analysis(species_data, environmental_data)
    else:
        return generate_general_analysis(species_data, environmental_data)

def generate_deep_sea_analysis(species_data: list, environmental_data: dict, depth: float) -> dict:
    """Specialized analysis for deep sea environments"""
    
    # Count extremophiles
    extremophiles = [s for s in species_data if any(term in s["scientific_name"].lower() 
                    for term in ["pyrococcus", "thermotoga", "methanocaldococcus", "pyrodictium", "colwellia", "shewanella"])]
    
    # Pressure adaptation analysis
    pressure_adapted = [s for s in species_data if "pressure" in s.get("habitat", "").lower() or "deep" in s.get("habitat", "").lower()]
    
    # Novel species analysis
    novel_species = [s for s in species_data if s.get("is_novel", False)]
    
    return {
        "analysis_type": "Deep Sea Extremophile Analysis",
        "key_findings": {
            "extremophile_count": len(extremophiles),
            "pressure_adapted_species": len(pressure_adapted),
            "novel_discovery_rate": round((len(novel_species) / len(species_data)) * 100, 1),
            "depth_zone": "Bathypelagic" if depth < 4000 else "Abyssopelagic" if depth < 6000 else "Hadalpelagic"
        },
        "extremophile_characteristics": {
            "thermophiles": len([s for s in extremophiles if "thermo" in s["scientific_name"].lower()]),
            "psychrophiles": len([s for s in extremophiles if "psychr" in s["scientific_name"].lower() or "colwellia" in s["scientific_name"].lower()]),
            "piezophiles": len([s for s in extremophiles if "piezo" in s["scientific_name"].lower() or "shewanella" in s["scientific_name"].lower()]),
            "chemosynthetic_organisms": len([s for s in species_data if "chemosynthetic" in s.get("habitat", "").lower()])
        },
        "environmental_adaptations": {
            "high_pressure_tolerance": environmental_data.get("pressure", 0) > 100,
            "low_temperature_adaptation": environmental_data.get("temperature", 0) < 5,
            "chemosynthetic_potential": environmental_data.get("methane_concentration", 0) > 1 or environmental_data.get("sulfide_concentration", 0) > 1,
            "hydrothermal_influence": environmental_data.get("hydrothermal_activity", False)
        },
        "biodiversity_insights": {
            "species_rarity_index": round(random.uniform(0.7, 0.95), 2),  # High rarity in deep sea
            "endemism_potential": round(random.uniform(0.6, 0.9), 2),
            "evolutionary_significance": "High - potential for unique evolutionary adaptations",
            "conservation_priority": "Critical - unique deep-sea ecosystem"
        },
        "research_implications": {
            "biotechnology_potential": "High - extremozymes and novel compounds",
            "climate_indicators": "Deep-sea communities as climate change indicators",
            "pharmaceutical_prospects": "Novel bioactive compounds from extremophiles",
            "astrobiology_relevance": "Models for life in extreme extraterrestrial environments"
        }
    }

def generate_marine_analysis(species_data: list, environmental_data: dict) -> dict:
    """Specialized analysis for marine environments"""
    
    # Marine-specific organisms
    phytoplankton = [s for s in species_data if any(term in s["scientific_name"].lower() 
                    for term in ["prochlorococcus", "synechococcus", "thalassiosira", "emiliania"])]
    
    bacteria = [s for s in species_data if s["kingdom"] == "Bacteria"]
    
    return {
        "analysis_type": "Marine Biodiversity Analysis",
        "key_findings": {
            "primary_producers": len(phytoplankton),
            "bacterial_diversity": len(bacteria),
            "trophic_levels_represented": random.randint(3, 5),
            "marine_productivity_index": round(random.uniform(0.6, 0.9), 2)
        },
        "oceanographic_indicators": {
            "chlorophyll_correlation": round(random.uniform(0.4, 0.8), 2),
            "nutrient_cycling_efficiency": round(random.uniform(0.7, 0.95), 2),
            "carbon_pump_activity": round(random.uniform(0.5, 0.85), 2),
            "oxygen_production_potential": environmental_data.get("dissolved_oxygen", 0) > 8
        },
        "ecosystem_health": {
            "biodiversity_status": "Good" if len(species_data) > 6 else "Moderate",
            "pollution_indicators": len([s for s in species_data if "vibrio" in s["scientific_name"].lower()]),
            "invasive_species_risk": round(random.uniform(0.1, 0.4), 2),
            "climate_resilience": round(random.uniform(0.6, 0.9), 2)
        },
        "conservation_insights": {
            "protected_species_present": random.randint(0, 2),
            "habitat_connectivity": round(random.uniform(0.7, 0.95), 2),
            "restoration_potential": "High" if environmental_data.get("ph", 0) > 7.9 else "Moderate",
            "monitoring_priority": "High - marine protected area candidate"
        }
    }

def generate_freshwater_analysis(species_data: list, environmental_data: dict) -> dict:
    """Specialized analysis for freshwater environments"""
    
    # Freshwater indicators
    fish_species = [s for s in species_data if s["kingdom"] == "Animalia" and s["phylum"] == "Chordata"]
    algae_species = [s for s in species_data if "algae" in s["common_name"].lower() or s["kingdom"] == "Plantae"]
    
    return {
        "analysis_type": "Freshwater Ecosystem Analysis",
        "key_findings": {
            "fish_diversity": len(fish_species),
            "algal_diversity": len(algae_species),
            "water_quality_score": round(random.uniform(0.6, 0.95), 2),
            "eutrophication_risk": "Low" if environmental_data.get("phosphate", 0) < 0.1 else "Moderate" if environmental_data.get("phosphate", 0) < 0.3 else "High"
        },
        "water_quality_indicators": {
            "dissolved_oxygen_status": "Excellent" if environmental_data.get("dissolved_oxygen", 0) > 10 else "Good" if environmental_data.get("dissolved_oxygen", 0) > 7 else "Poor",
            "nutrient_balance": {
                "nitrogen_level": environmental_data.get("nitrate", 0),
                "phosphorus_level": environmental_data.get("phosphate", 0),
                "n_p_ratio": round(environmental_data.get("nitrate", 1) / max(environmental_data.get("phosphate", 0.01), 0.01), 1)
            },
            "thermal_stratification": environmental_data.get("temperature", 0) > 15,
            "alkalinity_buffer": environmental_data.get("alkalinity", 0) > 50
        },
        "ecological_assessment": {
            "trophic_state": "Oligotrophic" if environmental_data.get("phosphate", 0) < 0.1 else "Mesotrophic" if environmental_data.get("phosphate", 0) < 0.3 else "Eutrophic",
            "biodiversity_index": round(random.uniform(0.7, 0.95), 2),
            "habitat_complexity": round(random.uniform(0.6, 0.9), 2),
            "seasonal_stability": round(random.uniform(0.5, 0.8), 2)
        },
        "management_recommendations": {
            "nutrient_management": "Monitor phosphate inputs" if environmental_data.get("phosphate", 0) > 0.2 else "Maintain current levels",
            "fisheries_potential": "Sustainable" if len(fish_species) > 2 else "Limited",
            "recreation_suitability": "High" if environmental_data.get("dissolved_oxygen", 0) > 8 else "Moderate",
            "conservation_priority": "Medium - maintain water quality"
        }
    }

def generate_soil_analysis(species_data: list, environmental_data: dict) -> dict:
    """Specialized analysis for soil environments"""
    
    # Soil-specific organisms
    bacteria = [s for s in species_data if s["kingdom"] == "Bacteria"]
    fungi = [s for s in species_data if s["kingdom"] == "Fungi"]
    nitrogen_fixers = [s for s in species_data if "rhizobium" in s["scientific_name"].lower() or "azotobacter" in s["scientific_name"].lower()]
    
    return {
        "analysis_type": "Soil Microbiome Analysis",
        "key_findings": {
            "bacterial_diversity": len(bacteria),
            "fungal_diversity": len(fungi),
            "nitrogen_fixers": len(nitrogen_fixers),
            "soil_health_score": round(random.uniform(0.7, 0.95), 2)
        },
        "nutrient_cycling": {
            "nitrogen_cycle_activity": len(nitrogen_fixers) > 0,
            "carbon_sequestration_potential": round(random.uniform(0.6, 0.9), 2),
            "phosphorus_solubilization": len([s for s in bacteria if "pseudomonas" in s["scientific_name"].lower()]) > 0,
            "organic_matter_decomposition": round(environmental_data.get("organic_matter", 5) / 10, 2)
        },
        "plant_soil_interactions": {
            "mycorrhizal_associations": len([s for s in fungi if "mycorrhiz" in s["scientific_name"].lower() or "glomus" in s["scientific_name"].lower()]),
            "rhizosphere_activity": round(random.uniform(0.7, 0.95), 2),
            "plant_growth_promotion": len([s for s in bacteria if "fluorescens" in s["scientific_name"].lower()]) > 0,
            "disease_suppression": len([s for s in fungi if "trichoderma" in s["scientific_name"].lower()]) > 0
        },
        "agricultural_implications": {
            "fertility_status": "High" if environmental_data.get("organic_matter", 0) > 8 else "Moderate" if environmental_data.get("organic_matter", 0) > 4 else "Low",
            "biological_activity": round(environmental_data.get("microbial_biomass", 400) / 800, 2),
            "sustainability_index": round(random.uniform(0.6, 0.9), 2),
            "crop_productivity_potential": "High" if len(nitrogen_fixers) > 0 and environmental_data.get("ph", 7) > 6 else "Moderate"
        }
    }

def generate_water_quality_analysis(species_data: list, environmental_data: dict) -> dict:
    """Specialized analysis for water quality assessment"""
    
    # Pollution indicators
    indicator_bacteria = [s for s in species_data if any(term in s["scientific_name"].lower() 
                         for term in ["escherichia", "enterococcus", "pseudomonas"])]
    
    return {
        "analysis_type": "Water Quality & Pollution Assessment",
        "key_findings": {
            "pollution_indicators": len(indicator_bacteria),
            "water_quality_grade": "A" if len(indicator_bacteria) == 0 else "B" if len(indicator_bacteria) < 2 else "C",
            "contamination_risk": "Low" if len(indicator_bacteria) < 2 else "High",
            "treatment_efficiency": round(random.uniform(0.6, 0.9), 2)
        },
        "microbial_indicators": {
            "coliform_presence": len([s for s in indicator_bacteria if "escherichia" in s["scientific_name"].lower()]) > 0,
            "pathogen_risk": len([s for s in indicator_bacteria if "pseudomonas" in s["scientific_name"].lower()]) > 0,
            "fecal_contamination": environmental_data.get("coliform_count", 0) > 1000,
            "antibiotic_resistance_potential": round(random.uniform(0.2, 0.7), 2)
        },
        "chemical_assessment": {
            "heavy_metal_contamination": environmental_data.get("heavy_metals", 0) > 0.1,
            "nutrient_pollution": environmental_data.get("nitrate", 0) > 10 or environmental_data.get("phosphate", 0) > 1,
            "ph_stability": 6.5 <= environmental_data.get("ph", 7) <= 8.5,
            "dissolved_oxygen_adequacy": environmental_data.get("dissolved_oxygen", 0) > 5
        },
        "public_health_implications": {
            "drinking_water_suitability": "Not recommended" if len(indicator_bacteria) > 1 else "Requires treatment",
            "recreational_safety": "Caution advised" if environmental_data.get("coliform_count", 0) > 500 else "Generally safe",
            "ecosystem_impact": "Moderate stress" if len(indicator_bacteria) > 2 else "Low impact",
            "remediation_priority": "High" if environmental_data.get("heavy_metals", 0) > 0.2 else "Medium"
        }
    }

def generate_general_analysis(species_data: list, environmental_data: dict) -> dict:
    """General environmental analysis"""
    return {
        "analysis_type": "General Environmental Analysis",
        "key_findings": {
            "species_richness": len(species_data),
            "taxonomic_diversity": len(set(s["kingdom"] for s in species_data)),
            "environmental_stability": round(random.uniform(0.6, 0.9), 2),
            "ecosystem_complexity": round(random.uniform(0.5, 0.8), 2)
        },
        "biodiversity_metrics": {
            "evenness_index": round(random.uniform(0.6, 0.9), 2),
            "dominance_index": round(random.uniform(0.1, 0.4), 2),
            "rarity_index": round(random.uniform(0.3, 0.7), 2)
        }
    }

def generate_environmental_data_by_type(sample_type: str, depth: float):
    """Generate environment-specific parameters"""
    
    if sample_type == "deep_seawater" or depth > 200:
        # Deep sea conditions
        return {
            "temperature": round(random.uniform(1.0, 4.0), 1),  # Very cold
            "ph": round(random.uniform(7.8, 8.2), 1),
            "dissolved_oxygen": round(random.uniform(2.0, 6.0), 1),  # Lower oxygen
            "pressure": round(depth * 0.1 + random.uniform(-5, 5), 1),  # High pressure
            "turbidity": round(random.uniform(0.1, 2.0), 1),  # Clear water
            "conductivity": random.randint(45000, 55000),  # High salinity
            "salinity": round(random.uniform(34.0, 35.5), 1),
            "depth": depth,
            "light_penetration": 0.0,  # No light
            "methane_concentration": round(random.uniform(0.1, 15.0), 2),
            "sulfide_concentration": round(random.uniform(0.0, 8.0), 2),
            "hydrothermal_activity": random.choice([True, False])
        }
    elif sample_type in ["seawater", "estuary_water", "marsh_water"]:
        # Marine conditions
        return {
            "temperature": round(random.uniform(12.0, 28.0), 1),
            "ph": round(random.uniform(7.9, 8.3), 1),
            "dissolved_oxygen": round(random.uniform(6.0, 12.0), 1),
            "turbidity": round(random.uniform(1.0, 8.0), 1),
            "conductivity": random.randint(35000, 50000),
            "salinity": round(random.uniform(30.0, 38.0), 1),
            "depth": depth,
            "wave_action": round(random.uniform(0.5, 3.0), 1),
            "tidal_range": round(random.uniform(0.5, 4.0), 1),
            "chlorophyll_a": round(random.uniform(0.5, 15.0), 2)
        }
    elif sample_type in ["freshwater", "alpine_water"]:
        # Freshwater conditions
        return {
            "temperature": round(random.uniform(4.0, 22.0), 1),
            "ph": round(random.uniform(6.5, 8.5), 1),
            "dissolved_oxygen": round(random.uniform(8.0, 14.0), 1),  # Higher oxygen
            "turbidity": round(random.uniform(0.5, 12.0), 1),
            "conductivity": random.randint(50, 500),  # Low conductivity
            "salinity": round(random.uniform(0.0, 0.5), 1),  # Very low salinity
            "depth": depth,
            "alkalinity": round(random.uniform(20, 200), 1),
            "hardness": round(random.uniform(50, 300), 1),
            "nitrate": round(random.uniform(0.1, 5.0), 2),
            "phosphate": round(random.uniform(0.01, 0.5), 3)
        }
    elif sample_type == "soil":
        # Soil conditions
        return {
            "temperature": round(random.uniform(8.0, 25.0), 1),
            "ph": round(random.uniform(5.5, 8.0), 1),
            "moisture_content": round(random.uniform(15.0, 45.0), 1),
            "organic_matter": round(random.uniform(2.0, 12.0), 1),
            "nitrogen": round(random.uniform(0.1, 2.5), 2),
            "phosphorus": round(random.uniform(5.0, 50.0), 1),
            "potassium": round(random.uniform(50, 300), 1),
            "carbon_nitrogen_ratio": round(random.uniform(8.0, 25.0), 1),
            "bulk_density": round(random.uniform(1.0, 1.8), 2),
            "porosity": round(random.uniform(35.0, 60.0), 1),
            "microbial_biomass": round(random.uniform(100, 800), 1)
        }
    elif sample_type in ["river_water", "urban_water"]:
        # River/urban water conditions
        return {
            "temperature": round(random.uniform(10.0, 25.0), 1),
            "ph": round(random.uniform(6.8, 8.2), 1),
            "dissolved_oxygen": round(random.uniform(3.0, 10.0), 1),
            "turbidity": round(random.uniform(5.0, 25.0), 1),  # Higher turbidity
            "conductivity": random.randint(200, 1500),
            "salinity": round(random.uniform(0.1, 2.0), 1),
            "depth": depth,
            "flow_rate": round(random.uniform(0.1, 3.0), 2),
            "nitrate": round(random.uniform(1.0, 15.0), 2),  # Higher nutrients
            "phosphate": round(random.uniform(0.1, 2.0), 2),
            "coliform_count": random.randint(100, 10000),  # Pollution indicator
            "heavy_metals": round(random.uniform(0.01, 0.5), 3)
        }
    else:
        # Default marine
        return {
            "temperature": round(random.uniform(12.0, 25.0), 1),
            "ph": round(random.uniform(7.8, 8.3), 1),
            "dissolved_oxygen": round(random.uniform(6.0, 12.0), 1),
            "turbidity": round(random.uniform(1.0, 8.0), 1),
            "conductivity": random.randint(35000, 50000),
            "salinity": round(random.uniform(30.0, 38.0), 1),
            "depth": depth
        }

@app.get("/")
async def root():
    return {"message": "eDNA Analysis API", "version": "1.0.0"}

def generate_unique_chart_data(file_info: dict, species_data: list) -> dict:
    """Generate unique chart data for each FASTA file"""
    
    # Use file ID for consistent randomization
    file_seed = hash(file_info["id"]) % 2**32
    random.seed(file_seed)
    
    # Generate unique radar chart data for environmental and biodiversity metrics
    radar_data = []
    
    # Define metrics suitable for radar chart (0-100 scale)
    metrics = [
        "Biodiversity Index",
        "Species Richness", 
        "Environmental Health",
        "Water Quality",
        "Ecosystem Stability",
        "Novel Species Rate",
        "Genetic Diversity",
        "Habitat Complexity"
    ]
    
    # Generate values based on sample type and file characteristics
    for metric in metrics:
        # Base values depend on environment type
        if file_info["sample_type"] == "deep_seawater":
            base_ranges = {
                "Biodiversity Index": (40, 70),
                "Species Richness": (30, 60),
                "Environmental Health": (70, 95),
                "Water Quality": (80, 98),
                "Ecosystem Stability": (85, 95),
                "Novel Species Rate": (70, 95),
                "Genetic Diversity": (60, 85),
                "Habitat Complexity": (50, 75)
            }
        elif file_info["sample_type"] in ["seawater", "estuary_water", "marsh_water"]:
            base_ranges = {
                "Biodiversity Index": (65, 90),
                "Species Richness": (70, 95),
                "Environmental Health": (60, 85),
                "Water Quality": (70, 90),
                "Ecosystem Stability": (60, 80),
                "Novel Species Rate": (40, 70),
                "Genetic Diversity": (70, 90),
                "Habitat Complexity": (75, 95)
            }
        elif file_info["sample_type"] in ["freshwater", "alpine_water"]:
            base_ranges = {
                "Biodiversity Index": (70, 85),
                "Species Richness": (60, 80),
                "Environmental Health": (75, 95),
                "Water Quality": (80, 95),
                "Ecosystem Stability": (70, 90),
                "Novel Species Rate": (30, 60),
                "Genetic Diversity": (65, 85),
                "Habitat Complexity": (60, 80)
            }
        elif file_info["sample_type"] == "soil":
            base_ranges = {
                "Biodiversity Index": (80, 95),
                "Species Richness": (85, 98),
                "Environmental Health": (70, 90),
                "Water Quality": (50, 75),
                "Ecosystem Stability": (75, 90),
                "Novel Species Rate": (50, 80),
                "Genetic Diversity": (80, 95),
                "Habitat Complexity": (85, 98)
            }
        else:  # river_water, urban_water
            base_ranges = {
                "Biodiversity Index": (30, 60),
                "Species Richness": (25, 55),
                "Environmental Health": (25, 50),
                "Water Quality": (20, 45),
                "Ecosystem Stability": (30, 60),
                "Novel Species Rate": (15, 40),
                "Genetic Diversity": (40, 70),
                "Habitat Complexity": (35, 65)
            }
        
        # Generate value within range with file-specific variation
        min_val, max_val = base_ranges[metric]
        value = random.randint(min_val, max_val)
        
        radar_data.append({
            "metric": metric,
            "value": value,
            "fullMark": 100
        })
    
    # Generate unique clustering data
    cluster_count = random.randint(4, 7)
    clustering_data = []
    cluster_names = ["Cluster 1", "Cluster 2", "Cluster 3", "Cluster 4", "Cluster 5", "Cluster 6", "Outliers"]
    
    for i in range(cluster_count):
        clustering_data.append({
            "cluster": cluster_names[i],
            "x": random.randint(5, 45),
            "y": random.randint(5, 40),
            "z": random.randint(5, 35),
            "size": random.randint(20, 150),
            "species": random.choice(["Marine Fish", "Algae", "Bacteria", "Plankton", "Fungi", "Novel Species"])
        })
    
    # Add outliers cluster for novel species
    if any(s.get("is_novel", False) for s in species_data):
        clustering_data.append({
            "cluster": "Outliers",
            "x": random.randint(40, 50),
            "y": random.randint(5, 15),
            "z": random.randint(25, 35),
            "size": random.randint(15, 45),
            "species": "Novel Species"
        })
    
    # Generate unique cluster size distribution
    cluster_size_data = []
    for cluster in clustering_data:
        cluster_size_data.append({
            "name": cluster["cluster"],
            "sequences": random.randint(50, 500),
            "abundance": random.randint(5, 35)
        })
    
    # Generate unique environmental correlation data
    environmental_data = []
    for i in range(6):
        environmental_data.append({
            "temp": random.randint(5, 30),
            "depth": random.randint(5, 200),
            "cluster": f"Cluster {chr(65 + i % 3)}",  # A, B, C
            "ph": round(random.uniform(7.0, 8.5), 1),
            "salinity": random.randint(30, 40)
        })
    
    # Generate unique richness data
    richness_data = []
    site_count = random.randint(6, 10)
    for i in range(site_count):
        richness_data.append({
            "site": f"Site {i + 1}",
            "richness": random.randint(25, 60),
            "diversity": round(random.uniform(2.0, 4.0), 1)
        })
    
    # Generate unique abundance treemap data
    abundance_treemap_data = []
    categories = ["Vertebrates", "Plants", "Microorganisms", "Invertebrates", "Fungi", "Unknown"]
    
    for species in species_data[:8]:  # Top 8 species
        abundance_treemap_data.append({
            "name": species["scientific_name"].split()[0],
            "value": int(species["abundance"] * random.uniform(8, 15)),
            "category": random.choice(categories)
        })
    
    # Generate unique prediction data
    quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025']
    prediction_data = []
    base_value = random.randint(100, 150)
    
    for i, quarter in enumerate(quarters):
        trend_factor = 1 + (i * 0.05) + random.uniform(-0.1, 0.1)
        expected = int(base_value * trend_factor)
        prediction_data.append({
            "quarter": quarter,
            "lower": int(expected * 0.8),
            "expected": expected,
            "upper": int(expected * 1.2)
        })
    
    # Generate unique outlier analysis data
    outlier_data = []
    similarity_values = [0.95, 0.88, 0.75, 0.45, 0.38, 0.25]
    confidence_values = [0.92, 0.85, 0.78, 0.52, 0.48, 0.35]
    
    # Default species names if no species data available
    default_known_species = ["Salmo trutta", "Gadus morhua", "Pleuronectes platessa", "Vibrio fischeri", "Prochlorococcus marinus"]
    known_species_pool = [s["scientific_name"] for s in species_data if not s.get("is_novel", False)] or default_known_species
    
    for i, (sim, conf) in enumerate(zip(similarity_values, confidence_values)):
        species_type = "Novel" if sim < 0.6 else "Known"
        species_name = f"Unknown sp. {i-2}" if species_type == "Novel" else random.choice(known_species_pool)
        
        outlier_data.append({
            "similarity": sim + random.uniform(-0.05, 0.05),
            "confidence": conf + random.uniform(-0.05, 0.05),
            "type": species_type,
            "species": species_name
        })
    
    return {
        "radar_data": radar_data,
        "clustering_data": clustering_data,
        "cluster_size_data": cluster_size_data,
        "environmental_data": environmental_data,
        "richness_data": richness_data,
        "abundance_treemap_data": abundance_treemap_data,
        "prediction_data": prediction_data,
        "outlier_data": outlier_data
    }

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
    
    # Use file ID as seed for consistent but different data per file
    random.seed(hash(file_id) % 2**32)
    
    # Generate environment-specific analysis report with consistent seeding
    file_seed = hash(file_id) % 2**32
    species_data = generate_species_data_by_environment(file_info["sample_type"], file_info["depth"], file_seed)
    environmental_data = generate_environmental_data_by_type(file_info["sample_type"], file_info["depth"])
    
    # Calculate summary statistics
    total_species = len(species_data)
    total_sequences = sum(s["sequence_count"] for s in species_data)
    total_biomass = sum(s["biomass_estimate"] for s in species_data)
    avg_confidence = sum(s["confidence_score"] for s in species_data) / total_species
    
    # Biodiversity indices
    shannon_diversity = round(random.uniform(1.5, 3.2), 3)
    simpson_diversity = round(random.uniform(0.6, 0.9), 3)
    
    # Generate specialized analysis sections based on environment type
    specialized_analysis = generate_specialized_analysis(file_info["sample_type"], species_data, environmental_data, file_info["depth"])
    
    # Generate unique chart data for this file
    chart_data = generate_unique_chart_data(file_info, species_data)
    
    analysis_report = {
        "file_info": file_info,
        "analysis_metadata": {
            "analysis_id": f"analysis_{uuid.uuid4().hex[:12]}",
            "processed_date": datetime.now().isoformat(),
            "processing_time": f"{random.randint(45, 180)} seconds",
            "pipeline_version": "v2.1.3",
            "database_version": "NCBI_nt_2024.1",
            "analysis_type": get_analysis_type(file_info["sample_type"], file_info["depth"])
        },
        "summary_statistics": {
            "total_species_detected": total_species,
            "total_sequences_analyzed": total_sequences,
            "total_biomass_estimate": round(total_biomass, 3),
            "average_confidence_score": round(avg_confidence, 3),
            "shannon_diversity_index": shannon_diversity,
            "simpson_diversity_index": simpson_diversity,
            "novel_species_count": len([s for s in species_data if s.get("is_novel", False)]),
            "novel_species_percentage": round((len([s for s in species_data if s.get("is_novel", False)]) / total_species) * 100, 1)
        },
        "species_composition": species_data,
        "environmental_parameters": environmental_data,
        "taxonomic_breakdown": {
            "kingdoms": {
                "Animalia": len([s for s in species_data if s["kingdom"] == "Animalia"]),
                "Plantae": len([s for s in species_data if s["kingdom"] == "Plantae"]),
                "Bacteria": len([s for s in species_data if s["kingdom"] == "Bacteria"]),
                "Fungi": len([s for s in species_data if s["kingdom"] == "Fungi"]),
                "Archaea": len([s for s in species_data if s["kingdom"] == "Archaea"]),
                "Chromista": len([s for s in species_data if s["kingdom"] == "Chromista"]),
                "Unknown": len([s for s in species_data if s["kingdom"] == "Unknown"])
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
        },
        "specialized_analysis": specialized_analysis,
        "chart_data": chart_data  # Add unique chart data for each file
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