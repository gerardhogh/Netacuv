import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema avec Zod
const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse e-mail est obligatoire")
    .email("Format d'e-mail invalide")
    .max(100, "L'adresse e-mail ne doit pas dépasser 100 caractères"),
  source: z.string().optional().default("FOOTER"),
});

// Simple in-memory rate limiter par IP (5 requêtes max par tranche de 10 minutes)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Nettoyage régulier si la map grossit
  if (rateLimitMap.size > 2000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

// Template email de bienvenue Netacuv
function getWelcomeEmailHtml(email: string) {
  const siteUrl = process.env.NEXTAUTH_URL || "https://netacuv.com";
  const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  const logoUrl = "https://www.netacuv.com/Logo/PNG/Logo%20white.png";

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bienvenue chez Netacuv</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #1e8ae9 0%, #32A8D7 100%); padding: 32px 24px; text-align: center; }
          .content { padding: 36px 32px; line-height: 1.6; font-size: 15px; color: #334155; }
          .content h2 { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 14px; letter-spacing: -0.3px; }
          .feature-list { margin: 26px 0; padding-left: 0; list-style: none; }
          .feature-item { display: flex; align-items: flex-start; margin-bottom: 16px; }
          .bullet { display: inline-block; width: 8px; height: 8px; min-width: 8px; min-height: 8px; border-radius: 50%; background: #1e8ae9; box-shadow: 0 0 0 4px #e0f2fe; margin-right: 14px; margin-top: 7px; flex-shrink: 0; }
          .btn-container { text-align: center; margin: 34px 0 18px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #f59e0b 50%, #d97706 100%); background-color: #f59e0b; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 6px 18px rgba(245, 158, 11, 0.35); }
          .footer { background: #f8fafc; padding: 22px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer a { color: #1e8ae9; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="${logoUrl}" alt="Netacuv" width="150" style="width: 150px; max-width: 150px; height: auto; display: block; margin: 0 auto; border: 0;" />
            </a>
          </div>
          <div class="content">
            <h2>Bienvenue dans notre communauté !</h2>
            <p style="margin-top: 0; margin-bottom: 16px;">Bonjour et merci d'avoir rejoint la newsletter Netacuv.</p>
            <p style="margin-bottom: 20px;">Vous êtes désormais aux premières loges pour recevoir :</p>
            <ul class="feature-list" style="margin: 26px 0; padding-left: 0; list-style: none;">
              <li class="feature-item" style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <span class="bullet" style="display: inline-block; width: 8px; height: 8px; min-width: 8px; min-height: 8px; border-radius: 50%; background: #1e8ae9; box-shadow: 0 0 0 4px #e0f2fe; margin-right: 14px; margin-top: 7px; flex-shrink: 0;"></span>
                <span style="font-size: 15px; color: #334155; line-height: 1.6;"><strong>Nos dernières opportunités d'emploi</strong> certifiées et vérifiées.</span>
              </li>
              <li class="feature-item" style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <span class="bullet" style="display: inline-block; width: 8px; height: 8px; min-width: 8px; min-height: 8px; border-radius: 50%; background: #1e8ae9; box-shadow: 0 0 0 4px #e0f2fe; margin-right: 14px; margin-top: 7px; flex-shrink: 0;"></span>
                <span style="font-size: 15px; color: #334155; line-height: 1.6;"><strong>Les innovations RH & IA</strong> pour réussir vos entretiens vidéo intelligents.</span>
              </li>
              <li class="feature-item" style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <span class="bullet" style="display: inline-block; width: 8px; height: 8px; min-width: 8px; min-height: 8px; border-radius: 50%; background: #1e8ae9; box-shadow: 0 0 0 4px #e0f2fe; margin-right: 14px; margin-top: 7px; flex-shrink: 0;"></span>
                <span style="font-size: 15px; color: #334155; line-height: 1.6;"><strong>Conseils pratiques</strong> pour maximiser votre attractivité en tant que talent ou recruteur.</span>
              </li>
            </ul>
            <div class="btn-container" style="text-align: center; margin: 34px 0 18px;">
              <a href="${siteUrl}" class="btn" style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #f59e0b 50%, #d97706 100%); background-color: #f59e0b; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 6px 18px rgba(245, 158, 11, 0.35);">Découvrir la plateforme Netacuv</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;">© ${new Date().getFullYear()} Netacuv. Tous droits réservés.</p>
            <p style="margin: 0 0 6px 0;">Vous recevez cet e-mail car vous vous êtes inscrit(e) sur Netacuv.</p>
            <p style="margin: 0;"><a href="${unsubscribeUrl}">Se désabonner en 1 clic</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Protection par Rate Limiting via IP client
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : req.headers.get("x-real-ip") || "unknown-ip";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer." },
        { status: 429 }
      );
    }

    // 2. Récupération et validation du body JSON
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Données de formulaire invalides." },
        { status: 400 }
      );
    }

    const validationResult = newsletterSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues?.[0]?.message || "Format d'e-mail invalide";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, source } = validationResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Sauvegarde dans la base de données PostgreSQL via Prisma
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    let isNewSubscriber = false;

    if (existingSubscriber) {
      if (existingSubscriber.status === "ACTIVE") {
        return NextResponse.json(
          { message: "Vous êtes déjà inscrit(e) à notre newsletter !" },
          { status: 200 }
        );
      } else {
        // Réactivation d'un abonné qui s'était précédemment désabonné
        await prisma.newsletterSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            status: "ACTIVE",
            unsubscribedAt: null,
            source: source || existingSubscriber.source,
          },
        });
        isNewSubscriber = true;
      }
    } else {
      // Nouvel abonné
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          source: source || "FOOTER",
          status: "ACTIVE",
        },
      });
      isNewSubscriber = true;
    }

    // 4. Synchronisation avec l'audience Resend & Envoi du mail de bienvenue (Asynchrone et résilient)
    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (apiKey) {
      const resend = new Resend(apiKey);

      // A. Synchronisation avec l'audience Resend
      if (audienceId) {
        resend.contacts
          .create({
            email: normalizedEmail,
            audienceId,
            unsubscribed: false,
          })
          .catch((err) => {
            console.warn("[Newsletter API] Sync contact Resend avertissement:", err?.message || err);
          });
      }

      // B. Envoi du mail de bienvenue si c'est une nouvelle inscription ou réactivation
      if (isNewSubscriber) {
        const fromSender = process.env.RESEND_FROM_EMAIL || "Netacuv <contact@netacuv.com>";
        resend.emails
          .send({
            from: fromSender,
            to: normalizedEmail,
            subject: "Bienvenue dans la communauté Netacuv ! 🚀",
            html: getWelcomeEmailHtml(normalizedEmail),
          })
          .then((res) => {
            if (res.error) {
              console.warn("[Newsletter API] Envoi email bienvenue avertissement Resend:", res.error);
            }
          })
          .catch((err) => {
            console.warn("[Newsletter API] Erreur envoi email bienvenue:", err?.message || err);
          });
      }
    } else {
      console.warn("[Newsletter API] RESEND_API_KEY non configurée. L'abonné est tout de même enregistré en base de données.");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Merci pour votre inscription à la newsletter Netacuv !",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Newsletter API] Erreur serveur imprévue :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
