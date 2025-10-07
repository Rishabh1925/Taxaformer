import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { 
  Microscope, Database, TrendingUp, Thermometer, 
  Layers, Activity, Award, Globe, FileText, Loader2, AlertCircle 
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { apiService } from '../services/api';

interface Fungal28sData {
  analysis_type: string;
  data_source: string;
  analysis_results: {
    analysis_metadata: {
      timestamp: string;
      version: string;
      model_used: string;
      clustering_method: string;
      input_dataset: string;
    };
    summary_statistics: {
      total_sequences_analyzed: number;
      known_species_count: number;
      novel_candidates_count: number;
      total_clusters_identified: number;
      species_diversity: number;
      novelty_discovery_rate: number;
    };
    species_distribution: Record<string, number>;
    environmental_analysis: {
      depth_distribution: Record<string, number>;
      temperature_distribution: Record<string, number>;
      depth_range: {
        min: number;
        max: number;
        average: number;
      };
      temperature_range: {
        min: number;
        max: number;
        average: number;
      };
    };
    geographic_distribution: Array<{
      lat: number;
      lng: number;
      species: string;
    }>;
    cluster_analysis: Record<string, number>;
    research_insights: {
      biodiversity_hotspots: string;
      novel_discovery_potential: string;
      ecological_significance: string;
      biotechnology_applications: string;
    };
  };
  visualization_data: {
    species_abundance_chart: Array<{ species: string; count: number }>;
    depth_distribution_chart: Array<{ depth_category: string; count: number }>;
    temperature_distribution_chart: Array<{ temperature_category: string; count: number }>;
    geographic_map_data: Array<{ lat: number; lng: number; species: string }>;
  };
  key_insights: string[];
}

export function Fungal28sAnalysis() {
  const [fungalData, setFungalData] = useState<Fungal28sData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFungalAnalysis();
  }, []);

  const loadFungalAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFungal28sAnalysis();
      setFungalData(data);
    } catch (err) {
      setError('Failed to load 28S fungal analysis data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Card className="glass-panel p-12 border-0 text-center">
        <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
        <h3 className="text-white text-xl mb-2">Loading 28S Fungal Analysis</h3>
        <p className="text-gray-400">Processing fungal sequence data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-panel p-12 border-0 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-white text-xl mb-2">Error Loading Data</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button 
          onClick={loadFungalAnalysis} 
          className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 text-white font-medium px-6 py-2.5 rounded-2xl transition-all duration-200 hover:border-gray-500/70"
        >
          Retry
        </Button>
      </Card>
    );
  }

  if (!fungalData) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Microscope className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">28S Fungal Sequences Analysis</h2>
        </div>
        <p className="text-gray-400 mb-2">{fungalData.data_source}</p>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          {fungalData.analysis_results.analysis_metadata.model_used}
        </Badge>
      </motion.div>

      {/* Summary Statistics */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="glass-panel p-4 border-0">
          <div className="text-center">
            <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl text-white font-bold">
              {fungalData.analysis_results.summary_statistics.total_sequences_analyzed.toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm">Total Sequences</p>
          </div>
        </Card>

        <Card className="glass-panel p-4 border-0">
          <div className="text-center">
            <Database className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl text-white font-bold">
              {fungalData.analysis_results.summary_statistics.known_species_count}
            </p>
            <p className="text-gray-400 text-sm">Known Species</p>
          </div>
        </Card>

        <Card className="glass-panel p-4 border-0">
          <div className="text-center">
            <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl text-white font-bold">
              {fungalData.analysis_results.summary_statistics.novel_candidates_count}
            </p>
            <p className="text-gray-400 text-sm">Novel Candidates</p>
          </div>
        </Card>

        <Card className="glass-panel p-4 border-0">
          <div className="text-center">
            <Layers className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl text-white font-bold">
              {fungalData.analysis_results.summary_statistics.total_clusters_identified}
            </p>
            <p className="text-gray-400 text-sm">Clusters</p>
          </div>
        </Card>

        <Card className="glass-panel p-4 border-0">
          <div className="text-center">
            <Activity className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl text-white font-bold">
              {fungalData.analysis_results.summary_statistics.species_diversity}
            </p>
            <p className="text-gray-400 text-sm">Species Diversity</p>
          </div>
        </Card>

        <Card className="glass-panel p-4 border-0">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl text-white font-bold">
              {fungalData.analysis_results.summary_statistics.novelty_discovery_rate}%
            </p>
            <p className="text-gray-400 text-sm">Novelty Rate</p>
          </div>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Abundance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass-panel p-6 border-0">
            <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Top Species by Abundance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fungalData.visualization_data.species_abundance_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="species" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Depth Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="glass-panel p-6 border-0">
            <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-400" />
              Depth Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fungalData.visualization_data.depth_distribution_chart}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ depth_category, count }) => `${depth_category}: ${count}`}
                >
                  {fungalData.visualization_data.depth_distribution_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Temperature Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="glass-panel p-6 border-0">
            <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-400" />
              Temperature Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fungalData.visualization_data.temperature_distribution_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="temperature_category" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#F472B6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Environmental Ranges */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="glass-panel p-6 border-0">
            <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Environmental Ranges
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Depth Range (meters)</h4>
                <div className="flex justify-between items-center">
                  <span className="text-white">Min: {fungalData.analysis_results.environmental_analysis.depth_range.min.toFixed(1)}m</span>
                  <span className="text-white">Max: {fungalData.analysis_results.environmental_analysis.depth_range.max.toFixed(1)}m</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-blue-400">Average: {fungalData.analysis_results.environmental_analysis.depth_range.average.toFixed(1)}m</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Temperature Range (°C)</h4>
                <div className="flex justify-between items-center">
                  <span className="text-white">Min: {fungalData.analysis_results.environmental_analysis.temperature_range.min.toFixed(1)}°C</span>
                  <span className="text-white">Max: {fungalData.analysis_results.environmental_analysis.temperature_range.max.toFixed(1)}°C</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-red-400">Average: {fungalData.analysis_results.environmental_analysis.temperature_range.average.toFixed(1)}°C</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Research Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <Card className="glass-panel p-6 border-0">
          <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Research Insights & Applications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-purple-400 font-medium mb-2">Biodiversity Hotspots</h4>
              <p className="text-gray-300 text-sm mb-4">
                {fungalData.analysis_results.research_insights.biodiversity_hotspots}
              </p>
              
              <h4 className="text-green-400 font-medium mb-2">Novel Discovery Potential</h4>
              <p className="text-gray-300 text-sm">
                <Badge className={`mr-2 ${
                  fungalData.analysis_results.research_insights.novel_discovery_potential === 'High' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : fungalData.analysis_results.research_insights.novel_discovery_potential === 'Moderate'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {fungalData.analysis_results.research_insights.novel_discovery_potential}
                </Badge>
                discovery potential based on current analysis
              </p>
            </div>
            
            <div>
              <h4 className="text-blue-400 font-medium mb-2">Ecological Significance</h4>
              <p className="text-gray-300 text-sm mb-4">
                {fungalData.analysis_results.research_insights.ecological_significance}
              </p>
              
              <h4 className="text-orange-400 font-medium mb-2">Biotechnology Applications</h4>
              <p className="text-gray-300 text-sm">
                {fungalData.analysis_results.research_insights.biotechnology_applications}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <Card className="glass-panel p-6 border-0">
          <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Key Analysis Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fungalData.key_insights.map((insight, index) => (
              <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/10">
                <p className="text-gray-300 text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}