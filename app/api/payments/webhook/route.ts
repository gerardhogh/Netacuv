import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFedaPayTransaction } from "@/lib/fedapay";
import { createNotification } from "@/lib/notifications";

/**
 * POST /api/payments/webhook
 * Receives asynchronous webhook callbacks from FedaPay.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Corps de requête vide." }, { status: 400 });
    }

    const eventName = body.name || body.event;
    const entity = body.entity || body.data || body;
    const fedaPayId = entity.id;

    if (!fedaPayId) {
      return NextResponse.json({ error: "ID de transaction FedaPay introuvable." }, { status: 400 });
    }

    // Verify transaction authenticity directly with FedaPay
    const verifiedTx = await getFedaPayTransaction(fedaPayId);
    if (!verifiedTx) {
      return NextResponse.json({ error: "Impossible de vérifier la transaction auprès de FedaPay." }, { status: 404 });
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
      });
    }

    if (!dbTx && userId) {
      dbTx = await prisma.transaction.findFirst({
        where: { userId: String(userId), status: "PENDING" },
        orderBy: { createdAt: "desc" },
        include: { user: { include: { role: true } } },
      });
    }

    if (status === "approved") {
      if (dbTx) {
        await prisma.transaction.update({
          where: { id: dbTx.id },
          data: { status: "SUCCESS" },
        });

        await prisma.user.update({
          where: { id: dbTx.userId },
          data: { isPremium: true },
        });

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
        });
        await prisma.transaction.create({
          data: {
            userId: String(userId),
            amount: verifiedTx.amount,
            currency: "CFA",
            type: "SUBSCRIPTION_PREMIUM",
            status: "SUCCESS",
            paymentMethod: "FEDAPAY_WEBHOOK",
          },
        });
      }
    } else if (status === "declined" || status === "canceled") {
      if (dbTx) {
        await prisma.transaction.update({
          where: { id: dbTx.id },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json({
      received: true,
      fedaPayId,
      status,
    });
  } catch (error) {
    console.error("FedaPay webhook processing error:", error);
    return NextResponse.json({ error: "Erreur interne webhook" }, { status: 500 });
  }
}
