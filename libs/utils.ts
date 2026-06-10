import { AnalyzeResponse, ApiResponse } from "./types";

export async function analyzeUrl(
  url: string,
): Promise<ApiResponse<AnalyzeResponse>> {
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
    return data as ApiResponse<AnalyzeResponse>;
  } catch (error) {
    throw error;
  }
}
