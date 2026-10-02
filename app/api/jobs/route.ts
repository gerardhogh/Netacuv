 import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine") === "true";

    let whereClause: any = { status: "PUBLISHED" };

    const recommended = searchParams.get("recommended") === "true";

    if (mine) {
      const session = await getServerSession(authOptions);
      if (session && session.user?.id && ["RECRUTEUR", "RECRUITER", ...["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"]].includes(session.user?.role?.toUpperCase() || "")) {
        const recruiterProfile = await prisma.recruiterProfile.findFirst({
          where: { userId: session.user.id as string },
        });
        if (recruiterProfile) {
          whereClause = { recruiterId: recruiterProfile.id };
        }
      }
    } else if (recommended) {
      const session = await getServerSession(authOptions);
      if (session && session.user?.id) {
        const talentProfile = await prisma.talentProfile.findFirst({
          where: { userId: session.user.id as string },
        });
        
        if (talentProfile) {
          const keywords: string[] = [];
          
          // Ajouter les compétences comme mots-clés
          if (talentProfile.skills) {
            keywords.push(...talentProfile.skills.split(',').map(s => s.trim()).filter(Boolean));
          }
          
          // Ajouter les mots significatifs de la bio
          if (talentProfile.bio) {
            const bioWords = talentProfile.bio.split(/\s+/).filter(w => w.length > 4);
            keywords.push(...bioWords);
          }
          
          // Dédupliquer les mots-clés
          const uniqueKeywords = Array.from(new Set(keywords.map(k => k.toLowerCase())));

          if (uniqueKeywords.length > 0) {
            whereClause = {
              status: "PUBLISHED",
              OR: uniqueKeywords.flatMap(skill => [
                { title: { contains: skill, mode: "insensitive" } },
                { description: { contains: skill, mode: "insensitive" } }
              ])
            };
          } else {
            whereClause = { id: "no-recommendation" };
          }
        } else {
          whereClause = { id: "no-recommendation" };
        }
      } else {
        whereClause = { id: "no-recommendation" };
      }
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          salary: true,
          contractType: true,
          status: true,
          createdAt: true,
          recruiter: {
            select: {
              id: true,
              companyName: true,
              companyLogo: true,
            }
          },
          _count: {
            select: { applications: true }
          }
        }
      }),
      prisma.jobOffer.count({ where: whereClause })
    ]);

    return NextResponse.json({ jobs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error("Failed to fetch jobs", { error: error instanceof Error ? error.message : "Unknown", context: "api/jobs/GET" });
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres." },
      { status: 500 }
    );
  }
}

// POST : Créer une nouvelle offre (RECRUITER ou ADMIN uniquement)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Vérification stricte des droits
  if (!session || !session.user?.id || !["RECRUTEUR", "RECRUITER", ...["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"]].includes(session.user?.role?.toUpperCase() || "")) {
    return NextResponse.json(
      { error: "Accès refusé. Seuls les recruteurs et administrateurs peuvent publier une offre." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { title, description, location, salary, contractType } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Le titre et la description sont obligatoires." },
        { status: 400 }
      );
    }

    // Récupérer le profil recruteur lié à l'utilisateur connecté
    const userId = session.user.id as string;
    let recruiterProfile = await prisma.recruiterProfile.findFirst({
      where: { userId },
    });

    if (!recruiterProfile) {
      // Si le recruteur n'a pas encore de profil, on le crée automatiquement avec le nom saisi
      recruiterProfile = await prisma.recruiterProfile.create({
        data: {
          userId,
          companyName: body.entreprise || "Entreprise",
        }
      });
    }

    // --- VÉRIFICATION PREMIUM ---
    // Si l'utilisateur n'est pas ADMIN, on vérifie la limite
    if (!["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes(session.user.role?.toUpperCase() || "")) {
      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true }
      });

      if (userRecord && !userRecord.isPremium) {
        // Compter les offres déjà créées
        const jobCount = await prisma.jobOffer.count({
          where: { recruiterId: recruiterProfile.id }
        });

        if (jobCount >= 1) {
          return NextResponse.json(
            { error: "Vous avez atteint la limite d'offres gratuites (1). Veuillez souscrire à l'offre Premium pour publier des offres en illimité." },
            { status: 403 }
          );
        }
      }
    }

    const newJob = await prisma.jobOffer.create({
      data: {
        title,
        description,
        location,
        salary,
        contractType,
        status: "PUBLISHED",
        recruiterId: recruiterProfile.id,
      },
      include: {
        recruiter: true,
      }
    });

    logger.info("Job offer created", { userId, jobId: newJob.id });
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    logger.error("Failed to create job offer", { error: error instanceof Error ? error.message : "Unknown", context: "api/jobs/POST" });
    return NextResponse.json(
      { error: "Erreur lors de la création de l'offre." },
      { status: 500 }
    );
  }
}