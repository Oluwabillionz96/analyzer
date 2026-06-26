import { AnalysisResponse, CachedAnalysis } from "../libs/types";
import { load } from "cheerio";
import pool from "./db";

export function isFullUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function getPageContent(
  url: string,
  token?: string,
  browserlessUrl?: string,
): Promise<string> {
  if (!token || !browserlessUrl) {
    throw new Error("Missing token or browserless URL");
  }

  const browserlessContentUrl = new URL("/unblock", browserlessUrl);
  browserlessContentUrl.searchParams.set("token", token);
  // browserlessContentUrl.searchParams.set("proxy", "residential");

  // const browserlessContentUrl = `${browserlessUrl}/unblock?token=${token}&proxy=residential`;
  const data = {
    url,
    content: true,
    cookies: false,
    screenshot: false,
    browserWSEndpoint: false,
    waitForTimeout: 5000,
  };

  try {
    const response = await fetch(browserlessContentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn("Browserless content fetch failed", {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Content fetch failed: ${response.status}`);
    }
    const result = await response.json();
    const $ = load(result.content);
    $(
      "script, style, noscript, link, nav, footer, [class*='cookies'], [id*='cookies'], aside, [class*='sidebar'], [id*='sidebar'], [class*='nav'], [class*='footer']",
    ).remove();
    const text = $("body").text().trim();

    if (text.length < 30) {
      throw new Error("Site analysis failed: content is too short");
    }

    return text.slice(0, 10000);
  } catch (error) {
    throw error;
  }
}

export async function getSiteAnalysis(
  url: string | undefined,
  siteContent: string,
  apiKey: string | undefined,
): Promise<AnalysisResponse> {
  try {
    if (!url || !apiKey) {
      throw new Error("URL and API key are required");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a business analyst that extracts structured company intelligence from website content. Analyze the provided text and return a JSON object.

              Fields:
              - companyName (string): The company name
              - summary (string): 2-3 sentence overview of what the company does
              - targetCustomers (array of strings): Who they serve
              - businessModel (string): How they make money
              - keyFeatures (array of strings): Main product features or capabilities
              - likelyCompetitors (array of strings): Companies offering similar products
              - confidenceNotes (string): What you're sure about vs what you inferred

              If the content does not appear to be from a company website, return:
              { "error": true, "message": "This page does not appear to be a company website" }

              Return ONLY valid JSON. No explanation. No markdown.
`,
          },

          {
            role: "user",
            content: siteContent,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("Site analysis request failed", {
        status: response.status,
        statusText: response.statusText,
        siteContentLength: siteContent.length,
      });
      console.warn(response);
      throw new Error(`Failed to analyze website: ${response.statusText}`);
    }

    const aiData = await response.json();

    const aiResponse = JSON.parse(aiData.choices[0].message.content);

    if (aiResponse.error) {
      throw new Error(aiResponse.message);
    }

    return aiResponse as AnalysisResponse;
  } catch (error) {
    throw error;
  }
}

export async function getFromDB(url: string): Promise<CachedAnalysis | false> {
  try {
    const result = await pool.query(
      `SELECT * FROM analyses WHERE url = $1 LIMIT 1`,
      [url],
    );
    return result.rows[0] ? result.rows[0] : false;
  } catch (error) {
    throw error;
  }
}

export async function addToDB(analysis: AnalysisResponse, url: string) {
  if (!analysis || !url) return;

  const {
    companyName,
    summary,
    targetCustomers,
    businessModel,
    keyFeatures,
    likelyCompetitors,
    confidenceNotes,
  } = analysis;
  try {
    await pool.query(
      `INSERT INTO analyses (url, "companyName", summary, "targetCustomers", "businessModel", "keyFeatures", "likelyCompetitors", "confidenceNotes")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        url,
        companyName,
        summary,
        JSON.stringify(targetCustomers),
        businessModel,
        JSON.stringify(keyFeatures),
        JSON.stringify(likelyCompetitors),
        confidenceNotes,
      ],
    );
  } catch (error) {
    throw error;
  }
}

export async function updateSearchcount(id: string) {
  try {
    await pool.query(
      `UPDATE analyses SET searchcount = searchcount + 1 WHERE id = $1`,
      [id],
    );
  } catch (error) {
    throw error;
  }
}

export function isThreeDaysOld(createdAt: string): boolean {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return new Date(createdAt) < threeDaysAgo;
}

export async function updateCache(
  updatedAnalysis: AnalysisResponse,
  id: string,
) {
  await pool.query(
    `UPDATE analyses AS a SET "companyName" = $1, summary = $2, "targetCustomers" = $3, "businessModel" = $4, "keyFeatures" = $5, "likelyCompetitors" = $6, "confidenceNotes" = $7 WHERE id = $8`,
    [
      updatedAnalysis.companyName,
      updatedAnalysis.summary,
      JSON.stringify(updatedAnalysis.targetCustomers),
      updatedAnalysis.businessModel,
      JSON.stringify(updatedAnalysis.keyFeatures),
      JSON.stringify(updatedAnalysis.likelyCompetitors),
      updatedAnalysis.confidenceNotes,
      id,
    ],
  );
}
