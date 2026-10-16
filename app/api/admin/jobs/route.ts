import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";
    const isAdmin = role === "SUPER ADMIN" || role === "ADMIN RH / MODÉRATEUR" || role === "MANAGER IA & CERTIFICATION" || role === "GESTIONNAIRE FINANCIER" || role === "SUPPORT CLIENT" || role === "ADMIN" || role === "ADMINISTRATEUR";

    if (!session || !session.user || !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20);
    const skip = (page - 1) * limit;

    const [jobs, totalCount] = await Promise.all([
      prisma.jobOffer.findMany({
        include: {
          recruiter: {
            include: { 
              user: {
                include: { role: true }
              }
            }
          },
          applications: true
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
      }),
      prisma.jobOffer.count(),
    ]);

    return NextResponse.json({
      jobs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
    });
  } catch (error) {
    console.error("Erreur GET /api/admin/jobs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
