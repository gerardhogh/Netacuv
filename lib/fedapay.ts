/**
 * FedaPay Service Integration for Netacuv
 * Handles transaction creation, status retrieval, and checkout token generation.
 */

export interface FedaPayCustomer {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone_number?: {
    number: string;
    country?: string;
  };
}

export interface CreateFedaPayTransactionParams {
  amount: number;
  description: string;
  callbackUrl: string;
  customer?: FedaPayCustomer;
  customMetadata?: Record<string, string | number | boolean>;
}

export interface FedaPayTransactionResponse {
  id: number;
  reference: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "declined" | "canceled" | "refunded" | string;
  paymentUrl: string;
  paymentToken?: string;
  customer?: any;
  customMetadata?: Record<string, any> | null;
  createdAt?: string;
}

/**
 * Get the FedaPay API base URL based on environment
 */
export function getFedaPayBaseUrl(): string {
  const env = process.env.FEDAPAY_ENVIRONMENT?.toLowerCase();
  const secretKey = process.env.FEDAPAY_SECRET_KEY || "";

  if (env === "sandbox" || secretKey.startsWith("sk_sandbox_")) {
    return "https://sandbox-api.fedapay.com/v1";
  }
  return "https://api.fedapay.com/v1";
}

/**
 * Get the Secret Key
 */
export function getFedaPaySecretKey(): string {
  const key = process.env.FEDAPAY_SECRET_KEY;
  if (!key) {
    throw new Error("FEDAPAY_SECRET_KEY n'est pas configuré dans les variables d'environnement.");
  }
  return key;
}

/**
 * Get the Public Key
 */
export function getFedaPayPublicKey(): string {
  return (
    process.env.FEDAPAY_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY ||
    ""
  );
}

/**
 * Formats a phone number for FedaPay customer payload
 */
export function formatFedaPayPhone(rawPhone: string, defaultCountry = "bj"): { number: string; country: string } {
  const cleaned = rawPhone.replace(/\s+/g, "").replace(/-/g, "");

  if (cleaned.startsWith("+229") || cleaned.startsWith("00229")) {
    return { number: cleaned.replace(/^(\+229|00229)/, ""), country: "bj" };
  }
  if (cleaned.startsWith("+225") || cleaned.startsWith("00225")) {
    return { number: cleaned.replace(/^(\+225|00225)/, ""), country: "ci" };
  }
  if (cleaned.startsWith("+221") || cleaned.startsWith("00221")) {
    return { number: cleaned.replace(/^(\+221|00221)/, ""), country: "sn" };
  }
  if (cleaned.startsWith("+228") || cleaned.startsWith("00228")) {
    return { number: cleaned.replace(/^(\+228|00228)/, ""), country: "tg" };
  }

  return { number: cleaned, country: defaultCountry };
}

/**
 * Create a new payment transaction with FedaPay
 */
export async function createFedaPayTransaction(
  params: CreateFedaPayTransactionParams
): Promise<FedaPayTransactionResponse> {
  const baseUrl = getFedaPayBaseUrl();
  const secretKey = getFedaPaySecretKey();

  const payload: Record<string, any> = {
    description: params.description,
    amount: Math.round(params.amount),
    currency: { iso: "XOF" },
    callback_url: params.callbackUrl,
  };

  if (params.customer) {
    payload.customer = params.customer;
  }

  if (params.customMetadata) {
    payload.custom_metadata = params.customMetadata;
  }

  const response = await fetch(`${baseUrl}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    console.error("FedaPay transaction creation failed:", response.status, data);
    const errorMessage =
      data?.message ||
      data?.errors?.[0] ||
      `Erreur FedaPay (${response.status}): Impossible de créer la transaction.`;
    throw new Error(errorMessage);
  }

  const tx = data["v1/transaction"] || data.transaction || data;

  let paymentUrl = tx.payment_url;
  let paymentToken = tx.payment_token;

  // If payment_url is not returned in create, request a token
  if (!paymentUrl && tx.id) {
    const tokenRes = await fetch(`${baseUrl}/transactions/${tx.id}/token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json().catch(() => null);
      if (tokenData?.url) {
        paymentUrl = tokenData.url;
        paymentToken = tokenData.token;
      }
    }
  }

  return {
    id: tx.id,
    reference: tx.reference,
    amount: tx.amount,
    description: tx.description,
    status: tx.status,
    paymentUrl: paymentUrl || `https://process.fedapay.com/${paymentToken || ""}`,
    paymentToken: paymentToken || undefined,
    customer: tx.customer,
    customMetadata: tx.custom_metadata,
    createdAt: tx.created_at,
  };
}

/**
 * Retrieve transaction details by FedaPay ID
 */
export async function getFedaPayTransaction(id: number | string): Promise<FedaPayTransactionResponse | null> {
  const baseUrl = getFedaPayBaseUrl();
  const secretKey = getFedaPaySecretKey();

  const response = await fetch(`${baseUrl}/transactions/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`FedaPay getTransaction error (${response.status}) for id ${id}`);
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!data) return null;

  const tx = data["v1/transaction"] || data.transaction || data;

  return {
    id: tx.id,
    reference: tx.reference,
    amount: tx.amount,
    description: tx.description,
    status: tx.status,
    paymentUrl: tx.payment_url,
    paymentToken: tx.payment_token,
    customer: tx.customer,
    customMetadata: tx.custom_metadata,
    createdAt: tx.created_at,
  };
}
