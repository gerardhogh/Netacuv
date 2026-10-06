import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";


export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    const upperRole = user?.role?.name?.toUpperCase() || "";
    const isAdmin = upperRole === "SUPER ADMIN" || upperRole === "ADMIN RH / MODÉRATEUR" || upperRole === "MANAGER IA & CERTIFICATION" || upperRole === "GESTIONNAIRE FINANCIER" || upperRole === "SUPPORT CLIENT" || upperRole === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    
    const body = await req.json();
    const { avatarBase64, fileName: originalName, mimeType } = body;

    if (!avatarBase64) {
      return NextResponse.json({ error: "Aucun fichier valide fourni" }, { status: 400 });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json({ error: "Format d'image non autorisé. Seuls les JPEG, PNG et WebP sont acceptés." }, { status: 400 });
    }

    const base64Data = avatarBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: "Image trop volumineuse. La taille maximale est de 5 Mo." }, { status: 400 });
    }

    // Sauvegarde en Base64 dans la BDD pour contourner le read-only de Vercel
    const fileUrl = avatarBase64;

    await prisma.user.update({
      where: { id: userId },
      data: { image: fileUrl }
    });

    return NextResponse.json({
      success: true,
      avatarUrl: fileUrl
    });

  } catch (error: any) {
    console.error("Erreur POST /api/admin/avatar:", error);
    return NextResponse.json({ error: "Erreur lors du traitement du fichier: " + error?.message }, { status: 500 });
  }
}
