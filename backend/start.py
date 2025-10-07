#!/usr/bin/env python3
"""
Production startup script for Taxaformer API
Optimized for Render.com deployment
"""
import os
import sys
import uvicorn
from pathlib import Path

def main():
    """Main startup function"""
    print("🚀 Starting Taxaformer API...")
    
    # Get port from environment
    port = int(os.environ.get("PORT", 8000))
    
    # Print startup info
    print(f"📡 Server starting on port {port}")
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Ensure we're in the right directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    try:
        # Start the server
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            reload=False,
            workers=1,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()