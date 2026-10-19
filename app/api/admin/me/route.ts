import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import bcrypt from "bcrypt";

export const dynamic = 'force-dynamic';

function checkIsAdminRole(roleName?: string | null): boolean {
  if (!roleName) return false;
  const upper = roleName.toUpperCase();
  return (
    upper.includes("ADMIN") ||
    upper.includes("MODERATEUR") ||
    upper.includes("MODÉRATEUR") ||
    upper.includes("MANAGER") ||
    upper.includes("GESTIONNAIRE") ||
    upper.includes("SUPPORT")
  );
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const token = !session?.user ? await getToken({ req, secret: process.env.NEXTAUTH_SECRET }).catch(() => null) : null;
    const userId = (session?.user as any)?.id || token?.sub;
    
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
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

    const sessionRole = (session?.user as any)?.role || (token as any)?.role;
    const isAdmin = checkIsAdminRole(user.role?.name) || checkIsAdminRole(sessionRole);

    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.image?.startsWith("data:image")
        ? `/api/users/${user.id}/avatar`
        : (user.image || "/assets/avatar_africain.jpg")
    });
  } catch (error) {
    logger.error("Error GET /api/admin/me", { error: error instanceof Error ? error.message : "Unknown", context: "api/admin/me/GET" });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const token = !session?.user ? await getToken({ req, secret: process.env.NEXTAUTH_SECRET }).catch(() => null) : null;
    const userId = (session?.user as any)?.id || token?.sub;
    
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, passwordHash: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const sessionRole = (session?.user as any)?.role || (token as any)?.role;
    const isAdmin = checkIsAdminRole(user.role?.name) || checkIsAdminRole(sessionRole);

    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const data = await req.json();
    const { name, email, currentPassword, newPassword } = data;

    const dataToUpdate: Record<string, any> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Veuillez entrer votre mot de passe actuel." }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Le mot de passe doit comporter au moins 8 caractères." }, { status: 400 });
      }
      if (user?.passwordHash) {
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: "Le mot de passe actuel est incorrect." }, { status: 400 });
        }
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      dataToUpdate.passwordHash = newHash;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
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

