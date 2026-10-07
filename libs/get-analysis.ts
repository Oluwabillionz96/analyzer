import pool from "./db";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisMessage } from "./prompt";
import { AnalysisResponse, PageContent } from "./types";
import { getOrigin } from "./utils-server";

export default async function getSiteAnalysis(
  url: string | undefined,
  pages: PageContent[],
  apiKey: string | undefined,
  siteUrl: string,
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
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: ANALYSIS_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: buildAnalysisMessage(pages),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("Site analysis request failed", {
        status: response.status,
        statusText: response.statusText,
        siteContentLength: pages.map((p) => ({
          url: p.url,
          textLength: p.text.length,
        })),
      });
      console.warn(response);
      throw new Error(`Failed to analyze website: ${response.statusText}`);
    }

    const aiData = await response.json();

    const aiResponse = JSON.parse(aiData.choices[0].message.content);

    if (aiResponse.error) {
      await pool.query(
        `INSERT INTO analyses (origin, error, is_success, pageContent) VALUES($1, $2, $3, $4)`,
        [getOrigin(siteUrl), aiResponse.message, false, pages[0].text],
      );
      throw new Error(aiResponse.message);
    }

    return aiResponse as AnalysisResponse;
  } catch (error) {
    throw error;
  }
}
