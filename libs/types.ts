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

