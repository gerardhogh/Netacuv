import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fsPromises from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;
    const formUserId = formData.get("userId") as string | null;

    // Try session first, fall back to formData userId (for /interview page outside auth layout)
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id || null;

    if (!userId && formUserId) {
      // Validate the userId exists and has a TalentProfile (security check)
      const profile = await prisma.talentProfile.findUnique({ where: { userId: formUserId }, select: { userId: true } });
      if (profile) {
        userId = formUserId;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: "Aucun fichier valide fourni" }, { status: 400 });
    }

    // --- SÉCURITÉ : Validation MIME Type et Taille ---
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    // file.type can be empty when uploaded via FormData from MediaRecorder
    const effectiveMime = file.type || (file.name.endsWith('.mp4') ? 'video/mp4' : 'video/webm');
    if (file.type && !allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format vidéo non autorisé. Seuls les MP4, WebM et MOV sont acceptés." }, { status: 400 });
    }

    const MAX_SIZE = 100 * 1024 * 1024; // 100 Mo (vidéos peuvent être volumineuses)
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Vidéo trop volumineuse. La taille maximale est de 100 Mo." }, { status: 400 });
    }
    // -------------------------------------------------

    // Nom de fichier unique pour éviter les collisions
    const fileExt = file.name.split('.').pop() || 'webm';
    const fileName = `${userId}-${Date.now()}-interview.${fileExt}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    
    try {
      await fsPromises.mkdir(uploadDir, { recursive: true });
      await fsPromises.writeFile(path.join(uploadDir, fileName), buffer);
    } catch (fsError) {
      console.error("Erreur d'écriture du fichier localement:", fsError);
      return NextResponse.json({ error: "Erreur lors de la sauvegarde du fichier." }, { status: 500 });
    }
    
    const fileUrl = `/uploads/videos/${fileName}`;

    // S'assurer que le TalentProfile existe pour cet utilisateur
    let talentProfile = await prisma.talentProfile.findUnique({
      where: { userId }
    });

    if (!talentProfile) {
      talentProfile = await prisma.talentProfile.create({
        data: {
          userId,
          videoUrl: fileUrl
        }
      });
    } else {
      talentProfile = await prisma.talentProfile.update({
        where: { userId },
        data: { videoUrl: fileUrl }
      });
    }

    return NextResponse.json({ 
      success: true, 
      videoUrl: fileUrl
    });
  } catch (error: any) {
    console.error("Erreur POST /api/talents/video:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'upload de la vidéo" }, { status: 500 });
  }
}
