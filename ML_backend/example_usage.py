"""
Example usage of the OceanEYE pipeline
Demonstrates how to run the complete eDNA analysis workflow
"""

import os
import json
from pathlib import Path
from oceaneye_pipeline import OceanEYEPipeline

def create_example_fasta():
    """Create a small example FASTA file for testing"""
    
    # Example marine sequences (simplified for demo)
    sequences = [
        ("seq_001", "ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC"),
        ("seq_002", "GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA"),
        ("seq_003", "TTAATTAATTAATTAATTAATTAATTAATTAATTAATTAATTAATTAATTAATTAATTAA"),
        ("seq_004", "GGCCGGCCGGCCGGCCGGCCGGCCGGCCGGCCGGCCGGCCGGCCGGCCGGCCGGCCGGCC"),
        ("seq_005", "ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT"),
        ("seq_006", "TGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCA"),
        ("seq_007", "CGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGAT"),
        ("seq_008", "AGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTC"),
        ("seq_009", "CTGACTGACTGACTGACTGACTGACTGACTGACTGACTGACTGACTGACTGACTGACTG"),
        ("seq_010", "GATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC"),
    ]
    
    fasta_content = ""
    for seq_id, sequence in sequences:
        fasta_content += f">{seq_id}\n{sequence}\n"
    
    # Create example file
    with open("example_sequences.fasta", "w") as f:
        f.write(fasta_content)
    
    print("✅ Created example FASTA file: example_sequences.fasta")
    return "example_sequences.fasta"

def run_basic_example():
    """Run basic pipeline example without model loading"""
    
    print("🧬 OceanEYE Pipeline - Basic Example")
    print("=" * 50)
    
    # Create example data
    fasta_file = create_example_fasta()
    
    # Initialize pipeline
    pipeline = OceanEYEPipeline()
    
    try:
        # Load data (without model for quick demo)
        print("\n📊 Loading FASTA data...")
        pipeline.load_fasta_data(fasta_file, sample_size=10)
        
        print(f"✅ Loaded {len(pipeline.df)} sequences")
        print("\nFirst few sequences:")
        print(pipeline.df[['Sequence_ID', 'sequence']].head())
        
        # Show environmental metadata
        print("\n🌊 Environmental metadata:")
        env_cols = ['latitude', 'longitude', 'depth', 'temperature']
        print(pipeline.df[env_cols].head())
        
        # Generate context embeddings (without DNA embeddings)
        print("\n🔬 Generating context embeddings...")
        pipeline.generate_context_embeddings()
        print(f"✅ Context embeddings shape: {pipeline.context_embeddings.shape}")
        
        # Calculate basic metrics
        print("\n📈 Basic biodiversity metrics:")
        metrics = {
            'total_sequences': len(pipeline.df),
            'unique_sequences': pipeline.df['sequence'].nunique(),
            'depth_range': {
                'min': float(pipeline.df['depth'].min()),
                'max': float(pipeline.df['depth'].max()),
                'mean': float(pipeline.df['depth'].mean())
            },
            'temperature_range': {
                'min': float(pipeline.df['temperature'].min()),
                'max': float(pipeline.df['temperature'].max()),
                'mean': float(pipeline.df['temperature'].mean())
            }
        }
        
        print(json.dumps(metrics, indent=2))
        
    except Exception as e:
        print(f"❌ Error in basic example: {e}")
    
    finally:
        # Cleanup
        if os.path.exists(fasta_file):
            os.remove(fasta_file)

def run_full_example_with_model():
    """Run full pipeline example with model loading (requires GPU/CPU resources)"""
    
    print("🧬 OceanEYE Pipeline - Full Example with Model")
    print("=" * 60)
    
    # Create example data
    fasta_file = create_example_fasta()
    
    try:
        # Initialize and run full pipeline
        pipeline = OceanEYEPipeline()
        
        print("\n🤖 Note: This will download and load the nucleotide transformer model")
        print("This may take several minutes and requires significant memory...")
        
        # Run full pipeline
        results = pipeline.run_full_pipeline(
            fasta_path=fasta_file,
            sample_size=10,  # Small sample for demo
            fetch_taxonomy=False,  # Skip NCBI lookup
            output_dir="example_results"
        )
        
        print("\n✅ Pipeline Results:")
        print(json.dumps(results, indent=2))
        
        # Show generated files
        if results['status'] == 'success':
            print("\n📁 Generated files:")
            for file_type, file_path in results['files_generated'].items():
                print(f"  - {file_type}: {file_path}")
    
    except Exception as e:
        print(f"❌ Error in full example: {e}")
        print("Note: Full pipeline requires significant computational resources")
    
    finally:
        # Cleanup
        if os.path.exists(fasta_file):
            os.remove(fasta_file)

def run_api_integration_example():
    """Example of how to integrate with the FastAPI backend"""
    
    print("🌐 OceanEYE API Integration Example")
    print("=" * 50)
    
    api_example = """
    # Start the API server
    python api_server.py
    
    # Upload FASTA file
    curl -X POST "http://localhost:8001/upload-fasta" \\
         -H "accept: application/json" \\
         -H "Content-Type: multipart/form-data" \\
         -F "file=@example_sequences.fasta"
    
    # Start analysis
    curl -X POST "http://localhost:8001/analyze" \\
         -H "accept: application/json" \\
         -H "Content-Type: application/json" \\
         -d '{
           "sample_size": 100,
           "fetch_taxonomy": false,
           "min_cluster_size": 5,
           "cluster_epsilon": 0.1
         }'
    
    # Check job status
    curl -X GET "http://localhost:8001/jobs/{job_id}"
    
    # Get results
    curl -X GET "http://localhost:8001/results/{job_id}/biodiversity"
    curl -X GET "http://localhost:8001/results/{job_id}/species"
    
    # Download files
    curl -X GET "http://localhost:8001/results/{job_id}/download/report"
    """
    
    print(api_example)

def main():
    """Main example runner"""
    
    print("🧬 OceanEYE Pipeline Examples")
    print("=" * 40)
    print("Choose an example to run:")
    print("1. Basic example (no model loading)")
    print("2. Full pipeline with model (requires resources)")
    print("3. API integration example")
    print("4. Run all examples")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "1":
        run_basic_example()
    elif choice == "2":
        run_full_example_with_model()
    elif choice == "3":
        run_api_integration_example()
    elif choice == "4":
        run_basic_example()
        print("\n" + "="*60 + "\n")
        run_api_integration_example()
    else:
        print("Invalid choice. Running basic example...")
        run_basic_example()

if __name__ == "__main__":
    main()