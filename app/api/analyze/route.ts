import { getOrigin, isFullUrl, isThreeDaysOld } from "@/libs/utils-server";
import { AnalysisResponse, AnalysisStages } from "@/libs/types";
import { NextRequest, NextResponse } from "next/server";
import { analyzePage, refreshCachedAnalysis } from "@/libs/analyze-page";
import {
  addToDB,
  getFromDB,
  updateSearchCountAndLastUpdated,
} from "@/libs/db-utils";
import { checkRateLimit, rateLimitResponse } from "@/libs/rate-limits";


const emit = (
  controller: ReadableStreamDefaultController,
  event: string,
  data: {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
  },
  encoder: TextEncoder,
) => {
  controller.enqueue(
    encoder.encode(`event: ${event}\ndata:${JSON.stringify(data)} \n\n`),
  );
};

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
    const limited = await checkRateLimit(req)
    if(limited) return rateLimitResponse(limited)

    const origin = getOrigin(url);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const cachedAnalysis = await getFromDB(origin);

          const announce = (stage: AnalysisStages) =>
            emit(
              controller,
              "stage",
              { success: true, data: { stage } },
              encoder,
            );

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

            if (!is_success) {
              emit(
                controller,
                "error",
                { success: is_success, error },
                encoder,
              );
              controller.close();
              return;
            }

            let siteAnalysis: AnalysisResponse = analysis;

            if (isThreeDaysOld(updated_at)) {
              try {
                siteAnalysis = await refreshCachedAnalysis(id, url, announce);
              } catch (error) {
                console.warn({ error });
              }
              emit(
                controller,
                "analysis",
                {
                  success: true,
                  data: siteAnalysis as unknown as Record<string, unknown>,
                },
                encoder,
              );
              controller.close();
              return;
            }

            try {
              await updateSearchCountAndLastUpdated(id);
            } catch (error) {
              console.warn({ error });
            }
            emit(
              controller,
              "analysis",
              {
                success: true,
                data: siteAnalysis as unknown as Record<string, unknown>,
              },
              encoder,
            );
            controller.close();
            return;
          }

          const analysis = await analyzePage(origin, announce);

          try {
            await addToDB(analysis, origin);
          } catch (dbError) {
            console.warn({ dbError });
          }
          emit(
            controller,
            "analysis",
            {
              success: true,
              data: analysis as unknown as Record<string, unknown>,
            },
            encoder,
          );
          controller.close();
        } catch (err) {
          emit(
            controller,
            "error",
            { success: false, error: String(err) },
            encoder,
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/plain;charset=UTF-8",
      },
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

export const maxDuration = 300;
