import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
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
    
    let fileUrl = "";

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isPlaceholder) {
      console.warn("Using placeholder Supabase URL, cannot upload CV.");
      return NextResponse.json({ error: "Supabase n'est pas configuré. Veuillez configurer NEXT_PUBLIC_SUPABASE_URL." }, { status: 500 });
    } else {
      try {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('cvs')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          return NextResponse.json({ error: "Erreur Supabase: " + (uploadError.message || "Impossible d'importer le CV.") + " (Le bucket 'cvs' existe-t-il ?)" }, { status: 500 });
        } else {
          const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(fileName);
          fileUrl = publicUrlData.publicUrl;
        }
      } catch (uploadException: any) {
        console.error("Supabase upload exception:", uploadException);
        return NextResponse.json({ error: "Exception Supabase: " + (uploadException.message || "Erreur réseau.") }, { status: 500 });
      }
    }

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
