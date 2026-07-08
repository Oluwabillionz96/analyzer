import pool from "./db";
import { AnalysisResponse, CachedAnalysis } from "./types";
import { cleanUrl } from "./utils-server";

export async function getFromDB(url: string): Promise<CachedAnalysis | null> {
  try {
    const result = await pool.query(
      `SELECT * FROM analyses WHERE url = $1 LIMIT 1`,
      [url],
    );
    return result.rows[0] ?? null;
  } catch (error) {
    throw error;
  }
}

export async function addToDB(analysis: AnalysisResponse, url: string) {
  if (!analysis || !url) return;

  const {
    companyName,
    summary,
    targetCustomers,
    businessModel,
    keyFeatures,
    likelyCompetitors,
    confidenceNotes,
  } = analysis;

  try {
    await pool.query(
      `INSERT INTO analyses (url, "companyName", summary, "targetCustomers", "businessModel", "keyFeatures", "likelyCompetitors", "confidenceNotes")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        cleanUrl(url),
        companyName,
        summary,
        JSON.stringify(targetCustomers),
        businessModel,
        JSON.stringify(keyFeatures),
        JSON.stringify(likelyCompetitors),
        confidenceNotes,
      ],
    );
  } catch (error) {
    throw error;
  }
}

export async function updateSearchCountAndLastUpdated(id: string) {
  try {
    if (!id) {
      throw new Error("id is required");
    }
    await pool.query(
      `UPDATE analyses SET searchcount = searchcount + 1, updated_at = $1 WHERE id = $2`,
      [new Date(), id],
    );
  } catch (error) {
    throw error;
  }
}

export async function updateCache(
  updatedAnalysis: AnalysisResponse,
  id: string,
) {
  await pool.query(
    `UPDATE analyses AS a SET "companyName" = $1, summary = $2, "targetCustomers" = $3, "businessModel" = $4, "keyFeatures" = $5, "likelyCompetitors" = $6, "confidenceNotes" = $7, updated_at=$8 WHERE id = $9`,
    [
      updatedAnalysis.companyName,
      updatedAnalysis.summary,
      JSON.stringify(updatedAnalysis.targetCustomers),
      updatedAnalysis.businessModel,
      JSON.stringify(updatedAnalysis.keyFeatures),
      JSON.stringify(updatedAnalysis.likelyCompetitors),
      updatedAnalysis.confidenceNotes,
      new Date(),
      id,
    ],
  );
}
