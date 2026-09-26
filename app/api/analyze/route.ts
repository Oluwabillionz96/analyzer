import { getOrigin, isFullUrl, isThreeDaysOld } from "@/libs/utils-server";
import { AnalysisResponse } from "@/libs/types";
import { NextRequest, NextResponse } from "next/server";
import { analyzePage, refreshCachedAnalysis } from "@/libs/analyze-page";
import {
  addToDB,
  getFromDB,
  updateSearchCountAndLastUpdated,
} from "@/libs/db-utils";

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
    const origin = getOrigin(url);

    const cachedAnalysis = await getFromDB(origin);

    if (cachedAnalysis) {
      const {
        id,
        origin: cachedUrl,
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
        return NextResponse.json(
          { success: is_success, error },
          { status: 400 },
        );
      }

      if (isThreeDaysOld(updated_at)) {
        try {
          siteAnalysis = await refreshCachedAnalysis(id, url);
        } catch (error) {
          console.warn({ error });
        }
        return NextResponse.json({ success: true, data: siteAnalysis });
      }

      try {
        await updateSearchCountAndLastUpdated(id);
      } catch (error) {
        console.warn({ error });
      }
      return NextResponse.json({ success: true, data: siteAnalysis });
    }

    const analysis = await analyzePage(url);

    try {
      await addToDB(analysis, origin);
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
