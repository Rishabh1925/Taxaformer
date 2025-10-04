"""
OceanEYE ML Pipeline - Production Backend
Based on oceaneye-2-0.ipynb notebook

This module implements the complete eDNA analysis pipeline:
1. FASTA file loading and preprocessing
2. Nucleotide Transformer embeddings generation
3. Environmental metadata integration
4. HDBSCAN clustering for species identification
5. Biodiversity metrics calculation (Shannon, confidence, abundance)
6. JSON report generation with location and temporal data
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
from pathlib import Path

# Bio libraries
from Bio import SeqIO, Entrez
from Bio.Seq import Seq

# ML libraries
import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score

# Clustering libraries
import hdbscan
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.stats import entropy

# Progress tracking
from tqdm.auto import tqdm
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OceanEYEPipeline:
    """
    Complete eDNA analysis pipeline for marine biodiversity assessment
    """
    
    def __init__(self, 
                 model_name: str = "InstaDeepAI/nucleotide-transformer-v2-500m-multi-species",
                 entrez_email: str = "research@oceaneye.ai",
                 device: str = "auto"):
        """
        Initialize the OceanEYE pipeline
        
        Args:
            model_name: HuggingFace model identifier for nucleotide transformer
            entrez_email: Email for NCBI Entrez API access
            device: Computing device ('auto', 'cpu', 'cuda')
        """
        self.model_name = model_name
        self.entrez_email = entrez_email
        self.device = self._setup_device(device)
        
        # Initialize components
        self.tokenizer = None
        self.model = None
        self.scaler = MinMaxScaler()
        
        # Data storage
        self.df = None
        self.dna_embeddings = None
        self.context_embeddings = None
        self.context_aware_embeddings = None
        
        logger.info(f"OceanEYE Pipeline initialized with device: {self.device}")
    
    def _setup_device(self, device: str) -> torch.device:
        """Setup computing device"""
        if device == "auto":
            return torch.device("cuda" if torch.cuda.is_available() else "cpu")
        return torch.device(device)
    
    def load_model(self, hf_token: Optional[str] = None) -> None:
        """
        Load the nucleotide transformer model
        
        Args:
            hf_token: HuggingFace authentication token (optional)
        """
        logger.info(f"Loading model: {self.model_name}")
        
        try:
            # Login to HuggingFace if token provided
            if hf_token:
                from huggingface_hub import login
                login(token=hf_token)
                logger.info("Successfully logged in to HuggingFace")
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, 
                trust_remote_code=True
            )
            
            base_model = AutoModelForMaskedLM.from_pretrained(
                self.model_name, 
                trust_remote_code=True
            )
            self.model = base_model.esm
            
            # Move to device
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"Model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def load_fasta_data(self, 
                       fasta_path: str, 
                       sample_size: Optional[int] = None,
                       simulate_metadata: bool = True) -> pd.DataFrame:
        """
        Load sequences from FASTA file and prepare DataFrame
        
        Args:
            fasta_path: Path to FASTA file
            sample_size: Maximum number of sequences to load (None for all)
            simulate_metadata: Whether to generate simulated environmental metadata
            
        Returns:
            DataFrame with sequences and metadata
        """
        logger.info(f"Loading FASTA data from: {fasta_path}")
        print(f"🔍 DEBUG: Attempting to load FASTA file: {fasta_path}")
        print(f"🔍 DEBUG: File exists: {os.path.exists(fasta_path)}")
        print(f"🔍 DEBUG: Absolute path: {os.path.abspath(fasta_path)}")
        print(f"🔍 DEBUG: Current working directory: {os.getcwd()}")
        
        sequences = []
        try:
            print(f"🔍 DEBUG: Starting FASTA parsing...")
            sequence_count = 0
            
            for record in SeqIO.parse(fasta_path, "fasta"):
                sequences.append({
                    'Sequence_ID': record.id,
                    'sequence': str(record.seq)
                })
                sequence_count += 1
                
                # Show first few sequences for debugging
                if sequence_count <= 3:
                    print(f"🔍 DEBUG: Sequence {sequence_count}: {record.id[:50]}...")
                    print(f"🔍 DEBUG: Length: {len(record.seq)} bp")
                
                if sample_size and len(sequences) >= sample_size:
                    print(f"🔍 DEBUG: Reached sample size limit: {sample_size}")
                    break
            
            print(f"🔍 DEBUG: Total sequences parsed: {sequence_count}")
            
            if not sequences:
                raise ValueError("No sequences found in FASTA file")
            
            print(f"🔍 DEBUG: Creating DataFrame with {len(sequences)} sequences...")
            self.df = pd.DataFrame(sequences)
            print(f"🔍 DEBUG: DataFrame created with shape: {self.df.shape}")
            
            logger.info(f"Loaded {len(self.df)} sequences")
            
            # Add simulated environmental metadata
            if simulate_metadata:
                print(f"🔍 DEBUG: Adding environmental metadata...")
                self._add_environmental_metadata()
                print(f"🔍 DEBUG: Environmental metadata added. New columns: {list(self.df.columns)}")
            
            return self.df
            
        except Exception as e:
            print(f"❌ DEBUG: Error in load_fasta_data: {e}")
            print(f"❌ DEBUG: Error type: {type(e).__name__}")
            logger.error(f"Failed to load FASTA data: {e}")
            raise
    
    def _add_environmental_metadata(self) -> None:
        """Add simulated environmental metadata to DataFrame"""
        print(f"🔍 DEBUG: Adding environmental metadata for {len(self.df)} samples")
        num_samples = len(self.df)
        
        # Geographic coordinates (global marine distribution)
        print(f"🔍 DEBUG: Adding geographic coordinates...")
        self.df['latitude'] = np.random.uniform(-60, 60, num_samples)
        self.df['longitude'] = np.random.uniform(-180, 180, num_samples)
        
        # Environmental parameters
        print(f"🔍 DEBUG: Adding environmental parameters...")
        self.df['depth'] = np.random.randint(1, 5000, num_samples)
        self.df['temperature'] = np.random.uniform(1, 30, num_samples)
        self.df['salinity'] = np.random.uniform(30, 40, num_samples)
        self.df['pH'] = np.random.uniform(7.5, 8.5, num_samples)
        
        print(f"🔍 DEBUG: Environmental metadata added successfully")
        
        # Temporal metadata
        self.df['collection_date'] = pd.date_range(
            start='2023-01-01', 
            end='2024-12-31', 
            periods=num_samples
        )
        
        logger.info("Added simulated environmental metadata")
    
    def fetch_taxonomic_data(self, batch_size: int = 100, delay: float = 1.0) -> None:
        """
        Fetch taxonomic information from NCBI Entrez
        
        Args:
            batch_size: Number of sequences to process per batch
            delay: Delay between API calls (seconds)
        """
        logger.info("Fetching taxonomic data from NCBI...")
        
        Entrez.email = self.entrez_email
        accession_ids = self.df['Sequence_ID'].tolist()
        
        all_organisms = {}
        all_genera = {}
        
        for i in tqdm(range(0, len(accession_ids), batch_size), 
                     desc="Fetching taxonomy"):
            batch_ids = accession_ids[i:i+batch_size]
            
            try:
                handle = Entrez.efetch(
                    db="nuccore", 
                    id=batch_ids, 
                    rettype="gb", 
                    retmode="xml"
                )
                records = Entrez.read(handle)
                handle.close()
                
                for record in records:
                    acc_id = record.get('GBSeq_accession-version', 'N/A')
                    organism = record.get('GBSeq_organism', 'Unknown')
                    
                    # Extract genus from taxonomy
                    lineage = record.get('GBSeq_taxonomy', 'Unknown').split('; ')
                    genus = lineage[-2] if len(lineage) > 1 else 'Unknown'
                    
                    all_organisms[acc_id] = organism
                    all_genera[acc_id] = genus
                    
            except Exception as e:
                logger.warning(f"Entrez error for batch {i}-{i+batch_size}: {e}")
            
            time.sleep(delay)  # Be polite to NCBI servers
        
        # Map to DataFrame
        self.df['organism'] = self.df['Sequence_ID'].map(all_organisms).fillna('Unknown')
        self.df['genus'] = self.df['Sequence_ID'].map(all_genera).fillna('Unknown')
        
        logger.info("Taxonomic data fetching completed")
    
    def generate_dna_embeddings(self, max_length: int = 512) -> np.ndarray:
        """
        Generate DNA embeddings using nucleotide transformer
        
        Args:
            max_length: Maximum sequence length for tokenization
            
        Returns:
            Array of DNA embeddings
        """
        logger.info("Generating DNA embeddings...")
        
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        embeddings = []
        
        for seq in tqdm(self.df['sequence'], desc="DNA Embeddings"):
            try:
                # Tokenize sequence
                inputs = self.tokenizer(
                    seq, 
                    return_tensors='pt', 
                    padding=True, 
                    truncation=True, 
                    max_length=max_length
                )
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                # Generate embedding
                with torch.no_grad():
                    outputs = self.model(**inputs)
                
                # Extract mean pooled embedding
                embedding = outputs.last_hidden_state.mean(dim=1).squeeze().cpu().numpy()
                embeddings.append(embedding)
                
            except Exception as e:
                logger.warning(f"Failed to embed sequence: {e}")
                # Use zero embedding as fallback
                embeddings.append(np.zeros(self.model.config.hidden_size))
        
        self.dna_embeddings = np.array(embeddings)
        logger.info(f"Generated DNA embeddings: {self.dna_embeddings.shape}")
        
        return self.dna_embeddings
    
    def generate_context_embeddings(self) -> np.ndarray:
        """
        Generate environmental context embeddings
        
        Returns:
            Array of normalized environmental features
        """
        logger.info("Generating context embeddings...")
        
        # Select environmental features
        context_features = ['latitude', 'longitude', 'depth', 'temperature']
        if 'salinity' in self.df.columns:
            context_features.extend(['salinity', 'pH'])
        
        # Normalize features
        context_data = self.df[context_features].fillna(0)
        self.context_embeddings = self.scaler.fit_transform(context_data)
        
        logger.info(f"Generated context embeddings: {self.context_embeddings.shape}")
        
        return self.context_embeddings
    
    def fuse_embeddings(self) -> np.ndarray:
        """
        Fuse DNA and environmental embeddings
        
        Returns:
            Combined context-aware embeddings
        """
        logger.info("Fusing DNA and context embeddings...")
        
        if self.dna_embeddings is None:
            raise ValueError("DNA embeddings not generated")
        if self.context_embeddings is None:
            raise ValueError("Context embeddings not generated")
        
        self.context_aware_embeddings = np.concatenate(
            (self.dna_embeddings, self.context_embeddings), 
            axis=1
        )
        
        logger.info(f"Fused embeddings shape: {self.context_aware_embeddings.shape}")
        
        return self.context_aware_embeddings
    
    def perform_clustering(self, 
                          min_cluster_size: int = 10,
                          cluster_selection_epsilon: float = 0.1) -> np.ndarray:
        """
        Perform HDBSCAN clustering on context-aware embeddings
        
        Args:
            min_cluster_size: Minimum size for clusters
            cluster_selection_epsilon: Epsilon for cluster selection
            
        Returns:
            Array of cluster labels
        """
        logger.info("Performing HDBSCAN clustering...")
        
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=min_cluster_size,
            min_samples=1,
            cluster_selection_epsilon=cluster_selection_epsilon,
            gen_min_span_tree=True
        )
        
        cluster_labels = clusterer.fit_predict(self.context_aware_embeddings)
        self.df['cluster'] = cluster_labels
        
        # Calculate clustering statistics
        n_clusters = len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)
        n_outliers = (cluster_labels == -1).sum()
        
        logger.info(f"Clustering complete: {n_clusters} clusters, {n_outliers} outliers")
        
        return cluster_labels
    
    def calculate_biodiversity_metrics(self) -> Dict[str, Any]:
        """
        Calculate comprehensive biodiversity metrics
        
        Returns:
            Dictionary containing biodiversity metrics
        """
        logger.info("Calculating biodiversity metrics...")
        print(f"🔍 DEBUG: Calculating metrics for DataFrame with columns: {list(self.df.columns)}")
        
        metrics = {}
        
        # Basic statistics
        metrics['total_sequences'] = len(self.df)
        
        # Clustering metrics (only if clustering has been performed)
        if 'cluster' in self.df.columns:
            print(f"🔍 DEBUG: Cluster column found, calculating cluster metrics...")
            metrics['total_clusters'] = len(set(self.df['cluster'])) - (1 if -1 in self.df['cluster'].values else 0)
            metrics['novel_candidates'] = (self.df['cluster'] == -1).sum()
            
            # Cluster distribution
            cluster_counts = self.df['cluster'].value_counts()
            metrics['cluster_distribution'] = cluster_counts.to_dict()
        else:
            print(f"🔍 DEBUG: No cluster column found, skipping cluster metrics...")
            metrics['total_clusters'] = 0
            metrics['novel_candidates'] = 0
        
        # Species-level metrics
        if 'organism' in self.df.columns:
            print(f"🔍 DEBUG: Organism column found, calculating species metrics...")
            species_counts = self.df['organism'].value_counts()
            metrics['total_species'] = len(species_counts)
            metrics['shannon_diversity'] = entropy(species_counts)
            metrics['simpson_diversity'] = 1 - sum((species_counts / len(self.df)) ** 2)
        
        # Environmental diversity
        if 'depth' in self.df.columns:
            print(f"🔍 DEBUG: Calculating depth range...")
            metrics['depth_range'] = {
                'min': float(self.df['depth'].min()),
                'max': float(self.df['depth'].max()),
                'mean': float(self.df['depth'].mean())
            }
        
        if 'temperature' in self.df.columns:
            print(f"🔍 DEBUG: Calculating temperature range...")
            metrics['temperature_range'] = {
                'min': float(self.df['temperature'].min()),
                'max': float(self.df['temperature'].max()),
                'mean': float(self.df['temperature'].mean())
            }
        
        print(f"🔍 DEBUG: Metrics calculated: {list(metrics.keys())}")
        logger.info("Biodiversity metrics calculated")
        
        return metrics
    
    def generate_species_report(self) -> Dict[str, Any]:
        """
        Generate detailed species-level analysis report
        
        Returns:
            Comprehensive species report with all metrics
        """
        logger.info("Generating species report...")
        
        if 'organism' not in self.df.columns:
            logger.warning("No organism data available for species report")
            return {}
        
        species_groups = self.df.groupby('organism')
        species_report = {}
        
        for species, group in species_groups:
            # Shannon diversity within species clusters
            cluster_counts = group['cluster'].value_counts()
            shannon_score = entropy(cluster_counts) if len(cluster_counts) > 1 else 0.0
            
            # Confidence score (proportion of dominant cluster)
            confidence_score = cluster_counts.max() / cluster_counts.sum() if cluster_counts.sum() > 0 else 0.0
            
            # Location metadata
            location_cols = ['latitude', 'longitude', 'depth']
            available_cols = [col for col in location_cols if col in group.columns]
            
            if available_cols:
                locations = group[available_cols].to_dict(orient='records')
                mean_location = group[available_cols].mean().to_dict()
            else:
                locations = []
                mean_location = {}
            
            # Temporal metadata
            if 'collection_date' in group.columns:
                times = group['collection_date'].dt.isoformat().tolist()
            else:
                times = [datetime.now().isoformat()] * len(group)
            
            # Hierarchical subclustering
            if len(group) > 1:
                group_embeddings = self.context_aware_embeddings[group.index]
                try:
                    Z = linkage(group_embeddings, method='ward')
                    hier_clusters = fcluster(Z, t=min(8, len(group)), criterion='maxclust').tolist()
                except:
                    hier_clusters = [1] * len(group)
            else:
                hier_clusters = [1] * len(group)
            
            # Environmental parameters
            env_params = {}
            for param in ['temperature', 'salinity', 'ph']:
                if param in group.columns:
                    env_params[param] = {
                        'mean': float(group[param].mean()),
                        'std': float(group[param].std()),
                        'range': [float(group[param].min()), float(group[param].max())]
                    }
            
            # Build species entry
            species_report[species] = {
                'shannon_score': float(shannon_score),
                'confidence_score': float(confidence_score),
                'abundance': int(len(group)),
                'mean_location': {k: float(v) for k, v in mean_location.items()},
                'locations': locations,
                'time_metadata': times,
                'environmental_parameters': env_params,
                'hierarchical_clusters': hier_clusters,
                'cluster_distribution': group['cluster'].value_counts().to_dict(),
                'sequences': group['sequence'].tolist(),
                'sequence_ids': group['Sequence_ID'].tolist(),
                'cluster_ids': group['cluster'].tolist(),
            }
        
        logger.info(f"Species report generated for {len(species_report)} species")
        
        return species_report
    
    def export_results(self, output_dir: str = "results") -> Dict[str, str]:
        """
        Export all results to files
        
        Args:
            output_dir: Directory to save results
            
        Returns:
            Dictionary mapping result types to file paths
        """
        logger.info(f"Exporting results to: {output_dir}")
        
        # Create output directory
        Path(output_dir).mkdir(exist_ok=True)
        
        file_paths = {}
        
        # 1. Main biodiversity report
        biodiversity_metrics = self.calculate_biodiversity_metrics()
        species_report = self.generate_species_report()
        
        main_report = {
            'metadata': {
                'pipeline_version': '1.0.0',
                'analysis_date': datetime.now().isoformat(),
                'model_used': self.model_name,
                'total_sequences_analyzed': len(self.df)
            },
            'summary': biodiversity_metrics,
            'species': species_report
        }
        
        main_report_path = os.path.join(output_dir, 'biodiversity_report.json')
        with open(main_report_path, 'w') as f:
            json.dump(main_report, f, indent=2)
        file_paths['main_report'] = main_report_path
        
        # 2. Novel candidates FASTA
        if -1 in self.df['cluster'].values:
            novel_df = self.df[self.df['cluster'] == -1]
            novel_fasta_path = os.path.join(output_dir, 'novel_candidates.fasta')
            
            with open(novel_fasta_path, 'w') as f:
                for _, row in novel_df.iterrows():
                    f.write(f">{row['Sequence_ID']}\n{row['sequence']}\n")
            
            file_paths['novel_fasta'] = novel_fasta_path
            logger.info(f"Exported {len(novel_df)} novel candidates")
        
        # 3. Cluster analysis
        cluster_analysis = {}
        for cluster_id in self.df['cluster'].unique():
            if cluster_id == -1:
                continue
            
            cluster_df = self.df[self.df['cluster'] == cluster_id]
            cluster_analysis[int(cluster_id)] = {
                'size': len(cluster_df),
                'dominant_organism': cluster_df['organism'].mode().iloc[0] if 'organism' in cluster_df.columns else 'Unknown',
                'organism_diversity': cluster_df['organism'].nunique() if 'organism' in cluster_df.columns else 0,
                'sequence_ids': cluster_df['Sequence_ID'].tolist()
            }
        
        cluster_path = os.path.join(output_dir, 'cluster_analysis.json')
        with open(cluster_path, 'w') as f:
            json.dump(cluster_analysis, f, indent=2)
        file_paths['cluster_analysis'] = cluster_path
        
        # 4. Raw data with embeddings
        results_df = self.df.copy()
        if self.dna_embeddings is not None:
            # Save embedding dimensions as separate columns (first 10 dimensions for space)
            for i in range(min(10, self.dna_embeddings.shape[1])):
                results_df[f'dna_emb_{i}'] = self.dna_embeddings[:, i]
        
        csv_path = os.path.join(output_dir, 'analysis_results.csv')
        results_df.to_csv(csv_path, index=False)
        file_paths['results_csv'] = csv_path
        
        logger.info(f"Results exported to {len(file_paths)} files")
        
        return file_paths
    
    def run_full_pipeline(self, 
                         fasta_path: str,
                         sample_size: Optional[int] = None,
                         fetch_taxonomy: bool = False,
                         output_dir: str = "results",
                         hf_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Run the complete OceanEYE analysis pipeline
        
        Args:
            fasta_path: Path to input FASTA file
            sample_size: Maximum sequences to process (None for all)
            fetch_taxonomy: Whether to fetch taxonomy from NCBI
            output_dir: Output directory for results
            hf_token: HuggingFace token for model access
            
        Returns:
            Complete analysis results
        """
        logger.info("Starting OceanEYE full pipeline...")
        
        try:
            # 1. Load model
            self.load_model(hf_token)
            
            # 2. Load and prepare data
            self.load_fasta_data(fasta_path, sample_size)
            
            # 3. Fetch taxonomy (optional)
            if fetch_taxonomy:
                self.fetch_taxonomic_data()
            
            # 4. Generate embeddings
            self.generate_dna_embeddings()
            self.generate_context_embeddings()
            self.fuse_embeddings()
            
            # 5. Perform clustering
            self.perform_clustering()
            
            # 6. Calculate metrics and export
            results = self.export_results(output_dir)
            
            logger.info("Pipeline completed successfully!")
            
            return {
                'status': 'success',
                'files_generated': results,
                'summary': self.calculate_biodiversity_metrics()
            }
            
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }


def main():
    """Example usage of the OceanEYE pipeline"""
    
    # Initialize pipeline
    pipeline = OceanEYEPipeline()
    
    # Example FASTA file path
    fasta_path = "16S_ribosomal_RNA.fasta"
    
    # Run pipeline
    results = pipeline.run_full_pipeline(
        fasta_path=fasta_path,
        sample_size=100,  # Process first 100 sequences
        fetch_taxonomy=False,  # Skip NCBI lookup for demo
        output_dir="oceaneye_results"
    )
    
    print("Pipeline Results:")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()