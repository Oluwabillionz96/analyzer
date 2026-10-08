import { Dispatch, SetStateAction } from "react";
import {
  AnalysisResponse,
  AnalysisStages,
  ApiResponse,
  CachedAnalysis,
  SORTVALUES,
} from "./types";

export async function analyzeUrl(
  url: string,
  onStage?: (stage: AnalysisStages) => void,
): Promise<ApiResponse<AnalysisResponse> | undefined> {
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
      throw new Error(body.error ?? body.message ?? `Something went wrong.`);
    }

    if (
      !response.headers
        .get("content-type")
        ?.includes("text/plain;charset=UTF-8")
    ) {
      return response.json();
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    for await (const chunk of response.body) {
      buffer += decoder.decode(chunk, { stream: true });

      let frameEnd: number;

      while ((frameEnd = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, frameEnd).trim();
        buffer = buffer.slice(frameEnd + 2);

        let event = "";
        let data = "";
        for (const line of frame.split("\n")) {
          if (line.startsWith("event:")) {
            event = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            data = line.slice(5).trim();
          }
        }

        if (data) {
          const payload = JSON.parse(data);
          const msg =
            (payload as ApiResponse<AnalysisResponse>).error ??
            "Analysis Failed";

          if (event === "stage") {
            onStage?.(payload.data.stage);
          } else if (event === "error") {
            throw new Error(msg);
          } else if (event === "analysis") {
            if (payload.success) {
              return payload as ApiResponse<AnalysisResponse>;
            }
            throw new Error(msg);
          }
        }
      }
    }
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
