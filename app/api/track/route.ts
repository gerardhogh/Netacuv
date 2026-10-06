import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await prisma.visitor.create({
      data: {
        ip,
        userAgent,
        path: data.path || "/",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    // Fail silently to avoid breaking the frontend
    return NextResponse.json({ success: false });
  }
}
