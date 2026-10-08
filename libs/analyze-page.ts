import { AnalysisResponse, AnalysisStages, PageContentInput } from "./types";
import getPageContent from "./get-page-content";
import getSiteAnalysis from "./get-analysis";
import { updateCache, updateSearchCountAndLastUpdated } from "./db-utils";
import discoverPages from "./page-discovery";

const browserlessApiKey = process.env.BROWSERLESS_API_KEY;
const browserlessURL = process.env.BROWSERLESS_URL;
const groqApiKey = process.env.GROQ_API_KEY;
const groqRequestUrl = process.env.GROQ_REQUEST_URL;

export async function analyzePage(
  url: string,
  onStage?: (stage: AnalysisStages) => void,
): Promise<AnalysisResponse> {
  onStage?.("fetching");
  const pageContent = await getPageContent(
    url,
    browserlessApiKey,
    browserlessURL,
  );

  if (!pageContent.text) {
    throw new Error("Website could not be analyzed");
  }

  onStage?.("discovering");
  const links = await discoverPages(url, pageContent.links, groqApiKey);

  const siblings = await Promise.all(
    links.map(async (link) => {
      try {
        const content = await getPageContent(
          link,
          browserlessApiKey,
          browserlessURL,
        );
        return content.text ? { url: link, text: content.text } : null;
      } catch {
        console.warn("Skipping sibling page", link);
        return null;
      }
    }),
  );

  const pages: PageContentInput[] = [
    { url, text: pageContent.text },
    ...siblings.filter((page): page is PageContentInput => page !== null),
  ];

  onStage?.("analyzing")
  return getSiteAnalysis(groqRequestUrl, pages, groqApiKey, url);
}

export async function refreshCachedAnalysis(
  id: string,
  entryUrl: string,
  onStage?: (stage: AnalysisStages) => void,
): Promise<AnalysisResponse> {
  const fresh = await analyzePage(entryUrl, onStage);
  await Promise.all([
    updateCache(fresh, id),
    updateSearchCountAndLastUpdated(id),
  ]);
  return fresh;
}
