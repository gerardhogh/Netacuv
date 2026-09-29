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
    
    let fileUrl = "";

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isPlaceholder) {
      return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
    } else {
      try {
        // We use the 'cvs' bucket because we know it exists and has the correct RLS policies.
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('cvs')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          return NextResponse.json({ error: "Erreur Supabase: " + (uploadError.message) }, { status: 500 });
        } else {
          const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(fileName);
          fileUrl = publicUrlData.publicUrl;
        }
      } catch (uploadException: any) {
        console.error("Supabase upload exception:", uploadException);
        return NextResponse.json({ error: "Exception Supabase: " + (uploadException.message) }, { status: 500 });
      }
    }

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
