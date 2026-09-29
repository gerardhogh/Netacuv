import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "L'adresse e-mail est obligatoire." },
        { status: 400 }
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true }
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "Aucun compte n'est associé à cette adresse e-mail. Veuillez vous inscrire." },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (req.headers.get("origin") ?? "http://localhost:3000");

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token in Prisma
    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token } },
      update: { token, expires },
      create: { identifier: email, token, expires }
    });

    const resetLink = `${appUrl}/mise-a-jour-mot-de-passe?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Netacuv <noreply@netacuv.com>",
        to: email,
        subject: "Réinitialisation de votre mot de passe - Netacuv",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0071a2;">Bonjour ${userExists.name || ""},</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur Netacuv.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #32A8D7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">Ce lien expirera dans 1 heure.</p>
            <p style="font-size: 14px; color: #666;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.</p>
            <br/>
            <p style="font-size: 14px; color: #666;">L'équipe Netacuv</p>
          </div>
        `
      })
    });

    if (!resendRes.ok) {
      const errorData = await resendRes.json();
      logger.error("ERREUR_ENVOI_RESEND", { error: errorData, email });
      console.error("[ERREUR_ENVOI_RESEND]", errorData);
      return NextResponse.json({ error: "Échec de l'envoi de l'e-mail." }, { status: 500 });
    }

    logger.info("Password reset email sent successfully via Resend", { email, context: "api/auth/forgot-password" });
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
