"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCheck, Sparkles, Loader2, Check, X, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function RecruteurPremium({ isPremium: propIsPremium }: { isPremium?: boolean }) {
  const t = useTranslations("recruiter.premiumTab");
  const router = useRouter();
  const { user } = useAuth();
  const isPremium = propIsPremium !== undefined ? propIsPremium : user?.isPremium;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bgClass = "min-h-screen bg-[#fafbfc] pt-12 pb-24 px-4 sm:px-6 lg:px-8";

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 1000,
          method: "fedapay",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.paymentUrl) {
        // Redirection directe vers la passerelle sécurisée FedaPay
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || "Impossible d'initialiser le paiement FedaPay. Veuillez réessayer.");
        setLoading(false);
      }
    } catch (e) {
      console.error("Erreur paiement:", e);
      setError("Erreur de connexion au serveur de paiement.");
      setLoading(false);
    }
  };

  return (
    <div className={bgClass}>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.1)] max-w-4xl mx-auto border border-white/50 relative overflow-hidden">
          <h2 className="text-3xl font-black text-center text-[#32A8D7] mb-10 relative z-10 drop-shadow-sm">
            {t("heroTitle")}
          </h2>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Gratuit */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white flex flex-col shadow-sm">
              <div className="bg-[#374151] text-white text-center py-4 font-bold text-lg">{t("freeModeTitle")}</div>
              <div className="p-8 text-center border-b border-slate-100 bg-white">
                <div className="text-5xl font-black text-slate-800 mb-2 flex items-baseline justify-center gap-1">
                  {t("freePrice")}<span className="text-base font-medium text-slate-500">{t("monthSuffix")}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{t("toStartRecruiting")}</p>
              </div>
              <div className="p-8 flex-1 bg-white flex flex-col">
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("featureCompanyProfile")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("feature1JobFree")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("featureAffiliation")} <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1 border border-green-200">{t("featureAffiliationBadge")}</span></span></li>
                  <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("featureUnlimitedJobs")}</span></li>
                  <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("featureFullContacts")}</span></li>
                  <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("featureUnlimitedCv")}</span></li>
                  <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("featureFullAiVideos")}</span></li>
                  <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("featurePriorityProfiles")}</span></li>
                  <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("featureAdvancedFilters")}</span></li>
                </ul>
                
                <button
                  onClick={() => router.push("/dashboard/recruteur")}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-auto cursor-pointer"
                >
                  <ArrowLeft size={18} /> {t("stayFree")}
                </button>
              </div>
            </div>

            {/* Premium */}
            <div className="rounded-2xl overflow-hidden border-2 border-[#32A8D7] bg-white flex flex-col shadow-xl shadow-[#32A8D7]/20 relative">
              <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFC107] text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-10 border-2 border-white">
                {t("recommended")}
              </div>
              <div className="bg-[#32A8D7] text-white text-center py-4 font-bold text-lg flex items-center justify-center gap-2">
                <Sparkles size={18} className="text-yellow-300" fill="currentColor" /> {t("premiumModeTitle")}
              </div>
              <div className="p-8 text-center border-b border-slate-100 bg-white">
                <div className="text-5xl font-black text-[#32A8D7] mb-2 flex items-baseline justify-center gap-1">
                  1 000 FCFA<span className="text-base font-medium text-slate-500">{t("monthSuffix")}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{t("forQualityRecruitment")}</p>
              </div>
              
              <div className="p-8 flex-1 bg-white flex flex-col">
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("featureCompanyProfile")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("featureUnlimitedJobs")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("featureFullContacts")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("featureUnlimitedCv")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("featureFullAiVideos")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("featurePriorityProfiles")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("featureAdvancedFilters")}</span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("badgePremium")} <Sparkles className="inline text-yellow-400" size={16} /></span></li>
                  <li className="flex items-start gap-3"><Check className="text-[#32A8D7] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600 font-bold">{t("support247")}</span></li>
                </ul>
                
                {isPremium ? (
                  <div className="space-y-3 mt-auto">
                    <div className="w-full bg-emerald-50 text-emerald-700 font-bold py-2.5 px-4 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 text-xs">
                      <CheckCheck size={16} className="text-emerald-600" /> {t("premiumActivated")}
                    </div>
                    <button
                      disabled={loading}
                      onClick={handleCheckout}
                      className="w-full font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#32A8D7] to-[#2896c2] hover:from-[#2896c2] hover:to-[#1f7ca4] text-white hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait text-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Connexion à FedaPay...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Prolonger de 30 jours (1 000 FCFA)
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={loading}
                    onClick={handleCheckout}
                    className="w-full font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-auto cursor-pointer bg-gradient-to-r from-[#32A8D7] to-[#2896c2] hover:from-[#2896c2] hover:to-[#1f7ca4] text-white hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Connexion à FedaPay...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Payer avec FedaPay (1 000 FCFA)
                      </>
                    )}
                  </button>
                )}

                {/* Badges de paiement FedaPay */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">MTN MoMo</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">Moov Money</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">Orange Money</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">Wave</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">Carte Visa / Mastercard</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    🔒 Passerelle de paiement sécurisée certifiée FedaPay
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 py-5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
            <p className="text-center text-sm font-medium text-slate-600 px-6">
              {t("securePaymentNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
