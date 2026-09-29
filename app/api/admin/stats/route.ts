import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const talentsCount = await prisma.user.count({ where: { talentProfile: { isNot: null } } });
    const recruteursCount = await prisma.user.count({ where: { recruiterProfile: { isNot: null } } });
    const jobsCount = await prisma.jobOffer.count();
    const applicationsCount = await prisma.application.count();

    // Mock videos count for now since it's not a distinct model
    const videosCount = await prisma.talentProfile.count({
      where: { videoUrl: { not: null } }
    });

    return NextResponse.json({
      talentsCount,
      recruteursCount,
      jobsCount,
      videosCount,
      applicationsCount,
    });
  } catch (error) {
    console.error("Erreur GET /api/admin/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
