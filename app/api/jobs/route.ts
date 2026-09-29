 import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine") === "true";

    let whereClause = {};

    if (mine) {
      const session = await getServerSession(authOptions);
      if (session && session.user?.id && ["RECRUTEUR", "RECRUITER", "ADMIN"].includes(session.user?.role || "")) {
        const recruiterProfile = await prisma.recruiterProfile.findFirst({
          where: { userId: session.user.id as string },
        });
        if (recruiterProfile) {
          whereClause = { recruiterId: recruiterProfile.id };
        }
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
  if (!session || !session.user?.id || !["RECRUTEUR", "RECRUITER", "ADMIN"].includes(session.user?.role || "")) {
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