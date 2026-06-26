export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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
  created_at: string;
  searchcount: number;
  updated_at: string;
}
