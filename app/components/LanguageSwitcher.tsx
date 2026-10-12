"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLocale } from 'next-intl';

export type Locale = "fr" | "en" | "es" | "zh";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export interface LanguageSwitcherProps {
  showLabel?: boolean;
  align?: "left" | "right";
  isDark?: boolean;
  className?: string;
  variant?: "desktop" | "mobile" | "responsive" | "default";
  onSelect?: () => void;
}

export default function LanguageSwitcher({
  showLabel,
  align = "left",
  isDark = false,
  className = "",
  variant = "default",
  onSelect,
}: LanguageSwitcherProps = {}) {
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isResponsive = variant === "responsive";
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";

  // Si showLabel est explicitement fourni, on le respecte.
  // Sinon : desktop -> false, responsive -> true (avec masquage CSS md:hidden), autre -> true
  const shouldShowLabel = showLabel !== undefined ? showLabel : !isDesktop;

  const current = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (code: Locale) => {
    const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const domainPart = isLocalhost ? "" : " domain=.netacuv.com;";
    document.cookie = `NEXT_LOCALE=${code}; path=/;${domainPart} SameSite=Lax`;
    setOpen(false);
    if (onSelect) onSelect();
    window.location.reload();
  };

  return (
    <div className={`relative ${isMobile || isResponsive ? "w-full md:w-auto" : ""}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 transition-all duration-200 rounded-xl border shadow-sm cursor-pointer ${
          isResponsive
            ? "w-full md:w-auto px-3.5 py-2.5 md:px-3 md:py-2"
            : shouldShowLabel
            ? "w-full px-3.5 py-2.5"
            : "px-3 py-2"
        } ${
          isDark
            ? "bg-white/10 hover:bg-white/15 border-white/20 text-white"
            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
        } ${className}`}
        aria-label={`Changer de langue (actuel : ${current.label})`}
        title={current.label}
      >
        <div className="flex items-center gap-2">
          <span className="text-base select-none leading-none">{current.flag}</span>
          {shouldShowLabel && (
            <span
              className={`text-sm font-semibold ${
                isDark ? "text-white" : "text-slate-700"
              } ${isResponsive ? "inline md:hidden" : ""}`}
            >
              {current.label}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${isDark ? "text-white/70" : "text-slate-500"}`}
        />
      </button>

      {open && (
        <div
          className={`${
            isMobile
              ? "relative mt-2 w-full"
              : isResponsive
              ? `relative md:absolute mt-2 w-full ${align === "right" ? "md:right-0 md:left-auto" : "md:left-0 md:right-auto"} md:w-48`
              : `absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-48`
          } rounded-2xl border shadow-xl overflow-hidden z-50 animate-fade-in ${
            isDark
              ? "bg-[#0A192F] border-white/20 text-white shadow-2xl"
              : "bg-white border-slate-100 text-slate-700 shadow-xl"
          }`}
        >
          <ul className={`py-1.5 ${isDark ? "divide-y divide-white/10" : "divide-y divide-slate-50"}`}>
            {LOCALES.map((loc) => {
              const isSelected = currentLocale === loc.code;
              return (
                <li key={loc.code}>
                  <button
                    type="button"
                    onClick={() => changeLanguage(loc.code)}
                    className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors flex items-center justify-between ${
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
                      <span className="text-base select-none leading-none">{loc.flag}</span>
                      <span className="font-medium">{loc.label}</span>
                    </div>
                    {isSelected && (
                      <Check size={15} className={`shrink-0 ${isDark ? "text-[#32A8D7]" : "text-blue-600"}`} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
