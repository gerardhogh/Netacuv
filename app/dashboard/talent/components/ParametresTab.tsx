"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield, Bell, Globe2, AlertTriangle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher, { LOCALES, Locale } from "@/app/components/LanguageSwitcher";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { DeleteAccountModal } from "@/app/dashboard/recruteur/components/Modals";

export default function ParametresTab() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const lang = useLocale();
  const t = useTranslations();
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const router = useRouter();
  const pathname = usePathname() || "/";

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { alert(t("settings.pwdMismatch")); return; }
    if (newPwd.length < 8) { alert(t("settings.pwdMinLength")); return; }
    setPwdSuccess(true);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setPwdSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
        <span>{t("settings.breadcrumbHome")}</span>
        <span>&rsaquo;</span>
        <span className="text-slate-700">{t("settings.breadcrumbSettings")}</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">
        {t("settings.accountSettings")}
      </h2>

      {/* Toast success */}
      {pwdSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          <Shield size={16} />
          {t("settings.pwdSuccess")}
        </div>
      )}

      {/* Section 1: Notification Preferences */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-[#008de4]" />
          <h3 className="text-base font-bold text-slate-800">{t("settings.notifications")}</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">{t("settings.emailNotif")}</span>
            <Toggle checked={emailNotif} onChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">{t("settings.smsNotif")}</span>
            <Toggle checked={smsNotif} onChange={setSmsNotif} />
          </div>
        </div>
      </section>

      {/* Section 2: Change Password */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-[#008de4]" />
          <h3 className="text-base font-bold text-slate-800">{t("settings.changePassword")}</h3>
        </div>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <PasswordField
            label={t("settings.currentPassword")}
            value={currentPwd}
            onChange={setCurrentPwd}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            placeholder="••••••••••••"
          />
          <PasswordField
            label={t("settings.newPassword")}
            value={newPwd}
            onChange={setNewPwd}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            placeholder="••••••••••••"
            hint={t("settings.pwdHint")}
          />
          <PasswordField
            label={t("settings.confirmPassword")}
            value={confirmPwd}
            onChange={setConfirmPwd}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            placeholder="••••••••••••"
          />
          <button
            type="submit"
            className="bg-[#008de4] hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md shadow-blue-500/20"
          >
            {t("settings.updatePassword")}
          </button>
        </form>
      </section>

      {/* Section 3: Language */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Globe2 size={18} className="text-[#008de4]" />
          <h3 className="text-base font-bold text-slate-800">{t("settings.language")}</h3>
        </div>
        <div>
          <CustomSelect
            value={lang}
            onChange={(newLocale) => {
              const isNetacuv = typeof window !== "undefined" && window.location.hostname.endsWith("netacuv.com");
              const domainPart = isNetacuv ? "; domain=.netacuv.com" : "";
              document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000${domainPart}; SameSite=Lax`;

              let newPath = pathname;
              if (pathname.startsWith('/fr/') || pathname === '/fr') {
                newPath = pathname.replace(/^\/fr(\/|$)/, `/${newLocale}$1`);
              } else if (pathname.startsWith('/en/') || pathname === '/en') {
                newPath = pathname.replace(/^\/en(\/|$)/, `/${newLocale}$1`);
              } else {
                newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`;
              }
              if (typeof window !== "undefined") {
                window.location.href = newPath;
              } else {
                router.push(newPath);
                router.refresh();
              }
            }}
            options={LOCALES.map(({ code, label, flag }) => ({
              value: code,
              label: `${flag} ${label}`,
            }))}
            className="w-full"
          />
        </div>
      </section>

      {/* Section 4: Deactivate Account */}
      <section className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="text-base font-bold text-red-600">{t("settings.deleteMyAccount")}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {t("settings.deactivateDesc")}
        </p>
        <button
          onClick={() => setDeleteModal(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors cursor-pointer"
        >
          {t("settings.deleteMyAccount")}
        </button>
      </section>

      {/* Delete Confirmation Modal (Unified) */}
      {deleteModal && (
        <DeleteAccountModal
          onCancel={() => setDeleteModal(false)}
          onConfirm={async (finalReason) => {
            try {
              const res = await fetch("/api/users/me/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: finalReason }),
              });
              if (res.ok) {
                setDeleteModal(false);
                localStorage.removeItem("check_cv_name");
                localStorage.removeItem("check_cv_date");
                localStorage.removeItem("check_cv_has_pdf");
                localStorage.removeItem("confetti_shown");
                await signOut({ callbackUrl: "/?account_deleted=true" });
              } else {
                alert("Erreur lors de la suppression.");
              }
            } catch (error) {
              alert("Erreur serveur.");
            }
          }}
        />
      )}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-[#008de4]" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle, placeholder, hint
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-slate-600 font-semibold">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 pr-10 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
