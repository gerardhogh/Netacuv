import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from "next-auth/jwt";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.sub) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = token.sub;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.role?.name !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.image
    });
  } catch (error) {
    logger.error("Error GET /api/admin/me", { error: error instanceof Error ? error.message : "Unknown", context: "api/admin/me/GET" });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.sub) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = token.sub;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role?.name !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const data = await req.json();
    const { name, email } = data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email }
    });

    logger.info("Admin profile updated", { userId });
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.image
      }
    });

  } catch (error) {
    logger.error("Erreur PUT /api/admin/me:", { error: error instanceof Error ? error.message : "Unknown", context: "api/admin/me/PUT" });
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 });
  }
}
