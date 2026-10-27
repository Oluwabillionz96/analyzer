import pool from "@/libs/db";
import { emit, isThreeDaysOld, streamCacheAnalysis } from "@/libs/utils-server";
import { refreshCachedAnalysis } from "@/libs/analyze-page";
import { getFromDB, updateSearchCountAndLastUpdated } from "@/libs/db-utils";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/libs/rate-limits";
import { AnalysisStages } from "@/libs/types";

export async function PATCH(req: NextRequest) {
  try {
    const limited = await checkRateLimit(req);
    if(limited) return rateLimitResponse(limited)
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "id is required", success: false },
        { status: 400 },
      );
    }
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller){

        const announce = (stage: AnalysisStages) =>
          emit(
            controller,
            "stage",
            { success: true, data: { stage } },
            encoder,
          );

        const cachedAnalysis = await getFromDB("id", id)

        if(!cachedAnalysis){
          emit(controller, "error", {success:false, error:"Analysis not found"}, encoder)
          controller.close()
          return
        }

        await streamCacheAnalysis(cachedAnalysis, controller, announce)

      }
    })

    return new Response(stream, {
      headers: {"content-type":"text/event-stream"}
    })


} catch (error) {
  console.error({error})
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        sucess: false,
      },
      { status: 500 },
    );
  }
}


export const maxDuration = 300;
