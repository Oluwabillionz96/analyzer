import { NextRequest, NextResponse } from "next/server";
import { consume, LimitResult } from "./rate-limit-store";

const PER_IP = Number(process.env.RATE_LIMIT_PER_IP_HOURLY ?? 20);
const GLOBAL = Number(process.env.RATE_LIMIT_GLOBAL_HOURLY ?? 100);



function clientBucket(req: NextRequest){
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded? forwarded.split(",")[0].trim():req.headers.get("x-real-ip")?.trim()??"unknown"
  return `ip:${ip}`
}

export async function checkRateLimit(req: NextRequest):Promise<LimitResult | null>{
  const perIp = await consume(clientBucket(req), PER_IP)
  if(!perIp.allowed) return perIp

  const global = await consume("global", GLOBAL)
  if(!global.allowed) return global

  return null
}

export function rateLimitResponse(result: LimitResult){
  const retryAfter = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now())/ 1000))

  return NextResponse.json({error:"Too many requests. Try again Later", success:false},{status:429, headers:{"Retry-After":String(retryAfter)}})
}
