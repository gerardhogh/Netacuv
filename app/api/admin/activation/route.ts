import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Helper checking admin privileges
function isUserAdmin(session: any) {
  const role = (session?.user as any)?.role?.toUpperCase() || "";
  return [
    "SUPER ADMIN",
    "ADMIN RH / MODÉRATEUR",
    "MANAGER IA & CERTIFICATION",
    "GESTIONNAIRE FINANCIER",
    "SUPPORT CLIENT",
    "ADMIN",
    "ADMINISTRATEUR",
  ].includes(role);
}

// GET: Récupérer tous les utilisateurs (Talents & Recruteurs) avec leur statut Premium
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !isUserAdmin(session)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // "all" | "talents" | "recruteurs"
    const search = (searchParams.get("q") || "").trim().toLowerCase();

    // Rôles administratifs à exclure de la liste des candidats/clients à l'offre
    const adminRoleNames = [
      "SUPER ADMIN",
      "ADMIN",
      "ADMINISTRATEUR",
      "ADMIN RH / MODÉRATEUR",
      "MANAGER IA & CERTIFICATION",
      "GESTIONNAIRE FINANCIER",
      "SUPPORT CLIENT",
    ];

    const users = await prisma.user.findMany({
      where: {
        AND: [
          // Ne conserver que les utilisateurs réels de la plateforme (Talents ou Recruteurs)
          {
            OR: [
              { talentProfile: { isNot: null } },
              { recruiterProfile: { isNot: null } },
            ],
          },
          // Exclure les membres du staff admin
          {
            NOT: {
              role: {
                name: { in: adminRoleNames, mode: "insensitive" },
              },
            },
          },
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { recruiterProfile: { companyName: { contains: search, mode: "insensitive" } } },
                ],
              }
            : {},
          type === "talents"
            ? { talentProfile: { isNot: null } }
            : type === "recruteurs"
            ? { recruiterProfile: { isNot: null } }
            : {},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        active: true,
        isPremium: true,
        createdAt: true,
        role: {
          select: { name: true },
        },
        talentProfile: {
          select: {
            degree: true,
            city: true,
            country: true,
            videoUrl: true,
          },
        },
        recruiterProfile: {
          select: {
            companyName: true,
            phone: true,
            jobOffers: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = users.map((u) => {
      const isRecruiter = !!u.recruiterProfile;
      return {
        id: u.id,
        name: isRecruiter
          ? u.recruiterProfile?.companyName || u.name || "Entreprise"
          : u.name || "Talent",
        email: u.email || "",
        avatar: u.image || "/assets/avatar_africain.jpg",
        userType: isRecruiter ? "recruteur" : "talent",
        roleName: u.role?.name || (isRecruiter ? "RECRUTEUR" : "TALENT"),
        isPremium: u.isPremium || false,
        active: u.active,
        createdAt: u.createdAt,
        details: isRecruiter
          ? `${u.recruiterProfile?.jobOffers?.length || 0} offre(s) publiée(s)`
          : u.talentProfile?.degree || "Profil Talent",
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erreur GET /api/admin/activation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Basculer l'offre / statut Premium (Activer / Désactiver gratuitement par l'admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !isUserAdmin(session)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { userId, isPremium } = await request.json();

    if (!userId || typeof isPremium !== "boolean") {
      return NextResponse.json(
        { error: "Paramètres userId et isPremium requis" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium },
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        recruiterProfile: { select: { companyName: true } },
      },
    });

    const displayName = updatedUser.recruiterProfile?.companyName || updatedUser.name || updatedUser.email || "Utilisateur";

    // 1. Enregistrer dans l'historique des Transactions pour traçabilité totale
    await prisma.transaction.create({
      data: {
        userId: updatedUser.id,
        amount: 0,
        currency: "CFA",
        status: "SUCCESS",
        type: isPremium ? "SUBSCRIPTION_PREMIUM" : "CANCELLATION_PREMIUM",
        paymentMethod: `Offre gratuite accordée par Admin (${session.user.email || "Admin"})`,
      },
    }).catch((err) => {
      console.warn("Avertissement: Impossible d'enregistrer la transaction:", err);
    });

    // 2. Enregistrer dans AuditLog
    await prisma.auditLog.create({
      data: {
        action: isPremium ? "PREMIUM_ACTIVATION_BY_ADMIN" : "PREMIUM_DEACTIVATION_BY_ADMIN",
        by: session.user.email || "admin",
        details: `L'admin a ${isPremium ? "activé gratuitement" : "désactivé"} l'offre Premium pour ${displayName} (${updatedUser.email})`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: isPremium
        ? `L'offre Premium a été activée avec succès pour ${displayName} et enregistrée dans l'historique des paiements !`
        : `L'offre Premium a été désactivée pour ${displayName}.`,
    });
  } catch (error) {
    console.error("Erreur POST /api/admin/activation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
