import pool from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page") || 1;
  const offset = (Number(page) - 1) * 20;
  try {
    const [results, totalResult] = await Promise.all([
      pool.query(
        `SELECT url, id, "companyName", created_at, updated_at, searchcount FROM analyses WHERE is_success = true ORDER BY searchcount DESC, updated_at DESC, created_at DESC LIMIT 20 OFFSET $1 `,
        [offset],
      ),
      pool.query(`SELECT id FROM analyses WHERE is_success=true`),
    ]);
    return NextResponse.json({
      success: true,
      data: results.rows,
      meta: { page: Number(page), total: totalResult.rowCount },
    });
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
