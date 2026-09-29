"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, CreditCard, ArrowLeft, CheckCheck, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type PayStep = "plan" | "processing";

export default function RecruteurPremium() {
  const router = useRouter();
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  const [step, setStep] = useState<PayStep>("plan");
  const [error, setError] = useState<string | null>(null);

  const bgClass = "min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8";

  const handleCinetPayCheckout = async () => {
    setStep("processing");
    setError(null);
    try {
      const res = await fetch("/api/payments/cinetpay/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1000, description: "Abonnement Recruteur Premium Netacuv" })
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setError(data.error || "Impossible d'initialiser le paiement");
        setStep("plan");
      }
    } catch (e) {
      console.error("Erreur réseau paiement:", e);
      setError("Erreur de connexion au serveur.");
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
            Devenez Recruteur Premium sur Netacuv
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Gratuit */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white flex flex-col shadow-sm">
              <div className="bg-[#374151] text-white text-center py-4 font-bold text-lg">Mode Gratuit</div>
              <div className="p-8 text-center border-b border-slate-100 bg-white">
                <div className="text-5xl font-black text-slate-800 mb-2 flex items-baseline justify-center gap-1">
                  0 FCFA<span className="text-base font-medium text-slate-500">/mois</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Pour commencer à recruter</p>
              </div>
              <div className="p-8 flex-1 bg-white flex flex-col">
                <ul className="space-y-5 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle size={20} className="text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span className="leading-relaxed"><span className="font-bold text-slate-800">Accès aux profils :</span> Floutés</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-400">
                    <XCircle size={20} className="text-slate-200 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span className="leading-relaxed">Coordonnées des talents : Masquées</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-400">
                    <XCircle size={20} className="text-slate-200 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span className="leading-relaxed">Accès vidéos de présentation : Non</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-400">
                    <XCircle size={20} className="text-slate-200 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span className="leading-relaxed">Badges de distinction : Non</span>
                  </li>
                </ul>

                <button
                  onClick={() => router.push("/dashboard/recruteur")}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-auto"
                >
                  <ArrowLeft size={18} /> Rester sur le mode Gratuit
                </button>
              </div>
            </div>

            {/* Premium */}
            <div className="rounded-2xl overflow-hidden border-2 border-[#32A8D7] bg-white flex flex-col shadow-xl shadow-[#32A8D7]/20 relative">
              <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFC107] text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-10 border-2 border-white">
                Recommandé
              </div>
              <div className="bg-[#32A8D7] text-white text-center py-4 font-bold text-lg flex items-center justify-center gap-2">
                <Sparkles size={18} className="text-yellow-300" fill="currentColor" /> Mode Premium
              </div>
              <div className="p-8 text-center border-b border-slate-100 bg-white">
                <div className="text-5xl font-black text-[#32A8D7] mb-2 flex items-baseline justify-center gap-1">
                  1 000 FCFA<span className="text-base font-medium text-slate-500">/mois</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Pour des recrutements de qualité</p>
              </div>
              
              <div className="p-8 flex-1 bg-white flex flex-col">
                <ul className="space-y-5 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle size={20} className="text-[#32A8D7] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    <span className="leading-relaxed"><span className="font-bold text-slate-800">Accès aux profils :</span> Visibles</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle size={20} className="text-[#32A8D7] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    <span className="leading-relaxed"><span className="font-bold text-slate-800">Coordonnées des talents :</span> Accessibles</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle size={20} className="text-[#32A8D7] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    <span className="leading-relaxed"><span className="font-bold text-slate-800">Accès vidéos de présentation :</span> Inclus</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle size={20} className="text-[#32A8D7] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    <span className="leading-relaxed"><span className="font-bold text-slate-800">Badges de distinction :</span> "Recruteur Premium"</span>
                  </li>
                </ul>
                
                <button
                  disabled={isPremium}
                  onClick={() => !isPremium && handleCinetPayCheckout()}
                  className={`w-full font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-auto ${
                    isPremium 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                      : "bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {isPremium ? (
                    <><CheckCheck size={18} /> Offre Premium activée</>
                  ) : (
                    <><CreditCard size={18} /> Activer mon Premium à 1 000 FCFA</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 py-5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
            <p className="text-center text-sm font-medium text-slate-600 px-6">
              Paiement sécurisé via CinetPay (Mobile Money et Cartes Bancaires). Aucun engagement, résiliable à tout moment.
            </p>
          </div>
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
          <h3 className="text-2xl font-black text-slate-900 mb-3">Redirection en cours...</h3>
          <p className="text-slate-500">
            Veuillez patienter pendant que nous vous redirigeons vers la page de paiement sécurisée CinetPay.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
