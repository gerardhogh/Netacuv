"use client";
import React, { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { LOCALES, Locale } from "@/app/components/LanguageSwitcher";
import { useRouter } from "next/navigation";

export default function AdminParametres() {
  const locale = useLocale();
  const router = useRouter();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in-up w-full">
      
      {/* Préférences de notification */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Préférences de notification</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Notifications par email</span>
            <div 
              className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors cursor-pointer ${emailNotif ? 'bg-[#1e8ae9]' : 'bg-slate-200'}`}
              onClick={() => setEmailNotif(!emailNotif)}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailNotif ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Notifications par SMS</span>
            <div 
              className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors cursor-pointer ${smsNotif ? 'bg-[#1e8ae9]' : 'bg-slate-200'}`}
              onClick={() => setSmsNotif(!smsNotif)}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${smsNotif ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Changer le mot de passe */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Changer le mot de passe</h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe actuel</label>
            <div className="relative">
              <input 
                type={showPassword1 ? "text" : "password"} 
                placeholder="*************" 
                className="w-full bg-[#f8f9fa] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1e8ae9]"
              />
              <button onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input 
                type={showPassword2 ? "text" : "password"} 
                placeholder="*************" 
                className="w-full bg-[#f8f9fa] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1e8ae9]"
              />
              <button onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Au moins 8 caractères avec des lettres et des chiffres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Retapez le nouveau mot de passe</label>
            <div className="relative">
              <input 
                type={showPassword3 ? "text" : "password"} 
                placeholder="*************" 
                className="w-full bg-[#f8f9fa] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1e8ae9]"
              />
              <button onClick={() => setShowPassword3(!showPassword3)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword3 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="px-6 py-2.5 bg-[#1e8ae9] text-white font-semibold rounded-lg text-sm hover:bg-blue-600 transition-colors">
            Mettre à jour le mot de passe
          </button>
        </div>
      </div>

      {/* Langue de la plateforme */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Langue de la plateforme</h3>
        <div className="relative w-full">
          <select
            value={locale}
            onChange={(e) => {
              const newLocale = e.target.value as Locale;
              const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
              const domainPart = isLocalhost ? '' : ' domain=.netacuv.com;';
              document.cookie = `NEXT_LOCALE=${newLocale}; path=/;${domainPart} SameSite=Lax`;
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
