import { load } from "cheerio";

export default async function getPageContent(
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

    if (text.split(" ").length < 30) {
      throw new Error("Site analysis failed: content is too short");
    }
    // console.log({ text });
    return text.slice(0, 10000);
  } catch (error) {
    throw error;
  }
}