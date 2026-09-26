import pool from "@/libs/db";
import { isThreeDaysOld } from "@/libs/utils-server";
import { refreshCachedAnalysis } from "@/libs/analyze-page";
import { updateSearchCountAndLastUpdated } from "@/libs/db-utils";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "id is required", success: false },
        { status: 400 },
      );
    }
    const result = await pool.query(
      `SELECT "companyName", summary, "targetCustomers", "businessModel","keyFeatures","likelyCompetitors", "confidenceNotes", origin, updated_at, is_success from analyses WHERE id=$1`,
      [id],
    );

    const analysis = result.rows[0];

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found", success: false },
        { status: 404 },
      );
    }

    if (
      analysis.is_success &&
      analysis.origin &&
      isThreeDaysOld(analysis.updated_at)
    ) {
      try {
        const fresh = await refreshCachedAnalysis(id, analysis.origin);
        return NextResponse.json({ success: true, data: fresh });
      } catch (error) {
        console.warn({ error });
      }
    }

    try {
      await updateSearchCountAndLastUpdated(id);
    } catch (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        sucess: false,
      },
      { status: 500 },
    );
  }
}
