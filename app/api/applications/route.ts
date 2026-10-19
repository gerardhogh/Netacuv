import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET : Récupérer les candidatures selon le rôle de l'utilisateur
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour accéder aux candidatures." },
      { status: 401 }
    );
  }

  try {
    const role = session.user.role;
    const { searchParams } = new URL(req.url);
    const jobOfferId = searchParams.get("jobOfferId");
    const requestedRole = searchParams.get("role");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20);
    const skip = (page - 1) * limit;
    const take = limit;
    
    // Determine effective role: if requestedRole is 'recruiter', and the user has a recruiter profile, we act as recruiter.
    // Otherwise fallback to session.user.role
    let effectiveRole = session.user.role;
    if (requestedRole === "recruiter" || requestedRole === "recruteur") {
       effectiveRole = "RECRUTEUR";
    }

    // 1. TALENT : ne voit que ses propres candidatures
    if (effectiveRole === "TALENT") {
      const talentProfile = await prisma.talentProfile.findFirst({
        where: { userId: session.user.id },
      });

      if (!talentProfile) {
        return NextResponse.json({
          applications: [],
          totalCount: 0,
          totalPages: 0,
          page,
          limit,
        });
      }

      const where = { talentId: talentProfile.id };
      const [applications, totalCount] = await Promise.all([
        prisma.application.findMany({
          where,
          include: { jobOffer: true },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.application.count({ where }),
      ]);

      return NextResponse.json({
        applications,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        page,
        limit,
      });
    }

    // 2. RECRUITER : ne voit que les candidatures sur ses offres (ou toutes si ADMIN)
    const isAdmin = ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes((session.user.role || "").toUpperCase());

    if (effectiveRole === "RECRUITER" || effectiveRole === "RECRUTEUR" || isAdmin) {
      const recruiterProfile = await prisma.recruiterProfile.findFirst({
        where: { userId: session.user.id },
      });

      const whereClause: any = {};
      if (jobOfferId) {
        whereClause.jobOfferId = jobOfferId;
      } else if (!isAdmin && recruiterProfile) {
        whereClause.jobOffer = {
          recruiterId: recruiterProfile.id,
        };
      } else if (!isAdmin && !recruiterProfile) {
        return NextResponse.json({
          applications: [],
          totalCount: 0,
          totalPages: 0,
          page,
          limit,
        });
      }

      const [applications, totalCount] = await Promise.all([
        prisma.application.findMany({
          where: whereClause,
          include: { 
            talent: {
              include: { 
                user: true,
                interviewSessions: {
                  select: {
                    id: true,
                    aiScore: true,
                    videoRecordings: true,
                  },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                }
              }
            }, 
            jobOffer: {
              include: {
                recruiter: true,
              }
            } 
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.application.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        applications,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        page,
        limit,
      });
    }

    return NextResponse.json({ error: "Rôle non autorisé." }, { status: 403 });
  } catch (error) {
    logger.error("Failed to fetch applications", { error: error instanceof Error ? error.message : "Unknown", context: "api/applications/GET" });
    return NextResponse.json(
      { error: "Erreur lors de la récupération des candidatures." },
      { status: 500 }
    );
  }
}

// POST : Soumettre une candidature
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour postuler." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { jobOfferId } = body;

    if (!jobOfferId) {
      return NextResponse.json(
        { error: "L'identifiant de l'offre d'emploi est obligatoire." },
        { status: 400 }
      );
    }

    // Récupérer le profil Talent de l'utilisateur connecté
    const talentProfile = await prisma.talentProfile.findFirst({
      where: { userId: session.user.id },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: "Profil talent introuvable. Veuillez compléter votre profil avant de postuler." },
        { status: 400 }
      );
    }

    // Vérification du quota Freemium
    if (!session.user.isPremium) {
      const totalApplications = await prisma.application.count({
        where: {
          talentId: talentProfile.id,
        },
      });

      if (totalApplications >= 1) {
        return NextResponse.json(
          { error: "Vous avez atteint votre limite de 1 candidature gratuite. Passez au Premium pour candidater en illimité !" },
          { status: 403 }
        );
      }
    }

    // Vérifier l'existence de l'offre d'emploi
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: "L'offre d'emploi n'existe pas." },
        { status: 404 }
      );
    }

    // 4. Check for double application (Idempotency)
    const existingApplication = await prisma.application.findUnique({
      where: {
        talentId_jobOfferId: {
          talentId: talentProfile.id,
          jobOfferId: jobOfferId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Vous avez déjà postulé à cette offre." },
        { status: 409 }
      );
    }

    // Création de la candidature rattachée de façon sécurisée
    const newApplication = await prisma.application.create({
      data: {
        jobOfferId,
        talentId: talentProfile.id,
      },
      include: {
        jobOffer: {
          include: {
            recruiter: true,
          },
        },
      },
    });

    // Notification temps réel au recruteur
    try {
      if (newApplication.jobOffer?.recruiter?.userId) {
        const talentUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true },
        });
        const { notifyNewApplication } = await import("@/lib/notifications");
        await notifyNewApplication({
          recruiterUserId: newApplication.jobOffer.recruiter.userId,
          candidateName: talentUser?.name || session.user.name || "Un candidat",
          jobTitle: newApplication.jobOffer.title,
        });
      }
    } catch (notifErr) {
      console.error("[Applications] Erreur notification recruteur:", notifErr);
    }

    logger.info("Application submitted", { talentId: talentProfile.id, jobOfferId });
    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    logger.error("Failed to submit application", { error: error instanceof Error ? error.message : "Unknown", context: "api/applications/POST" });
    return NextResponse.json(
      { error: "Erreur lors de la soumission de la candidature." },
      { status: 500 }
    );
  }
}