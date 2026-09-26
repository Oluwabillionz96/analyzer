import { AnalysisResponse } from "./types";
import getPageContent from "./get-page-content";
import getSiteAnalysis from "./get-analysis";
import { updateCache, updateSearchCountAndLastUpdated } from "./db-utils";
import discoverPages from "./page-discovery";

export async function analyzePage(url: string): Promise<AnalysisResponse> {
  const pageContent = await getPageContent(
    url,
    process.env.BROWSERLESS_API_KEY,
    process.env.BROWSERLESS_URL,
  );

  const links = await discoverPages(
    url,
    pageContent.links,
    process.env.GROQ_API_KEY,
  );

  if (!pageContent.text) {
    throw new Error("Website could not be analyzed");
  }

  return getSiteAnalysis(
    process.env.GROQ_REQUEST_URL,
    pageContent.text,
    process.env.GROQ_API_KEY,
    url,
  );
}

export async function refreshCachedAnalysis(
  id: string,
  entryUrl: string,
): Promise<AnalysisResponse> {
  const fresh = await analyzePage(entryUrl);
  await Promise.all([
    updateCache(fresh, id),
    updateSearchCountAndLastUpdated(id),
  ]);
  return fresh;
}
