import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return new Response(renderPage("Adresse e-mail manquante", "Le lien de désabonnement est incomplet."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    // 1. Mise à jour dans la base de données PostgreSQL
    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    });

    // 2. Mise à jour dans Resend si configuré
    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (apiKey && audienceId) {
      const resend = new Resend(apiKey);
      try {
        await resend.contacts.update({
          email,
          audienceId,
          unsubscribed: true,
        });
      } catch (err) {
        console.warn("[Newsletter Unsubscribe] Note Resend:", err);
      }
    }

    return new Response(
      renderPage(
        "Désabonnement confirmé",
        `L'adresse <strong>${email}</strong> a bien été retirée de notre liste de diffusion. Vous ne recevrez plus nos actualités.`
      ),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("[Newsletter Unsubscribe] Erreur:", error);
    return new Response(
      renderPage("Erreur", "Une erreur est survenue lors de votre désabonnement. Veuillez réessayer plus tard."),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}

function renderPage(title: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} - Netacuv</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: white; max-width: 460px; width: 100%; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; padding: 40px 32px; text-align: center; }
          .logo { font-size: 26px; font-weight: 800; color: #1e8ae9; margin-bottom: 24px; }
          h1 { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
          p { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 28px; }
          a.btn { display: inline-block; background: #1e8ae9; color: white; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 12px; transition: background 0.2s; }
          a.btn:hover { background: #0071a2; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Netacuv</div>
          <h1>${title}</h1>
          <p>${message}</p>
          <a href="/" class="btn">Retourner à l'accueil</a>
        </div>
      </body>
    </html>
  `;
}
