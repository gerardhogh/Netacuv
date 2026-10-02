import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";
    const isAdmin = role === "SUPER ADMIN" || role === "ADMIN RH / MODÉRATEUR" || role === "MANAGER IA & CERTIFICATION" || role === "GESTIONNAIRE FINANCIER" || role === "SUPPORT CLIENT" || role === "ADMIN";

    if (!session || !session.user || !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const jobs = await prisma.jobOffer.findMany({
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
      }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Erreur GET /api/admin/jobs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
