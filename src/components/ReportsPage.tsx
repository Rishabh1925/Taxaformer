import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, Legend, BarChart, Bar, ScatterChart, Scatter, Cell, RadialBarChart, RadialBar,
  PieChart, Pie, ComposedChart, TreeMap
} from 'recharts';
import { FileText, Download, Filter, Calendar, TrendingUp, Users, File, Upload, Search, Eye, Database, Zap, MapPin, Clock, Award, BarChart3, Activity, Layers, Globe, ArrowUpDown, ChevronUp, ChevronDown, Loader2, X, CheckCircle, AlertCircle, FileUp, CloudUpload } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { apiService, FastaFile, AnalysisReport } from '../services/api';

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

export function ReportsPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [fastaFiles, setFastaFiles] = useState<FastaFile[]>([]);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Metadata states
  const [metadataFields, setMetadataFields] = useState([
    { id: 'location', label: 'Sample Location', type: 'text', value: '', required: true },
    { id: 'date', label: 'Collection Date', type: 'date', value: '', required: true },
    { id: 'temperature', label: 'Water Temperature (°C)', type: 'number', value: '', required: false }
  ]);

  // Load FASTA files on component mount
  useEffect(() => {
    loadFastaFiles();
  }, []);

  // Load analysis report when file is selected
  useEffect(() => {
    if (selectedFile) {
      loadAnalysisReport(selectedFile);
    }
  }, [selectedFile]);

  const loadFastaFiles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFastaFiles();
      setFastaFiles(response.files);
      if (response.files.length > 0 && !selectedFile) {
        setSelectedFile(response.files[0].id);
      }
    } catch (err) {
      setError('Failed to load FASTA files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysisReport = async (fileId: string) => {
    try {
      setLoading(true);
      setError(null);
      const report = await apiService.getAnalysisReport(fileId);
      setAnalysisReport(report);
    } catch (err) {
      setError('Failed to load analysis report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Upload functions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.fasta') || file.name.endsWith('.fa') || file.name.endsWith('.fas')) {
        setUploadFile(file);
      } else {
        alert('Please upload a valid FASTA file (.fasta, .fa, .fas)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.fasta') || file.name.endsWith('.fa') || file.name.endsWith('.fas')) {
        setUploadFile(file);
      } else {
        alert('Please upload a valid FASTA file (.fasta, .fa, .fas)');
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Create FormData with file and metadata
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      // Convert metadata fields to object
      const metadataObject = metadataFields.reduce((acc, field) => {
        if (field.value) {
          acc[field.id] = {
            label: field.label,
            value: field.value,
            type: field.type
          };
        }
        return acc;
      }, {} as any);
      
      formData.append('metadata', JSON.stringify(metadataObject));

      // Upload file using API service
      await apiService.uploadFastaFile(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Refresh file list
      setTimeout(() => {
        loadFastaFiles();
        setShowUploadModal(false);
        resetUploadState();
      }, 2000);
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadState = () => {
    setUploadFile(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setIsUploading(false);
    setMetadataFields([
      { id: 'location', label: 'Sample Location', type: 'text', value: '', required: true },
      { id: 'date', label: 'Collection Date', type: 'date', value: '', required: true },
      { id: 'temperature', label: 'Water Temperature (°C)', type: 'number', value: '', required: false }
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addMetadataField = () => {
    const fieldTypes = [
      { value: 'text', label: 'Text' },
      { value: 'number', label: 'Number' },
      { value: 'date', label: 'Date' },
      { value: 'select', label: 'Dropdown' }
    ];
    
    const newField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      value: '',
      required: false
    };
    
    setMetadataFields([...metadataFields, newField]);
  };

  const updateMetadataField = (id: string, updates: any) => {
    setMetadataFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeMetadataField = (id: string) => {
    setMetadataFields(fields => fields.filter(field => field.id !== id));
  };

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

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 max-w-[1600px]">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl text-white mb-2">eDNA Analysis Dashboard</h1>
            <p className="text-gray-400">Advanced genomic sequencing insights and environmental monitoring</p>
          </div>
          <div className="flex gap-3">
            <Button 
              className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-6 py-2.5 rounded-2xl transition-all duration-200 hover:border-gray-500/70"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload FASTA
            </Button>
            <Button className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-6 py-2.5 rounded-2xl transition-all duration-200 hover:border-gray-500/70">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

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
                <SelectTrigger className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select FASTA file" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {fastaFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id} className="text-white hover:bg-white/10">
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{file.name}</span>
                        <Badge className="ml-2 text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          {file.sample_type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {analysisReport && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Location:</span>
                    <span className="text-white">{analysisReport.file_info.location}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Collection Date:</span>
                    <span className="text-white">{analysisReport.file_info.collection_date}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Sample Type:</span>
                    <span className="text-white">{analysisReport.file_info.sample_type}</span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Summary Cards */}
          {analysisReport && (
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
                      <p className="text-2xl text-white">{analysisReport.summary_statistics.total_sequences_analyzed.toLocaleString()}</p>
                      <p className="text-green-400 text-sm">Analyzed</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-6 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Species Detected</p>
                      <p className="text-2xl text-white">{analysisReport.summary_statistics.total_species_detected}</p>
                      <p className="text-blue-400 text-sm">Identified</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-6 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Shannon Diversity</p>
                      <p className="text-2xl text-white">{analysisReport.summary_statistics.shannon_diversity_index}</p>
                      <p className="text-orange-400 text-sm">Index</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-6 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Confidence</p>
                      <p className="text-2xl text-white">{(analysisReport.summary_statistics.average_confidence_score * 100).toFixed(1)}%</p>
                      <p className="text-green-400 text-sm">Score</p>
                    </div>
                    <MapPin className="w-8 h-8 text-green-400" />
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Dashboard Content */}
        {loading ? (
          <Card className="glass-panel p-12 border-0 text-center">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">Loading Analysis</h3>
            <p className="text-gray-400">Fetching analysis data from server...</p>
          </Card>
        ) : error ? (
          <Card className="glass-panel p-12 border-0 text-center">
            <div className="w-16 h-16 border-4 border-red-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <h3 className="text-white text-xl mb-2">Error Loading Data</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={() => selectedFile && loadAnalysisReport(selectedFile)} className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-6 py-2.5 rounded-2xl transition-all duration-200 hover:border-gray-500/70">
              Retry
            </Button>
          </Card>
        ) : !analysisReport ? (
          <Card className="glass-panel p-12 border-0 text-center">
            <div className="w-16 h-16 border-4 border-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white text-xl mb-2">Select Analysis File</h3>
            <p className="text-gray-400">Choose a FASTA file to view comprehensive analysis results</p>
          </Card>
        ) : (
          <div className="w-full space-y-8">
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Comprehensive eDNA Analysis Dashboard</h2>
              <p className="text-gray-400">Complete analysis overview for {analysisReport.file_info.name}</p>
            </div>

            {/* Overview Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-semibold text-white">Species Overview & Trends</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="chart-container p-6 border-0">
                  <h4 className="text-white mb-4 text-lg font-medium">Species Abundance Timeline</h4>
                  <ResponsiveContainer width="100%" height={300}>
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
                </Card>

                <Card className="chart-container p-6 border-0">
                  <h4 className="text-white mb-4 text-lg font-medium">Biodiversity Prediction Intervals</h4>
                  <ResponsiveContainer width="100%" height={300}>
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
                </Card>
              </div>
            </div>

            {/* Clustering Analysis Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h3 className="text-2xl font-semibold text-white">Clustering & Pattern Analysis</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="chart-container p-6 border-0">
                  <h4 className="text-white mb-4 text-lg font-medium">Cluster Distribution (UMAP Embeddings)</h4>
                  <ResponsiveContainer width="100%" height={350}>
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
                </Card>

                <Card className="chart-container p-6 border-0">
                  <h4 className="text-white mb-4 text-lg font-medium">Cluster Size Distribution</h4>
                  <ResponsiveContainer width="100%" height={350}>
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
                </Card>
              </div>

              <Card className="chart-container p-6 border-0">
                <h4 className="text-white mb-4 text-lg font-medium">Novelty Detection Analysis</h4>
                <ResponsiveContainer width="100%" height={300}>
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
              </Card>
            </div>

            {/* Environmental Analysis Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-green-400" />
                <h3 className="text-2xl font-semibold text-white">Environmental Conditions</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="chart-container p-6 border-0">
                  <h4 className="text-white mb-4 text-lg font-medium">Temperature vs Depth by Cluster</h4>
                  <ResponsiveContainer width="100%" height={300}>
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
                </Card>

                <Card className="chart-container p-6 border-0">
                  <h4 className="text-white mb-4 text-lg font-medium">Environmental Parameter Ranges</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { param: 'Temperature', min: 5, max: 25, avg: 15 },
                      { param: 'Depth', min: 5, max: 150, avg: 60 },
                      { param: 'pH', min: 7.6, max: 8.1, avg: 7.8 },
                      { param: 'Salinity', min: 34, max: 38, avg: 36 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="param" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="min" stackId="a" fill="#60A5FA" fillOpacity={0.3} />
                      <Bar dataKey="avg" stackId="a" fill="#34D399" />
                      <Bar dataKey="max" stackId="a" fill="#F472B6" fillOpacity={0.3} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>

            {/* Biodiversity Analysis Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-6 h-6 text-orange-400" />
                <h3 className="text-2xl font-semibold text-white">Biodiversity Metrics</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="chart-container p-6 border-0">
                  <h4 className="text-white mb-4 text-lg font-medium">Species Richness by Site</h4>
                  <ResponsiveContainer width="100%" height={300}>
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
                </Card>

                <Card className="chart-container p-6 border-0 lg:col-span-2">
                  <h4 className="text-white mb-4 text-lg font-medium">Relative Abundance Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={abundanceTreemapData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
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
                </Card>
              </div>
            </div>

            {/* Species Data Analysis Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-cyan-400" />
                <h3 className="text-2xl font-semibold text-white">Species Data & Analysis</h3>
              </div>
              
              {/* Species Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="glass-panel p-4 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Species</p>
                      <p className="text-2xl text-white">{analysisReport ? analysisReport.summary_statistics.total_species_detected : speciesDetailedData.length}</p>
                    </div>
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-4 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Sequences</p>
                      <p className="text-2xl text-white">{analysisReport ? analysisReport.summary_statistics.total_sequences_analyzed.toLocaleString() : '0'}</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-4 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Confidence</p>
                      <p className="text-2xl text-white">
                        {analysisReport ? (analysisReport.summary_statistics.average_confidence_score * 100).toFixed(1) + '%' : '0%'}
                      </p>
                    </div>
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                </Card>
                
                <Card className="glass-panel p-4 border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Biomass</p>
                      <p className="text-2xl text-white">
                        {analysisReport ? analysisReport.summary_statistics.total_biomass_estimate.toFixed(2) : '0'}
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
                      <Button className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-4 py-2 rounded-2xl transition-all duration-200 hover:border-gray-500/70">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-4 py-2 rounded-2xl transition-all duration-200 hover:border-gray-500/70">
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
                      <Button className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-3 py-1.5 rounded-2xl transition-all duration-200 hover:border-gray-500/70 text-sm">
                        Previous
                      </Button>
                      <span className="text-gray-400 text-sm">Page 1 of 1</span>
                      <Button className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-3 py-1.5 rounded-2xl transition-all duration-200 hover:border-gray-500/70 text-sm">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              {/* Species Data Table */}
              <Card className="glass-panel border-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-white text-xl mb-1 font-medium">Detected Species Details</h4>
                      <p className="text-gray-400 text-sm">Real-time species analysis from backend API</p>
                    </div>
                    <div className="flex gap-3">
                      <Button className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-4 py-2 rounded-2xl transition-all duration-200 hover:border-gray-500/70">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-4 py-2 rounded-2xl transition-all duration-200 hover:border-gray-500/70">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  {analysisReport && (
                    <div className="overflow-x-auto">
                      <table className="w-full data-table rounded-lg">
                        <thead>
                          <tr>
                            <th className="text-left">Species</th>
                            <th className="text-left">Common Name</th>
                            <th className="text-right">Abundance</th>
                            <th className="text-right">Confidence</th>
                            <th className="text-right">Sequences</th>
                            <th className="text-left">Kingdom</th>
                            <th className="text-left">Phylum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisReport.species_composition.map((species, index) => (
                            <tr key={species.species_id} className="hover:bg-white/5 transition-colors">
                              <td>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                    {species.scientific_name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-white font-medium text-sm">{species.scientific_name}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="text-gray-300 text-sm">{species.common_name}</span>
                              </td>
                              <td className="text-right">
                                <span className="text-white font-medium">{species.abundance}%</span>
                              </td>
                              <td className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-300"
                                      style={{ width: `${species.confidence_score * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-white text-sm font-medium min-w-[3rem]">{(species.confidence_score * 100).toFixed(1)}%</span>
                                </div>
                              </td>
                              <td className="text-right">
                                <span className="text-white">{species.sequence_count}</span>
                              </td>
                              <td>
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                  {species.kingdom}
                                </Badge>
                              </td>
                              <td>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  {species.phylum}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(16px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              className="border border-white/20 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(249, 115, 22, 0.08) 25%, rgba(6, 182, 212, 0.08) 75%, rgba(0, 0, 0, 0.85) 100%)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Upload FASTA Files & Metadata</h2>
                <Button
                  className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-3 py-2 rounded-2xl transition-all duration-200 hover:border-gray-500/70"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {!uploadSuccess ? (
                <div className="flex h-[600px]">
                  {/* Left Side - FASTA File Upload */}
                  <div className="flex-1 p-6 border-r border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6">FASTA File Upload</h3>
                    
                    <div
                      className={`relative border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-blue-400 bg-blue-400/10'
                          : uploadFile
                          ? 'border-green-400 bg-green-400/10'
                          : 'border-white/20 hover:border-white/30 bg-black/20'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".fasta,.fa,.fas"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {uploadFile ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{uploadFile.name}</p>
                            <p className="text-gray-200 text-sm">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-8 h-8 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-lg">
                              {dragActive ? 'Drop your FASTA file here' : 'Drag & drop FASTA files here'}
                            </p>
                            <p className="text-gray-200 text-sm mt-2">Supports .fasta, .fa, .fas formats</p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="mt-6 text-center">
                      <Button
                        className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-6 py-2.5 rounded-2xl transition-all duration-200 hover:border-gray-500/70"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  {/* Right Side - Sample Metadata */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Sample Metadata</h3>
                      <Button
                        className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-4 py-2 rounded-2xl transition-all duration-200 hover:border-gray-500/70"
                        onClick={addMetadataField}
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {metadataFields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Field name"
                              value={field.label}
                              onChange={(e) => updateMetadataField(field.id, { label: e.target.value })}
                              className="flex-1 bg-black/50 border-white/40 text-white placeholder:text-gray-300 text-sm focus:bg-black/70 focus:border-white/60"
                            />
                            <Select 
                              value={field.type} 
                              onValueChange={(value) => updateMetadataField(field.id, { type: value })}
                            >
                              <SelectTrigger className="w-24 bg-black/50 border-white/40 text-white text-sm focus:bg-black/70 focus:border-white/60">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/95 border-white/40 backdrop-blur-md">
                                <SelectItem value="text" className="text-white hover:bg-white/10">Text</SelectItem>
                                <SelectItem value="number" className="text-white hover:bg-white/10">Number</SelectItem>
                                <SelectItem value="date" className="text-white hover:bg-white/10">Date</SelectItem>
                              </SelectContent>
                            </Select>
                            {metadataFields.length > 1 && (
                              <Button
                                className="bg-red-800/60 hover:bg-red-700/80 border border-red-600/50 text-red-200 font-medium px-3 py-2 rounded-2xl transition-all duration-200 hover:border-red-500/70"
                                onClick={() => removeMetadataField(field.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <Input
                            type={field.type}
                            placeholder="Enter value"
                            value={field.value}
                            onChange={(e) => updateMetadataField(field.id, { value: e.target.value })}
                            className="bg-black/60 border-white/40 text-white placeholder:text-gray-300 focus:bg-black/80 focus:border-white/60"
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">Uploading...</span>
                          <span className="text-white font-medium">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-black/80 rounded-full h-3 overflow-hidden border border-white/30">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full shadow-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Action Button */}
                    <div className="mt-6">
                      <Button
                        className="w-full bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium py-3 rounded-2xl transition-all duration-200 hover:border-gray-500/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        onClick={handleUpload}
                        disabled={!uploadFile || isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            Start Analysis
                            <ChevronUp className="w-4 h-4 ml-2 rotate-90" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Upload Successful!</h3>
                    <p className="text-gray-200">Your FASTA file has been uploaded and analysis will begin shortly.</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-green-200 font-medium">{uploadFile?.name}</p>
                    <p className="text-gray-200 text-sm">Analysis in progress...</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}