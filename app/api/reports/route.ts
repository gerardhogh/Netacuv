import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifySystemAlert } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { targetType, targetId, targetTitle, reason, details } = body;

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: "Paramètres obligatoires manquants (targetType, targetId, reason)." },
        { status: 400 }
      );
    }

    const reporterId = (session?.user as any)?.id || null;
    const reporterName = session?.user?.name || "Un utilisateur";

    // Enregistrer le signalement en base
    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        targetTitle: targetTitle || "Élément signalé",
        reason,
        details: details || null,
        status: "PENDING",
      },
    });

    // Journal d'audit
    await prisma.auditLog.create({
      data: {
        action: `REPORT_${targetType}`,
        by: reporterId || "ANONYMOUS",
        details: JSON.stringify({
          targetId,
          targetTitle,
          reason,
          details,
        }),
      },
    }).catch(() => {});

    // Déclencher une notification temps réel SYSTEM_ALERT pour les administrateurs
    try {
      const typeLabel =
        targetType === "JOB_OFFER"
          ? "l'offre d'emploi"
          : targetType === "TALENT"
          ? "le profil candidat"
          : "le compte recruteur";

      const link =
        targetType === "JOB_OFFER"
          ? "/dashboard/admin/emplois"
          : targetType === "TALENT"
          ? "/dashboard/admin/talents"
          : "/dashboard/admin/recruteurs";

      await notifySystemAlert({
        title: `Nouveau signalement : ${targetTitle || "Contenu"}`,
        message: `${reporterName} a signalé ${typeLabel} "${targetTitle || targetId}" pour le motif : "${reason}".`,
        link,
      });
    } catch (notifErr) {
      console.error("[Reports] Erreur notification admin:", notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Votre signalement a été enregistré avec succès et transmis à l'équipe de modération.",
        reportId: report.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du signalement." },
      { status: 500 }
    );
  }
}

// GET: Liste des signalements (accessible uniquement aux administrateurs)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";

    if (!session || !["SUPER ADMIN", "ADMIN", "ADMIN RH / MODÉRATEUR"].includes(role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH: Mettre à jour le statut d'un signalement (ex: RESOLVED, DISMISSED)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";

    if (!session || !["SUPER ADMIN", "ADMIN", "ADMIN RH / MODÉRATEUR"].includes(role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id et status requis." }, { status: 400 });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/reports error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE: Supprimer un signalement
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";

    if (!session || !["SUPER ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id requis." }, { status: 400 });
    }

    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/reports error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
