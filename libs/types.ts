export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, string | number | boolean>;
}

export interface AnalysisResponse {
  companyName: string;
  summary: string;
  targetCustomers: string[];
  businessModel: string;
  keyFeatures: string[];
  likelyCompetitors: string[];
  confidenceNotes: string;
}

export interface CachedAnalysis extends AnalysisResponse {
  id: string;
  url: string;
  searchcount: number;
  created_at: string;
  updated_at: string;
  is_success: boolean;
  error?: string;
}
