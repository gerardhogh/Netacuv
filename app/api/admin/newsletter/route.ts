import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Vérification des droits administrateur
    const role = (session?.user as any)?.role?.toUpperCase() || "";
    if (!role.includes("ADMIN")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 1. Récupération prioritaire depuis la base de données PostgreSQL
    const dbSubscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 2. Synchronisation douce : si Resend contient d'anciens contacts non encore en DB
    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (apiKey && audienceId) {
      try {
        const resend = new Resend(apiKey);
        const { data: resendData } = await resend.contacts.list({ audienceId });
        const resendContacts = resendData?.data || [];

        const existingEmails = new Set(dbSubscribers.map((s) => s.email.toLowerCase()));

        // Insérer les contacts Resend manquants en base de données
        const missingContacts = resendContacts.filter(
          (c: any) => c.email && !existingEmails.has(c.email.toLowerCase())
        );

        if (missingContacts.length > 0) {
          for (const contact of missingContacts) {
            try {
              const created = await prisma.newsletterSubscriber.create({
                data: {
                  email: contact.email.toLowerCase().trim(),
                  source: "RESEND_SYNC",
                  status: contact.unsubscribed ? "UNSUBSCRIBED" : "ACTIVE",
                },
              });
              dbSubscribers.push(created);
            } catch {
              // Ignore duplicate race conditions
            }
          }
        }
      } catch (syncErr) {
        console.warn("[Admin Newsletter] Info sync Resend vers DB:", syncErr);
      }
    }

    const activeCount = dbSubscribers.filter((s) => s.status === "ACTIVE").length;
    const unsubscribedCount = dbSubscribers.filter((s) => s.status === "UNSUBSCRIBED").length;

    return NextResponse.json({
      subscribers: dbSubscribers.map((s) => ({
        id: s.id,
        email: s.email,
        status: s.status,
        source: s.source || "FOOTER",
        created_at: s.createdAt.toISOString(),
        unsubscribed: s.status === "UNSUBSCRIBED",
      })),
      count: dbSubscribers.length,
      activeCount,
      unsubscribedCount,
    });
  } catch (error: any) {
    console.error("[Admin Newsletter] Erreur serveur GET:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";
    if (!role.includes("ADMIN")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Configuration RESEND_API_KEY manquante." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { subject, message, testEmailOnly } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "L'objet et le contenu du message sont obligatoires." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    const fromSender = process.env.RESEND_FROM_EMAIL || "Netacuv <contact@netacuv.com>";
    const siteUrl = process.env.NEXTAUTH_URL || "https://netacuv.com";

    // Récupération des destinataires depuis la base de données
    let targetEmails: string[] = [];

    if (testEmailOnly) {
      targetEmails = [testEmailOnly.trim().toLowerCase()];
    } else {
      const activeDbSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: "ACTIVE" },
        select: { email: true },
      });

      targetEmails = activeDbSubscribers.map((s) => s.email.toLowerCase());

      if (targetEmails.length === 0) {
        return NextResponse.json(
          { error: "Aucun abonné actif en base de données pour l'envoi." },
          { status: 400 }
        );
      }
    }

    // Template HTML moderne Netacuv pour la newsletter
    const generateHtml = (recipientEmail: string) => {
      const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

      return `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
              .header { background: linear-gradient(135deg, #1e8ae9 0%, #32A8D7 100%); padding: 32px 24px; text-align: center; }
              .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
              .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #334155; }
              .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
              .footer a { color: #1e8ae9; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Netacuv</h1>
                <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 14px;">La plateforme intelligente de recrutement</p>
              </div>
              <div class="content">
                ${message.replace(/\n/g, "<br />")}
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Netacuv. Tous droits réservés.</p>
                <p>Vous recevez cet e-mail car vous êtes abonné(e) à la newsletter Netacuv.</p>
                <p><a href="${unsubscribeUrl}">Se désabonner en 1 clic</a></p>
              </div>
            </div>
          </body>
        </html>
      `;
    };

    let sentCount = 0;
    const errors: string[] = [];

    // Envoi aux destinataires
    for (const recipient of targetEmails) {
      try {
        const { error: sendError } = await resend.emails.send({
          from: fromSender,
          to: recipient,
          subject,
          html: generateHtml(recipient),
        });

        if (sendError) {
          errors.push(`${recipient}: ${sendError.message}`);
        } else {
          sentCount++;
        }
      } catch (err: any) {
        errors.push(`${recipient}: ${err.message}`);
      }
    }

    if (sentCount === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: `Échec de l'envoi : ${errors[0]}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter envoyée avec succès à ${sentCount} destinataire(s) !`,
      sentCount,
      errorsCount: errors.length,
    });
  } catch (error: any) {
    console.error("[Admin Newsletter] Erreur serveur POST:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur interne lors de l'envoi." },
      { status: 500 }
    );
  }
}

// DELETE: Permet à l'administrateur de supprimer ou désabonner un contact
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";
    if (!role.includes("ADMIN")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Abonné introuvable." }, { status: 404 });
    }

    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Abonné supprimé avec succès.",
    });
  } catch (error: any) {
    console.error("[Admin Newsletter] Erreur suppression:", error);
    return NextResponse.json(
      { error: "Impossible de supprimer l'abonné." },
      { status: 500 }
    );
  }
}
