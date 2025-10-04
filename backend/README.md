# eDNA Analysis Backend API

FastAPI backend for eDNA analysis with dummy data for 10 FASTA files.

## Quick Start

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the API Server

```bash
python start.py
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Get Available FASTA Files
```
GET /fasta-files
```
Returns list of 10 available FASTA files with metadata.

### Get Analysis Report
```
GET /analysis/{file_id}
```
Returns detailed analysis report for a specific FASTA file including:
- Species composition
- Environmental parameters  
- Biodiversity indices
- Quality metrics
- Taxonomic breakdown

### Get Species Details
```
GET /analysis/{file_id}/species
GET /analysis/{file_id}/species?species_id={species_id}
```
Returns species information for a file or specific species.

### Get Environmental Analysis
```
GET /analysis/{file_id}/environmental
```
Returns environmental correlation analysis.

### Compare Samples
```
GET /comparison?file_ids=fasta_001,fasta_002
```
Compare multiple samples.

## Sample Data

The API generates realistic dummy data including:
- 10 FASTA files from different environments (marine, freshwater, soil, etc.)
- Species detection with confidence scores
- Environmental parameters (temperature, pH, dissolved oxygen, etc.)
- Biodiversity indices (Shannon, Simpson)
- Quality metrics and temporal analysis

## Integration with Frontend

The frontend React app connects to this API to:
1. Load available FASTA files
2. Display detailed analysis reports
3. Show interactive charts and visualizations
4. Enable sample comparison

Make sure both backend (port 8000) and frontend (port 3000) are running for full functionality.