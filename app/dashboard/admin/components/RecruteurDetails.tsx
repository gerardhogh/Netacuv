"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function RecruteurDetails({ recruteur, onBack }: { recruteur: any, onBack: () => void }) {
  const t = useTranslations("admin.recruiters");
  const [activeTab, setActiveTab] = useState("Informations");

  const tabs = [
    { key: "Informations", label: t("tabInfo") },
    { key: "Réseaux", label: t("tabNetworks") },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <button onClick={onBack} className="hover:text-slate-800 transition-colors">{t("home")}</button>
        <span>›</span>
        <button onClick={onBack} className="hover:text-slate-800 transition-colors">{t("recruiterList")}</button>
        <span>›</span>
        <span className="text-slate-800 font-semibold">{t("details")}</span>
      </div>

      <div className="w-full space-y-6">
        {/* Avatar section */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-4 w-60">
            <div className="w-28 h-28 rounded-full bg-blue-50 border-4 border-white shadow-md relative flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center">
                {recruteur.logo ? (
                  <img src={recruteur.logo} alt={recruteur.name} className="object-cover object-center w-full h-full" />
                ) : (
                  <div className="text-4xl font-black text-[#1E4D7B]">{recruteur.name.substring(0, 1).toUpperCase()}</div>
                )}
              </div>
            </div>
            <div className="text-center w-full">
              <h2 className="text-lg font-bold text-slate-800">{recruteur.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-1 mb-3">
                <span className="text-xs text-slate-500 font-medium">{t("recruiterRole")}</span>
                {recruteur.isPremium ? (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold">
                    ✨ {t("premium")}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-medium">
                    {t("standard")}
                  </span>
                )}
              </div>

              <button
                onClick={async () => {
                  try {
                    const nextVal = !recruteur.isPremium;
                    const res = await fetch("/api/admin/activation", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: recruteur.id, isPremium: nextVal })
                    });
                    if (res.ok) {
                      recruteur.isPremium = nextVal;
                      window.location.reload();
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  recruteur.isPremium
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-amber-500/20"
                }`}
              >
                {recruteur.isPremium ? t("premiumOfferDisable") : t("premiumOfferEnable")}
              </button>
            </div>
          </div>
        </div>
        
        {/* Tab card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
          {/* Tab nav */}
          <div className="flex border-b border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors capitalize ${
                  activeTab === tab.key
                    ? "bg-white text-slate-900 border-b-2 border-[#32A8D7]"
                    : "bg-slate-50 text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "Informations" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">{t("companyName")}</label>
                  <input readOnly type="text" value={recruteur.name} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">{t("industry")}</label>
                  <input readOnly type="text" value={recruteur.secteur || t("notProvided")} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">{t("contactEmail")}</label>
                  <input readOnly type="text" value={recruteur.email} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">{t("phone")}</label>
                  <input readOnly type="text" value={recruteur.contact} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">{t("website")}</label>
                  <input readOnly type="text" value={recruteur.website || t("notProvided")} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">{t("address")}</label>
                  <input readOnly type="text" value={recruteur.address || t("notProvided")} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">{t("companyDescription")}</label>
                  <textarea readOnly value={recruteur.description || t("notProvided")} rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">{t("keySkills")}</label>
                  <input readOnly type="text" value={recruteur.skills || t("notProvided")} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
              </div>
            )}

            {activeTab === "Réseaux" && (
              <div className="text-center text-slate-500 py-20">
                {t("socialContent")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
