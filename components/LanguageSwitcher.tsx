"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { useLocale } from "next-intl";

export type Locale = "fr" | "en";

export interface LocaleOption {
  code: Locale;
  label: string;
  flag: string;
  countryCode: string;
}

export const LOCALES: LocaleOption[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", countryCode: "FR" },
  { code: "en", label: "English", flag: "🇬🇧", countryCode: "EN" },
];

export interface LanguageSwitcherProps {
  showLabel?: boolean;
  align?: "left" | "right";
  isDark?: boolean;
  className?: string;
  variant?: "desktop" | "mobile" | "responsive" | "default";
  onSelect?: () => void;
}

/**
 * Remplace ou ajoute le préfixe de langue dans l'URL.
 * Exemples :
 * - "/fr/jobs" avec target "en" -> "/en/jobs"
 * - "/en/jobs" avec target "fr" -> "/fr/jobs"
 * - "/fr" avec target "en"      -> "/en"
 * - "/jobs" avec target "en"    -> "/en/jobs"
 * - "/" avec target "en"        -> "/en"
 */
export function switchLocaleInPath(pathname: string, targetLocale: Locale): string {
  if (!pathname || pathname === "/") {
    return `/${targetLocale}`;
  }

  const localeRegex = /^\/(fr|en)(\/.*)?$/;
  const match = pathname.match(localeRegex);

  if (match) {
    const remainder = match[2] || "";
    return `/${targetLocale}${remainder}`;
  }

  return `/${targetLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export default function LanguageSwitcher({
  showLabel,
  align = "right",
  isDark = false,
  className = "",
  variant = "default",
  onSelect,
}: LanguageSwitcherProps = {}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const intlLocale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Détection de la langue active : URL > next-intl useLocale > Fallback 'fr'
  const currentLocale: Locale = pathname.startsWith("/en")
    ? "en"
    : pathname.startsWith("/fr")
    ? "fr"
    : intlLocale === "en" || intlLocale === "fr"
    ? intlLocale
    : "fr";

  const currentItem = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  const isResponsive = variant === "responsive";
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const shouldShowLabel = showLabel !== undefined ? showLabel : !isDesktop;

  // Fermer le menu lors d'un clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Changement de langue : cookie NEXT_LOCALE + remplacement dans l'URL + router.push
  const handleSelectLanguage = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setOpen(false);
      return;
    }

    // 1. Mettre à jour le cookie NEXT_LOCALE
    const isNetacuv =
      typeof window !== "undefined" && window.location.hostname.endsWith("netacuv.com");
    const domainPart = isNetacuv ? "; domain=.netacuv.com" : "";
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000${domainPart}; SameSite=Lax`;

    // 2. Remplacer le code de langue dans l'URL actuelle
    const newPath = switchLocaleInPath(pathname, newLocale);
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const targetUrl = `${newPath}${search}${hash}`;

    setOpen(false);
    if (onSelect) onSelect();

    // 3. Rechargement complet pour que le layout racine et next-intl chargent le nouveau dictionnaire
    if (typeof window !== "undefined") {
      window.location.href = targetUrl;
    } else {
      router.push(targetUrl);
      router.refresh();
    }
  };

  return (
    <div
      className={`relative inline-block ${isMobile || isResponsive ? "w-full md:w-auto" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Changer de langue (Actuel: ${currentItem.label})`}
        className={`group flex items-center justify-between gap-2 transition-all duration-200 rounded-xl border shadow-xs cursor-pointer select-none ${
          isResponsive
            ? "w-full md:w-auto px-3.5 py-2.5 md:px-3 md:py-1.5"
            : shouldShowLabel
            ? "w-full px-3.5 py-2.5"
            : "px-2.5 py-1.5"
        } ${
          isDark
            ? "bg-white/10 hover:bg-white/15 border-white/20 text-white"
            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base leading-none select-none" role="img" aria-hidden="true">
            {currentItem.flag}
          </span>
          <span
            className={`text-xs font-bold tracking-wider ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            {currentItem.countryCode}
          </span>
          {shouldShowLabel && (
            <span
              className={`text-sm font-medium ${
                isDark ? "text-slate-200" : "text-slate-600"
              } ${isResponsive ? "inline md:hidden" : ""}`}
            >
              {currentItem.label}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${isDark ? "text-white/70" : "text-slate-400 group-hover:text-slate-600"}`}
        />
      </button>

      {/* Menu Déroulant */}
      {open && (
        <div
          role="listbox"
          className={`${
            isMobile
              ? "relative mt-2 w-full"
              : isResponsive
              ? `relative md:absolute mt-2 w-full ${
                  align === "right" ? "md:right-0 md:left-auto" : "md:left-0 md:right-auto"
                } md:w-44`
              : `absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-44`
          } rounded-2xl border shadow-xl overflow-hidden z-50 animate-fade-in ${
            isDark
              ? "bg-[#0A192F] border-white/20 text-white shadow-2xl"
              : "bg-white border-slate-100 text-slate-700 shadow-xl"
          }`}
        >
          <div className="p-1">
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Langue / Language
            </div>
            <ul className="space-y-0.5">
              {LOCALES.map((loc) => {
                const isSelected = currentLocale === loc.code;
                return (
                  <li key={loc.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelectLanguage(loc.code)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-white/10 text-[#32A8D7] font-semibold"
                            : "bg-blue-50 text-blue-600 font-semibold"
                          : isDark
                          ? "text-blue-100 hover:bg-white/10 hover:text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base select-none leading-none" role="img" aria-hidden="true">
                          {loc.flag}
                        </span>
                        <span className="text-xs font-semibold leading-tight">{loc.label}</span>
                      </div>
                      {isSelected && (
                        <Check
                          size={15}
                          className={`shrink-0 ${isDark ? "text-[#32A8D7]" : "text-blue-600"}`}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
