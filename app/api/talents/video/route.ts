import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import fsPromises from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;
    const formUserId = formData.get("userId") as string | null;

    // 1. Identification sécurisée et robuste de l'utilisateur (Token JWT > Session > formUserId validé en BDD)
    let userId: string | null = null;
    
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.sub) {
        userId = token.sub;
      }
    } catch (e) {
      // Ignorer l'erreur JWT et essayer la session
    }

    if (!userId) {
      try {
        const session = await getServerSession(authOptions);
        userId = (session?.user as any)?.id || null;
      } catch (e) {
        // Ignorer
      }
    }

    if (!userId && formUserId) {
      const userExists = await prisma.user.findUnique({ 
        where: { id: formUserId }, 
        select: { id: true } 
      });
      if (userExists) {
        userId = formUserId;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: { select: { name: true } }, isPremium: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: "Aucun fichier valide fourni" }, { status: 400 });
    }

    // --- SÉCURITÉ : Validation MIME Type et Taille ---
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    const effectiveMime = file.type || (file.name.endsWith('.mp4') ? 'video/mp4' : 'video/webm');
    if (file.type && !allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format vidéo non autorisé. Seuls les MP4, WebM et MOV sont acceptés." }, { status: 400 });
    }

    const MAX_SIZE = 150 * 1024 * 1024; // 150 Mo
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Vidéo trop volumineuse. La taille maximale est de 150 Mo." }, { status: 400 });
    }

    // Nom de fichier unique pour éviter les collisions
    const fileExt = file.name.split('.').pop() || (effectiveMime.includes('mp4') ? 'mp4' : 'webm');
    const fileName = `${userId}-${Date.now()}-interview.${fileExt}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    
    try {
      await fsPromises.mkdir(uploadDir, { recursive: true });
      await fsPromises.writeFile(path.join(uploadDir, fileName), buffer);
    } catch (fsError) {
      console.error("Erreur d'écriture du fichier localement:", fsError);
      return NextResponse.json({ error: "Erreur lors de la sauvegarde du fichier sur le serveur." }, { status: 500 });
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

    // Mettre à jour la session d'entretien s'il y en a une
    try {
      const latestSession = await prisma.interviewSession.findFirst({
        where: { talentId: talentProfile.id },
        orderBy: { createdAt: "desc" },
      });
      if (latestSession) {
        await prisma.interviewSession.update({
          where: { id: latestSession.id },
          data: {
            videoRecordings: fileUrl,
            status: "COMPLETED",
          },
        });
      }
    } catch (sessionErr) {
      console.warn("Could not sync interviewSession:", sessionErr);
    }

    return NextResponse.json({ 
      success: true, 
      videoUrl: fileUrl,
      profileId: talentProfile.id
    });
  } catch (error: any) {
    console.error("Erreur POST /api/talents/video:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'upload de la vidéo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.sub) userId = token.sub;
    } catch (e) {}

    if (!userId) {
      try {
        const session = await getServerSession(authOptions);
        userId = (session?.user as any)?.id || null;
      } catch (e) {}
    }

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const profile = await prisma.talentProfile.findUnique({
      where: { userId },
      select: { videoUrl: true }
    });

    if (profile?.videoUrl) {
      // Si la vidéo est sur le stockage local, supprimer le fichier
      if (profile.videoUrl.startsWith("/uploads/videos/")) {
        const filePath = path.join(process.cwd(), "public", profile.videoUrl);
        try {
          await fsPromises.unlink(filePath);
        } catch (e) {
          console.warn("Could not delete physical video file:", e);
        }
      }
    }

    // Supprimer la référence videoUrl en base de données
    await prisma.talentProfile.update({
      where: { userId },
      data: { videoUrl: null }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Vidéo supprimée avec succès" 
    });
  } catch (error: any) {
    console.error("Erreur DELETE /api/talents/video:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la suppression de la vidéo" }, { status: 500 });
  }
}
