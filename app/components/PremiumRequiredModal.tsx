"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Crown, X } from "lucide-react";
import Link from "next/link";

interface PremiumRequiredModalProps {
  onClose: () => void;
  message?: string;
}

export default function PremiumRequiredModal({ onClose, message = "Passez au plan Premium pour contacter ce talent." }: PremiumRequiredModalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative flex flex-col items-center text-center mx-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-5">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Fonctionnalité Premium
        </h3>
        
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex flex-col w-full gap-3">
          <Link
            href="/dashboard/recruteur?tab=premium"
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Découvrir le Premium
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold border border-slate-200 transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
