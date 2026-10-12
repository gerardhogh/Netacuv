import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Vérification des droits administrateur
    const role = (session?.user as any)?.role?.toUpperCase() || "";
    if (!role.includes("ADMIN")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!apiKey || !audienceId) {
      return NextResponse.json(
        { error: "Configuration Resend manquante dans l'environnement" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.contacts.list({ audienceId });

    if (error) {
      console.error("[Admin Newsletter] Erreur récupération contacts:", error);
      return NextResponse.json(
        { error: "Impossible de récupérer les abonnés depuis Resend." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscribers: data?.data || [],
      count: data?.data?.length || 0,
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
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!apiKey || !audienceId) {
      return NextResponse.json(
        { error: "Configuration Resend manquante." },
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
    const fromSender = process.env.RESEND_FROM_EMAIL || "Netacuv <onboarding@resend.dev>";

    // Récupération des abonnés de l'audience
    let targetEmails: string[] = [];

    if (testEmailOnly) {
      targetEmails = [testEmailOnly.trim()];
    } else {
      const { data: contactsData, error: contactsError } = await resend.contacts.list({
        audienceId,
      });

      if (contactsError) {
        return NextResponse.json(
          { error: "Impossible de récupérer la liste des destinataires." },
          { status: 500 }
        );
      }

      targetEmails = (contactsData?.data || [])
        .filter((c: any) => !c.unsubscribed)
        .map((c: any) => c.email);

      if (targetEmails.length === 0) {
        return NextResponse.json(
          { error: "Aucun abonné actif dans l'audience pour l'envoi." },
          { status: 400 }
        );
      }
    }

    // Template HTML moderne Netacuv pour la newsletter
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #0076a8 0%, #1699d2 100%); padding: 32px 24px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #334155; }
            .content p { margin-bottom: 16px; }
            .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .footer a { color: #1699d2; text-decoration: none; }
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
              <p>Vous recevez cet e-mail car vous êtes inscrit(e) à notre newsletter.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoi par lot ou individuel via Resend
    let sentCount = 0;
    const errors: string[] = [];

    // Envoi par paquets de 50 pour respecter les quotas
    for (const recipient of targetEmails) {
      try {
        const { error: sendError } = await resend.emails.send({
          from: fromSender,
          to: recipient,
          subject,
          html: htmlTemplate,
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
