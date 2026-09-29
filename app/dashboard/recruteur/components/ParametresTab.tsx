"use client";

import { useState } from "react";
import {
  Bell,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { DeleteAccountModal } from "./Modals";
import { useLang, LOCALES } from "../../../context/LangContext";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ParametresTab() {
  // i18n
  const { locale, setLocale, t } = useLang();

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  // Password
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };


  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      showToast("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPwd.length < 8) {
      showToast("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    showToast("Mot de passe mis à jour avec succès !");
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={16} className="text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Delete account modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async (reason) => {
            setShowDeleteModal(false);
            try {
              const res = await fetch("/api/users/me/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
              });
              if (res.ok) {
                showToast("Compte supprimé définitivement.");
                setTimeout(() => signOut({ callbackUrl: "/?account_deleted=true" }), 2000);
              } else {
                showToast("Erreur lors de la suppression.");
              }
            } catch (error) {
              showToast("Erreur serveur.");
            }
          }}
        />
      )}

      {/* ── Notifications ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
            <Bell size={15} className="text-[#32A8D7]" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Préférences de notifications</h3>
        </div>

        <div className="space-y-4">
          {/* Email notifications */}
          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Notifications par email</p>
                <p className="text-xs text-slate-400 mt-0.5">Recevez des mises à jour par email</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotif(!emailNotif)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${emailNotif ? "bg-[#32A8D7]" : "bg-slate-200"}`}
              aria-label="Toggle email notifications"
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
                style={{ left: emailNotif ? "22px" : "2px" }}
              />
            </button>
          </div>

          {/* SMS notifications */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <MessageSquare size={16} className="text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Notifications par SMS</p>
                <p className="text-xs text-slate-400 mt-0.5">Recevez des alertes par SMS</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSmsNotif(!smsNotif)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${smsNotif ? "bg-[#32A8D7]" : "bg-slate-200"}`}
              aria-label="Toggle SMS notifications"
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
                style={{ left: smsNotif ? "22px" : "2px" }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Change password ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <Lock size={15} className="text-slate-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Changer le mot de passe</h3>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors"
                placeholder="Minimum 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPwd.length > 0 && (
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      newPwd.length >= i * 2
                        ? newPwd.length >= 8 ? "bg-green-400" : "bg-amber-400"
                        : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirmer le nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 text-sm text-slate-800 outline-none transition-colors ${
                  confirmPwd && confirmPwd !== newPwd
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-200 focus:border-[#32A8D7] focus:bg-white"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPwd && confirmPwd !== newPwd && (
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>

      {/* ── Language ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Globe size={15} className="text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{t("settings", "language")}</h3>
        </div>

        <div className="relative">
          <select
            value={locale}
            onChange={(e) => {
              const newLocale = e.target.value as typeof locale;
              setLocale(newLocale);
              const label = LOCALES.find((l) => l.code === newLocale)?.label ?? newLocale;
              showToast(`${t("settings", "languageUpdated")} : ${label}`);
            }}
            className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 font-medium outline-none focus:border-[#32A8D7] focus:bg-white transition-colors cursor-pointer"
          >
            {LOCALES.map(({ code, label, flag }) => (
              <option key={code} value={code}>
                {flag} {label}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Supprimer le compte ───────────────────────────────────────────── */}
      <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={15} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-700 text-sm mb-1">Zone de danger</h3>
            <p className="text-xs text-red-500 leading-relaxed mb-4">
              La suppression de votre compte est définitive. Toutes vos données seront effacées et vous devrez créer un nouveau compte si vous souhaitez revenir.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
