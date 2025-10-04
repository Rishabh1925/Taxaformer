# OceanEYE ML Backend

Advanced eDNA analysis pipeline using nucleotide transformers and machine learning clustering for marine biodiversity assessment.

## 🧬 Features

- **Nucleotide Transformer Embeddings**: Uses InstaDeepAI's nucleotide-transformer-v2-500m-multi-species
- **Context-Aware Analysis**: Integrates environmental metadata (depth, temperature, location)
- **Advanced Clustering**: HDBSCAN clustering for species identification
- **Biodiversity Metrics**: Shannon diversity, Simpson diversity, confidence scores
- **Novel Species Detection**: Identifies potential novel species as outliers
- **Comprehensive Reporting**: JSON reports with species, locations, and temporal data
- **FastAPI Integration**: RESTful API for web application integration

## 📋 Requirements

### System Requirements
- Python 3.8+
- 8GB+ RAM (16GB+ recommended for large datasets)
- GPU support optional but recommended for large-scale analysis

### Dependencies
```bash
pip install -r requirements.txt
```

Key dependencies:
- `torch` - PyTorch for deep learning
- `transformers` - HuggingFace transformers library
- `biopython` - Bioinformatics tools
- `hdbscan` - Hierarchical clustering
- `fastapi` - Web API framework
- `pandas`, `numpy`, `scikit-learn` - Data science stack

## 🚀 Quick Start

### 1. Basic Pipeline Usage

```python
from oceaneye_pipeline import OceanEYEPipeline

# Initialize pipeline
pipeline = OceanEYEPipeline()

# Run complete analysis
results = pipeline.run_full_pipeline(
    fasta_path="your_sequences.fasta",
    sample_size=500,  # Optional: limit sequences
    fetch_taxonomy=False,  # Set True to fetch from NCBI
    output_dir="results"
)

print(results)
```

### 2. Step-by-Step Analysis

```python
# Initialize
pipeline = OceanEYEPipeline()

# Load model (downloads ~2GB model first time)
pipeline.load_model()

# Load and prepare data
pipeline.load_fasta_data("sequences.fasta", sample_size=100)

# Generate embeddings
pipeline.generate_dna_embeddings()
pipeline.generate_context_embeddings()
pipeline.fuse_embeddings()

# Perform clustering
pipeline.perform_clustering(min_cluster_size=10)

# Export results
files = pipeline.export_results("output_directory")
```

### 3. API Server

```bash
# Start the FastAPI server
python api_server.py

# Server runs on http://localhost:8001
# API documentation at http://localhost:8001/docs
```

### 4. Example Usage

```bash
# Run examples
python example_usage.py
```

## 📊 Pipeline Workflow

```
FASTA File Input
       ↓
1. Sequence Loading & Preprocessing
       ↓
2. Environmental Metadata Generation
   (latitude, longitude, depth, temperature, pH, salinity)
       ↓
3. Nucleotide Transformer Embeddings
   (DNA sequences → high-dimensional vectors)
       ↓
4. Context Embedding Generation
   (Environmental features → normalized vectors)
       ↓
5. Embedding Fusion
   (DNA + Environmental → context-aware embeddings)
       ↓
6. HDBSCAN Clustering
   (Species identification & novel detection)
       ↓
7. Biodiversity Analysis
   (Shannon diversity, confidence scores, abundance)
       ↓
8. Report Generation
   (JSON reports, FASTA files, visualizations)
```

## 🔬 Analysis Outputs

### 1. Biodiversity Report (`biodiversity_report.json`)
```json
{
  "metadata": {
    "pipeline_version": "1.0.0",
    "analysis_date": "2024-01-15T10:30:00",
    "model_used": "nucleotide-transformer-v2-500m-multi-species",
    "total_sequences_analyzed": 500
  },
  "summary": {
    "total_sequences": 500,
    "total_clusters": 23,
    "novel_candidates": 12,
    "total_species": 45,
    "shannon_diversity": 2.847,
    "simpson_diversity": 0.923
  },
  "species": {
    "Prochlorococcus marinus": {
      "shannon_score": 0.234,
      "confidence_score": 0.94,
      "abundance": 89,
      "mean_location": {"latitude": 36.5, "longitude": -121.8, "depth": 25.3},
      "environmental_parameters": {...},
      "sequences": [...],
      "cluster_ids": [1, 1, 2, ...]
    }
  }
}
```

