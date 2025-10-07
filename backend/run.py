"""
Simple run script for Taxaformer API
Alternative startup method for Render.com
"""
import os
import uvicorn

# Get port from environment variable
PORT = int(os.environ.get("PORT", 8000))

print(f"🚀 Starting Taxaformer API on port {PORT}")

# Run the server
uvicorn.run(
    "main:app",
    host="0.0.0.0", 
    port=PORT,
    log_level="info"
)