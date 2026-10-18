import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFedaPayTransaction } from "@/lib/fedapay";
import { createNotification } from "@/lib/notifications";

/**
 * GET /api/payments/webhook
 * Healthcheck endpoint for FedaPay webhook verification
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Point de terminaison Webhook FedaPay Netacuv opérationnel.",
  });
}

/**
 * OPTIONS /api/payments/webhook
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
    },
  });
}

/**
 * POST /api/payments/webhook
 * Receives asynchronous webhook callbacks from FedaPay.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    // If empty payload or ping/verification event from FedaPay, respond 200 OK
    if (!body) {
      return NextResponse.json(
        { received: true, message: "Ping FedaPay reçu avec succès." },
        { status: 200 }
      );
    }

    const eventName = body.name || body.event || "";
    const entity = body.entity || body.data || body;
    const fedaPayId = entity.id;

    // FedaPay test events or events without transaction ID
    if (!fedaPayId) {
      return NextResponse.json(
        {
          received: true,
          event: eventName,
          message: "Événement FedaPay reçu sans transaction à traiter.",
        },
        { status: 200 }
      );
    }

    // Verify transaction authenticity directly with FedaPay API
    const verifiedTx = await getFedaPayTransaction(fedaPayId).catch(() => null);
    
    // SECURITY: Reject webhooks that cannot be authenticated via the official FedaPay API
    if (!verifiedTx) {
      console.warn(`[FEDAPAY_WEBHOOK_WARNING] Tentative de webhook non vérifiable avec FedaPay (ID: ${fedaPayId})`);
      return NextResponse.json(
        { received: true, verified: false, message: "Transaction non authentifiée auprès de FedaPay." },
        { status: 200 }
      );
    }

    const status = verifiedTx.status;
    const customMetadata = verifiedTx.customMetadata || entity.custom_metadata || {};
    const dbTransactionId = customMetadata.dbTransactionId;
    const userId = customMetadata.userId;

    // Locate the database transaction
    let dbTx = null;
    if (dbTransactionId) {
      dbTx = await prisma.transaction.findUnique({
        where: { id: String(dbTransactionId) },
        include: { user: { include: { role: true } } },
      }).catch(() => null);
    }

    if (!dbTx && userId) {
      dbTx = await prisma.transaction.findFirst({
        where: { userId: String(userId), status: "PENDING" },
        orderBy: { createdAt: "desc" },
        include: { user: { include: { role: true } } },
      }).catch(() => null);
    }

    if (status === "approved") {
      if (dbTx) {
        await prisma.transaction.update({
          where: { id: dbTx.id },
          data: { status: "SUCCESS" },
        }).catch(() => null);

        await prisma.user.update({
          where: { id: dbTx.userId },
          data: { isPremium: true },
        }).catch(() => null);

        try {
          const isRecruiter = dbTx.user?.role?.name === "RECRUTEUR";
          await createNotification({
            userId: dbTx.userId,
            title: "Paiement Premium confirmé !",
            message: "Votre paiement a été traité avec succès. Votre compte bénéficie maintenant du statut Premium.",
            type: "SYSTEM_ALERT",
            link: isRecruiter ? "/dashboard/recruteur" : "/dashboard/talent",
          });
        } catch (e) {
          console.error("Erreur notification webhook:", e);
        }
      } else if (userId) {
        // Fallback if transaction record was somehow missing
        await prisma.user.update({
          where: { id: String(userId) },
          data: { isPremium: true },
        }).catch(() => null);

        await prisma.transaction.create({
          data: {
            userId: String(userId),
            amount: verifiedTx?.amount || entity.amount || 700,
            currency: "CFA",
            type: "SUBSCRIPTION_PREMIUM",
            status: "SUCCESS",
            paymentMethod: "FEDAPAY_WEBHOOK",
          },
        }).catch(() => null);
      }
    } else if (status === "declined" || status === "canceled") {
      if (dbTx) {
        await prisma.transaction.update({
          where: { id: dbTx.id },
          data: { status: "FAILED" },
        }).catch(() => null);
      }
    }

    // Always respond 200 OK to FedaPay so it marks the webhook as successfully delivered
    return NextResponse.json(
      {
        received: true,
        fedaPayId,
        status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("FedaPay webhook processing error:", error);
    // Still return 200 OK so FedaPay doesn't retry infinitely or flag the webhook as broken
    return NextResponse.json(
      { received: true, error: "Traitement partiel" },
      { status: 200 }
    );
  }
}
