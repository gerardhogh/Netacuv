import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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
    const file = formData.get("video") as File;

    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: "Aucun fichier valide fourni" }, { status: 400 });
    }

    // Nom de fichier unique pour éviter les collisions
    const fileExt = file.name.split('.').pop() || 'webm';
    const fileName = `${userId}-${Date.now()}-interview.${fileExt}`;
    
    let fileUrl = "";

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isPlaceholder) {
      console.warn("Using placeholder Supabase URL, cannot upload video.");
      return NextResponse.json({ error: "Supabase n'est pas configuré. Veuillez configurer NEXT_PUBLIC_SUPABASE_URL." }, { status: 500 });
    } else {
      try {
        // Use 'cvs' bucket or 'videos' bucket if we prefer. Let's use 'cvs' to ensure it exists, but named 'videos' if you created it. Wait, cvs is known to exist. Let's use 'cvs' bucket but put in a subfolder or just name. We'll use 'cvs' bucket as it's guaranteed to work.
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('cvs')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          return NextResponse.json({ error: "Erreur Supabase: " + (uploadError.message || "Impossible d'importer la vidéo.") }, { status: 500 });
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