### 2. Novel Candidates (`novel_candidates.fasta`)
FASTA file containing sequences identified as potential novel species (outliers from clustering).

### 3. Cluster Analysis (`cluster_analysis.json`)
Detailed breakdown of each cluster with dominant organisms and diversity metrics.

### 4. Raw Results (`analysis_results.csv`)
Complete dataset with embeddings, cluster assignments, and metadata.

## 🌐 API Endpoints

### Core Endpoints
- `POST /upload-fasta` - Upload FASTA file
- `POST /analyze` - Start analysis job
- `GET /jobs/{job_id}` - Check job status
- `GET /results/{job_id}/biodiversity` - Get biodiversity metrics
- `GET /results/{job_id}/species` - Get species report
- `GET /results/{job_id}/download/{file_type}` - Download result files

### Example API Usage
```bash
# Upload file
curl -X POST "http://localhost:8001/upload-fasta" \
     -F "file=@sequences.fasta"

# Start analysis
curl -X POST "http://localhost:8001/analyze" \
     -H "Content-Type: application/json" \
     -d '{"sample_size": 100, "min_cluster_size": 5}'

# Check status
curl "http://localhost:8001/jobs/analysis_20241201_143022"

# Get results
curl "http://localhost:8001/results/analysis_20241201_143022/biodiversity"
```

## ⚙️ Configuration

### Pipeline Parameters
- `model_name`: HuggingFace model identifier
- `sample_size`: Maximum sequences to analyze
- `min_cluster_size`: Minimum cluster size for HDBSCAN
- `cluster_selection_epsilon`: Clustering sensitivity
- `fetch_taxonomy`: Whether to fetch taxonomy from NCBI

### Environmental Variables
```bash
export HUGGINGFACE_TOKEN="your_hf_token"  # Optional: for private models
export ENTREZ_EMAIL="your@email.com"      # Required for NCBI API
export CUDA_VISIBLE_DEVICES="0"           # GPU selection
```

## 🔧 Advanced Usage

### Custom Environmental Features
```python
# Add custom environmental parameters
pipeline.df['custom_feature'] = your_data
pipeline.generate_context_embeddings()  # Will include new features
```

### Custom Clustering Parameters
```python
# Fine-tune clustering
pipeline.perform_clustering(
    min_cluster_size=5,        # Smaller clusters
    cluster_selection_epsilon=0.05  # More sensitive
)
```

### Batch Processing
```python
# Process multiple files
for fasta_file in fasta_files:
    results = pipeline.run_full_pipeline(
        fasta_path=fasta_file,
        output_dir=f"results/{fasta_file.stem}"
    )
```

## 📈 Performance Notes

### Memory Usage
- Model loading: ~4GB RAM
- Embeddings: ~100MB per 1000 sequences
- Clustering: Scales with O(n²) for large datasets

### Processing Time
- Model loading: 30-60 seconds (first time)
- Embedding generation: ~1-2 seconds per sequence
- Clustering: 10-30 seconds for 1000 sequences
- Total: ~30-60 minutes for 1000 sequences

### Optimization Tips
- Use GPU for faster embedding generation
- Limit `sample_size` for initial testing
- Batch process large datasets
- Cache embeddings for repeated analysis

## 🐛 Troubleshooting

### Common Issues

1. **Model Download Fails**
   ```bash
   # Set HuggingFace cache directory
   export HF_HOME="/path/to/cache"
   ```

2. **Out of Memory**
   ```python
   # Reduce sample size or batch size
   pipeline.run_full_pipeline(sample_size=100)
   ```

3. **NCBI API Errors**
   ```python
   # Skip taxonomy fetching
   pipeline.run_full_pipeline(fetch_taxonomy=False)
   ```

4. **Clustering Issues**
   ```python
   # Adjust clustering parameters
   pipeline.perform_clustering(min_cluster_size=3)
   ```

## 📚 References

- [Nucleotide Transformer Paper](https://www.biorxiv.org/content/10.1101/2023.01.11.523679v2)
- [HDBSCAN Documentation](https://hdbscan.readthedocs.io/)
- [BioPython Tutorial](https://biopython.org/wiki/Documentation)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the example usage scripts

---

**OceanEYE ML Backend** - Advanced eDNA analysis for marine biodiversity research 🧬🌊