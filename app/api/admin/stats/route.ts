import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";
    const isAdmin = role === "SUPER ADMIN" || role === "ADMIN RH / MODÉRATEUR" || role === "MANAGER IA & CERTIFICATION" || role === "GESTIONNAIRE FINANCIER" || role === "SUPPORT CLIENT" || role === "ADMIN" || role === "ADMINISTRATEUR";

    if (!session || !session.user || !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [talentsCount, recruteursCount, jobsCount, applicationsCount, videosCount] = await Promise.all([
      prisma.user.count({ where: { talentProfile: { isNot: null } } }),
      prisma.user.count({ where: { recruiterProfile: { isNot: null } } }),
      prisma.jobOffer.count(),
      prisma.application.count(),
      prisma.talentProfile.count({
        where: { videoUrl: { not: null } }
      }),
    ]);

    return NextResponse.json({
      talentsCount,
      recruteursCount,
      jobsCount,
      videosCount,
      applicationsCount,
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=10, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    console.error("Erreur GET /api/admin/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
