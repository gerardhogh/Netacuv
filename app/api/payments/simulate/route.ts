import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true },
      include: { role: true },
    });

    const roleName = updatedUser.role?.name;
    const amount = roleName === "RECRUTEUR" ? 1000 : 700;

    if (prisma.transaction) {
      await prisma.transaction.create({
        data: {
          userId,
          amount,
          currency: "CFA",
          type: "SUBSCRIPTION_PREMIUM",
          status: "SUCCESS",
          paymentMethod: "SIMULATION"
        }
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Erreur simulation paiement:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'activation du premium" },
      { status: 500 }
    );
  }
}
