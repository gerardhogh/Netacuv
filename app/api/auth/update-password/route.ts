import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 5; // Limite de tentatives
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Basic IP Rate Limiting
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const rateRecord = rateLimitMap.get(ip);
    
    if (rateRecord && now < rateRecord.resetTime) {
      if (rateRecord.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { error: "Trop de tentatives. Veuillez réessayer plus tard." },
          { status: 429 }
        );
      }
      rateRecord.count += 1;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    }

    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "Paramètres manquants (token, email, ou mot de passe)" },
        { status: 400 }
      );
    }

    // Vérifier le token dans la base de données
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Lien invalide. Veuillez refaire la demande." },
        { status: 401 }
      );
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Lien expiré. Veuillez refaire la demande." },
        { status: 401 }
      );
    }

    // Hacher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Mettre à jour l'utilisateur dans Prisma
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur update-password route:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
