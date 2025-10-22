<div align="center">

# Taxaformer - eDNA Analysis Platform

**Advanced Environmental DNA Analysis with Machine Learning & Interactive Visualization**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![GitHub issues](https://img.shields.io/github/issues/Shaurya-Sinha3301/Taxaformer.svg)](https://github.com/Shaurya-Sinha3301/Taxaformer/issues)


[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.8-blue.svg)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)

[Live Demo](https://shaurya-sinha3301.github.io/Taxaformer) • [Documentation](#-documentation) • [Contributing](CONTRIBUTING.md) • [Report Bug](https://github.com/Shaurya-Sinha3301/Taxaformer/issues) • [Request Feature](https://github.com/Shaurya-Sinha3301/Taxaformer/issues)

---

**Taxaformer** is a comprehensive environmental DNA (eDNA) analysis platform that combines cutting-edge machine learning with interactive data visualization for biodiversity monitoring and species identification. Built for researchers, conservationists, and environmental scientists.

</div>

## Key Features

<table>
<tr>
<td width="50%">

### **Advanced eDNA Analysis**
- **Nucleotide Transformers**: State-of-the-art ML models for sequence analysis
- **Species Identification**: High-confidence taxonomic classification
- **Novel Species Detection**: Identify potentially new or rare species
- **Biodiversity Metrics**: Shannon & Simpson diversity indices
- **Environmental Integration**: Context-aware analysis with environmental parameters

</td>
<td width="50%">

### **Interactive Geospatial Mapping**
- **Dynamic Maps**: Leaflet-powered interactive mapping
- **Sample Visualization**: Geo-located sampling sites with biodiversity data
- **Environmental Layers**: Temperature, pH, depth, and salinity overlays
- **Advanced Filtering**: Multi-parameter search and filtering capabilities
- **Temporal Analysis**: Time-series biodiversity tracking

</td>
</tr>
<tr>
<td width="50%">

### **Modern Web Platform**
- **Real-time Processing**: Instant FASTA file analysis
- **Glass Morphism UI**: Modern, professional interface design
- **Responsive Design**: Seamless experience across all devices
- **Dark Theme**: Optimized for extended research sessions
- **Smooth Animations**: Framer Motion powered transitions

</td>
<td width="50%">

### **Developer-Friendly**
- **RESTful APIs**: Comprehensive backend integration
- **Drag & Drop**: Intuitive file upload with metadata
- **Export Capabilities**: Multiple format downloads (JSON, CSV, FASTA)
- **Real-time Updates**: Live analysis progress tracking
- **Comprehensive Docs**: Detailed API and usage documentation

</td>
</tr>
</table>

## Quick Start

### Prerequisites

<table>
<tr>
<td><strong>Runtime</strong></td>
<td><strong>Version</strong></td>
<td><strong>Purpose</strong></td>
</tr>
<tr>
<td>Node.js</td>
<td>≥ 18.0.0</td>
<td>Frontend development & build</td>
</tr>
<tr>
<td>Python</td>
<td>≥ 3.8</td>
<td>Backend API & ML pipeline</td>
</tr>
<tr>
<td>npm/yarn</td>
<td>Latest</td>
<td>Package management</td>
</tr>
<tr>
<td>Git</td>
<td>Latest</td>
<td>Version control</td>
</tr>
</table>

### One-Click Setup

```bash
# Clone and setup everything
git clone https://github.com/Shaurya-Sinha3301/Taxaformer.git
cd Taxaformer

# Install frontend dependencies
npm install

# Setup backend
cd backend && pip install -r requirements.txt && cd ..

# Setup ML pipeline
cd ML_backend && pip install -r requirements.txt && cd ..

# Start development (requires 3 terminals)
npm run dev                    # Terminal 1: Frontend (http://localhost:5173)
cd backend && python start.py # Terminal 2: Backend API (http://localhost:8000)
cd ML_backend && python api_server.py # Terminal 3: ML API (http://localhost:8001)
```

### Docker Setup (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# ML API: http://localhost:8001
```

### Production Deployment

| Platform | Status | URL | Deploy Command |
|----------|--------|-----|----------------|
| **GitHub Pages** | ✅ Active | [Live Demo](https://shaurya-sinha3301.github.io/Taxaformer) | `npm run deploy` |
| **Vercel** | ✅ Ready | - | `vercel --prod` |
| **Render** | ✅ Backend | [API](https://taxaformer-1.onrender.com) | Auto-deploy on push |

## Project Structure

<details>
<summary><strong>Complete Project Architecture</strong></summary>

```
Taxaformer/
├── src/                            # Frontend Application
│   ├── components/                 # React Components
│   │   ├── ui/                     # Reusable UI Components (Radix UI)
│   │   ├── LandingPage.tsx         # Homepage & Hero Section
│   │   ├── ReportsPage.tsx         # Analysis Dashboard
│   │   ├── MappingPage.tsx         # Geospatial Interface
│   │   ├── FinalMap.tsx            # Interactive Leaflet Map
│   │   ├── Fungal28sAnalysis.tsx   # Specialized Analysis
│   │   └── Navigation.tsx          # App Navigation
│   ├── services/                   # API Integration
│   │   └── api.ts                  # HTTP Client & Endpoints
│   ├── styles/                     # Styling & CSS
│   │   └── leaflet.css             # Map Styling
│   └── App.tsx                     # Main Application Root
│
├── backend/                        # FastAPI Backend
│   ├── main.py                     # Primary API Server
│   ├── start.py                    # Server Startup Script
│   ├── test_backend.py             # API Tests
│   ├── requirements.txt            # Python Dependencies
│   ├── Dockerfile                  # Container Configuration
│   ├── fasta_files/                # Sample FASTA Data
│   └── build.sh                    # Build Scripts
│
├── ML_backend/                     # Machine Learning Pipeline
│   ├── oceaneye_pipeline_real.py   # Core ML Pipeline
│   ├── taxaformer.py               # Transformer Models
│   ├── api_server.py               # ML API Server
│   ├── oceaneye-2-0.ipynb          # Research Notebook
│   ├── test_real_pipeline.py       # ML Tests
│   ├── requirements.txt            # ML Dependencies
│   ├── 16S_ribosomal_RNA.fasta     # Reference Sequences
│   └── README.md                   # ML Documentation
│
├── .github/                        # CI/CD & Automation
│   └── workflows/
│       └── deploy.yml              # GitHub Actions Deployment
│
├── dist/                           # Production Build Output
├── node_modules/                   # Node.js Dependencies
├── .vscode/                        # VS Code Configuration
├── .venv/                          # Python Virtual Environment
│
├── package.json                    # Node.js Project Configuration
├── tsconfig.json                   # TypeScript Configuration
├── vite.config.ts                  # Vite Build Configuration
├── vercel.json                     # Vercel Deployment Config
├── .env.example                    # Environment Variables Template
├── .gitignore                      # Git Ignore Rules
├── LICENSE                         # MIT License
├── README.md                       # Project Documentation
├── CONTRIBUTING.md                 # Contribution Guidelines
├── DEPLOYMENT_CHECKLIST.md         # Deployment Guide
└── VERCEL_DEPLOYMENT.md            # Vercel-specific Deployment
```

</details>

## Documentation

### Available Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| **[README.md](README.md)** | Main project documentation | All users |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Contribution guidelines | Developers |
| **[Backend README](backend/README.md)** | Backend API documentation | API users |
| **[ML README](ML_backend/README.md)** | ML pipeline documentation | Data scientists |
| **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** | Production deployment guide | DevOps |
| **[Vercel Deployment](VERCEL_DEPLOYMENT.md)** | Vercel-specific deployment | Developers |

### Quick Links

- **[Live Demo](https://shaurya-sinha3301.github.io/Taxaformer)** - Try the application
- **[API Documentation](https://taxaformer-1.onrender.com/docs)** - Interactive API docs
- **[ML Pipeline Guide](ML_backend/README.md)** - Detailed ML documentation
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Issue Tracker](https://github.com/Shaurya-Sinha3301/Taxaformer/issues)** - Report bugs or request features

## Technology Stack

<div align="center">

### Frontend Architecture
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://framer.com/motion/)

### Backend & APIs
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-2F5F8F?style=for-the-badge&logo=uvicorn&logoColor=white)](https://uvicorn.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://pydantic.dev/)

### Machine Learning & Bioinformatics
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Hugging Face](https://img.shields.io/badge/🤗_Hugging_Face-FFD21E?style=for-the-badge)](https://huggingface.co/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)](https://numpy.org/)

### Visualization & Mapping
[![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge)](https://recharts.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Plotly](https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)](https://plotly.com/)

### Development & Deployment
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

</div>

### Architecture Overview

```mermaid
graph TB
    A[React Frontend] --> B[FastAPI Backend]
    A --> C[ML Pipeline API]
    B --> D[FASTA Processing]
    C --> E[Nucleotide Transformer]
    C --> F[HDBSCAN Clustering]
    E --> G[Species Classification]
    F --> H[Biodiversity Analysis]
    G --> I[Interactive Visualizations]
    H --> I
    D --> I
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ML_API_URL=http://localhost:8001
```

## API Documentation

### Backend API Endpoints

<details>
<summary><strong>FASTA File Management</strong></summary>

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/fasta-files` | List all available FASTA files | Array of file metadata |
| `POST` | `/upload-fasta` | Upload new FASTA file with metadata | Upload confirmation |
| `GET` | `/analysis/{file_id}` | Get complete analysis results | Full analysis report |
| `DELETE` | `/fasta-files/{file_id}` | Remove FASTA file | Deletion confirmation |

</details>

<details>
<summary><strong>Species Analysis</strong></summary>

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/analysis/{file_id}/species` | Get species composition data | Species breakdown with confidence |
| `GET` | `/analysis/{file_id}/environmental` | Get environmental correlations | Environmental parameter analysis |
| `GET` | `/analysis/{file_id}/biodiversity` | Get biodiversity metrics | Shannon, Simpson indices |
| `POST` | `/comparison` | Compare multiple samples | Comparative analysis results |

</details>

### ML Pipeline API Endpoints

<details>
<summary><strong>Machine Learning Operations</strong></summary>

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `POST` | `/ml/analyze` | Start ML analysis job | Job ID and status |
| `GET` | `/ml/jobs/{job_id}` | Check analysis job status | Job progress and results |
| `GET` | `/ml/results/{job_id}/biodiversity` | Get ML biodiversity metrics | Advanced diversity analysis |
| `GET` | `/ml/results/{job_id}/clusters` | Get clustering results | Species clusters and outliers |
| `POST` | `/ml/upload-fasta` | Upload FASTA for ML analysis | Upload confirmation |

</details>

### Interactive API Documentation

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **ML API Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

## Deployment & Production

### Live Deployments

| Service | Status | URL | Purpose |
|---------|--------|-----|---------|
| **Frontend** | ![GitHub Pages](https://img.shields.io/website?url=https%3A%2F%2Fshaurya-sinha3301.github.io%2FTaxaformer&label=GitHub%20Pages) | [Live Demo](https://shaurya-sinha3301.github.io/Taxaformer) | Main application |
| **Backend API** | ![Render](https://img.shields.io/website?url=https%3A%2F%2Ftaxaformer-1.onrender.com&label=Render) | [API Docs](https://taxaformer-1.onrender.com/docs) | REST API server |
| **ML Pipeline** | ![Status](https://img.shields.io/badge/status-ready-green) | On-demand | ML processing |

### Deployment Options

<details>
<summary><strong>Local Development</strong></summary>

```bash
# Method 1: Manual setup (3 terminals)
npm run dev                              # Frontend: http://localhost:5173
cd backend && python start.py           # Backend: http://localhost:8000  
cd ML_backend && python api_server.py   # ML API: http://localhost:8001

# Method 2: Docker Compose (recommended)
docker-compose up --build
```

</details>

<details>
<summary><strong>GitHub Pages</strong></summary>

```bash
# Automatic deployment (on push to main)
git push origin main

# Manual deployment
npm run build:github
npm run deploy

# Custom domain setup
echo "your-domain.com" > dist/CNAME
```

</details>

<details>
<summary><strong>Vercel</strong></summary>

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Environment variables (set in Vercel dashboard)
VITE_API_BASE_URL=https://your-backend.vercel.app
VITE_ML_API_URL=https://your-ml-api.vercel.app
```

</details>

<details>
<summary><strong>Docker Production</strong></summary>

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM python:3.9-slim AS backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

</details>

### Environment Configuration

<details>
<summary><strong>Production Environment</strong></summary>

```env
# Frontend (.env.production)
VITE_API_BASE_URL=https://taxaformer-1.onrender.com
VITE_ML_API_URL=https://taxaformer-1.onrender.com
NODE_ENV=production
VITE_APP_VERSION=1.0.0

# Backend
DATABASE_URL=postgresql://user:pass@host:port/db
CORS_ORIGINS=["https://shaurya-sinha3301.github.io"]
LOG_LEVEL=INFO
```

</details>

<details>
<summary><strong>Development Environment</strong></summary>

```env
# Frontend (.env.development)
VITE_API_BASE_URL=http://localhost:8000
VITE_ML_API_URL=http://localhost:8001
NODE_ENV=development
VITE_APP_VERSION=dev

# Backend
DATABASE_URL=sqlite:///./dev.db
CORS_ORIGINS=["http://localhost:5173"]
LOG_LEVEL=DEBUG
```

</details>

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Quick Contribution Guide

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes with proper tests
4. **Commit** with conventional commits: `git commit -m 'feat: add amazing feature'`
5. **Push** to your branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Contribution Areas

| Area | Skills Needed | Examples |
|------|---------------|----------|
| **Bioinformatics** | Python, Biology | New analysis algorithms, species databases |
| **Frontend** | React, TypeScript | UI improvements, new visualizations |
| **Backend** | FastAPI, Python | API enhancements, performance optimization |
| **ML/AI** | PyTorch, Transformers | Model improvements, new ML features |
| **Documentation** | Markdown, Writing | Tutorials, API docs, examples |
| **Testing** | Jest, Pytest | Unit tests, integration tests |

### Development Guidelines

- **Code Style**: Follow ESLint (Frontend) and Black (Python) formatting
- **Testing**: Add tests for new features (`npm test` / `pytest`)
- **Documentation**: Update relevant docs and README sections
- **Commits**: Use [Conventional Commits](https://conventionalcommits.org/)

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

### Contributors

<a href="https://github.com/Shaurya-Sinha3301/Taxaformer/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Shaurya-Sinha3301/Taxaformer" />
</a>

## Project Stats

<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/Shaurya-Sinha3301/Taxaformer)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Shaurya-Sinha3301/Taxaformer)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Shaurya-Sinha3301/Taxaformer)
![GitHub last commit](https://img.shields.io/github/last-commit/Shaurya-Sinha3301/Taxaformer)

</div>

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2024 Taxaformer
Permission is hereby granted, free of charge, to any person obtaining a copy...
```

## Acknowledgments & Credits

### Scientific & Technical
- **[Hugging Face](https://huggingface.co/)** - Nucleotide transformer models and ML infrastructure
- **[InstaDeepAI](https://instadeep.com/)** - Nucleotide Transformer architecture
- **[BioPython](https://biopython.org/)** - Bioinformatics tools and FASTA processing
- **[NCBI](https://ncbi.nlm.nih.gov/)** - Taxonomic databases and sequence data

### Development Tools
- **[React](https://reactjs.org/)** & **[TypeScript](https://typescriptlang.org/)** - Frontend framework
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[Leaflet](https://leafletjs.com/)** - Interactive mapping capabilities
- **[Recharts](https://recharts.org/)** - Data visualization components
- **[Radix UI](https://radix-ui.com/)** - Accessible UI components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Special Thanks
- **Environmental DNA Research Community** for inspiration and feedback
- **Open Source Contributors** who make projects like this possible
- **GitHub** for hosting and continuous integration
- **Vercel** & **Render** for deployment platforms

## Support & Community

<div align="center">

### Get Help

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/Shaurya-Sinha3301/Taxaformer/issues)
[![GitHub Discussions](https://img.shields.io/badge/GitHub-Discussions-blue?style=for-the-badge&logo=github)](https://github.com/Shaurya-Sinha3301/Taxaformer/discussions)
[![Documentation](https://img.shields.io/badge/Read-Documentation-green?style=for-the-badge&logo=gitbook)](https://github.com/Shaurya-Sinha3301/Taxaformer#-documentation)

### Contact

For research collaborations, enterprise support, or general inquiries:
- **Create an Issue**: [Bug Reports & Feature Requests](https://github.com/Shaurya-Sinha3301/Taxaformer/issues/new)
- **Start a Discussion**: [Community Q&A](https://github.com/Shaurya-Sinha3301/Taxaformer/discussions)
- **Email**: Available in GitHub profile

</div>

---

<div align="center">

**Built with dedication for biodiversity research and environmental monitoring**

*Empowering scientists and researchers with cutting-edge eDNA analysis tools*

[![Made with Love](https://img.shields.io/badge/Made%20with-Love-red.svg)](https://github.com/Shaurya-Sinha3301/Taxaformer)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green.svg)](https://opensource.org/)
[![Science](https://img.shields.io/badge/For-Science-blue.svg)](https://github.com/Shaurya-Sinha3301/Taxaformer)

</div>
