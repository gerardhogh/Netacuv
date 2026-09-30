"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Netacuv Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Oups, une erreur est survenue
        </h1>

        {/* Message */}
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir à
          l&apos;accueil. Si le problème persiste, contactez notre support.
        </p>

        {/* Error digest for debugging (only visible in dev) */}
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="text-xs text-slate-400 font-mono mb-4 bg-slate-50 rounded-lg p-2 break-all">
            Digest: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            <Home size={16} />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
