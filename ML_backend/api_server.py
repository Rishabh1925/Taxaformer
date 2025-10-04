"""
OceanEYE API Server
FastAPI backend for eDNA analysis pipeline integration
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field

from oceaneye_pipeline import OceanEYEPipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="OceanEYE eDNA Analysis API",
    description="Advanced eDNA analysis using nucleotide transformers and ML clustering",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance
pipeline = None
executor = ThreadPoolExecutor(max_workers=2)

# Data models
class AnalysisRequest(BaseModel):
    """Request model for eDNA analysis"""
    sample_size: Optional[int] = Field(None, description="Maximum sequences to analyze")
    fetch_taxonomy: bool = Field(False, description="Fetch taxonomy from NCBI")
    min_cluster_size: int = Field(10, description="Minimum cluster size for HDBSCAN")
    cluster_epsilon: float = Field(0.1, description="Cluster selection epsilon")

class AnalysisStatus(BaseModel):
    """Analysis job status model"""
    job_id: str
    status: str  # 'pending', 'running', 'completed', 'failed'
    progress: float
    message: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    results: Optional[Dict[str, Any]] = None

class BiodiversityMetrics(BaseModel):
    """Biodiversity metrics response model"""
    total_sequences: int
    total_clusters: int
    novel_candidates: int
    total_species: Optional[int] = None
    shannon_diversity: Optional[float] = None
    simpson_diversity: Optional[float] = None
    depth_range: Optional[Dict[str, float]] = None
    temperature_range: Optional[Dict[str, float]] = None

class SpeciesInfo(BaseModel):
    """Species information model"""
    species_name: str
    abundance: int
    shannon_score: float
    confidence_score: float
    locations: List[Dict[str, float]]
    mean_location: Dict[str, float]
    environmental_parameters: Dict[str, Any]
    cluster_distribution: Dict[str, int]

# Job tracking
analysis_jobs: Dict[str, AnalysisStatus] = {}

@app.on_event("startup")
async def startup_event():
    """Initialize the pipeline on startup"""
    global pipeline
    try:
        pipeline = OceanEYEPipeline()
        logger.info("OceanEYE pipeline initialized")
    except Exception as e:
        logger.error(f"Failed to initialize pipeline: {e}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "OceanEYE eDNA Analysis API",
        "version": "1.0.0",
        "status": "operational",
        "pipeline_ready": pipeline is not None
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "pipeline_initialized": pipeline is not None,
        "active_jobs": len([job for job in analysis_jobs.values() if job.status == "running"])
    }

@app.post("/upload-fasta")
async def upload_fasta(file: UploadFile = File(...)):
    """Upload FASTA file for analysis"""
    if not file.filename.endswith(('.fasta', '.fa', '.fas')):
        raise HTTPException(status_code=400, detail="File must be in FASTA format")
    
    # Create uploads directory
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Save uploaded file
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    logger.info(f"FASTA file uploaded: {file.filename}")
    
    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "file_path": str(file_path),
        "file_size": len(content)
    }

@app.post("/analyze", response_model=Dict[str, str])
async def start_analysis(
    background_tasks: BackgroundTasks,
    request: AnalysisRequest,
    fasta_file: str = "uploads/example.fasta"
):
    """Start eDNA analysis job"""
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")
    
    if not Path(fasta_file).exists():
        raise HTTPException(status_code=404, detail="FASTA file not found")
    
    # Generate job ID
    job_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Create job status
    job_status = AnalysisStatus(
        job_id=job_id,
        status="pending",
        progress=0.0,
        message="Analysis queued",
        started_at=datetime.now()
    )
    analysis_jobs[job_id] = job_status
    
    # Start analysis in background
    background_tasks.add_task(
        run_analysis_job,
        job_id,
        fasta_file,
        request
    )
    
    return {
        "job_id": job_id,
        "status": "started",
        "message": "Analysis job queued successfully"
    }

async def run_analysis_job(job_id: str, fasta_file: str, request: AnalysisRequest):
    """Run analysis job in background"""
    job = analysis_jobs[job_id]
    
    try:
        # Update status
        job.status = "running"
        job.message = "Loading model..."
        job.progress = 10.0
        
        # Load model if not already loaded
        if pipeline.model is None:
            await asyncio.get_event_loop().run_in_executor(
                executor, pipeline.load_model
            )
        
        job.message = "Loading FASTA data..."
        job.progress = 20.0
        
        # Load data
        await asyncio.get_event_loop().run_in_executor(
            executor, 
            pipeline.load_fasta_data,
            fasta_file,
            request.sample_size
        )
        
        job.message = "Generating DNA embeddings..."
        job.progress = 40.0
        
        # Generate embeddings
        await asyncio.get_event_loop().run_in_executor(
            executor, pipeline.generate_dna_embeddings
        )
        
        job.message = "Processing environmental context..."
        job.progress = 60.0
        
        await asyncio.get_event_loop().run_in_executor(
            executor, pipeline.generate_context_embeddings
        )
        
        await asyncio.get_event_loop().run_in_executor(
            executor, pipeline.fuse_embeddings
        )
        
        job.message = "Performing clustering analysis..."
        job.progress = 80.0
        
        # Clustering
        await asyncio.get_event_loop().run_in_executor(
            executor,
            pipeline.perform_clustering,
            request.min_cluster_size,
            request.cluster_epsilon
        )
        
        job.message = "Generating reports..."
        job.progress = 90.0
        
        # Generate results
        output_dir = f"results/{job_id}"
        results = await asyncio.get_event_loop().run_in_executor(
            executor,
            pipeline.export_results,
            output_dir
        )
        
        # Complete job
        job.status = "completed"
        job.progress = 100.0
        job.message = "Analysis completed successfully"
        job.completed_at = datetime.now()
        job.results = results
        
        logger.info(f"Analysis job {job_id} completed successfully")
        
    except Exception as e:
        job.status = "failed"
        job.message = f"Analysis failed: {str(e)}"
        job.completed_at = datetime.now()
        logger.error(f"Analysis job {job_id} failed: {e}")

@app.get("/jobs/{job_id}", response_model=AnalysisStatus)
async def get_job_status(job_id: str):
    """Get analysis job status"""
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return analysis_jobs[job_id]

@app.get("/jobs", response_model=List[AnalysisStatus])
async def list_jobs():
    """List all analysis jobs"""
    return list(analysis_jobs.values())

@app.get("/results/{job_id}/biodiversity", response_model=BiodiversityMetrics)
async def get_biodiversity_metrics(job_id: str):
    """Get biodiversity metrics for completed job"""
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = analysis_jobs[job_id]
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    # Load results from file
    results_file = f"results/{job_id}/biodiversity_report.json"
    if not Path(results_file).exists():
        raise HTTPException(status_code=404, detail="Results file not found")
    
    with open(results_file, 'r') as f:
        data = json.load(f)
    
    return BiodiversityMetrics(**data['summary'])

@app.get("/results/{job_id}/species")
async def get_species_report(job_id: str):
    """Get detailed species report"""
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = analysis_jobs[job_id]
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    results_file = f"results/{job_id}/biodiversity_report.json"
    if not Path(results_file).exists():
        raise HTTPException(status_code=404, detail="Results file not found")
    
    with open(results_file, 'r') as f:
        data = json.load(f)
    
    return data['species']

@app.get("/results/{job_id}/download/{file_type}")
async def download_results(job_id: str, file_type: str):
    """Download result files"""
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = analysis_jobs[job_id]
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    file_mapping = {
        "report": f"results/{job_id}/biodiversity_report.json",
        "novel": f"results/{job_id}/novel_candidates.fasta",
        "clusters": f"results/{job_id}/cluster_analysis.json",
        "csv": f"results/{job_id}/analysis_results.csv"
    }
    
    if file_type not in file_mapping:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    file_path = file_mapping[file_type]
    if not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=f"{job_id}_{file_type}.{file_path.split('.')[-1]}"
    )

@app.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete analysis job and results"""
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Remove job from tracking
    del analysis_jobs[job_id]
    
    # Clean up result files
    results_dir = Path(f"results/{job_id}")
    if results_dir.exists():
        import shutil
        shutil.rmtree(results_dir)
    
    return {"message": "Job deleted successfully"}

@app.get("/demo/quick-analysis")
async def demo_quick_analysis():
    """Demo endpoint with pre-computed results"""
    return {
        "status": "completed",
        "summary": {
            "total_sequences": 500,
            "total_clusters": 23,
            "novel_candidates": 12,
            "total_species": 45,
            "shannon_diversity": 2.847,
            "simpson_diversity": 0.923
        },
        "top_species": [
            {
                "name": "Prochlorococcus marinus",
                "abundance": 89,
                "confidence": 0.94,
                "novelty": 0.12
            },
            {
                "name": "Synechococcus sp.",
                "abundance": 67,
                "confidence": 0.87,
                "novelty": 0.08
            },
            {
                "name": "Pelagibacter ubique",
                "abundance": 54,
                "confidence": 0.91,
                "novelty": 0.15
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )