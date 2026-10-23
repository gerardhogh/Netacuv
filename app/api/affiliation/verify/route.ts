import { NextResponse } from "next/server";
import { findReferrer } from "@/lib/referral";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim();

    if (!code || code.length < 2) {
      return NextResponse.json({ valid: false, message: "Code invalide" }, { status: 400 });
    }

    const referrer = await findReferrer(code);

    if (!referrer) {
      return NextResponse.json({ valid: false, message: "Code de parrainage introuvable" });
    }

    // Format safe name (e.g. "Jean D." ou premier prénom)
    const displayName = referrer.name
      ? referrer.name.split(" ")[0] + (referrer.name.split(" ")[1] ? ` ${referrer.name.split(" ")[1][0]}.` : "")
      : "Membre Netacuv";

    return NextResponse.json({
      valid: true,
      code: referrer.referralCode || code,
      referrerName: displayName,
    });
  } catch (error) {
    console.error("Erreur GET /api/affiliation/verify:", error);
    return NextResponse.json({ valid: false, message: "Erreur serveur" }, { status: 500 });
  }
}
