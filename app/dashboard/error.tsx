"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our central logger or reporting service
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 my-8 shadow-sm max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">
        Oops ! Une erreur est survenue
      </h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        Nous n&apos;avons pas pu charger cette page correctement. Veuillez réessayer ou retourner au tableau de bord.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-[#32A8D7] text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-sky-500/20 hover:bg-[#2896c2] hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <RefreshCw size={18} />
          Réessayer
        </button>
      </div>
    </div>
  );
}
