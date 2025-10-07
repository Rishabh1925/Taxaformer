const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ||
  ((import.meta as any).env?.MODE === 'production'
    ? 'https://taxaformer-1.onrender.com'
    : 'http://localhost:8000');

export interface FastaFile {
  id: string;
  name: string;
  location: string;
  collection_date: string;
  sample_type: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  depth: number;
  species_count: number;
  novel_species: number;
  novelty_percentage: number;
  biodiversity_index: number;
  environmental_score: number;
}

export interface Species {
  species_id: string;
  scientific_name: string;
  common_name: string;
  kingdom: string;
  phylum: string;
  abundance: number;
  confidence_score: number;
  sequence_count: number;
  biomass_estimate: number;
}

export interface AnalysisReport {
  file_info: FastaFile;
  analysis_metadata: {
    analysis_id: string;
    processed_date: string;
    processing_time: string;
    pipeline_version: string;
    database_version: string;
    analysis_type?: string;
  };
  summary_statistics: {
    total_species_detected: number;
    total_sequences_analyzed: number;
    total_biomass_estimate: number;
    average_confidence_score: number;
    shannon_diversity_index: number;
    simpson_diversity_index: number;
    novel_species_count?: number;
    novel_species_percentage?: number;
  };
  species_composition: Species[];
  environmental_parameters: Record<string, any>;
  taxonomic_breakdown: {
    kingdoms: Record<string, number>;
    phylums: Record<string, number>;
  };
  quality_metrics: {
    sequence_quality_score: number;
    contamination_level: number;
    coverage_depth: string;
    gc_content: number;
  };
  temporal_analysis: {
    seasonal_variation: number;
    stability_index: number;
    trend_direction: string;
  };
  specialized_analysis?: {
    analysis_type: string;
    key_findings: Record<string, any>;
    extremophile_characteristics?: Record<string, any>;
    oceanographic_indicators?: Record<string, any>;
    water_quality_indicators?: Record<string, any>;
    nutrient_cycling?: Record<string, any>;
    microbial_indicators?: Record<string, any>;
    research_implications?: Record<string, any>;
    management_recommendations?: Record<string, any>;
    public_health_implications?: Record<string, any>;
    [key: string]: any;
  };
  chart_data?: {
    radar_data: Array<{
      metric: string;
      value: number;
      fullMark: number;
    }>;
    clustering_data: Array<{
      cluster: string;
      x: number;
      y: number;
      z: number;
      size: number;
      species: string;
    }>;
    cluster_size_data: Array<{
      name: string;
      sequences: number;
      abundance: number;
    }>;
    environmental_data: Array<Record<string, any>>;
    richness_data: Array<{
      site: string;
      richness: number;
      diversity: number;
    }>;
    abundance_treemap_data: Array<{
      name: string;
      value: number;
      category: string;
    }>;
    prediction_data: Array<{
      quarter: string;
      lower: number;
      expected: number;
      upper: number;
    }>;
    outlier_data: Array<{
      similarity: number;
      confidence: number;
      type: string;
      species: string;
    }>;
  };
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getFastaFiles(): Promise<{ files: FastaFile[] }> {
    const response = await fetch(`${this.baseUrl}/fasta-files`);
    if (!response.ok) {
      throw new Error('Failed to fetch FASTA files');
    }
    return response.json();
  }

  async getAnalysisReport(fileId: string): Promise<AnalysisReport> {
    const response = await fetch(`${this.baseUrl}/analysis/${fileId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch analysis report for ${fileId}`);
    }
    return response.json();
  }

  async getSpeciesDetails(fileId: string, speciesId?: string): Promise<any> {
    const url = speciesId
      ? `${this.baseUrl}/analysis/${fileId}/species?species_id=${speciesId}`
      : `${this.baseUrl}/analysis/${fileId}/species`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch species details');
    }
    return response.json();
  }

  async getEnvironmentalAnalysis(fileId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/analysis/${fileId}/environmental`);
    if (!response.ok) {
      throw new Error('Failed to fetch environmental analysis');
    }
    return response.json();
  }

  async compareSamples(fileIds: string[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/comparison?file_ids=${fileIds.join(',')}`);
    if (!response.ok) {
      throw new Error('Failed to compare samples');
    }
    return response.json();
  }

  async uploadFastaFile(formData: FormData): Promise<{ success: boolean; fileId: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/upload-fasta`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload FASTA file');
    }

    return response.json();
  }
}

export const apiService = new ApiService();

// Convenience functions for easier imports
export const fetchFastaFiles = async (): Promise<FastaFile[]> => {
  const response = await apiService.getFastaFiles();
  return response.files;
};

export const fetchAnalysisReports = async (): Promise<Record<string, AnalysisReport>> => {
  try {
    const { files } = await apiService.getFastaFiles();
    const reports: Record<string, AnalysisReport> = {};

    // Try to fetch analysis reports for each file
    for (const file of files) {
      try {
        const report = await apiService.getAnalysisReport(file.id);
        reports[file.id] = report;
      } catch (err) {
        console.warn(`Failed to fetch analysis report for ${file.id}:`, err);
        // Continue with other files even if one fails
      }
    }
    
    return reports;
  } catch (err) {
    console.error('Failed to fetch analysis reports:', err);
    return {};
  }
};