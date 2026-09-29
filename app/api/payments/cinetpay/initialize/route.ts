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

    // 3. Initialize CinetPay payment
    const cinetpayUrl = "https://api-checkout.cinetpay.com/v2/payment";
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    if (!apiKey || !siteId) {
      logger.error("Clés CinetPay manquantes dans les variables d'environnement");
      return NextResponse.json({ error: "Erreur de configuration serveur (Clés manquantes)" }, { status: 500 });
    }

    // Get user details
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      select: { name: true, email: true, talentProfile: true } 
    });

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/talent#premium`;
    const notifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/cinetpay/webhook`;

    const cinetpayPayload = {
      apikey: apiKey,
      site_id: siteId,
      transaction_id: transactionId,
      amount,
      currency,
      description,
      return_url: returnUrl,
      notify_url: notifyUrl,
      customer_name: user?.name || "Candidat",
      customer_surname: "Netacuv",
      customer_email: user?.email || "contact@netacuv.com",
      customer_phone_number: user?.talentProfile?.phone?.replace(/\D/g, '') || "00000000",
      customer_address: user?.talentProfile?.city || "Cotonou",
      customer_city: user?.talentProfile?.city || "Cotonou",
      customer_country: "BJ",
      customer_state: "BJ",
      customer_zip_code: "0000",
      channels: "ALL" // Mobile Money + Cards
    };

    const response = await fetch(cinetpayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cinetpayPayload)
    });

    const data = await response.json();

    if (data.code === "201") {
      // Success - URL returned
      return NextResponse.json({ 
        success: true, 
        payment_url: data.data.payment_url, 
        transaction_id: transactionId 
      });
    } else {
      logger.error("Erreur CinetPay Init", { data });
      return NextResponse.json({ error: "Impossible d'initialiser le paiement avec CinetPay", details: data }, { status: 400 });
    }

  } catch (error) {
    logger.error("Payment init error", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
