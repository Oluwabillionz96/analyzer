import { chromium } from "playwright";
import { AnalysisResponse } from "./types";

export function isFullUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function getPageContent(url: string): Promise<string> {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const body = page.locator("body");
    await body.waitFor({ timeout: 3000 });

    await page.evaluate(() => {
      const trash = document.querySelectorAll(
        "nav, footer, [class*='cookies'], [id*='cookies'], aside, [class*='sidebar'], [id*='sidebar'], [class*='nav'], [class*='footer']",
      );
      trash.forEach((el) => el.remove());
    });

    const content = await body.innerText();
    await browser.close();
    return content;
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
      throw new Error("Analysis failed");
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
