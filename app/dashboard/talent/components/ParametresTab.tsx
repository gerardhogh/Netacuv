"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield, Bell, Globe2, AlertTriangle } from "lucide-react";
import { useLang, LOCALES } from "../../../context/LangContext";

export default function ParametresTab() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { locale: lang, setLocale: setLang } = useLang();
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { alert("Les mots de passe ne correspondent pas."); return; }
    if (newPwd.length < 8) { alert("Le mot de passe doit comporter au moins 8 caractères."); return; }
    setPwdSuccess(true);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setPwdSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
        <span>Accueil</span>
        <span>&rsaquo;</span>
        <span className="text-slate-700">Paramètre</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">
        Paramètre du <span className="font-normal">compte</span>
      </h2>

      {/* Toast success */}
      {pwdSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          <Shield size={16} />
          Mot de passe mis à jour avec succès !
        </div>
      )}

      {/* Section 1: Notification Preferences */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-[#008de4]" />
          <h3 className="text-base font-bold text-slate-800">Préférences de notification</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Notifications par email</span>
            <Toggle checked={emailNotif} onChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Notifications par SMS</span>
            <Toggle checked={smsNotif} onChange={setSmsNotif} />
          </div>
        </div>
      </section>

      {/* Section 2: Change Password */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-[#008de4]" />
          <h3 className="text-base font-bold text-slate-800">Changer le mot de passe</h3>
        </div>
        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
          <PasswordField
            label="Mot de passe actuel"
            value={currentPwd}
            onChange={setCurrentPwd}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            placeholder="••••••••••••"
          />
          <PasswordField
            label="Nouveau mot de passe"
            value={newPwd}
            onChange={setNewPwd}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            placeholder="••••••••••••"
            hint="Au moins 8 caractères avec des lettres et des chiffres"
          />
          <PasswordField
            label="Retapez le nouveau mot de passe"
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
            Mettre à jour le mot de passe
          </button>
        </form>
      </section>

      {/* Section 3: Language */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Globe2 size={18} className="text-[#008de4]" />
          <h3 className="text-base font-bold text-slate-800">Langue de la plateforme</h3>
        </div>
        <div className="max-w-lg">
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
            >
              {LOCALES.map(({ code, label, flag }) => (
                <option key={code} value={code}>{flag} {label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section 4: Deactivate Account */}
      <section className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="text-base font-bold text-red-600">Désactiver mon compte</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Vous pouvez désactiver temporairement votre compte. Vous pourrez le réactiver à tout moment.
        </p>
        <button
          onClick={() => setDeactivateModal(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors"
        >
          Désactiver mon compte
        </button>
      </section>

      {/* Deactivate Confirmation Modal */}
      {deactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Confirmer la désactivation</h4>
            <p className="text-sm text-slate-500">
              Êtes-vous sûr de vouloir désactiver temporairement votre compte ? Vous ne recevrez plus de notifications.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeactivateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => setDeactivateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
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
