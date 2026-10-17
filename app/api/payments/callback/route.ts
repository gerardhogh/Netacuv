import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFedaPayTransaction } from "@/lib/fedapay";
import { createNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fedaPayId = searchParams.get("id");
    const dbId = searchParams.get("db_id");
    const rawStatus = searchParams.get("status");

    let isApproved = rawStatus === "approved";
    let dbTx: any = null;

    if (dbId) {
      dbTx = await prisma.transaction.findUnique({
        where: { id: dbId },
        include: { user: { include: { role: true } } },
      });
    }

    // Verify directly with FedaPay API for security
    if (fedaPayId) {
      const fedaPayTx = await getFedaPayTransaction(fedaPayId);
      if (fedaPayTx) {
        isApproved = fedaPayTx.status === "approved";
        
        // If dbTx not found by dbId, check custom_metadata from FedaPay
        if (!dbTx && fedaPayTx.customMetadata?.dbTransactionId) {
          dbTx = await prisma.transaction.findUnique({
            where: { id: String(fedaPayTx.customMetadata.dbTransactionId) },
            include: { user: { include: { role: true } } },
          });
        }
      }
    }

    const isRecruiter = dbTx?.user?.role?.name === "RECRUTEUR";
    const redirectBase = isRecruiter ? "/dashboard/recruteur" : "/dashboard/talent";

    if (isApproved && dbTx) {
      // Update transaction status
      await prisma.transaction.update({
        where: { id: dbTx.id },
        data: { status: "SUCCESS" },
      });

      // Upgrade user to premium
      await prisma.user.update({
        where: { id: dbTx.userId },
        data: { isPremium: true },
      });

      // Send in-app notification
      try {
        await createNotification({
          userId: dbTx.userId,
          title: "Abonnement Premium activé !",
          message: "Félicitations, votre paiement a été validé. Vous bénéficiez désormais de tous les avantages Premium.",
          type: "SYSTEM_ALERT",
          link: redirectBase,
        });
      } catch (notifErr) {
        console.error("Erreur envoi notification premium:", notifErr);
      }

      return NextResponse.redirect(new URL(`${redirectBase}?premium=success`, request.url));
    }

    if (dbTx && (rawStatus === "canceled" || rawStatus === "declined")) {
      await prisma.transaction.update({
        where: { id: dbTx.id },
        data: { status: "FAILED" },
      });
      return NextResponse.redirect(new URL(`${redirectBase}?premium=canceled`, request.url));
    }

    // Default fallback
    return NextResponse.redirect(new URL(`${redirectBase}?premium=pending`, request.url));
  } catch (error) {
    console.error("Erreur callback paiement FedaPay:", error);
    return NextResponse.redirect(new URL("/dashboard?premium=error", request.url));
  }
}
