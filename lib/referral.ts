import { prisma } from "@/lib/prisma";

export interface ReferrerMatch {
  id: string;
  name: string | null;
  email: string | null;
  referralCode: string | null;
}

/**
 * Recherche robuste et tolérante d'un parrain.
 * Prend en charge :
 * - Le code exact (insensible à la casse)
 * - Le code avec ou sans le préfixe "REF-"
 * - L'ancien format temporaire basé sur le nom (ex: "GEN-750", "G-750")
 * - L'adresse email du parrain (très souvent utilisée par les utilisateurs comme code de parrainage)
 * - Le nom ou prénom exact du parrain
 */
export async function findReferrer(rawCode: string | null | undefined): Promise<ReferrerMatch | null> {
  if (!rawCode) return null;

  const clean = rawCode.trim().replace(/^['"]|['"]$/g, "");
  if (clean.length < 2) return null;

  // 1. Recherche directe par code de parrainage (insensible à la casse)
  const byCode = await prisma.user.findFirst({
    where: {
      referralCode: {
        equals: clean,
        mode: "insensitive",
      },
    },
    select: { id: true, name: true, email: true, referralCode: true },
  });
  if (byCode) return byCode;

  // 2. Recherche avec préfixe "REF-" ajouté si absent
  if (!clean.toUpperCase().startsWith("REF-")) {
    const byWithRef = await prisma.user.findFirst({
      where: {
        referralCode: {
          equals: `REF-${clean}`,
          mode: "insensitive",
        },
      },
      select: { id: true, name: true, email: true, referralCode: true },
    });
    if (byWithRef) return byWithRef;
  } else {
    // Si commence par "REF-", tenter sans le "REF-"
    const stripped = clean.substring(4);
    if (stripped.length >= 2) {
      const byWithoutRef = await prisma.user.findFirst({
        where: {
          referralCode: {
            equals: stripped,
            mode: "insensitive",
          },
        },
        select: { id: true, name: true, email: true, referralCode: true },
      });
      if (byWithoutRef) return byWithoutRef;
    }
  }

  // 3. Recherche par adresse email (si l'amie a saisi l'email de son parrain)
  if (clean.includes("@")) {
    const byEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: clean,
          mode: "insensitive",
        },
      },
      select: { id: true, name: true, email: true, referralCode: true },
    });
    if (byEmail) return byEmail;
  }

  // 4. Gestion de l'ancien format fallback "[NOM]-750" (ex: "GEN-750", "G-750")
  if (clean.toUpperCase().endsWith("-750")) {
    const namePrefix = clean.slice(0, -4).trim();
    if (namePrefix.length >= 1) {
      const byNamePrefix = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { startsWith: namePrefix, mode: "insensitive" } },
            { referralCode: { contains: namePrefix, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true, referralCode: true },
      });
      if (byNamePrefix) return byNamePrefix;
    }
  }

  // 5. Recherche par nom d'utilisateur (si le filleul a saisi le prénom ou pseudo du parrain)
  const byName = await prisma.user.findFirst({
    where: {
      name: {
        equals: clean,
        mode: "insensitive",
      },
    },
    select: { id: true, name: true, email: true, referralCode: true },
  });
  if (byName) return byName;

  return null;
}

/**
 * Critère 2 d'éligibilité au bonus : profil 100% complété.
 * - Pour un Talent : nom + téléphone + ville + pays + bio + compétences
 * - Pour un Recruteur : nom + entreprise + secteur
 */
export function isProfileComplete(user: any): boolean {
  if (!user || !user.name || typeof user.name !== "string" || !user.name.trim()) {
    return false;
  }

  if (user.talentProfile) {
    const tp = user.talentProfile;
    return Boolean(
      tp.phone?.trim() &&
      tp.city?.trim() &&
      tp.country?.trim() &&
      tp.bio?.trim() &&
      tp.skills?.trim()
    );
  }

  if (user.recruiterProfile) {
    const rp = user.recruiterProfile;
    return Boolean(
      rp.companyName?.trim() &&
      rp.industry?.trim()
    );
  }

  return false;
}

/**
 * Validation et déblocage du bonus de 25 FCFA lorsque les 2 critères sont satisfaits :
 * 1. Inscription via code/QR parrain (relation referredById)
 * 2. Profil 100% complété
 * 
 * Si éligible et non encore crédité :
 * - Vérifie le plafond de 15 parrainages par jour
 * - Crédite 25 FCFA au parrain
 * - Enregistre la transaction AFFILIATE_REWARD
 * - Envoie une notification en temps réel au parrain
 */
export async function checkAndRewardReferral(filleulUserId: string) {
  try {
    const filleul = await prisma.user.findUnique({
      where: { id: filleulUserId },
      include: {
        talentProfile: true,
        recruiterProfile: true,
        referredBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } },
          },
        },
      },
    });

    if (!filleul || !filleul.referredById || !filleul.referredBy) {
      return { eligible: false, rewarded: false, reason: "NO_REFERRER" };
    }

    const complete = isProfileComplete(filleul);
    if (!complete) {
      return { eligible: false, rewarded: false, reason: "PROFILE_INCOMPLETE" };
    }

    const referrerId = filleul.referredById;

    // Vérifier si le bonus a déjà été versé pour ce filleul spécifique
    const alreadyRewarded = await prisma.transaction.findFirst({
      where: {
        userId: referrerId,
        type: "AFFILIATE_REWARD",
        paymentMethod: { contains: filleul.id },
      },
    });

    if (alreadyRewarded) {
      return { eligible: true, rewarded: false, reason: "ALREADY_REWARDED" };
    }

    // Vérifier le plafond journalier de 15 parrainages par jour (max 11 250 FCFA/mois)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayRewardsCount = await prisma.transaction.count({
      where: {
        userId: referrerId,
        type: "AFFILIATE_REWARD",
        createdAt: { gte: startOfToday },
      },
    });

    if (todayRewardsCount >= 15) {
      return { eligible: true, rewarded: false, reason: "DAILY_LIMIT_REACHED" };
    }

    // Créditer 25 FCFA au parrain
    const bonus = 25;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: referrerId },
        data: { affiliateBalance: { increment: bonus } },
      }),
      prisma.transaction.create({
        data: {
          userId: referrerId,
          amount: bonus,
          currency: "XOF",
          status: "COMPLETED",
          type: "AFFILIATE_REWARD",
          paymentMethod: `Parrainage - Filleul: ${filleul.id} (${filleul.name || filleul.email})`,
        },
      }),
    ]);

    // Notifier le parrain en temps réel
    try {
      const { createNotification } = await import("@/lib/notifications");
      const isRecruiter = filleul.referredBy.role?.name === "RECRUTEUR";
      await createNotification({
        userId: referrerId,
        title: "Prime de parrainage débloquée ! 🎉",
        message: `Votre filleul ${filleul.name || "Nouveau membre"} a complété son profil à 100%. Vous avez reçu 25 FCFA sur votre solde affilié.`,
        type: "SYSTEM_ALERT",
        link: isRecruiter ? "/dashboard/recruteur?tab=affiliation" : "/dashboard/talent?tab=affiliation",
      });
    } catch (notifErr) {
      console.error("[Affiliation] Erreur notification prime débloquée:", notifErr);
    }

    return { eligible: true, rewarded: true, bonus };
  } catch (error) {
    console.error("[Affiliation] Erreur checkAndRewardReferral:", error);
    return { eligible: false, rewarded: false, error };
  }
}
