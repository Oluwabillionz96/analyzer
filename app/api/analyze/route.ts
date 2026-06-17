import fakeResponse from "@/libs/fake-response";
import { isFullUrl } from "@/libs/utils";
import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required", success: false });
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const body = page.locator("body");
    await body.waitFor({ timeout: 30000 });
    await page.evaluate(() => {
      const nav = document.querySelectorAll(
        "nav, footer, [class*='cookies'], [id*='cookies'], aside, [class*='sidebar'], [id*='sidebar']",
      );
      nav.forEach((el) => el.remove());
    });
    const bodyText = await body.innerText();

    await browser.close();

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
              content: bodyText,
            },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      console.log(response);
      return NextResponse.json({
        success: false,
        error: "AI error",
      });
    }

    const aiData = await response.json();
    const aiResponse = JSON.parse(aiData.choices[0].message.content);

    return NextResponse.json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error({ error });
    return NextResponse.json({
      error: "Internal server error",
      success: false,
    });
  }
}
