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
    const bodyText = await body.innerText();

    await browser.close();

    return NextResponse.json({
      success: true,
      data: { ...fakeResponse, summary: bodyText },
    });
  } catch (error) {
    console.error({ error });
    return NextResponse.json({
      error: "Internal server error",
      success: false,
    });
  }
}
