#!/usr/bin/env python3
"""
Startup script for the eDNA Analysis Backend
"""
import uvicorn
import sys
import os

if __name__ == "__main__":
    print("Starting eDNA Analysis Backend Server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)