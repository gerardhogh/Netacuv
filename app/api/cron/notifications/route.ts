import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  notifyJobExpiringSoon,
  notifyInterviewReminder,
  notifyApplicationSummary,
} from "@/lib/notifications";
import { applyDataRetentionPolicy } from "@/lib/dataRetention";

export const dynamic = "force-dynamic";

/**
 * Route exécutée par un Cron Job (ex: Vercel Cron, GitHub Actions, curl)
 * Fréquence recommandée : 1 fois par jour à 08:00 (ou toutes les quelques heures).
 */
export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}

async function handleCron(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const secretParam = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET || "netacuv_cron_secret_2026";

    // Vérification de sécurité (Bearer token, paramètre secret, session admin, ou environnement de dev)
    let isAuthorized = false;
    if (process.env.NODE_ENV === "development") {
      isAuthorized = true;
    } else if (authHeader === `Bearer ${cronSecret}` || secretParam === cronSecret) {
      isAuthorized = true;
    } else {
      // Vérifier si un administrateur connecté lance le cron manuellement
      const session = await getServerSession(authOptions);
      if (session?.user && ["SUPER ADMIN", "ADMIN", "ADMINISTRATEUR"].includes((session.user as any).role?.toUpperCase() || "")) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Accès refusé au Cron Job" }, { status: 401 });
    }

    const now = new Date();
    const stats = {
      jobExpiringNotified: 0,
      interviewRemindersNotified: 0,
      applicationSummariesNotified: 0,
      inactiveAccountsDeleted: 0,
      executedAt: now.toISOString(),
    };

    // ------------------------------------------------------------------
    // 1. TÂCHE RECRUTEURS : JOB_EXPIRING_SOON (Offres expirant dans <= 3 jours)
    // ------------------------------------------------------------------
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const activeJobs = await prisma.jobOffer.findMany({
      where: {
        status: { in: ["PUBLISHED", "ACTIVE", "OUVERTE", "DRAFT"] },
      },
      include: {
        recruiter: true,
      },
    });

    for (const job of activeJobs) {
      // Déterminer la date d'expiration (soit expiresAt si définie, soit 30 jours après création)
      const expirationDate = job.expiresAt
        ? new Date(job.expiresAt)
        : new Date(new Date(job.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);

      const msDiff = expirationDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

      // Si l'offre expire dans les 3 prochains jours et n'est pas encore expirée
      if (daysLeft >= 0 && daysLeft <= 3 && job.recruiter?.userId) {
        // Vérifier si une notification n'a pas déjà été envoyée dans les dernières 48h pour cette offre
        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: job.recruiter.userId,
            type: "JOB_EXPIRING_SOON",
            title: { contains: "Offre expirant bientôt" },
            message: { contains: job.title },
            createdAt: { gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
          },
        });

        if (!recentNotif) {
          await notifyJobExpiringSoon({
            recruiterUserId: job.recruiter.userId,
            jobTitle: job.title,
            daysLeft: Math.max(1, daysLeft),
          });
          stats.jobExpiringNotified++;
        }
      }
    }

    // ------------------------------------------------------------------
    // 2. TÂCHE TALENTS : INTERVIEW_REMINDER (Rappels d'entretiens vidéo)
    // ------------------------------------------------------------------
    // Sessions d'entretiens en statut TODO créées il y a plus de 24h
    const pendingSessions = await prisma.interviewSession.findMany({
      where: {
        status: "TODO",
        createdAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
      include: {
        talent: true,
        interview: true,
      },
      take: 50,
    });

    for (const sessionItem of pendingSessions) {
      const talentUserId = sessionItem.talent?.userId;
      if (!talentUserId) continue;

      // Vérifier si un rappel n'a pas déjà été envoyé dans les 3 derniers jours
      const recentReminder = await prisma.notification.findFirst({
        where: {
          userId: talentUserId,
          type: "INTERVIEW_REMINDER",
          createdAt: { gte: new Date(now.getTime() - 72 * 60 * 60 * 1000) },
        },
      });

      if (!recentReminder) {
        await notifyInterviewReminder({
          talentUserId,
          interviewTitle: sessionItem.interview?.title,
        });
        stats.interviewRemindersNotified++;
      }
    }

    // ------------------------------------------------------------------
    // 3. TÂCHE RECRUTEURS : APPLICATION_SUMMARY (Récapitulatif hebdo)
    // ------------------------------------------------------------------
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recruiters = await prisma.recruiterProfile.findMany({
      include: {
        jobOffers: {
          include: {
            applications: {
              where: {
                createdAt: { gte: oneWeekAgo },
              },
            },
          },
        },
      },
    });

    for (const recruiter of recruiters) {
      if (!recruiter.userId) continue;

      // Compter le nombre total de candidatures reçues cette semaine
      const weeklyApplicationsCount = recruiter.jobOffers.reduce(
        (sum, job) => sum + (job.applications?.length || 0),
        0
      );

      // On n'envoie le récapitulatif que s'il y a eu au moins 1 candidature (ou si demandé)
      // et qu'aucun récapitulatif n'a été envoyé dans les 6 derniers jours
      if (weeklyApplicationsCount > 0) {
        const recentSummary = await prisma.notification.findFirst({
          where: {
            userId: recruiter.userId,
            type: "APPLICATION_SUMMARY",
            createdAt: { gte: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
          },
        });

        if (!recentSummary) {
          await notifyApplicationSummary({
            recruiterUserId: recruiter.userId,
            count: weeklyApplicationsCount,
          });
          stats.applicationSummariesNotified++;
        }
      }
    }

    // ------------------------------------------------------------------
    // 4. TÂCHE CONSERVATION DES DONNÉES : Inactivité > 2 ans
    // ------------------------------------------------------------------
    try {
      const retentionResult = await applyDataRetentionPolicy({ dryRun: false });
      stats.inactiveAccountsDeleted = retentionResult.deletedUsersCount;
    } catch (retentionErr) {
      console.error("Erreur lors de l'application de la politique de conservation des données:", retentionErr);
    }

    return NextResponse.json({
      success: true,
      message: "Cron Job exécuté avec succès (notifications & conservation des données)",
      stats,
    });
  } catch (error) {
    console.error("Cron Notifications Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'exécution du cron job",
        details: error instanceof Error ? error.message : "Inconnu",
      },
      { status: 500 }
    );
  }
}
