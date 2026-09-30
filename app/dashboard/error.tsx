"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
        <div className="mx-auto w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Erreur de chargement
        </h2>

        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Le tableau de bord a rencontré un problème. Réessayez ou revenez en arrière.
        </p>

        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-red-400 font-mono mb-4 bg-red-50 rounded-lg p-2 break-all text-left">
            {error.message}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={15} />
            Retour
          </button>
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <RefreshCw size={15} />
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
