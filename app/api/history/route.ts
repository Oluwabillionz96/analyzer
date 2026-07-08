import pool from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  let page = searchParams.get("page") || 1;
  let limit: string | number = searchParams.get("limit") || "";

  const column = searchParams.get("field") || "updated_at";
  const direction = searchParams.get("direction") || "DESC";

  const allowedColumns = ["searchcount", "updated_at"];
  const allowedDirections = ["ASC", "DESC"];

  const safeColumn = allowedColumns.includes(column.toLowerCase())
    ? column.toLowerCase()
    : "updated_at";
  const safeDirection = allowedDirections.includes(direction.toUpperCase())
    ? direction.toUpperCase()
    : "DESC";

  limit = Math.min(Math.max(parseInt(limit as string) || 20, 1), 100);
  page = Math.max(Number(page) || 1, 1);
  const offset = (page - 1) * limit;
  try {
    const [results, totalResult] = await Promise.all([
      pool.query(
        `SELECT url, id, "companyName", created_at, updated_at, searchcount FROM analyses WHERE is_success = true ORDER BY ${safeColumn} ${safeDirection}, created_at DESC LIMIT $1 OFFSET $2 `,
        [limit, offset],
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM analyses WHERE is_success=true`),
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
