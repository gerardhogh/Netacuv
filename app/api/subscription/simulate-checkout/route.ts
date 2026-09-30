import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Vérifier si l'utilisateur est déjà Premium (idempotent)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, role: true },
    });

    if (currentUser?.isPremium) {
      return NextResponse.json(
        { message: "Vous êtes déjà Premium !", isPremium: true },
        { status: 200 }
      );
    }

    // Déterminer le montant en fonction du rôle
    const roleName = currentUser?.role?.name;
    const amount = roleName === "RECRUTEUR" ? 1000 : 700;

    // AS-05: Transaction atomique — mise à jour User + création Transaction
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isPremium: true },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount,
          currency: "XOF",
          type: "SUBSCRIPTION",
          status: "SUCCESS",
          paymentMethod: "SIMULATION",
        },
      }),
    ]);

    logger.info("Premium subscription simulated", { userId, amount, role: roleName });

    return NextResponse.json(
      {
        message: "Félicitations ! Votre abonnement Premium est désormais actif.",
        isPremium: updatedUser.isPremium,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Simulation error", {
      error: error instanceof Error ? error.message : "Unknown",
      context: "api/subscription/simulate-checkout",
    });
    return NextResponse.json(
      { message: "Une erreur s'est produite lors de la simulation du paiement." },
      { status: 500 }
    );
  }
}
