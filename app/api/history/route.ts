import pool from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await pool.query(
      `SELECT * FROM analyses ORDER BY searchcount DESC, updated_at DESC, created_at DESC`,
    );
    return NextResponse.json({ success: true, data: results.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 },
    );
  }
}
