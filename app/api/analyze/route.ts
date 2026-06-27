import { cleanUrl, isFullUrl, isThreeDaysOld } from "@/libs/utils-server";
import { AnalysisResponse } from "@/libs/types";
import { NextRequest, NextResponse } from "next/server";
import getPageContent from "@/libs/get-page-content";
import getSiteAnalysis from "@/libs/get-analysis";
import {
  addToDB,
  getFromDB,
  updateCache,
  updateSearchcount,
} from "@/libs/db-utils";

async function analyze(url: string) {
  try {
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
      url,
    );

    return analysis;
  } catch (error) {
    throw error;
  }
}

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

    const cachedAnalysis = await getFromDB(cleanUrl(url));

    if (cachedAnalysis) {
      const {
        id,
        url: cachedUrl,
        created_at,
        updated_at,
        searchcount,
        is_success,
        error,
        ...analysis
      } = cachedAnalysis;
      void searchcount;
      void created_at;
      void cachedUrl;

      let siteAnalysis: AnalysisResponse = analysis;

      if (!is_success) {
        return NextResponse.json({ success: is_success, error });
      }

      if (isThreeDaysOld(updated_at)) {
        siteAnalysis = await analyze(url);
        try {
          await Promise.all([
            updateCache(siteAnalysis, id),
            updateSearchcount(id),
          ]);
        } catch (error) {
          console.warn({ error });
        }
        return NextResponse.json({ success: true, data: siteAnalysis });
      }

      try {
        await updateSearchcount(id);
      } catch (error) {
        console.warn({ error });
      }
      return NextResponse.json({ success: true, data: siteAnalysis });
    }

    const analysis = await analyze(url);

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
