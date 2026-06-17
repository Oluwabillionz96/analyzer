import { AnalysisResponse, ApiResponse } from "./types";

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
      throw new Error(`HTTP error! status: ${response.status}`);
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


