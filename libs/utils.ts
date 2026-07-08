import { Dispatch, SetStateAction } from "react";
import {
  AnalysisResponse,
  ApiResponse,
  CachedAnalysis,
  SORTVALUES,
} from "./types";

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
  selectedSort: SORTVALUES,
  limit = 20,
): Promise<ApiResponse<CachedAnalysis[]>> {
  try {
    const order =
      selectedSort === "oldest"
        ? "direction=ASC"
        : selectedSort === "most-searched"
          ? "field=searchcount"
          : selectedSort === "least-searched"
            ? "field=searchcount&direction=ASC"
            : "";
    const response = await fetch(
      `/api/history?page=${page}&limit=${limit}${order ? `&${order}` : ""}`,
    );
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
  setLoading: Dispatch<SetStateAction<boolean>>,
  selectedSort: SORTVALUES,
  page = 1,
) {
  setLoading(true);
  try {
    const data = await getAllHistory(page, selectedSort);
    setHistory(data?.data || []);
    setTotalHistory(data?.meta?.total as number);
  } catch (error) {
    console.warn(error);
  } finally {
    setLoading(false);
  }
}

export async function loadHistory(
  page: number,
  selectedSort: SORTVALUES,
  limit?: number,
) {
  const data = await getAllHistory(page, selectedSort, limit);
  return {
    data: data?.data,
    total: data?.meta?.total as number,
    page: data?.meta?.page as number,
  };
}

export const SORT_OPTIONS: { label: string; value: SORTVALUES }[] = [
  { label: "Most Recent", value: "most-recent" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Searched", value: "most-searched" },
  { label: "Least Searched", value: "least-searched" },
];
