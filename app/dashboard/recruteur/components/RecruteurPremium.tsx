"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, CreditCard, ArrowLeft, CheckCheck, Sparkles, Loader2, Check, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useSession } from "next-auth/react";

type PayStep = "plan" | "method" | "input" | "processing";

const PAYMENT_METHODS = [
  { id: "mtn", label: "MTN MoMo", logo: "🟡", prefix: "+229", color: "#FFCC00", textColor: "#000" },
  { id: "moov", label: "Moov Money", logo: "🔵", prefix: "+229", color: "#0066CC", textColor: "#FFF" },
  { id: "orange", label: "Orange Money", logo: "🟠", prefix: "+225", color: "#FF6600", textColor: "#FFF" },
  { id: "wave", label: "Wave", logo: "🐧", prefix: "+225", color: "#00C3FF", textColor: "#FFF" },
  { id: "card", label: "Carte Bancaire", logo: "💳", prefix: "", color: "#333", textColor: "#FFF" }
];

export default function RecruteurPremium({ isPremium: propIsPremium }: { isPremium?: boolean }) {
  const t = useTranslations("recruiter.premiumTab");
  const router = useRouter();
  const { user } = useAuth();
  const { update } = useSession();
  const isPremium = propIsPremium !== undefined ? propIsPremium : user?.isPremium;
  const [step, setStep] = useState<PayStep>("plan");
  const [method, setMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === method);
  const prefix = selectedMethod?.prefix || "";

  const bgClass = "min-h-screen bg-[#fafbfc] pt-12 pb-24 px-4 sm:px-6 lg:px-8";

  const handleCheckout = async () => {
    setStep("processing");
    setError(null);
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Force le rafraîchissement du token JWT depuis la DB sur TOUS les appareils
        await update({ isPremium: true });
        router.refresh();
        setTimeout(() => window.location.reload(), 300);
      } else {
        setError(data.error || t("errorSimulation"));
        setStep("plan");
      }
    } catch (e) {
      console.error("Erreur réseau paiement:", e);
      setError(t("errorServer"));
      setStep("plan");
    }
  };

  return (
    <div className={bgClass}>
      <div className="space-y-8 max-w-7xl mx-auto">
      {/* STEP: Plan Overview */}
      {step === "plan" && (
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.1)] max-w-4xl mx-auto border border-white/50 relative overflow-hidden">
          <h2 className="text-3xl font-black text-center text-[#32A8D7] mb-10 relative z-10 drop-shadow-sm">
            {t("heroTitle")}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium text-center">
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
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-auto"
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
                
                <button
                  disabled={isPremium}
                  onClick={() => !isPremium && setStep("method")}
                  className={`w-full font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-auto ${
                    isPremium 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                      : "bg-gradient-to-r from-[#32A8D7] to-[#2896c2] hover:from-[#2896c2] hover:to-[#1f7ca4] text-white hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {isPremium ? (
                    <><CheckCheck size={18} /> {t("premiumActivated")}</>
                  ) : (
                    <><CreditCard size={18} /> {t("activatePremiumBtn")}</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 py-5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
            <p className="text-center text-sm font-medium text-slate-600 px-6">
              {t("securePaymentNote")}
            </p>
          </div>
        </div>
      )}

      {/* STEP: Choose Method */}
      {step === "method" && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900">{t("chooseMethod")}</h3>
            <p className="text-sm text-slate-500 mt-1">{t("chooseMethodSubtitle")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => { setMethod(pm.id); setStep("input"); }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-slate-100 hover:border-[#32A8D7] hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-white"
              >
                <span className="text-3xl">{pm.logo}</span>
                <div>
                  <p className="font-bold text-sm text-slate-800">{pm.id === "card" ? t("bankCard") : pm.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{pm.id === "card" ? t("cardDescription") : t("mobilePayment")}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: pm.color, color: pm.textColor }}
                >
                  {pm.id === "card" ? t("bankCard") : pm.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP: Enter Number */}
      {step === "input" && selectedMethod && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900">{t("enterNumber")}</h3>
            <p className="text-sm text-slate-500 mt-1">{t("paymentVia")} <strong>{selectedMethod.id === "card" ? t("bankCard") : selectedMethod.label}</strong></p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                {method === "card" ? t("cardNumber") : t("phoneNumber")}
              </label>
              {method !== "card" ? (
                <div className="flex gap-3">
                  <div className="flex items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 whitespace-nowrap">
                    {prefix}
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="01 23 45 67 89"
                    maxLength={12}
                    className="flex-1 bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#32A8D7]"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="4111 1111 1111 1111"
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#32A8D7]"
                />
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">{t("serviceLabel")}</span><span className="font-bold">{t("serviceValue")}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t("amountLabel")}</span><span className="font-black text-[#32A8D7]">1 000 FCFA</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t("methodLabel")}</span><span className="font-bold">{selectedMethod.id === "card" ? t("bankCard") : selectedMethod.label}</span></div>
            </div>

            <button
              disabled={phone.length < 8}
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white font-bold text-sm transition-colors shadow-lg shadow-[#32A8D7]/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("confirmAndPay")}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            {t("securePaymentFooter")}
          </p>
        </div>
      )}

      {/* STEP: Processing */}
      {step === "processing" && (
        <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/50 text-center relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#32A8D7]/10 rounded-full animate-ping"></div>
            <div className="relative bg-white rounded-full p-4 shadow-lg flex items-center justify-center h-full w-full border border-slate-50">
              <Loader2 size={40} className="text-[#32A8D7] animate-spin" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">{t("initPayment")}</h3>
          <p className="text-slate-500">
            {t("pleaseWait")}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
