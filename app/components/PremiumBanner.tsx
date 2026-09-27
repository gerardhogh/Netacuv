"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Check, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PremiumBanner() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session === undefined) return;
    if (session?.user?.isPremium) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [session]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSimulatePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/subscription/simulate-checkout", {
        method: "POST",
      });
      if (res.ok) {
        setSuccess(true);
        await update({ isPremium: true });
        
        setTimeout(() => {
          setShowModal(false);
          setIsVisible(false);
          router.refresh(); // Refresh Server Components
        }, 2000);
      } else {
        alert("Une erreur s'est produite lors de la simulation.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  const isTalent = session?.user?.role === "TALENT";

  return (
    <>
      <div className="bg-gradient-to-r from-[#32A8D7] to-[#0071a2] text-white p-4 relative overflow-hidden shadow-lg border-b border-[#0071a2]/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
              <Sparkles className="text-yellow-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-yellow-50">
                Passez à la vitesse supérieure avec le Premium
              </h3>
              <p className="text-blue-100 text-sm mt-0.5">
                {isTalent 
                  ? "Postulez en illimité et boostez votre visibilité auprès des meilleurs recruteurs." 
                  : "Accédez sans limite aux coordonnées et téléchargez les CV de tous les talents."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setShowModal(true)}
              className="whitespace-nowrap px-5 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              Découvrir le Premium
            </button>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-200 hover:text-white"
              aria-label="Fermer la bannière"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="text-blue-500 w-5 h-5" />
                Activation Premium
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {success ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Félicitations !</h4>
                  <p className="text-sm text-slate-500">Votre abonnement Premium est désormais actif. Rechargement en cours...</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Vous êtes sur le point de simuler un paiement pour débloquer votre accès Premium. Cette action mettra immédiatement à jour votre compte.
                  </p>
                  <ul className="text-sm space-y-2 text-slate-700">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Accès complet aux profils & CV (Recruteur)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Candidatures illimitées (Talent)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Visibilité prioritaire</li>
                  </ul>
                  
                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                      disabled={isLoading}
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={handleSimulatePayment}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex justify-center items-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Payer (Simulation)"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
