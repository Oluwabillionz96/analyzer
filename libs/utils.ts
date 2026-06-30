import { Dispatch, SetStateAction } from "react";
import { AnalysisResponse, ApiResponse, CachedAnalysis } from "./types";

type LoadingState = {
  analysis: boolean;
  history: boolean;
  fromHistory: boolean;
};

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

export async function getAnalysisById(
  id: string,
): Promise<ApiResponse<AnalysisResponse>> {
  try {
    const response = await fetch(`/api/pastAnalyzes`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.error ?? body.message ?? `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data as ApiResponse<AnalysisResponse>;
  } catch (error) {
    throw error;
  }
}

export async function getAllHistory(
  page: number,
): Promise<ApiResponse<CachedAnalysis[]>> {
  try {
    const response = await fetch(`/api/history?page=${page}`);
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.error ?? body.message ?? `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data as ApiResponse<CachedAnalysis[]>;
  } catch (error) {
    throw error;
  }
}

export async function fetchHistory(
  setHistory: Dispatch<SetStateAction<CachedAnalysis[]>>,
  setTotalHistory: Dispatch<SetStateAction<number>>,
  loading: LoadingState,
  setLoading: Dispatch<SetStateAction<LoadingState>>,
  page = 1,
) {
  setLoading({ ...loading, history: true });
  try {
    const data = await getAllHistory(page);
    setHistory(data?.data || []);
    setTotalHistory(data?.meta?.total as number);
  } catch (error) {
    console.warn(error);
  } finally {
    setLoading({ ...loading, history: false });
  }
}

export async function loadHistory(page: number) {
  const data = await getAllHistory(page);
  return {
    data: data?.data,
    total: data?.meta?.total as number,
    page: data?.meta?.page as number,
  };
}
