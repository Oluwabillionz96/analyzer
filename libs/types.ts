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
  origin: string;
  searchcount: number;
  created_at: string;
  updated_at: string;
  is_success: boolean;
  error?: string;
}

export interface PageLink {
  href: string;
  origin: string;
  anchor: string;
}

export interface SitePageContent {
  text: string;
  links: PageLink[];
}

export interface PageContentInput {
  url: string;
  text: string;
}

export type SORTVALUES = "most-recent" | "oldest" | "most-searched" | "least-searched";

export type PageContent = { url: string; text: string };
