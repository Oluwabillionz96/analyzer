import { Dispatch, SetStateAction } from "react";
import {
  AnalysisResponse,
  AnalysisStages,
  ApiResponse,
  CachedAnalysis,
  SORTVALUES,
} from "./types";
import streamResponse from "./stream-response";

export async function analyzeUrl(
  url: string,
  onStage?: (stage: AnalysisStages) => void,
): Promise<ApiResponse<AnalysisResponse>> {
  try {
    const response = await fetch("api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
      const res = await streamResponse(response, onStage)
      return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAnalysisById(
  id: string,
  onStage?: (stage: AnalysisStages) => void,
): Promise<ApiResponse<AnalysisResponse>> {
  try {
    const response = await fetch(`/api/pastAnalyzes`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
      const res = await streamResponse(response,onStage )
      return res
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
      throw new Error(body.error ?? body.message ?? `Analysis Failed`);
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
    setTotalHistory(Number(data?.meta?.total ?? 0));
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
    total: Number(data?.meta?.total ?? 0),
    page: Number(data?.meta?.page ?? 0),
  };
}

export const SORT_OPTIONS: { label: string; value: SORTVALUES }[] = [
  { label: "Most Recent", value: "most-recent" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Searched", value: "most-searched" },
  { label: "Least Searched", value: "least-searched" },
];
