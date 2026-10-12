import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

// Validation schema avec Zod
const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse e-mail est obligatoire")
    .email("Format d'e-mail invalide")
    .max(100, "L'adresse e-mail ne doit pas dépasser 100 caractères"),
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

    const { email } = validationResult.data;

    // 3. Vérification des variables d'environnement Resend
    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!apiKey || !audienceId) {
      console.error(
        "[Newsletter API] Erreur : RESEND_API_KEY ou RESEND_AUDIENCE_ID non défini dans l'environnement."
      );
      return NextResponse.json(
        { error: "Configuration du service de newsletter manquante sur le serveur." },
        { status: 500 }
      );
    }

    // 4. Appel de l'API Resend pour ajouter le contact à l'audience
    const resend = new Resend(apiKey);
    const { data, error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (error) {
      console.error("[Newsletter API] Erreur Resend :", error);
      // Cas particulier : contact déjà existant
      const errMessage = typeof error === "object" && error !== null && "message" in error 
        ? String(error.message) 
        : "";
      if (errMessage.toLowerCase().includes("already exists")) {
        return NextResponse.json(
          { message: "Vous êtes déjà inscrit(e) à notre newsletter !" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Une erreur est survenue lors de l'inscription. Veuillez réessayer." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Inscription réussie à la newsletter !" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Newsletter API] Erreur serveur imprévue :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
