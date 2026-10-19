"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Download, Eye, Video, Bookmark } from "lucide-react";
import NetacuvVideoPlayer from "@/components/NetacuvVideoPlayer";
import { useTranslations } from "next-intl";

export function TalentDetails({ 
  talent, 
  onBack, 
  isFavorite = false, 
  onToggleFavorite 
}: { 
  talent: any; 
  onBack: () => void; 
  isFavorite?: boolean; 
  onToggleFavorite?: () => void; 
}) {
  const t = useTranslations("admin.talents");
  const [activeTab, setActiveTab] = useState("Informations");

  const tabs = [
    { key: "Informations", label: t("tabInfo") },
    { key: "Réseaux", label: t("tabNetworks") },
    { key: "Vidéo Entretien", label: t("tabVideo") },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <button onClick={onBack} className="hover:text-slate-800 transition-colors">{t("home")}</button>
        <span>›</span>
        <button onClick={onBack} className="hover:text-slate-800 transition-colors">{t("talentList")}</button>
        <span>›</span>
        <span className="text-slate-800 font-semibold">{t("details")}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 relative bg-slate-100">
              <img 
                src={talent.avatar || "/assets/avatar_africain.jpg"} 
                alt={talent.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/avatar_africain.jpg";
                }}
                className="object-cover object-center w-full h-full" 
              />
            </div>
            <h2 className="text-xl font-black text-slate-900">{talent.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{talent.domaine}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {talent.status === "Actif" ? (
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-sm">{t("active")}</span>
              ) : talent.status === "En attente" ? (
                <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold shadow-sm">{t("pending")}</span>
              ) : (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-sm">{t("suspended")}</span>
              )}
              {talent.isPremium ? (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                  ✨ {t("premium")}
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium shadow-sm">
                  {t("standard")}
                </span>
              )}
              {talent.certifie && (
                <span className="px-3 py-1 bg-blue-100 text-[#32A8D7] rounded-full text-xs font-bold shadow-sm">{t("certified")}</span>
              )}
            </div>

            <div className="w-full flex flex-col gap-2 mb-2">
              <button
                onClick={async () => {
                  try {
                    const nextVal = !talent.isPremium;
                    const res = await fetch("/api/admin/activation", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: talent.id, isPremium: nextVal })
                    });
                    if (res.ok) {
                      talent.isPremium = nextVal;
                      window.location.reload();
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  talent.isPremium
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-amber-500/20"
                }`}
              >
                {talent.isPremium ? t("premiumOfferDisable") : t("premiumOfferEnable")}
              </button>

              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    isFavorite
                      ? "bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-amber-600"
                  }`}
                >
                  <Bookmark size={14} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "text-amber-500" : ""} />
                  {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                </button>
              )}

              <a 
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${talent.email}&su=Contact%20Check%20CV&body=Bonjour%20${talent.name},`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block py-2.5 px-4 bg-white border border-[#32A8D7] text-[#32A8D7] rounded-lg font-bold hover:bg-[#32A8D7] hover:text-white transition-colors text-center text-sm"
              >
                {t("sendEmail")}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-800 mb-4">{t("cvUpdatedOn", { date: talent.date })}</p>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 aspect-[1/1.4] relative mb-4 flex flex-col group">
              <div className="flex-1 relative">
                {talent.cvUrl ? (
                  <iframe
                    src={`${talent.cvUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full rounded border-0 bg-white pointer-events-none"
                    title={t("preview")}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 p-6">
                    <span className="text-sm font-medium">{t("noCvAvailable")}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors">
                <Download size={16} className="text-red-500" /> {t("downloadPdf")}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#32A8D7] text-white rounded-lg font-semibold text-sm hover:bg-[#2892bd] transition-colors">
                {t("preview")}
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[500px]">
          <div className="flex bg-slate-50 p-1 rounded-xl mb-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "Informations" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("firstName")}</label>
                <input readOnly type="text" value={talent.firstName || talent.name?.split(" ")[0] || ""} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("lastName")}</label>
                <input readOnly type="text" value={talent.lastName || talent.name?.split(" ").slice(1).join(" ") || ""} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("profTitle")}</label>
                <input readOnly type="text" value={talent.domaine} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("username")}</label>
                <input readOnly type="text" value={talent.username || ""} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("gender")}</label>
                <input readOnly type="text" value={talent.gender || t("unspecified")} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("oppType")}</label>
                <input readOnly type="text" value={talent.opportunity || "Emploi"} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("country")}</label>
                <input readOnly type="text" value={talent.country || t("unspecified")} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("city")}</label>
                <input readOnly type="text" value={talent.location} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("phone")}</label>
                <input readOnly type="text" value={talent.contact} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("email")}</label>
                <input readOnly type="text" value={talent.email} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("bio")}</label>
                <textarea readOnly value={talent.bio || t("noBio")} rows={3} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0 resize-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t("skills")}</label>
                <input readOnly type="text" value={talent.skills || ""} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
            </div>
          )}

          {activeTab === "Réseaux" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold font-serif">f</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">Facebook</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.facebook || t("notProvided")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold">in</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">LinkedIn</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.linkedin || t("notProvided")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold">X</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">Twitter</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.twitter || t("notProvided")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center text-white font-bold font-serif">P</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">Pinterest</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.pinterest || t("notProvided")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#1769FF] flex items-center justify-center text-white font-bold text-[10px]">Be</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">Behance</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.behance || t("notProvided")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "Vidéo Entretien" && (() => {
            let adminVideoUrl = talent.videoUrl || talent.videoRecordings || talent.interviewSession?.videoRecordings;
            if (typeof adminVideoUrl === "string" && adminVideoUrl.trim().startsWith("[")) {
              try {
                const parsed = JSON.parse(adminVideoUrl);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  adminVideoUrl = parsed[parsed.length - 1] || parsed[0];
                }
              } catch (e) {}
            }
            return (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                {adminVideoUrl ? (
                  <NetacuvVideoPlayer
                    src={adminVideoUrl}
                    aspectRatio="aspect-video"
                  />
                ) : (
                  <div className="text-center text-slate-500 py-20 bg-slate-50 rounded-xl border border-slate-100 w-full">
                    <Video className="w-12 h-12 mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                    <p className="font-medium text-sm">{t("noVideoTitle")}</p>
                    <p className="text-xs text-slate-400 mt-1">{t("noVideoDesc")}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
