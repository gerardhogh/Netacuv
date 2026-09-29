import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    // CinetPay sends webhook data as x-www-form-urlencoded
    const formData = await req.formData();
    const cpm_trans_id = formData.get('cpm_trans_id') as string;
    
    if (!cpm_trans_id) {
      logger.error("CinetPay Webhook: Missing cpm_trans_id");
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    }

    logger.info("CinetPay Webhook Received", { cpm_trans_id });

    // Pilier 08: IDEMPOTENCE Check
    // Prevent processing the same transaction multiple times
    const existingTx = await prisma.transaction.findUnique({
      where: { id: cpm_trans_id }
    });

    if (!existingTx) {
      logger.error("CinetPay Webhook: Transaction non trouvée", { cpm_trans_id });
      // Return 200 OK anyway to stop CinetPay from retrying a non-existent transaction
      return new NextResponse("OK", { status: 200 });
    }

    if (existingTx.status === "SUCCESS") {
      // IDEMPOTENCE: Already processed successfully. We just return 200 OK so CinetPay stops retrying.
      logger.info("CinetPay Webhook Idempotence: Transaction déjà validée", { cpm_trans_id });
      return new NextResponse("OK", { status: 200 });
    }

    // Verify transaction status directly with CinetPay API to prevent spoofing
    const apikey = process.env.CINETPAY_API_KEY;
    const site_id = process.env.CINETPAY_SITE_ID;

    if (!apikey || !site_id) {
      logger.error("CinetPay Webhook: Clés API manquantes pour la vérification");
      return NextResponse.json({ error: "Configuration Serveur Incomplète" }, { status: 500 });
    }

    const verifyPayload = {
      apikey,
      site_id,
      transaction_id: cpm_trans_id
    };

    const verifyResponse = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifyPayload)
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.code === "00") {
      // Payment successful
      // 1. Update Transaction status
      await prisma.transaction.update({
        where: { id: cpm_trans_id },
        data: { status: "SUCCESS" }
      });

      // 2. Grant Premium access to user
      await prisma.user.update({
        where: { id: existingTx.userId },
        data: { isPremium: true }
      });

      logger.info("CinetPay Webhook: Paiement validé avec succès", { cpm_trans_id });
    } else {
      // Payment failed or is still pending
      await prisma.transaction.update({
        where: { id: cpm_trans_id },
        data: { status: "FAILED" }
      });
      logger.warn("CinetPay Webhook: Paiement échoué ou annulé", { cpm_trans_id, reason: verifyData.message });
    }

    // Always return 200 OK to webhook provider to acknowledge receipt
    return new NextResponse("OK", { status: 200 });
    
  } catch (error) {
    logger.error("CinetPay Webhook Error", { error: error instanceof Error ? error.message : String(error) });
    // Returning 200 here might prevent retries, but returning 500 ensures CinetPay will retry if there's a DB crash
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
