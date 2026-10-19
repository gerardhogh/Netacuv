import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    let userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      userId = (token?.sub as string) || (token?.id as string);
      userEmail = token?.email as string;
    }

    if (!userId && userEmail) {
      const u = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      });
      userId = u?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé ou identifiant introuvable" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: "Aucun fichier valide fourni" }, { status: 400 });
    }

    // --- SÉCURITÉ : Validation MIME Type et Taille ---
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format d'image non autorisé. Seuls les JPEG, PNG et WebP sont acceptés." }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image trop volumineuse. La taille maximale est de 5 Mo." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    let base64String: string;
    let outputMime = 'image/webp';
    try {
      const sharp = (await import('sharp')).default;
      const compressed = await sharp(inputBuffer)
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .webp({ quality: 82 })
        .toBuffer();
      base64String = compressed.toString('base64');
    } catch (e) {
      base64String = inputBuffer.toString('base64');
      outputMime = file.type;
    }
    const fileUrl = `data:${outputMime};base64,${base64String}`;

    // Mettre à jour l'image de l'utilisateur dans la base de données
    await prisma.user.update({
      where: { id: userId },
      data: { image: fileUrl }
    });

    // Également mettre à jour le logo entreprise s'il existe
    try {
      const recProfile = await prisma.recruiterProfile.findFirst({
        where: { userId }
      });
      if (recProfile) {
        await prisma.recruiterProfile.update({
          where: { id: recProfile.id },
          data: { companyLogo: fileUrl }
        });
      }
    } catch (e) {
      // Ignore if no recruiter profile yet
    }

    const publicUrl = `/api/users/${userId}/avatar?v=${Date.now()}`;

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl
    });

  } catch (error) {
    console.error("Erreur POST /api/recruiters/avatar:", error);
    return NextResponse.json({ error: "Erreur lors du traitement du fichier" }, { status: 500 });
  }
}
