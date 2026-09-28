"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Smartphone, CreditCard, ArrowLeft, CheckCheck, Clock, Sparkles } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

type PayStep = "plan" | "method" | "input" | "processing" | "success";
type PayMethod = "mtn" | "moov" | "wave" | "card" | null;

const PAYMENT_METHODS = [
  { id: "mtn" as const, label: "MTN MoMo", color: "#FFCC00", textColor: "#1a1a1a", logo: "📱", description: "Mobile Money MTN" },
  { id: "moov" as const, label: "Moov Money", color: "#0057A8", textColor: "#ffffff", logo: "📱", description: "Mobile Money Moov" },
  { id: "wave" as const, label: "Wave", color: "#1EC4FF", textColor: "#ffffff", logo: "〰️", description: "Paiement Wave" },
  { id: "card" as const, label: "Carte bancaire", color: "#08304c", textColor: "#ffffff", logo: "💳", description: "CB / Visa / Mastercard" },
];

const COUNTRY_PREFIXES: Record<string, string> = {
  mtn: "+229",
  moov: "+229",
  wave: "+221",
  card: "",
};

export default function RecruteurPremium() {
  const router = useRouter();
  const { user } = useAuth();
  const isPremium = user?.isPremium;
  const [step, setStep] = useState<PayStep>("plan");
  const [method, setMethod] = useState<PayMethod>(null);
  const [phone, setPhone] = useState("");
  const [countdown, setCountdown] = useState(90);
  const [pollingDots, setPollingDots] = useState(".");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dotsRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === "processing") {
      let isCancelled = false;
      
      const simulatePayment = async () => {
        try {
          const res = await fetch("/api/payments/simulate", { method: "POST" });
          if (!res.ok) {
            console.error("Erreur API paiement:", await res.text());
          }
        } catch (e) {
          console.error("Erreur réseau paiement:", e);
        }

        if (!isCancelled) {
          setStep("success");
          setTimeout(() => {
            if (!isCancelled) {
              window.location.href = "/dashboard/recruteur";
              window.location.reload();
            }
          }, 5000);
        }
      };

      // Simulate network delay / USSD prompt
      const timer = setTimeout(() => {
        simulatePayment();
      }, 3000);

      dotsRef.current = setInterval(() => {
        setPollingDots((d) => (d === "..." ? "." : d + "."));
      }, 500);
      
      return () => {
        isCancelled = true;
        clearTimeout(timer);
        if (dotsRef.current) clearInterval(dotsRef.current);
      };
    }
  }, [step]);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method);
  const prefix = method ? COUNTRY_PREFIXES[method] : "";

  const bgClass = "min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8";

  if (step === "success") {
    return (
      <div className={bgClass}>
        <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center animate-fade-in relative z-10">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
            <CheckCheck size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Paiement Réussi !</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              Félicitations, vous êtes maintenant un <strong className="text-[#32A8D7]">Recruteur Premium</strong> sur Netacuv. Profitez d'un accès complet aux talents !
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-8 py-3.5 bg-[#32A8D7] hover:bg-[#0071a2] text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            Retour à mon tableau de bord
          </button>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    const pct = (countdown / 90) * 100;
    return (
      <div className={bgClass}>
        <div className="flex flex-col items-center justify-center py-16 space-y-8 text-center">
          <div className="relative w-32 h-32 flex items-center justify-center animate-spin">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="60" className="stroke-slate-100" strokeWidth="8" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="60"
                className="stroke-[#32A8D7]"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * 0.75}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse">
              <Clock size={24} className="text-[#32A8D7]" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">En attente de validation USSD{pollingDots}</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Une notification USSD a été envoyée à votre téléphone. Validez la demande de paiement pour continuer.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full bg-[#32A8D7] ${i < pollingDots.length ? "opacity-100" : "opacity-30"} transition-opacity duration-300`} />
              ))}
            </div>
            <p className="text-xs text-slate-400">Vérification toutes les 3 secondes</p>
          </div>
          <button
            onClick={() => setStep("input")}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Annuler et retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={bgClass}>
      <div className="space-y-8 max-w-7xl mx-auto">
      {/* Steps breadcrumb */}
      {step !== "plan" && (
        <div className="flex items-center gap-2 text-sm z-10 relative">
          <button
            onClick={() => setStep(step === "input" ? "method" : "plan")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            {step === "method" ? "1. Sélection de la méthode" : "2. Saisie du numéro"}
          </span>
        </div>
      )}

      {/* STEP: Plan Overview */}
      {step === "plan" && (
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.1)] max-w-4xl mx-auto border border-white/50 relative overflow-hidden">
          <h2 className="text-3xl font-black text-center text-[#32A8D7] mb-10 relative z-10 drop-shadow-sm">
            Devenez Recruteur Premium sur Netacuv
          </h2>

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
              Paiement sécurisé via mobile money. Aucun engagement, résiliable à tout moment.
            </p>
          </div>
        </div>
      )}

      {/* STEP: Choose Method */}
      {step === "method" && (
        <div className="max-w-lg mx-auto space-y-6 relative z-10">
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
        <div className="max-w-md mx-auto space-y-6 relative z-10">
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
                    className="flex-1 bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="4111 1111 1111 1111"
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
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
              onClick={() => setStep("processing")}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmer et payer 1 000 FCFA
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            🔒 Paiement sécurisé. Vos données sont protégées.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
