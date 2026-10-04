"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PremiumBanner({ isPremium, onUpgrade }: { isPremium?: boolean; onUpgrade?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isPremium !== undefined) {
      setIsVisible(!isPremium);
      return;
    }
    
    if (session === undefined) return;
    if (session?.user?.isPremium) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [session, isPremium]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDiscover = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Fallback for TalentDashboard or others that use hash
      window.location.hash = "premium";
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const isTalent = session?.user?.role === "TALENT";

  return (
    <div className="bg-gradient-to-r from-[#32A8D7] to-[#0071a2] text-white p-4 relative overflow-hidden shadow-lg border-b border-[#0071a2]/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
      
      <button 
        onClick={handleClose}
        className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-full transition-colors text-blue-100 hover:text-white z-20"
        aria-label="Fermer la bannière"
      >
        <X size={20} />
      </button>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10 pr-6">
        <div className="flex items-start md:items-center gap-4 text-left w-full">
          <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0 mt-1 md:mt-0">
            <Sparkles className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-3 md:gap-6">
            <div>
              <h3 className="font-bold text-base md:text-lg text-yellow-50">
                Passez à la vitesse supérieure avec le Premium
              </h3>
              <p className="text-blue-100 text-sm mt-0.5 leading-snug">
                {isTalent 
                  ? "Postulez en illimité et boostez votre visibilité auprès des meilleurs recruteurs." 
                  : "Accédez sans limite aux coordonnées et téléchargez les CV de tous les talents."}
              </p>
            </div>
            
            <button 
              onClick={handleDiscover}
              className="w-fit whitespace-nowrap px-4 py-2 md:px-5 md:py-2 text-sm md:text-base bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-semibold rounded-lg shadow-md transition-all active:scale-95 shrink-0"
            >
              Découvrir le Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

