"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useLocale } from 'next-intl';

export type Locale = "fr" | "en" | "es" | "zh";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const domainPart = isLocalhost ? '' : ' domain=.netacuv.com;';
    document.cookie = `NEXT_LOCALE=${code}; path=/;${domainPart} SameSite=Lax`;
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 bg-white hover:bg-slate-50 transition-colors px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{current.flag}</span>
          <span className="text-sm font-semibold text-slate-700">{current.label}</span>
        </div>
        <ChevronDown size={14} className="text-slate-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 min-w-[140px] bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-50">
          <ul className="py-2">
            {LOCALES.map((loc) => (
              <li key={loc.code}>
                <button
                  onClick={() => changeLanguage(loc.code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3 ${
                    currentLocale === loc.code
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">{loc.flag}</span>
                  <span>{loc.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
