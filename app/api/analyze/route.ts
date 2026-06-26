import {
  addToDB,
  getFromDB,
  getPageContent,
  getSiteAnalysis,
  isFullUrl,
} from "@/libs/utils-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required", success: false },
        { status: 400 },
      );
    }

    if (
      !isFullUrl(url) ||
      !(url.startsWith("https://") || url.startsWith("http://"))
    ) {
      return NextResponse.json(
        { error: "Invalid URL", success: false },
        { status: 400 },
      );
    }

    const cachedAnalysis = await getFromDB(url);

    if (cachedAnalysis) {
      return NextResponse.json({ success: true, data: cachedAnalysis });
    }

    const pageContent = await getPageContent(
      url,
      process.env.BROWSERLESS_API_KEY,
      process.env.BROWSERLESS_URL,
    );

    if (!pageContent) {
      throw new Error("Website could not be analyzed");
    }
    const analysis = await getSiteAnalysis(
      process.env.GROQ_REQUEST_URL,
      pageContent,
      process.env.GROQ_API_KEY,
    );
    try {
      await addToDB(analysis, url);
    } catch (dbError) {
      console.warn({ dbError });
    }
    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error({ error });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 },
    );
  }
}
