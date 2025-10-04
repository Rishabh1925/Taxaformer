#!/usr/bin/env python3
"""
eDNA Analysis API Startup Script
"""

import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🧬 Starting eDNA Analysis API...")
    print("📊 API Documentation will be available at: http://localhost:8000/docs")
    print("🔬 Interactive API at: http://localhost:8000/redoc")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )