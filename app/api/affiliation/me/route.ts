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

    // Date du début de la journée en cours
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Récupérer la liste des filleuls avec vérification des 3 critères
    const filleuls = await prisma.user.findMany({
      where: { referredById: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isPremium: true,
        talentProfile: {
          select: {
            phone: true,
            city: true,
            country: true,
            degree: true,
            bio: true,
            skills: true,
            cvUrl: true,
          },
        },
        recruiterProfile: {
          select: {
            companyName: true,
            industry: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const todayReferralsCount = filleuls.filter(
      (f) => new Date(f.createdAt) >= startOfToday
    ).length;

    // Formatter les filleuls selon les 2 critères d'éligibilité :
    // 1. Inscription via code/QR (relation referredById)
    // 2. Profil 100% complété (sans condition Premium)
    const { isProfileComplete, checkAndRewardReferral } = await import("@/lib/referral");

    const affilies = await Promise.all(
      filleuls.map(async (f: any) => {
        const step1Registered = true;
        const step2ProfileComplete = isProfileComplete(f);
        const isEligible = step1Registered && step2ProfileComplete;

        // Si le filleul remplit les 2 critères, s'assurer que les 25 FCFA sont débloqués
        if (isEligible) {
          await checkAndRewardReferral(f.id);
        }

        const statut: "Validé" | "Profil incomplet" = isEligible ? "Validé" : "Profil incomplet";

        return {
          id: f.id,
          name: f.name || "Utilisateur anonyme",
          email: f.email,
          dateInscription: new Date(f.createdAt).toLocaleDateString('fr-FR'),
          step1Registered,
          step2ProfileComplete,
          isEligible,
          statut,
          gain: isEligible ? 25 : 0,
        };
      })
    );

    // Rafraîchir le solde cagnotte après attribution automatique
    const refreshedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { affiliateBalance: true },
    });

    return NextResponse.json({
      referralCode: user.referralCode || "",
      cagnotte: refreshedUser?.affiliateBalance ?? user.affiliateBalance ?? 0,
      affilies,
      dailyReferralsCount: todayReferralsCount,
      dailyLimit: 15,
      bonusPerReferral: 25,
      monthlyMaxPotential: 11250,
    });
  } catch (error) {
    console.error("Erreur GET /api/affiliation/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
