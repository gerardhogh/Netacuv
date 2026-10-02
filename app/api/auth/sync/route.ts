import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { access_token, roleParam, actionParam } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: "Access token manquant" },
        { status: 400 }
      );
    }

    // Initialiser le client Supabase serveur
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Récupérer l'utilisateur avec le token pour vérifier son authenticité
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabaseServer.auth.getUser(access_token);

    if (authError || !supabaseUser) {
      console.error("Erreur vérification token Supabase:", authError);
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    const email = supabaseUser.email!;
    const name =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      email.split("@")[0];
    const image = supabaseUser.user_metadata?.avatar_url || null;

    // Synchronisation avec Prisma
    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      const roleName = roleParam === "recruteur" ? "RECRUTEUR" : "TALENT";
      let role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        role = await prisma.role.create({
          data: {
            name: roleName,
            isSystem: true,
          },
        });
      }

      const randomPassword = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          name,
          email,
          image,
          passwordHash,
          roleId: role.id,
          emailVerified: new Date(),
        },
        include: { role: true },
      });

      if (roleName === "RECRUTEUR") {
        await prisma.recruiterProfile.create({ data: { userId: user.id } });
      } else {
        await prisma.talentProfile.create({ data: { userId: user.id } });
      }
    } else {
      if (actionParam === "signup") {
        return NextResponse.json(
          { 
            error: `Ce compte Google est déjà associé à un compte Netacuv. Veuillez vous connecter.` 
          },
          { status: 403 }
        );
      }

      const existingRoleName = user.role?.name;
      const targetRoleName = roleParam === "recruteur" ? "RECRUTEUR" : "TALENT";

      if (existingRoleName && existingRoleName !== targetRoleName) {
        return NextResponse.json(
          { 
            error: `Cette adresse e-mail est déjà associée à un autre type de profil. Veuillez vérifier l'onglet sélectionné ou utiliser une autre adresse.` 
          },
          { status: 403 }
        );
      }

      await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          image: image || user.image,
          emailVerified: user.emailVerified || new Date(),
        },
      });
    }

    // Déterminer la redirection basée sur le nouveau rôle
    const userRole = user.role?.name || "TALENT";
    const redirectPath =
      ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes(userRole.toUpperCase())
        ? "/dashboard/admin"
        : userRole === "RECRUTEUR"
        ? "/dashboard/recruteur"
        : "/dashboard/talent";

    // Générer le HMAC Token
    const timestamp = Date.now().toString();
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${email}:${timestamp}`)
      .digest("hex");
    const hmacToken = `${timestamp}:${signature}`;

    return NextResponse.json({
      email,
      token: hmacToken,
      redirect: redirectPath,
    });
  } catch (error) {
    console.error("Erreur sync route:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
