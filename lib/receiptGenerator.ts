/**
 * Utilitaire de génération et téléchargement de reçus officiels Netacuv
 */

export interface TransactionReceiptData {
  id: string;
  reference?: string;
  date?: string;
  createdAt?: string | Date;
  amount: number | string;
  currency?: string;
  paymentMethod?: string;
  method?: string;
  status: string;
  type?: string;
  service?: string;
  user?: {
    name?: string;
    email?: string;
    role?: { name?: string } | string;
  };
  clientName?: string;
  clientEmail?: string;
}

export function generateReceiptHtml(tx: TransactionReceiptData): string {
  const ref = tx.reference || tx.id.slice(-8).toUpperCase();
  const fullRef = tx.id;
  const rawDate = tx.date || tx.createdAt || new Date();
  const formattedDate = typeof rawDate === "string" && !rawDate.includes("-") 
    ? rawDate 
    : new Date(rawDate).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const currency = tx.currency || "FCFA";
  const amount = typeof tx.amount === "number" ? tx.amount.toLocaleString("fr-FR") : tx.amount;
  const method = tx.paymentMethod || tx.method || "Paiement en ligne";
  const clientName = tx.clientName || tx.user?.name || "Client Netacuv";
  const clientEmail = tx.clientEmail || tx.user?.email || "Non renseigné";
  const roleName = typeof tx.user?.role === "string" ? tx.user.role : tx.user?.role?.name || "Utilisateur";
  const service = tx.service || (tx.type === "SUBSCRIPTION_PREMIUM" || tx.type === "SUBSCRIPTION" ? "Abonnement Netacuv Premium" : "Service Recrutement / Évaluation Netacuv");
  const isSuccess = tx.status === "SUCCESS" || tx.status === "success" || tx.status === "COMPLETE";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Reçu de paiement - Netacuv - ${ref}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 30px;
    }
    .receipt-container {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 25px;
      margin-bottom: 25px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0284c7;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }
    .receipt-badge {
      text-align: right;
    }
    .receipt-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .receipt-ref {
      font-family: monospace;
      font-size: 13px;
      color: #0284c7;
      margin-top: 4px;
      font-weight: 700;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .info-group p {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .info-group h4 {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      word-break: break-all;
    }
    .table-container {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .table-container th {
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 6px;
    }
    .table-container td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #1e293b;
    }
    .amount-row td {
      border-bottom: none;
      padding-top: 20px;
    }
    .total-box {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 15px;
      margin-bottom: 30px;
      padding: 18px 24px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
    }
    .total-label {
      font-size: 14px;
      font-weight: 700;
      color: #0369a1;
      text-transform: uppercase;
    }
    .total-value {
      font-size: 24px;
      font-weight: 800;
      color: #0284c7;
    }
    .status-stamp {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      ${isSuccess 
        ? "background: #dcfce7; color: #15803d; border: 1px solid #86efac;" 
        : "background: #fef3c7; color: #b45309; border: 1px solid #fde68a;"}
    }
    .footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 20px;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.6;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 25px;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-print {
      background: #0284c7;
      color: white;
    }
    .btn-close {
      background: #e2e8f0;
      color: #334155;
    }
    @media print {
      body { background: white; padding: 0; }
      .receipt-container { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .actions { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="logo-area">
        <div>
          <h1 class="brand-title">Netacuv</h1>
          <p class="brand-sub">Plateforme de recrutement & certification IA</p>
        </div>
      </div>
      <div class="receipt-badge">
        <h2 class="receipt-title">Reçu Officiel</h2>
        <p class="receipt-ref">Réf: ${ref}</p>
        <div style="margin-top: 8px;">
          <span class="status-stamp">${isSuccess ? "✓ Paiement Validé" : "En Attente"}</span>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-group">
        <p>Bénéficiaire / Client</p>
        <h4>${clientName}</h4>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${clientEmail}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Rôle: ${roleName}</div>
      </div>
      <div class="info-group">
        <p>Détails du paiement</p>
        <h4>${formattedDate}</h4>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Méthode: ${method}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">ID Transaction: ${fullRef}</div>
      </div>
    </div>

    <table class="table-container">
      <thead>
        <tr>
          <th>Désignation du service</th>
          <th style="text-align: right;">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${service}</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
              Accès illimité aux fonctionnalités avancées Netacuv (Certification IA, Vivier de Talents, Vidéos)
            </div>
          </td>
          <td style="text-align: right; font-weight: 700; font-size: 15px;">
            ${amount} ${currency}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <span class="total-label">Total Payé :</span>
      <span class="total-value">${amount} ${currency}</span>
    </div>

    <div class="footer">
      <p>Ce reçu fait office de preuve de paiement officielle émise par Netacuv.</p>
      <p>Pour toute question relative à cette transaction, veuillez contacter le support : support@netacuv.com</p>
      <p>© ${new Date().getFullYear()} Netacuv. Tous droits réservés.</p>
    </div>

    <div class="actions">
      <button class="btn btn-print" onclick="window.print()">Imprimer / Télécharger en PDF</button>
      <button class="btn btn-close" onclick="window.close()">Fermer</button>
    </div>
  </div>

  <script>
    // Auto-déclenchement de l'impression si ouvert pour téléchargement
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;
}

export function downloadReceipt(tx: TransactionReceiptData) {
  if (typeof window === "undefined") return;

  const html = generateReceiptHtml(tx);

  // Technique moderne par iframe invisible : immunisée contre le blocage de popups
  try {
    const existing = document.getElementById("netacuv-receipt-frame");
    if (existing) existing.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "netacuv-receipt-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          fallbackPrint(html, tx);
        }
      }, 400);
      return;
    }
  } catch (err) {
    console.warn("Iframe receipt error, using fallback:", err);
  }

  fallbackPrint(html, tx);
}

function fallbackPrint(html: string, tx: TransactionReceiptData) {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Si popup bloqué, fallback vers blob download
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Recu_Netacuv_${tx.id.slice(-8).toUpperCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
