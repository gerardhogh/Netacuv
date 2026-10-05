import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fsPromises from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    // --- SÉCURITÉ PREMIUM : Vérification côté serveur ---
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true }
    });
    if (!user?.isPremium) {
      return NextResponse.json({ error: "Cette fonctionnalité est réservée aux membres Premium." }, { status: 403 });
    }
    // -----------------------------------------------------
    
    const formData = await req.formData();
    const file = formData.get("cv") as File;

    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: "Aucun fichier valide fourni" }, { status: 400 });
    }

    // --- SÉCURITÉ : Validation MIME Type et Taille ---
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format de fichier non autorisé. Seuls les PDF et Word sont acceptés." }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux. La taille maximale est de 5 Mo." }, { status: 400 });
    }
    // -------------------------------------------------

    // Nom de fichier unique pour éviter les collisions
    const fileName = `${userId}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
    
    try {
      await fsPromises.mkdir(uploadDir, { recursive: true });
      await fsPromises.writeFile(path.join(uploadDir, fileName), buffer);
    } catch (fsError) {
      console.error("Erreur d'écriture du fichier localement:", fsError);
      return NextResponse.json({ error: "Erreur lors de la sauvegarde du fichier." }, { status: 500 });
    }
    
    const fileUrl = `/uploads/cvs/${fileName}`;

    // S'assurer que le TalentProfile existe pour cet utilisateur
    let talentProfile = await prisma.talentProfile.findUnique({
      where: { userId }
    });

    if (!talentProfile) {
      talentProfile = await prisma.talentProfile.create({
        data: {
          userId,
          cvUrl: fileUrl
        }
      });
    } else {
      talentProfile = await prisma.talentProfile.update({
        where: { userId },
        data: { cvUrl: fileUrl }
      });
    }

    return NextResponse.json({ 
      success: true, 
      cvUrl: fileUrl,
      fileName: file.name
    });
  } catch (error: any) {
    console.error("Erreur POST /api/talents/cv:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'upload du CV" }, { status: 500 });
  }
}
