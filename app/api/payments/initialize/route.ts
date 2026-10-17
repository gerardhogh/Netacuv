import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createFedaPayTransaction, formatFedaPayPhone } from "@/lib/fedapay";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => ({}));
    const { method = "fedapay", phone = "" } = body;

    const sessionUserId = session?.user?.id;
    const targetUserId = body.userId || sessionUserId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Utilisateur non identifié. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    const isRecruiter = user.role?.name === "RECRUTEUR";
    const amount = body.amount ? Number(body.amount) : isRecruiter ? 1000 : 700;
    const planName = isRecruiter ? "Abonnement Recruteur Premium" : "Abonnement Talent Premium";

    // Create pending transaction in Prisma database
    const dbTx = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        currency: "CFA",
        type: "SUBSCRIPTION_PREMIUM",
        status: "PENDING",
        paymentMethod: method ? `FEDAPAY_${method.toUpperCase()}` : "FEDAPAY",
      },
    });

    // App base URL for callback
    const reqOrigin = request.headers.get("origin") || request.nextUrl.origin;
    const appUrl = process.env.NEXTAUTH_URL || reqOrigin || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/payments/callback?db_id=${dbTx.id}`;

    // Prepare customer information
    const fullName = user.name || "Client Netacuv";
    const nameParts = fullName.trim().split(" ");
    const firstname = nameParts[0] || "Client";
    const lastname = nameParts.slice(1).join(" ") || "Netacuv";

    const customerPayload: any = {
      firstname,
      lastname,
      email: user.email,
    };

    if (phone && phone.trim().length >= 8) {
      customerPayload.phone_number = formatFedaPayPhone(phone.trim());
    }

    // Call FedaPay to create transaction
    const fedaPayTx = await createFedaPayTransaction({
      amount,
      description: `${planName} - Netacuv`,
      callbackUrl,
      customer: customerPayload,
      customMetadata: {
        userId: user.id,
        dbTransactionId: dbTx.id,
        role: user.role?.name || "TALENT",
      },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: fedaPayTx.paymentUrl,
      paymentToken: fedaPayTx.paymentToken,
      fedaPayId: fedaPayTx.id,
      reference: fedaPayTx.reference,
      dbTransactionId: dbTx.id,
      message: "Transaction FedaPay initialisée avec succès.",
    });
  } catch (error: any) {
    console.error("Erreur initialisation paiement FedaPay:", error);
    return NextResponse.json(
      {
        error: error.message || "Erreur lors de l'initialisation du paiement avec FedaPay.",
      },
      { status: 500 }
    );
  }
}

// GET: Polling status endpoint
export async function GET(request: NextRequest) {
  try {
    const dbId = request.nextUrl.searchParams.get("db_id");
    const userId = request.nextUrl.searchParams.get("user_id");

    if (dbId) {
      const tx = await prisma.transaction.findUnique({
        where: { id: dbId },
      });
      if (!tx) {
        return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });
      }
      return NextResponse.json({ status: tx.status, transaction: tx });
    }

    if (userId) {
      const lastTx = await prisma.transaction.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ transaction: lastTx, status: lastTx?.status || "NONE" });
    }

    return NextResponse.json({ error: "Paramètre manquant (db_id ou user_id)" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
