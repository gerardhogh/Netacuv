"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, CreditCard, ArrowLeft, CheckCheck, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type PayStep = "plan" | "method" | "input" | "processing";

const PAYMENT_METHODS = [
  { id: "mtn", label: "MTN MoMo", description: "Paiement mobile", logo: "🟡", prefix: "+229", color: "#FFCC00", textColor: "#000" },
  { id: "moov", label: "Moov Money", description: "Paiement mobile", logo: "🔵", prefix: "+229", color: "#0066CC", textColor: "#FFF" },
  { id: "orange", label: "Orange Money", description: "Paiement mobile", logo: "🟠", prefix: "+225", color: "#FF6600", textColor: "#FFF" },
  { id: "wave", label: "Wave", description: "Paiement mobile", logo: "🐧", prefix: "+225", color: "#00C3FF", textColor: "#FFF" },
  { id: "card", label: "Carte Bancaire", description: "Visa, Mastercard", logo: "💳", prefix: "", color: "#333", textColor: "#FFF" }
];

export default function RecruteurPremium({ isPremium: propIsPremium }: { isPremium?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const isPremium = propIsPremium !== undefined ? propIsPremium : user?.isPremium;
  const [step, setStep] = useState<PayStep>("plan");
  const [method, setMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === method);
  const prefix = selectedMethod?.prefix || "";

  const bgClass = "min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8";

  const handleCheckout = async () => {
    setStep("processing");
    setError(null);
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Success: Reload the page to reflect premium status
        window.location.reload();
      } else {
        setError(data.error || "Impossible de simuler le paiement");
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
                  onClick={() => !isPremium && setStep("method")}
                  className={`w-full font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-auto ${
                    isPremium 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                      : "bg-gradient-to-r from-[#32A8D7] to-[#2896c2] hover:from-[#2896c2] hover:to-[#1f7ca4] text-white hover:shadow-lg hover:-translate-y-0.5"
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
              Paiement sécurisé (Mobile Money et Carte). Aucun engagement, résiliable à tout moment.
            </p>
          </div>
        </div>
      )}

      {/* STEP: Choose Method */}
      {step === "method" && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900">Choisissez votre méthode</h3>
            <p className="text-sm text-slate-500 mt-1">Sélectionnez un moyen de paiement pour votre abonnement à <strong>1 000 FCFA/mois</strong></p>
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
                  <p className="font-bold text-sm text-slate-800">{pm.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{pm.description}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: pm.color, color: pm.textColor }}
                >
                  {pm.label}
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
            <h3 className="text-2xl font-black text-slate-900">Entrer votre numéro</h3>
            <p className="text-sm text-slate-500 mt-1">Paiement via <strong>{selectedMethod.label}</strong></p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                {method === "card" ? "Numéro de carte" : "Numéro de téléphone"}
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
              <div className="flex justify-between"><span className="text-slate-500">Service</span><span className="font-bold">Abonnement Recruteur Premium</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Montant</span><span className="font-black text-[#32A8D7]">1 000 FCFA</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Méthode</span><span className="font-bold">{selectedMethod.label}</span></div>
            </div>

            <button
              disabled={phone.length < 8}
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white font-bold text-sm transition-colors shadow-lg shadow-[#32A8D7]/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmer et payer 1 000 FCFA
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            🔒 Paiement sécurisé. Vos données sont protégées.
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
          <h3 className="text-2xl font-black text-slate-900 mb-3">Initialisation du paiement...</h3>
          <p className="text-slate-500">
            Veuillez patienter quelques instants.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
