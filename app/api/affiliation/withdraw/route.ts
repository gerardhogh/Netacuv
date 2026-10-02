import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    const body = await request.json();
    const { montant, operateur, numero } = body;

    if (!montant || !operateur || !numero) {
      return NextResponse.json(
        { error: "Paramètres manquants: montant, operateur, numero." },
        { status: 400 }
      );
    }

    if (montant < 500) {
      return NextResponse.json(
        { error: "Le montant minimum de retrait est de 500 FCFA." },
        { status: 422 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.affiliateBalance < montant) {
      return NextResponse.json({ error: "Solde insuffisant." }, { status: 422 });
    }

    // Atomic transaction
    const [updatedUser, withdrawal] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { affiliateBalance: { decrement: montant } },
      }),
      prisma.transaction.create({
        data: { 
          userId, 
          amount: montant, 
          paymentMethod: `${operateur} - ${numero}`, 
          status: "PENDING",
          type: "WITHDRAWAL" 
        },
      })
    ]);

    return NextResponse.json({
      success: true,
      withdrawalId: withdrawal.id,
      message: `Demande de retrait de ${montant} FCFA enregistrée.`,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    const withdrawals = await prisma.transaction.findMany({
      where: { userId, type: "WITHDRAWAL" },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
