import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { applyDataRetentionPolicy } from "@/lib/dataRetention";

export const dynamic = "force-dynamic";

/**
 * Route Cron dédiée au nettoyage et à la conservation des données :
 * Supprime les comptes et données associées en cas d'inactivité > 2 ans.
 * Accessible via Vercel Cron, token secret, ou session administrateur.
 */
export async function GET(req: Request) {
  return handleCleanup(req);
}

export async function POST(req: Request) {
  return handleCleanup(req);
}

async function handleCleanup(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const secretParam = searchParams.get("secret");
    const dryRunParam = searchParams.get("dryRun") === "true";
    const cronSecret = process.env.CRON_SECRET || "netacuv_cron_secret_2026";

    let isAuthorized = false;
    if (process.env.NODE_ENV === "development") {
      isAuthorized = true;
    } else if (authHeader === `Bearer ${cronSecret}` || secretParam === cronSecret) {
      isAuthorized = true;
    } else {
      const session = await getServerSession(authOptions);
      if (
        session?.user &&
        ["SUPER ADMIN", "ADMIN", "ADMINISTRATEUR"].includes(
          ((session.user as any).role || "").toUpperCase()
        )
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
    }

    const result = await applyDataRetentionPolicy({ dryRun: dryRunParam });

    return NextResponse.json({
      success: true,
      message: dryRunParam
        ? "Simulation de conservation des données terminée (aucun compte supprimé)"
        : "Politique de conservation des données appliquée avec succès",
      ...result,
    });
  } catch (error: any) {
    console.error("Cleanup Cron Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du nettoyage des données",
        details: error?.message || "Inconnu",
      },
      { status: 500 }
    );
  }
}
