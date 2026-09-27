"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// ─── Supported locales ────────────────────────────────────────────────────────
export type Locale = "fr" | "en" | "es" | "zh";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const COOKIE_NAME = "netacuv_locale";
const DEFAULT_LOCALE: Locale = "fr";

// ─── Dictionary type (mirrors JSON structure) ─────────────────────────────────
export type Dictionary = {
  common: Record<string, string>;
  nav: Record<string, string>;
  settings: Record<string, string>;
  profile: Record<string, string>;
  jobs: Record<string, string>;
  modals: {
    logout: Record<string, string>;
    deleteJob: Record<string, string>;
    closeJob: Record<string, string>;
    jobPublished: Record<string, string>;
    deactivate: Record<string, string>;
  };
};

// ─── Dynamic dictionary loader ────────────────────────────────────────────────
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("../../lib/i18n/fr.json").then((m) => m.default as Dictionary),
  en: () => import("../../lib/i18n/en.json").then((m) => m.default as Dictionary),
  es: () => import("../../lib/i18n/es.json").then((m) => m.default as Dictionary),
  zh: () => import("../../lib/i18n/zh.json").then((m) => m.default as Dictionary),
};

// ─── Cookie helpers ───────────────────────────────────────────────────────────
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function isValidLocale(l: string): l is Locale {
  return ["fr", "en", "es", "zh"].includes(l);
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface LangContextValue {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (section: keyof Omit<Dictionary, "modals">, key: string) => string;
}

// Minimal French fallback so the context is never undefined
import frFallback from "../../lib/i18n/fr.json";
const FALLBACK = frFallback as Dictionary;

const LangContext = createContext<LangContextValue>({
  locale: DEFAULT_LOCALE,
  dict: FALLBACK,
  setLocale: () => {},
  t: (section, key) => (FALLBACK[section] as Record<string, string>)[key] ?? key,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [dict, setDict] = useState<Dictionary>(FALLBACK);

  // Restore locale from cookie on mount (client-side only)
  useEffect(() => {
    // Clean up any legacy googtrans cookies left by the old Google Translate integration
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/`;

    const saved = getCookie(COOKIE_NAME);
    const initial = saved && isValidLocale(saved) ? saved : DEFAULT_LOCALE;
    if (initial !== locale) {
      setLocaleState(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load dictionary and sync <html lang> whenever locale changes
  useEffect(() => {
    let cancelled = false;
    loaders[locale]().then((d) => {
      if (!cancelled) setDict(d);
    });
    // Keep <html lang> in sync for accessibility & SEO
    document.documentElement.lang = locale;
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // Instant locale switch — no page reload, pure React state update
  const setLocale = useCallback((newLocale: Locale) => {
    setCookie(COOKIE_NAME, newLocale);
    setLocaleState(newLocale);
  }, []);

  // Convenience translator for flat sections
  const t = useCallback(
    (section: keyof Omit<Dictionary, "modals">, key: string): string => {
      return (dict[section] as Record<string, string>)[key] ?? key;
    },
    [dict]
  );

  return (
    <LangContext.Provider value={{ locale, dict, setLocale, t }}>
      {children}
    </LangContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLang() {
  return useContext(LangContext);
}
