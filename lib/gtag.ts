export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-N717VTE1Y7";

// Déclaration TypeScript pour window.gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Enregistrement d'une vue de page (pageview)
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Enregistrement d'un événement personnalisé (conversion, clic bouton, inscription, etc.)
export const event = (
  action: string,
  params?: Record<string, string | number | boolean | null | undefined>
) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
};
