import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim();

    if (!code || code.length < 3) {
      return NextResponse.json({ valid: false, message: "Code invalide" }, { status: 400 });
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: {
        id: true,
        name: true,
      },
    });

    if (!referrer) {
      return NextResponse.json({ valid: false, message: "Code de parrainage introuvable" });
    }

    // Format safe name (e.g. "Jean D." instead of full name if preferred, or first name)
    const displayName = referrer.name
      ? referrer.name.split(" ")[0] + (referrer.name.split(" ")[1] ? ` ${referrer.name.split(" ")[1][0]}.` : "")
      : "Membre Netacuv";

    return NextResponse.json({
      valid: true,
      code,
      referrerName: displayName,
    });
  } catch (error) {
    console.error("Erreur GET /api/affiliation/verify:", error);
    return NextResponse.json({ valid: false, message: "Erreur serveur" }, { status: 500 });
  }
}
