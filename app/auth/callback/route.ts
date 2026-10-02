import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Callback OAuth Supabase → Crée/retrouve l'utilisateur dans Prisma,
 * puis redirige vers le dashboard avec une session NextAuth.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const roleParam = searchParams.get("role"); // "talent" ou "recruteur"
  const type = searchParams.get("type"); // "recovery" pour réinitialisation de mot de passe
  const next = searchParams.get("next"); // URL de redirection optionnelle

  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?error=NoCodeReceived`);
  }

  // Si c'est un lien de réinitialisation de mot de passe,
  // on redirige directement vers la page client sans échanger le code côté serveur
  // (le client Supabase JS échangera le code et stockera la session dans le navigateur)
  if (type === "recovery" || next === "/mise-a-jour-mot-de-passe") {
    const resetUrl = new URL(`${origin}/mise-a-jour-mot-de-passe`);
    resetUrl.searchParams.set("code", code);
    return NextResponse.redirect(resetUrl.toString());
  }

  try {
    // 1. Échanger le code OAuth contre une session Supabase
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { session },
      error: authError,
    } = await supabaseServer.auth.exchangeCodeForSession(code);

    if (authError || !session?.user) {
      console.error("Supabase auth error:", authError);
      return NextResponse.redirect(
        `${origin}/connexion?error=AuthenticationFailed`
      );
    }

    // Si c'est un lien de réinitialisation de mot de passe, rediriger vers la page dédiée
    const sessionType = (session as any)?.type || type;
    if (sessionType === "recovery" || next === "/mise-a-jour-mot-de-passe") {
      return NextResponse.redirect(`${origin}/mise-a-jour-mot-de-passe`);
    }

    const supabaseUser = session.user;
    const email = supabaseUser.email!;
    const name =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      email.split("@")[0];
    const image = supabaseUser.user_metadata?.avatar_url || null;

    // 2. Upsert l'utilisateur dans la base Prisma
    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      // Déterminer le rôle
      const roleName =
        roleParam === "recruteur" ? "RECRUTEUR" : "TALENT";

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

      // Créer un mot de passe aléatoire (l'utilisateur se connecte via Google)
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

      // Créer le profil spécifique
      if (roleName === "RECRUTEUR") {
        await prisma.recruiterProfile.create({
          data: { userId: user.id },
        });
      } else {
        await prisma.talentProfile.create({
          data: { userId: user.id },
        });
      }
    } else {
      // Mettre à jour les infos si l'utilisateur existe déjà
      await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          image: image || user.image,
          emailVerified: user.emailVerified || new Date(),
        },
      });
    }

    // 3. Rediriger vers le bon dashboard
    // On passe par une page intermédiaire qui va créer la session NextAuth côté client
    const userRole = user.role?.name || "TALENT";
    const dashboardPath =
      userRole === "ADMIN"
        ? "/dashboard/admin"
        : userRole === "RECRUTEUR"
        ? "/dashboard/recruteur"
        : "/dashboard/talent";

    // Générer un jeton HMAC sécurisé valable 5 minutes
    const timestamp = Date.now().toString();
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${email}:${timestamp}`)
      .digest("hex");
    const token = `${timestamp}:${signature}`;

    // Redirection vers la page de callback client qui va créer la session NextAuth
    const callbackUrl = new URL(`${origin}/auth/google-session`);
    callbackUrl.searchParams.set("email", email);
    callbackUrl.searchParams.set("token", token);
    callbackUrl.searchParams.set("redirect", dashboardPath);

    return NextResponse.redirect(callbackUrl.toString());
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${origin}/connexion?error=ServerError`
    );
  }
}
