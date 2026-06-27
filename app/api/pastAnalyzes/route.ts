import pool from "@/libs/db";
import { updateSearchcount } from "@/libs/db-utils";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "id is required", sucess: false },
        { status: 400 },
      );
    }
    const result = await pool.query(
      `SELECT "companyName", summary, "targetCustomers", "businessModel","keyFeatures","likelyCompetitors", "confidenceNotes" from analyses WHERE id=$1`,
      [id],
    );

    try {
      await updateSearchcount(id);
    } catch (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
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
