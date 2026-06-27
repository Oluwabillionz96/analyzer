import pool from "./db";
import { AnalysisResponse } from "./types";

export default async function getSiteAnalysis(
  url: string | undefined,
  siteContent: string,
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

              If the content does not appear to be from a company website or if the content is too short for a correct analysis, return:
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
      await pool.query(
        `INSERT INTO analyses (url, error, is_success) VALUES($1, $2, $3)`,
        [siteUrl, aiResponse.message, false],
      );
      throw new Error(aiResponse.message);
    }

    return aiResponse as AnalysisResponse;
  } catch (error) {
    throw error;
  }
}
