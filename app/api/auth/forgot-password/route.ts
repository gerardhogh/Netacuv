import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "L'adresse e-mail est obligatoire." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (req.headers.get("origin") ?? "http://localhost:3000");

    // L'appel côté serveur permet de loguer les erreurs SMTP de Supabase plus précisément
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/mise-a-jour-mot-de-passe`,
    });

    if (error) {
      // Logging détaillé de l'erreur (Point 2)
      logger.error("Failed to send password reset email via Supabase", {
        error: error.message,
        code: error.code,
        status: error.status,
        email,
        context: "api/auth/forgot-password",
      });
      
      console.error("[FORGOT_PASSWORD_ERROR]", error);

      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }

    logger.info("Password reset email sent successfully", { email, context: "api/auth/forgot-password" });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Unexpected error during password reset", {
      error: error instanceof Error ? error.message : "Unknown error",
      context: "api/auth/forgot-password",
    });

    console.error("[FORGOT_PASSWORD_EXCEPTION]", error);

    return NextResponse.json(
      { error: "Une erreur inattendue est survenue." },
      { status: 500 }
    );
  }
}
