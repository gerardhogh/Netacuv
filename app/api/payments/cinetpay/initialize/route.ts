import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { amount = 700, currency = "XOF", description = "Abonnement Talent Premium Netacuv" } = body;

    // 1. Generate unique transaction ID
    const transactionId = `NTCV-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    // 2. Create PENDING transaction in DB
    await prisma.transaction.create({
      data: {
        id: transactionId,
        amount: Number(amount),
        currency,
        status: "PENDING",
        type: "SUBSCRIPTION",
        paymentMethod: "CinetPay",
        userId: session.user.id,
      }
    });

    // TEMPORARY: Bypass CinetPay and grant premium directly
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      select: { name: true, email: true, talentProfile: true, recruiterProfile: true, role: true } 
    });

    const isRecruteur = user?.role?.name === "RECRUTEUR";
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/${isRecruteur ? 'recruteur?tab=premium&payment=success' : 'talent?payment=success#premium'}`;

    // Update the User directly since isPremium is on the User model
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isPremium: true }
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "SUCCESS" }
    });

    return NextResponse.json({ 
      success: true, 
      payment_url: returnUrl, 
      transaction_id: transactionId 
    });
  } catch (error) {
    logger.error("Payment init error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
