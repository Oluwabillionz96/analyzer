import { refreshCachedAnalysis } from "./analyze-page";
import {updateSearchCountAndLastUpdated } from "./db-utils";
import { AnalysisResponse, AnalysisStages, CachedAnalysis } from "./types";

export function isFullUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isThreeDaysOld(createdAt: string): boolean {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return new Date(createdAt) < threeDaysAgo;
}

export function getOrigin(url: string): string {
  const { protocol, host } = new URL(url);
  return `${protocol}//${host.replace(/^www\./i, "")}`;
}

export const emit = (
  controller: ReadableStreamDefaultController,
  event: string,
  data: {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
  },
  encoder: TextEncoder,
) => {
  controller.enqueue(
    encoder.encode(`event: ${event}\ndata:${JSON.stringify(data)} \n\n`),
  );
};

export async function streamCacheAnalysis (cachedAnalysis: CachedAnalysis,
  controller:ReadableStreamDefaultController, announce: (stage:AnalysisStages)=>void ){
const encoder = new TextEncoder()
    const {
      id,
      origin: cachedUrl,
      created_at,
      updated_at,
      searchcount,
      is_success,
      error,
      last_updated_content_at,
      ...analysis
    } = cachedAnalysis;
    void searchcount;
    void created_at;
    void cachedUrl;
    void updated_at;

    if (!is_success) {

      emit(
        controller,
        "error",
        { success: is_success, error },
        encoder,
      );
      controller.close();
      return;
    }

    let siteAnalysis: AnalysisResponse = analysis;

    if (isThreeDaysOld(last_updated_content_at)) {
     
      try {
        siteAnalysis = await refreshCachedAnalysis(id, cachedUrl, announce);
      } catch (error) {
        console.warn({ error });
      }
      emit(
        controller,
        "analysis",
        {
          success: true,
          data: siteAnalysis as unknown as Record<string, unknown>,
        },
        encoder,
      );
      controller.close();
      return;
    }else{
      announce("retrieving")
    }
    
    try {
      await updateSearchCountAndLastUpdated(id);
    } catch (error) {
      console.warn({ error });
    }
    emit(
      controller,
      "analysis",
      {
        success: true,
        data: siteAnalysis as unknown as Record<string, unknown>,
      },
      encoder,
    );
    controller.close();
    return;
}
