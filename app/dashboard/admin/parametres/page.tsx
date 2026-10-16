"use client";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronDown, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LOCALES, Locale } from "@/app/components/LanguageSwitcher";
import { useRouter, usePathname } from "next/navigation";

export default function AdminParametres() {
  const t = useTranslations("admin.settingsPage");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname() || "/";

  // Notification preference
  const [emailNotif, setEmailNotif] = useState(true);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotif = localStorage.getItem("admin_email_notif");
      if (savedNotif !== null) {
        setEmailNotif(savedNotif === "true");
      }
    }
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleToggleEmailNotif = () => {
    const nextVal = !emailNotif;
    setEmailNotif(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_email_notif", String(nextVal));
    }
    if (nextVal) {
      showToast(t("toastNotifEnabled"), "success");
    } else {
      showToast(t("toastNotifDisabled"), "error");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast(t("toastPwdCurrentRequired"), "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast(t("toastPwdMinLength"), "error");
      return;
    }
    if (newPassword !== repeatPassword) {
      showToast(t("toastPwdMismatch"), "error");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erreur lors de la mise à jour du mot de passe", "error");
        return;
      }
      showToast(t("toastPwdSuccess"), "success");
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch (err: any) {
      showToast(err.message || "Erreur de connexion", "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up w-full">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          {toast.type === "success" ? (
            <CheckCircle size={18} className="text-green-400 shrink-0" />
          ) : (
            <XCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
      
      {/* Préférences de notification */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{t("notifPrefsTitle")}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-700 block">{t("emailNotifLabel")}</span>
              <span className="text-xs text-slate-400">
                {emailNotif ? "Activé" : "Désactivé"}
              </span>
            </div>
            <div 
              className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors cursor-pointer ${emailNotif ? 'bg-[#1e8ae9]' : 'bg-slate-200'}`}
              onClick={handleToggleEmailNotif}
              role="switch"
              aria-checked={emailNotif}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailNotif ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Changer le mot de passe */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{t("changePasswordTitle")}</h3>
        
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("currentPasswordLabel")}</label>
            <div className="relative">
              <input 
                type={showPassword1 ? "text" : "password"} 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="*************" 
                className="w-full bg-[#f8f9fa] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1e8ae9]"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword1(!showPassword1)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              >
                {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("newPasswordLabel")}</label>
            <div className="relative">
              <input 
                type={showPassword2 ? "text" : "password"} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="*************" 
                className="w-full bg-[#f8f9fa] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1e8ae9]"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword2(!showPassword2)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              >
                {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t("passwordHint")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("repeatPasswordLabel")}</label>
            <div className="relative">
              <input 
                type={showPassword3 ? "text" : "password"} 
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="*************" 
                className="w-full bg-[#f8f9fa] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1e8ae9]"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword3(!showPassword3)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              >
                {showPassword3 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={updatingPassword}
            className="px-6 py-2.5 bg-[#1e8ae9] text-white font-semibold rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {updatingPassword ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t("updatingPassword")}</span>
              </>
            ) : (
              t("updatePasswordBtn")
            )}
          </button>
        </form>
      </div>

      {/* Langue de la plateforme */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{t("platformLanguageTitle")}</h3>
        <div className="relative w-full">
          <select
            value={locale}
            onChange={(e) => {
              const newLocale = e.target.value as Locale;
              const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
              const domainPart = isLocalhost ? '' : '; domain=.netacuv.com';
              document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000${domainPart}; SameSite=Lax`;

              let newPath = pathname;
              if (pathname.startsWith('/fr/') || pathname === '/fr') {
                newPath = pathname.replace(/^\/fr(\/|$)/, `/${newLocale}$1`);
              } else if (pathname.startsWith('/en/') || pathname === '/en') {
                newPath = pathname.replace(/^\/en(\/|$)/, `/${newLocale}$1`);
              } else {
                newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`;
              }

              router.push(newPath);
              router.refresh();
            }}
            className="w-full bg-[#f8f9fa] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1e8ae9] appearance-none cursor-pointer text-slate-800 font-medium"
          >
            {LOCALES.map(({ code, label, flag }) => (
              <option key={code} value={code}>{flag} {label}</option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
      
    </div>
  );
}
