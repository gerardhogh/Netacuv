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
        return NextResponse.json([]);
      }

      const applications = await prisma.application.findMany({
        where: { talentId: talentProfile.id },
        include: { jobOffer: true },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(applications);
    }

    // 2. RECRUITER : ne voit que les candidatures sur ses offres
    if (effectiveRole === "RECRUITER" || effectiveRole === "RECRUTEUR") {
      const recruiterProfile = await prisma.recruiterProfile.findFirst({
        where: { userId: session.user.id },
      });

      if (!recruiterProfile) {
        return NextResponse.json([]);
      }

      const whereClause: any = {
        jobOffer: {
          recruiterId: recruiterProfile.id,
        },
      };

      if (jobOfferId) {
        whereClause.jobOfferId = jobOfferId;
      }

      const applications = await prisma.application.findMany({
        where: whereClause,
        include: { 
          talent: {
            include: { user: true }
          }, 
          jobOffer: true 
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(applications);
    }

    // 3. ADMIN : accès global
    if (effectiveRole === "ADMIN") {
      const applications = await prisma.application.findMany({
        include: { talent: true, jobOffer: true },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(applications);
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
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const applicationsThisMonth = await prisma.application.count({
        where: {
          talentId: talentProfile.id,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

      if (applicationsThisMonth >= 1) {
        return NextResponse.json(
          { error: "Vous avez atteint votre limite de 1 candidature gratuite ce mois-ci. Passez au Premium pour candidater en illimité !" },
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
    });

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