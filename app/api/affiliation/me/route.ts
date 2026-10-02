import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son referralCode et sa cagnotte
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        referralCode: true,
        affiliateBalance: true,
        isPremium: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Générer un code si l'utilisateur n'en a pas
    if (!user.referralCode) {
      const generatedCode = `REF-${user.name?.replace(/\s+/g, '').substring(0, 4).toUpperCase() || 'USR'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode: generatedCode },
        select: {
          id: true,
          name: true,
          referralCode: true,
          affiliateBalance: true,
          isPremium: true,
        },
      });
    }

    // Récupérer la liste des filleuls
    const filleuls = await prisma.user.findMany({
      where: { referredById: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isPremium: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Formatter les filleuls
    const affilies = filleuls.map((f: any) => ({
      id: f.id,
      name: f.name || "Utilisateur anonyme",
      email: f.email,
      dateInscription: new Date(f.createdAt).toLocaleDateString('fr-FR'),
      // Si premium, le filleul est considéré comme actif/validé pour la prime
      statut: f.isPremium ? "Inscrit" : "En attente",
      // Si le filleul passe premium, le parrain gagne 2500 CFA
      gain: f.isPremium ? 2500 : 0,
    }));

    return NextResponse.json({
      referralCode: user.referralCode || "",
      cagnotte: user.affiliateBalance || 0,
      affilies,
    });
  } catch (error) {
    console.error("Erreur GET /api/affiliation/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
