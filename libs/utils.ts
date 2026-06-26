import { AnalysisResponse, ApiResponse, CachedAnalysis } from "./types";

export async function analyzeUrl(
  url: string,
): Promise<ApiResponse<AnalysisResponse>> {
  try {
    const response = await fetch("api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.error ?? body.message ?? `HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    return data as ApiResponse<AnalysisResponse>;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllHistory(): Promise<ApiResponse<CachedAnalysis[]>> {
  try {
    const response = await fetch("/api/history");
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.error ?? body.message ?? `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data as ApiResponse<CachedAnalysis[]>;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
