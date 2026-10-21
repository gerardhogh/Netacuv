import { prisma } from "@/lib/prisma";

export interface PremiumInfo {
  isPremium: boolean;
  planName: string;
  premiumStartedAt: string | null;
  premiumExpiresAt: string | null;
  daysRemaining: number;
  isExpired: boolean;
  amount?: number;
  paymentMethod?: string;
  totalCycleDays: number;
}

/**
 * Calcule avec précision le statut et la validité de l'offre Premium d'un utilisateur.
 * Netacuv applique une validité mensuelle de 30 jours par souscription.
 * Si l'utilisateur a renouvelé son offre avant la fin, la période restante est cumulée.
 */
export async function getUserPremiumStatus(userId: string): Promise<PremiumInfo> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isPremium: true,
        updatedAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      return {
        isPremium: false,
        planName: "Gratuit",
        premiumStartedAt: null,
        premiumExpiresAt: null,
        daysRemaining: 0,
        isExpired: false,
        totalCycleDays: 30,
      };
    }

    const isRecruiter = user.role?.name === "RECRUTEUR";
    const defaultPlanName = isRecruiter
      ? "Abonnement Recruteur Premium"
      : "Abonnement Talent Premium";

    // Si l'utilisateur n'est pas marqué premium
    if (!user.isPremium) {
      return {
        isPremium: false,
        planName: "Gratuit",
        premiumStartedAt: null,
        premiumExpiresAt: null,
        daysRemaining: 0,
        isExpired: false,
        totalCycleDays: 30,
      };
    }

    // Récupérer les transactions réussies d'abonnement
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        status: "SUCCESS",
        type: { in: ["SUBSCRIPTION_PREMIUM", "SUBSCRIPTION", "PREMIUM"] },
      },
      orderBy: { createdAt: "asc" },
    });

    const CYCLE_DAYS = 30;
    const CYCLE_MS = CYCLE_DAYS * 24 * 60 * 60 * 1000;
    const now = new Date();

    let computedExpiry: Date | null = null;
    let computedStart: Date | null = null;
    let latestAmount = isRecruiter ? 1000 : 700;
    let latestPaymentMethod = "FedaPay";

    if (transactions.length > 0) {
      for (const tx of transactions) {
        latestAmount = tx.amount || latestAmount;
        latestPaymentMethod = tx.paymentMethod || latestPaymentMethod;

        if (!computedExpiry || tx.createdAt > computedExpiry) {
          // Nouveau cycle démarré
          computedStart = tx.createdAt;
          computedExpiry = new Date(tx.createdAt.getTime() + CYCLE_MS);
        } else {
          // Renouvellement avant expiration : on cumule 30 jours supplémentaires
          computedExpiry = new Date(computedExpiry.getTime() + CYCLE_MS);
        }
      }
    } else {
      // Fallback si l'utilisateur a isPremium: true sans transaction enregistrée
      computedStart = user.updatedAt;
      computedExpiry = new Date(user.updatedAt.getTime() + CYCLE_MS);
    }

    const diffMs = computedExpiry ? computedExpiry.getTime() - now.getTime() : 0;
    const isExpired = diffMs <= 0;
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (isExpired) {
      // Désactiver le statut premium si expiré pour synchroniser la base
      await prisma.user
        .update({
          where: { id: user.id },
          data: { isPremium: false },
        })
        .catch((err) => {
          console.error("Erreur mise à jour expiration premium:", err);
        });

      return {
        isPremium: false,
        planName: "Gratuit (Expiré)",
        premiumStartedAt: computedStart ? computedStart.toISOString() : null,
        premiumExpiresAt: computedExpiry ? computedExpiry.toISOString() : null,
        daysRemaining: 0,
        isExpired: true,
        totalCycleDays: CYCLE_DAYS,
      };
    }

    return {
      isPremium: true,
      planName: defaultPlanName,
      premiumStartedAt: computedStart ? computedStart.toISOString() : null,
      premiumExpiresAt: computedExpiry ? computedExpiry.toISOString() : null,
      daysRemaining,
      isExpired: false,
      amount: latestAmount,
      paymentMethod: latestPaymentMethod,
      totalCycleDays: CYCLE_DAYS,
    };
  } catch (error) {
    console.error("Erreur dans getUserPremiumStatus:", error);
    return {
      isPremium: false,
      planName: "Gratuit",
      premiumStartedAt: null,
      premiumExpiresAt: null,
      daysRemaining: 0,
      isExpired: false,
      totalCycleDays: 30,
    };
  }
}
