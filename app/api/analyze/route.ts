import fakeResponse from "@/libs/fake-response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required", success: false });
    }

    return NextResponse.json({ success: true, data: fakeResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Internal server error",
      success: false,
    });
  }
}
