import pool from "./db";

export interface LimitResult {
  allowed: boolean;
  resetAt: Date
}

export async function consume(bucket: string, limit: number):Promise<LimitResult>{
  try{
  const data = await pool.query(`INSERT INTO rate_limits (bucket, window_start)
    VALUES ($1, date_trunc('hour', now()))
    ON CONFLICT(bucket, window_start)
    DO UPDATE SET hits=rate_limits.hits + 1
    RETURNING hits, date_trunc('hour', now()) + interval '1 hour' AS reset_at`, [bucket])

  const {hits, reset_at} = data.rows[0]

 return {
   allowed: limit >= hits,
   resetAt: reset_at
 }
  }catch(err){
    console.error({error: err})
    return {
      allowed: true,
      resetAt: new Date(Date.now() + 3_600_000)
    }
 }
}
