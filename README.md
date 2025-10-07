# Taxaformer - eDNA Analysis Platform

A comprehensive environmental DNA (eDNA) analysis platform that combines advanced machine learning with interactive data visualization for biodiversity monitoring and species identification.

## 🌟 Features

### 🧬 **eDNA Analysis Dashboard**
- **Real-time Analysis**: Process FASTA files and get instant biodiversity insights
- **Species Identification**: Advanced taxonomic classification with confidence scores
- **Novelty Detection**: Identify potentially new or rare species
- **Interactive Charts**: Comprehensive data visualization with Recharts

### 🗺️ **Geospatial Mapping**
- **Interactive Maps**: Leaflet-powered mapping with custom markers
- **Sample Locations**: Visualize sampling sites with biodiversity data
- **Environmental Context**: Layer environmental parameters on maps
- **Filtering & Search**: Advanced filtering by sample type, novelty, and location

### 📊 **Data Management**
- **File Upload**: Drag & drop FASTA file upload with metadata
- **Dynamic Metadata**: Customizable metadata fields for samples
- **Export Capabilities**: Download comprehensive analysis reports
- **API Integration**: RESTful backend integration for data processing

### 🎨 **Modern UI/UX**
- **Glass Morphism Design**: Modern, sleek interface with blur effects
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Works seamlessly across all devices
- **Dark Theme**: Professional dark theme optimized for data analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/Shaurya-Sinha3301/Taxaformer.git
cd Taxaformer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

### ML Pipeline Setup
```bash
# Navigate to ML backend directory
cd ML_backend

# Install ML dependencies
pip install -r requirements.txt

# Run the ML pipeline
python oceaneye_pipeline_real.py
```

## 📁 Project Structure

```
Taxaformer/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── LandingPage.tsx     # Homepage component
│   │   ├── ReportsPage.tsx     # Analysis dashboard
│   │   ├── MappingPage.tsx     # Geospatial mapping
│   │   └── FinalMap.tsx        # Interactive map component
│   ├── services/               # API services
│   ├── styles/                 # CSS and styling
│   └── App.tsx                 # Main application component
├── backend/                     # FastAPI backend
│   ├── main.py                 # API server
│   └── requirements.txt        # Python dependencies
├── ML_backend/                  # Machine learning pipeline
│   ├── oceaneye_pipeline_real.py # ML processing pipeline
│   └── requirements.txt        # ML dependencies
└── package.json                # Node.js dependencies
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **React Leaflet** - Interactive maps
- **Radix UI** - Accessible UI components

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **SQLAlchemy** - Database ORM

### Machine Learning
- **PyTorch** - Deep learning framework
- **Transformers** - Hugging Face transformers
- **BioPython** - Bioinformatics tools
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing

## 🔧 Development

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

## 📊 API Endpoints

### FASTA File Management
- `GET /fasta-files` - List all FASTA files
- `POST /upload-fasta` - Upload new FASTA file
- `GET /analysis/{file_id}` - Get analysis results

### Species Analysis
- `GET /analysis/{file_id}/species` - Get species composition
- `GET /analysis/{file_id}/environmental` - Get environmental data
- `POST /comparison` - Compare multiple samples

## 🚀 Deployment

### Live Demo
- **Frontend**: [GitHub Pages](https://shaurya-sinha3301.github.io/Taxaformer)
- **Backend API**: [https://taxaformer-1.onrender.com](https://taxaformer-1.onrender.com)

### Deployment Options

#### 1. GitHub Pages (Recommended)
```bash
# Build for GitHub Pages
npm run build:github

# Deploy using GitHub Actions (automatic on push to main)
# Or manually deploy
npm run deploy
```

#### 2. Vercel
```bash
# Build for Vercel
npm run build:vercel

# Deploy to Vercel (automatic with Git integration)
vercel --prod
```

#### 3. Local Development
```bash
# Start frontend
npm run dev

# Start backend (in separate terminal)
cd backend
python main.py
```

### Environment Configuration

#### Production Environment Variables
```env
VITE_API_BASE_URL=https://taxaformer-1.onrender.com
VITE_ML_API_URL=https://taxaformer-1.onrender.com
NODE_ENV=production
```

#### Development Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ML_API_URL=http://localhost:8001
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for transformer models
- **Leaflet** for mapping capabilities
- **Recharts** for data visualization
- **Radix UI** for accessible components

## 📞 Support

For support, create an issue on GitHub or contact the development team.

---

**Built with ❤️ for biodiversity research and environmental monitoring**