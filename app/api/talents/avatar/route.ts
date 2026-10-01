import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: "Aucun fichier valide fourni" }, { status: 400 });
    }

    // --- SÉCURITÉ : Validation MIME Type et Taille ---
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format d'image non autorisé. Seuls les JPEG, PNG et WebP sont acceptés." }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image trop volumineuse. La taille maximale est de 5 Mo." }, { status: 400 });
    }
    // -------------------------------------------------

    // Nom de fichier unique pour éviter les collisions (sans sous-dossier au cas où les règles Supabase le bloqueraient)
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, fileName), buffer);
    } catch (fsError) {
      console.error("Erreur d'écriture du fichier localement:", fsError);
      return NextResponse.json({ error: "Erreur lors de la sauvegarde du fichier." }, { status: 500 });
    }
    
    const fileUrl = `/uploads/avatars/${fileName}`;

    // Mettre à jour l'utilisateur dans la base de données
    await prisma.user.update({
      where: { id: userId },
      data: { image: fileUrl }
    });

    return NextResponse.json({
      success: true,
      avatarUrl: fileUrl
    });

  } catch (error) {
    console.error("Erreur POST /api/talents/avatar:", error);
    return NextResponse.json({ error: "Erreur lors du traitement du fichier" }, { status: 500 });
  }
}
