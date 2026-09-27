import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Simulation de la transaction avec mise à jour du statut
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true },
    });

    // Enregistrez un log d'audit ou de transaction si nécessaire
    try {
      if (prisma.transaction) {
        await prisma.transaction.create({
          data: {
            userId,
            amount: 99.99, // Montant fictif
            type: "SUBSCRIPTION_PREMIUM",
            status: "SUCCESS",
            paymentMethod: "SIMULATION"
          }
        });
      }
    } catch (err) {
      console.warn("Transaction log failed, continuing anyway", err);
    }

    return NextResponse.json(
      { message: "Félicitations ! Votre abonnement Premium est désormais actif.", isPremium: updatedUser.isPremium },
      { status: 200 }
    );
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { message: "Une erreur s'est produite lors de la simulation du paiement." },
      { status: 500 }
    );
  }
}
