import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, Legend, BarChart, Bar, ScatterChart, Scatter, Cell, RadialBarChart, RadialBar,
  PieChart, Pie, ComposedChart, TreeMap
} from 'recharts';
import { FileText, Download, Filter, Calendar, TrendingUp, Users, File, Upload, Search, Eye, Database, Zap, MapPin, Clock, Award, BarChart3, Activity, Layers, Globe, ArrowUpDown, ChevronUp, ChevronDown, X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

interface AnalysisFile {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  status: 'completed' | 'processing' | 'pending';
  samplesCount: number;
  speciesFound: number;
  novelSpecies: number;
  clusters: number;
  noveltyPercentage: number;
  samplingSites: number;
}

interface SpeciesData {
  id: string;
  index: number;
  name: string;
  abundance: number;
  confidence: number;
  shannonScore: number;
  location: string;
  date: string;
  sampleUploaded: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  isNovel: boolean;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  id: string;
}

interface MetadataField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export function ReportsPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [1, 1, 0.9, 0.8]);
  
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y1Spring = useSpring(y1, springConfig);
  const y2Spring = useSpring(y2, springConfig);
  const y3Spring = useSpring(y3, springConfig);

  const [selectedFile, setSelectedFile] = useState<string | null>('file-001');
  const [activeSection, setActiveSection] = useState('overview');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([
    { id: '1', name: 'Sample Location', value: '', type: 'text' },
    { id: '2', name: 'Collection Date', value: '', type: 'date' },
    { id: '3', name: 'Water Temperature (°C)', value: '', type: 'number' },
    { id: '4', name: 'pH Level', value: '', type: 'number' },
    { id: '5', name: 'Depth (m)', value: '', type: 'number' },
    { id: '6', name: 'Salinity (ppt)', value: '', type: 'number' },
    { id: '7', name: 'Sample Type', value: '', type: 'select', options: ['Water', 'Sediment', 'Plankton', 'Other'] }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock file data
  const analysisFiles: AnalysisFile[] = [
    {
      id: 'file-001',
      name: 'Pacific_Coast_Sample_Jan2024.fasta',
      uploadDate: '2024-01-15',
      size: '2.4 MB',
      status: 'completed',
      samplesCount: 12847,
      speciesFound: 156,
      novelSpecies: 12,
      clusters: 24,
      noveltyPercentage: 7.7,
      samplingSites: 8
    },
    {
      id: 'file-002', 
      name: 'Arctic_Ocean_Deep_Feb2024.fasta',
      uploadDate: '2024-02-03',
      size: '1.8 MB',
      status: 'completed',
      samplesCount: 8623,
      speciesFound: 89,
      novelSpecies: 8,
      clusters: 18,
      noveltyPercentage: 9.0,
      samplingSites: 5
    },
    {
      id: 'file-003',
      name: 'Amazon_River_Delta_Mar2024.fasta',
      uploadDate: '2024-03-10',
      size: '3.1 MB',
      status: 'processing',
      samplesCount: 15205,
      speciesFound: 0,
      novelSpecies: 0,
      clusters: 0,
      noveltyPercentage: 0,
      samplingSites: 0
    },
    {
      id: 'file-004',
      name: 'Mediterranean_Coastal_Apr2024.fasta',
      uploadDate: '2024-04-18',
      size: '2.7 MB',
      status: 'completed',
      samplesCount: 11934,
      speciesFound: 203,
      novelSpecies: 15,
      clusters: 32,
      noveltyPercentage: 7.4,
      samplingSites: 12
    }
  ];

  const selectedFileData = analysisFiles.find(f => f.id === selectedFile);

  // File upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const fastaFiles = files.filter(file => 
      file.name.toLowerCase().endsWith('.fasta') || 
      file.name.toLowerCase().endsWith('.fa') ||
      file.name.toLowerCase().endsWith('.fas')
    );

    // Check for invalid files
    const invalidFiles = files.filter(file => !fastaFiles.includes(file));
    if (invalidFiles.length > 0) {
      toast.error(`Invalid file types detected. Only .fasta, .fa, and .fas files are supported.`, {
        description: `Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`
      });
    }

    // Check file sizes (max 100MB per file)
    const oversizedFiles = fastaFiles.filter(file => file.size > 100 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Files too large. Maximum file size is 100MB.`, {
        description: `Oversized files: ${oversizedFiles.map(f => f.name).join(', ')}`
      });
      return;
    }

    fastaFiles.forEach(file => {
      // Check for duplicate files
      const isDuplicate = uploadedFiles.some(uploadedFile => 
        uploadedFile.file.name === file.name && uploadedFile.file.size === file.size
      );
      
      if (isDuplicate) {
        toast.warning(`File "${file.name}" is already uploaded.`);
        return;
      }

      const newFile: UploadedFile = {
        file,
        progress: 0,
        status: 'uploading',
        id: Math.random().toString(36).substr(2, 9)
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress with more realistic timing
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10 + 5; // Progress between 5-15% each step
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadedFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, progress: 100, status: 'completed' } : f)
          );
          
          // Show success message
          setTimeout(() => {
            toast.success(`File "${file.name}" uploaded successfully!`, {
              description: 'Ready for analysis. Click "Start Analysis" to begin processing.'
            });
          }, 500);
        } else {
          setUploadedFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, progress } : f)
          );
        }
      }, 200);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const addMetadataField = () => {
    const newField: MetadataField = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      value: '',
      type: 'text'
    };
    setMetadataFields(prev => [...prev, newField]);
  };

  const updateMetadataField = (id: string, updates: Partial<MetadataField>) => {
    setMetadataFields(prev => 
      prev.map(field => field.id === id ? { ...field, ...updates } : field)
    );
  };

  const removeMetadataField = (id: string) => {
    setMetadataFields(prev => prev.filter(field => field.id !== id));
  };

  // Keyboard shortcut for upload modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
        setShowUpload(true);
        toast.info('Upload modal opened', {
          description: 'Ctrl+U keyboard shortcut used'
        });
      }
      if (event.key === 'Escape' && showUpload) {
        setShowUpload(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUpload]);

  // Species detailed data
  const speciesDetailedData: SpeciesData[] = [
    {
      id: '1',
      index: 0,
      name: 'Albifimbria verrucaria',
      abundance: 449,
      confidence: 96.8,
      shannonScore: 2.84,
      location: 'Pacific Coast, CA',
      date: '2024-01-15',
      sampleUploaded: 'Pacific_Coast_Sample_Jan2024.fasta',
      category: 'Marine Algae',
      trend: 'up',
      isNovel: false
    },
    {
      id: '2',
      index: 1,
      name: 'Novel / Rare Candidates (Outliers)',
      abundance: 35,
      confidence: 78.2,
      shannonScore: 1.92,
      location: 'Pacific Coast, CA',
      date: '2024-01-15',
      sampleUploaded: 'Pacific_Coast_Sample_Jan2024.fasta',
      category: 'Unknown',
      trend: 'stable',
      isNovel: true
    },
    {
      id: '3',
      index: 2,
      name: 'Allantophomopsiella pseudotsugae',
      abundance: 16,
      confidence: 89.4,
      shannonScore: 1.45,
      location: 'Pacific Coast, CA',
      date: '2024-01-15',
      sampleUploaded: 'Pacific_Coast_Sample_Jan2024.fasta',
      category: 'Fungi',
      trend: 'down',
      isNovel: false
    },
    {
      id: '4',
      index: 3,
      name: 'Salmo trutta',
      abundance: 287,
      confidence: 94.2,
      shannonScore: 2.67,
      location: 'Arctic Ocean',
      date: '2024-02-03',
      sampleUploaded: 'Arctic_Ocean_Deep_Feb2024.fasta',
      category: 'Fish',
      trend: 'up',
      isNovel: false
    },
    {
      id: '5',
      index: 4,
      name: 'Pseudomonas fluorescens',
      abundance: 156,
      confidence: 92.1,
      shannonScore: 2.34,
      location: 'Mediterranean Sea',
      date: '2024-04-18',
      sampleUploaded: 'Mediterranean_Coastal_Apr2024.fasta',
      category: 'Bacteria',
      trend: 'stable',
      isNovel: false
    },
    {
      id: '6',
      index: 5,
      name: 'Gadus morhua',
      abundance: 198,
      confidence: 93.7,
      shannonScore: 2.51,
      location: 'Arctic Ocean',
      date: '2024-02-03',
      sampleUploaded: 'Arctic_Ocean_Deep_Feb2024.fasta',
      category: 'Fish',
      trend: 'up',
      isNovel: false
    },
    {
      id: '7',
      index: 6,
      name: 'Unknown Marine Species A',
      abundance: 28,
      confidence: 65.3,
      shannonScore: 1.73,
      location: 'Pacific Coast, CA',
      date: '2024-01-15',
      sampleUploaded: 'Pacific_Coast_Sample_Jan2024.fasta',
      category: 'Unknown',
      trend: 'stable',
      isNovel: true
    },
    {
      id: '8',
      index: 7,
      name: 'Vibrio parahaemolyticus',
      abundance: 142,
      confidence: 91.6,
      shannonScore: 2.28,
      location: 'Mediterranean Sea',
      date: '2024-04-18',
      sampleUploaded: 'Mediterranean_Coastal_Apr2024.fasta',
      category: 'Bacteria',
      trend: 'down',
      isNovel: false
    },
    {
      id: '9',
      index: 8,
      name: 'Pleuronectes platessa',
      abundance: 89,
      confidence: 88.9,
      shannonScore: 2.12,
      location: 'Arctic Ocean',
      date: '2024-02-03',
      sampleUploaded: 'Arctic_Ocean_Deep_Feb2024.fasta',
      category: 'Fish',
      trend: 'stable',
      isNovel: false
    },
    {
      id: '10',
      index: 9,
      name: 'Novel Extremophile sp.',
      abundance: 12,
      confidence: 58.7,
      shannonScore: 1.34,
      location: 'Mediterranean Sea',
      date: '2024-04-18',
      sampleUploaded: 'Mediterranean_Coastal_Apr2024.fasta',
      category: 'Unknown',
      trend: 'up',
      isNovel: true
    }
  ];

  // Chart data
  const clusteringData = [
    { cluster: 'Cluster 1', x: 12, y: 15, z: 8, size: 120, species: 'Marine Fish' },
    { cluster: 'Cluster 2', x: 25, y: 20, z: 12, size: 85, species: 'Algae' },
    { cluster: 'Cluster 3', x: 35, y: 10, z: 18, size: 95, species: 'Bacteria' },
    { cluster: 'Cluster 4', x: 20, y: 35, z: 22, size: 75, species: 'Plankton' },
    { cluster: 'Outliers', x: 45, y: 5, z: 30, size: 25, species: 'Novel Species' }
  ];

  const clusterSizeData = [
    { name: 'Cluster 1', sequences: 450, abundance: 32 },
    { name: 'Cluster 2', sequences: 380, abundance: 28 },
    { name: 'Cluster 3', sequences: 320, abundance: 24 },
    { name: 'Cluster 4', sequences: 280, abundance: 18 },
    { name: 'Cluster 5', sequences: 220, abundance: 15 },
    { name: 'Cluster 6', sequences: 180, abundance: 12 },
    { name: 'Outliers', sequences: 45, abundance: 3 }
  ];

  const outlierData = [
    { similarity: 0.95, confidence: 0.92, type: 'Known', species: 'Salmo trutta' },
    { similarity: 0.88, confidence: 0.85, type: 'Known', species: 'Gadus morhua' },
    { similarity: 0.75, confidence: 0.78, type: 'Known', species: 'Pleuronectes platessa' },
    { similarity: 0.45, confidence: 0.52, type: 'Novel', species: 'Unknown sp. 1' },
    { similarity: 0.38, confidence: 0.48, type: 'Novel', species: 'Unknown sp. 2' },
    { similarity: 0.25, confidence: 0.35, type: 'Novel', species: 'Unknown sp. 3' }
  ];

  const environmentalData = [
    { temp: 8, depth: 50, cluster: 'Cluster A', ph: 8.1, salinity: 35 },
    { temp: 12, depth: 75, cluster: 'Cluster A', ph: 8.0, salinity: 34 },
    { temp: 15, depth: 25, cluster: 'Cluster B', ph: 7.9, salinity: 36 },
    { temp: 18, depth: 10, cluster: 'Cluster B', ph: 7.8, salinity: 37 },
    { temp: 22, depth: 5, cluster: 'Cluster C', ph: 7.7, salinity: 38 },
    { temp: 25, depth: 150, cluster: 'Cluster C', ph: 7.6, salinity: 35 }
  ];

  const richnessData = [
    { site: 'Site 1', richness: 45, diversity: 3.2 },
    { site: 'Site 2', richness: 38, diversity: 2.8 },
    { site: 'Site 3', richness: 52, diversity: 3.5 },
    { site: 'Site 4', richness: 41, diversity: 3.0 },
    { site: 'Site 5', richness: 35, diversity: 2.6 },
    { site: 'Site 6', richness: 48, diversity: 3.3 },
    { site: 'Site 7', richness: 43, diversity: 3.1 },
    { site: 'Site 8', richness: 39, diversity: 2.9 }
  ];

  const abundanceTreemapData = [
    { name: 'Marine Fish', value: 450, category: 'Vertebrates' },
    { name: 'Algae', value: 320, category: 'Plants' },
    { name: 'Bacteria', value: 280, category: 'Microorganisms' },
    { name: 'Plankton', value: 220, category: 'Microorganisms' },
    { name: 'Mollusks', value: 180, category: 'Invertebrates' },
    { name: 'Crustaceans', value: 150, category: 'Invertebrates' },
    { name: 'Fungi', value: 120, category: 'Fungi' },
    { name: 'Novel Species', value: 45, category: 'Unknown' }
  ];

  const streamData = [
    { month: 'Jan', fish: 45, algae: 32, bacteria: 28, plankton: 15 },
    { month: 'Feb', fish: 52, algae: 38, bacteria: 31, plankton: 18 },
    { month: 'Mar', fish: 48, algae: 35, bacteria: 29, plankton: 16 },
    { month: 'Apr', fish: 61, algae: 42, bacteria: 36, plankton: 22 },
    { month: 'May', fish: 67, algae: 48, bacteria: 41, plankton: 25 },
    { month: 'Jun', fish: 73, algae: 52, bacteria: 45, plankton: 28 }
  ];

  const predictionData = [
    { quarter: 'Q1 2024', lower: 100, expected: 125, upper: 150 },
    { quarter: 'Q2 2024', lower: 110, expected: 135, upper: 160 },
    { quarter: 'Q3 2024', lower: 105, expected: 137, upper: 170 },
    { quarter: 'Q4 2024', lower: 115, expected: 145, upper: 175 },
    { quarter: 'Q1 2025', lower: 120, expected: 150, upper: 180 },
    { quarter: 'Q2 2025', lower: 125, expected: 155, upper: 185 }
  ];

  const colors = ['#60A5FA', '#F472B6', '#A78BFA', '#34D399', '#FBBF24', '#FB7185', '#38BDF8', '#A3E635'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 rounded-lg p-3">
          <p className="text-white text-sm">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Chart configurations for scrollable layout
  const chartConfigurations = [
    {
      title: "Species Abundance Timeline",
      description: "Temporal analysis of species abundance across different categories",
      chart: (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={streamData}>
            <defs>
              <linearGradient id="fishGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="fish" stackId="1" stroke="#60A5FA" fill="url(#fishGradient)" />
            <Area type="monotone" dataKey="algae" stackId="1" stroke="#34D399" fill="#34D399" fillOpacity={0.3} />
            <Area type="monotone" dataKey="bacteria" stackId="1" stroke="#F472B6" fill="#F472B6" fillOpacity={0.3} />
            <Area type="monotone" dataKey="plankton" stackId="1" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Biodiversity Prediction Intervals",
      description: "Future biodiversity trends with confidence intervals",
      chart: (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="quarter" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="upper" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.1} />
            <Area type="monotone" dataKey="lower" stroke="#60A5FA" fill="#ffffff" fillOpacity={0} />
            <Line type="monotone" dataKey="expected" stroke="#60A5FA" strokeWidth={3} dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Cluster Distribution (UMAP Embeddings)",
      description: "Spatial clustering of genetic sequences using UMAP dimensionality reduction",
      chart: (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={clusteringData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey="x" name="UMAP 1" stroke="#9ca3af" />
            <YAxis type="number" dataKey="y" name="UMAP 2" stroke="#9ca3af" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-black/90 border border-white/10 rounded-lg p-3">
                      <p className="text-white text-sm">{data.cluster}</p>
                      <p className="text-gray-400 text-sm">{data.species}</p>
                      <p className="text-blue-400 text-sm">Size: {data.size}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Clusters" dataKey="size" fill="#60A5FA">
              {clusteringData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Cluster Size Distribution",
      description: "Relative sizes of identified sequence clusters",
      chart: (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={clusterSizeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sequences" fill="#60A5FA" radius={[4, 4, 0, 0]}>
              {clusterSizeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Novelty Detection Analysis",
      description: "Identification of potential novel species based on similarity and confidence scores",
      chart: (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={outlierData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey="similarity" name="Similarity Score" domain={[0, 1]} stroke="#9ca3af" />
            <YAxis type="number" dataKey="confidence" name="Confidence" domain={[0, 1]} stroke="#9ca3af" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-black/90 border border-white/10 rounded-lg p-3">
                      <p className="text-white text-sm">{data.species}</p>
                      <p className="text-gray-400 text-sm">Type: {data.type}</p>
                      <p className="text-blue-400 text-sm">Similarity: {(data.similarity * 100).toFixed(1)}%</p>
                      <p className="text-green-400 text-sm">Confidence: {(data.confidence * 100).toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Known Species" dataKey="confidence" fill="#34D399" />
            <Scatter name="Novel Species" dataKey="confidence" fill="#F472B6" />
          </ScatterChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Environmental Correlations",
      description: "Temperature vs depth distribution by cluster groups",
      chart: (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={environmentalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey="temp" name="Temperature (°C)" stroke="#9ca3af" />
            <YAxis type="number" dataKey="depth" name="Depth (m)" stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Environmental Conditions" dataKey="depth" fill="#60A5FA">
              {environmentalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % 3]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Species Richness by Site",
      description: "Biodiversity metrics across different sampling locations",
      chart: (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={richnessData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="site" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="richness" fill="#60A5FA" radius={[4, 4, 0, 0]}>
              {richnessData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Relative Abundance Distribution",
      description: "Proportional representation of different taxonomic groups",
      chart: (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={abundanceTreemapData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {abundanceTreemapData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )
    }
  ];



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-orange-400';
      case 'pending': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen pt-28 pb-16 parallax-element">
      <div className="container mx-auto px-6 max-w-[1600px] relative">
        {/* Parallax background elements */}
        <motion.div 
          className="absolute top-0 right-0 w-40 h-40 morphing-blob bg-gradient-to-br from-cyan-500/8 to-blue-500/8 blur-2xl"
          style={{ y: y3Spring }}
        />
        <motion.div 
          className="absolute bottom-40 left-0 w-32 h-32 morphing-blob bg-gradient-to-br from-pink-500/8 to-purple-500/8 blur-xl"
          style={{ y: y2Spring }}
        />
        
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center mb-8"
          style={{ y: y1Spring, opacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="font-display text-4xl text-white mb-2 neon-text">eDNA Analysis Dashboard</h1>
            <p className="text-gray-400">Advanced genomic sequencing insights and environmental monitoring</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Button 
                className="glass-button relative bg-white/10 border border-white/20 text-white hover:bg-white/15"
                onClick={() => setShowUpload(true)}
                title="Upload FASTA files (Ctrl+U)"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload FASTA
                {uploadedFiles.filter(f => f.status === 'completed').length > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-mono">
                      {uploadedFiles.filter(f => f.status === 'completed').length}
                    </span>
                  </div>
                )}
              </Button>
            </div>
            <Button className="glass-button-primary bg-blue-500/20 border border-blue-400/30 text-white hover:bg-blue-500/30">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Upload Modal */}
        {showUpload && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-panel p-8 max-w-4xl w-full mx-6 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl text-white">Upload FASTA Files & Metadata</h2>
                  {uploadedFiles.length > 0 && (
                    <p className="text-gray-400 text-sm mt-1">
                      {uploadedFiles.filter(f => f.status === 'completed').length} of {uploadedFiles.length} files ready
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  className="glass-button bg-white/10 border border-white/20 text-white hover:bg-white/15"
                  onClick={() => setShowUpload(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* File Upload Section */}
                <div>
                  <h3 className="text-white text-lg mb-4">FASTA File Upload</h3>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-400/10 scale-[1.02]' 
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className={`transition-all duration-200 ${dragActive ? 'scale-110' : ''}`}>
                      <Upload className={`w-12 h-12 mx-auto mb-4 ${
                        dragActive ? 'text-blue-400' : 'text-white/60'
                      }`} />
                    </div>
                    <p className={`mb-2 ${
                      dragActive ? 'text-blue-400 font-medium' : 'text-white'
                    }`}>
                      {dragActive ? 'Drop files here' : 'Drag & drop FASTA files here'}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      Supports .fasta, .fa, .fas formats • Max 100MB per file
                    </p>
                    <Button
                      className="glass-button bg-white/10 border border-white/20 text-white hover:bg-white/15"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <File className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".fasta,.fa,.fas"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <div className="mt-4 text-xs text-gray-500">
                      Selected files will be automatically analyzed for species identification
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white">Uploaded Files ({uploadedFiles.length})</h4>
                        <Button
                          size="sm"
                          className="glass-button bg-white/10 border border-white/20 text-white hover:bg-white/15 text-xs h-7"
                          onClick={() => setUploadedFiles([])}
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="glass-panel p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span className="text-white text-sm truncate" title={file.file.name}>
                                  {file.file.name}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                className="glass-button bg-white/10 border border-white/20 text-white hover:bg-white/15 h-6 w-6 p-0 ml-2"
                                onClick={() => removeFile(file.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  file.status === 'completed' ? 'bg-green-400' :
                                  file.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                                }`}
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-xs">
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <div className="flex items-center gap-2">
                                {file.status === 'completed' && (
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                )}
                                {file.status === 'uploading' && (
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                )}
                                {file.status === 'error' && (
                                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                )}
                                <span className={`text-xs font-mono ${
                                  file.status === 'completed' ? 'text-green-400' :
                                  file.status === 'error' ? 'text-red-400' : 'text-orange-400'
                                }`}>
                                  {file.status === 'completed' ? 'Complete' :
                                   file.status === 'error' ? 'Error' : `${Math.round(file.progress)}%`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white text-lg">Sample Metadata</h3>
                    <Button
                      size="sm"
                      className="glass-button bg-white/10 border border-white/20 text-white hover:bg-white/15"
                      onClick={addMetadataField}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {metadataFields.map((field) => (
                      <div key={field.id} className="glass-panel p-4 rounded-lg">
                        <div className="flex gap-3 mb-3">
                          <Input
                            placeholder="Field name"
                            value={field.name}
                            onChange={(e) => updateMetadataField(field.id, { name: e.target.value })}
                            className="glass-input flex-1"
                          />
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateMetadataField(field.id, { type: value as any })}
                          >
                            <SelectTrigger className="glass-input w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10">
                              <SelectItem value="text" className="text-white hover:bg-white/10">Text</SelectItem>
                              <SelectItem value="number" className="text-white hover:bg-white/10">Number</SelectItem>
                              <SelectItem value="date" className="text-white hover:bg-white/10">Date</SelectItem>
                              <SelectItem value="select" className="text-white hover:bg-white/10">Select</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            className="glass-button bg-white/10 border border-white/20 text-white hover:bg-white/15 h-10 w-10 p-0"
                            onClick={() => removeMetadataField(field.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {field.type === 'select' ? (
                          <Select value={field.value} onValueChange={(value) => updateMetadataField(field.id, { value })}>
                            <SelectTrigger className="glass-input">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10">
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option} className="text-white hover:bg-white/10">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type}
                            placeholder="Enter value"
                            value={field.value}
                            onChange={(e) => updateMetadataField(field.id, { value: e.target.value })}
                            className="glass-input"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <Button 
                      className="w-full glass-button-primary bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-white hover:from-blue-500/30 hover:to-purple-500/30"
                      disabled={uploadedFiles.filter(f => f.status === 'completed').length === 0}
                      onClick={() => {
                        const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
                        if (completedFiles.length > 0) {
                          toast.success(`Starting analysis for ${completedFiles.length} file(s)`, {
                            description: 'This may take several minutes depending on file size and complexity.'
                          });
                          setShowUpload(false);
                          // Reset uploaded files after starting analysis
                          setTimeout(() => setUploadedFiles([]), 1000);
                        }
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {uploadedFiles.filter(f => f.status === 'completed').length === 0 
                        ? 'Upload Files to Start Analysis' 
                        : `Start Analysis (${uploadedFiles.filter(f => f.status === 'completed').length} files)`
                      }
                    </Button>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Analysis includes sequence clustering, species identification, and environmental correlation
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* File Selection & Overview */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* File Selector */}
          <motion.div 
            className="col-span-12 lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-panel p-6 border-0">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-white" />
                <h3 className="text-white">Analysis Files</h3>
              </div>
              
              <Select value={selectedFile || ''} onValueChange={setSelectedFile}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select FASTA file" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {analysisFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id} className="text-white hover:bg-white/10">
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{file.name}</span>
                        <Badge className={`ml-2 text-xs ${getStatusBadge(file.status)}`}>
                          {file.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedFileData && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>File size:</span>
                    <span className="text-white">{selectedFileData.size}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Upload date:</span>
                    <span className="text-white">{selectedFileData.uploadDate}</span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Summary Cards */}
          {selectedFileData && selectedFileData.status === 'completed' && (
            <motion.div 
              className="col-span-12 lg:col-span-9"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-panel p-6 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Sequences</p>
                      <p className="text-2xl text-white">{selectedFileData.samplesCount.toLocaleString()}</p>
                      <p className="text-green-400 text-sm">+12.4%</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-6 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Clusters Found</p>
                      <p className="text-2xl text-white">{selectedFileData.clusters}</p>
                      <p className="text-blue-400 text-sm">Optimal</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-6 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">% Novelty / Outliers</p>
                      <p className="text-2xl text-white">{selectedFileData.noveltyPercentage}%</p>
                      <p className="text-orange-400 text-sm">{selectedFileData.novelSpecies} species</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-6 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Sampling Sites</p>
                      <p className="text-2xl text-white">{selectedFileData.samplingSites}</p>
                      <p className="text-green-400 text-sm">Geographic</p>
                    </div>
                    <MapPin className="w-8 h-8 text-green-400" />
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Dashboard Content */}
        {!selectedFileData || selectedFileData.status !== 'completed' ? (
          <Card className="glass-panel p-12 border-0 text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-white text-xl mb-2">
              {!selectedFileData ? 'Select Analysis File' : 'Processing Analysis'}
            </h3>
            <p className="text-gray-400">
              {!selectedFileData 
                ? 'Choose a FASTA file to view comprehensive analysis results'
                : 'Your file is being processed. Advanced analytics will be available shortly.'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Charts Grid Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="mb-8">
                <div>
                  <h2 className="text-2xl text-white mb-2">Analysis Visualizations</h2>
                  <p className="text-gray-400">Comprehensive analytical charts and insights - scroll to view all</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {chartConfigurations.map((chartConfig, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Card className="chart-container border-0 p-8">
                      <div className="mb-6">
                        <h3 className="text-xl text-white mb-2">{chartConfig.title}</h3>
                        <p className="text-gray-400 text-sm">{chartConfig.description}</p>
                      </div>
                      {chartConfig.chart}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Species Data Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {/* Species Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="glass-panel p-4 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Species</p>
                      <p className="text-2xl text-white">{speciesDetailedData.length}</p>
                    </div>
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-4 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Novel Species</p>
                      <p className="text-2xl text-white">{speciesDetailedData.filter(s => s.isNovel).length}</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-4 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Confidence</p>
                      <p className="text-2xl text-white">
                        {(speciesDetailedData.reduce((acc, s) => acc + s.confidence, 0) / speciesDetailedData.length).toFixed(1)}%
                      </p>
                    </div>
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-4 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Abundance</p>
                      <p className="text-2xl text-white">
                        {speciesDetailedData.reduce((acc, s) => acc + s.abundance, 0).toLocaleString()}
                      </p>
                    </div>
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                </Card>
              </div>

              {/* Species Data Table */}
              <Card className="glass-panel border-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white text-xl mb-1">Predicted Organism Count</h3>
                      <p className="text-gray-400 text-sm">Detailed species analysis with confidence scores and abundance data</p>
                    </div>
                    <div className="flex gap-3">
                      <Button className="glass-button">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button className="glass-button">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full data-table rounded-lg">
                      <thead>
                        <tr>
                          <th className="text-left">#</th>
                          <th className="text-left">Species Name</th>
                          <th className="text-right">Abundance</th>
                          <th className="text-right">Confidence %</th>
                          <th className="text-right">Shannon Score</th>
                          <th className="text-left">Location</th>
                          <th className="text-left">Date</th>
                          <th className="text-left">Sample File</th>
                          <th className="text-center">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {speciesDetailedData.map((species) => (
                          <tr key={species.id} className="hover:bg-white/5 transition-colors">
                            <td>
                              <span className="text-gray-400 text-sm font-mono">{species.index}</span>
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="text-white font-medium">{species.name}</div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">{species.category}</span>
                                    {species.isNovel && (
                                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                                        Novel
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right">
                              <span className="text-white font-mono">{species.abundance}</span>
                            </td>
                            <td className="text-right">
                              <span className={`font-mono ${
                                species.confidence > 90 
                                  ? 'text-green-400' 
                                  : species.confidence > 80 
                                    ? 'text-orange-400' 
                                    : 'text-red-400'
                              }`}>
                                {species.confidence.toFixed(1)}%
                              </span>
                            </td>
                            <td className="text-right">
                              <span className="text-white font-mono">{species.shannonScore.toFixed(2)}</span>
                            </td>
                            <td>
                              <div className="flex items-center gap-2 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{species.location}</span>
                              </div>
                            </td>
                            <td>
                              <span className="text-gray-400 text-sm">{species.date}</span>
                            </td>
                            <td>
                              <span className="text-gray-400 text-sm max-w-xs truncate block" title={species.sampleUploaded}>
                                {species.sampleUploaded}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="flex items-center justify-center">
                                {species.trend === 'up' && <ChevronUp className="w-4 h-4 text-green-400" />}
                                {species.trend === 'down' && <ChevronDown className="w-4 h-4 text-red-400" />}
                                {species.trend === 'stable' && <div className="w-4 h-4 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                </div>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <div className="text-gray-400 text-sm">
                      Showing {speciesDetailedData.length} species • Total abundance: {speciesDetailedData.reduce((acc, s) => acc + s.abundance, 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="glass-button">
                        Previous
                      </Button>
                      <span className="text-gray-400 text-sm">Page 1 of 1</span>
                      <Button size="sm" className="glass-button">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}