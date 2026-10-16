"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "../context/NotificationContext";
import { Toaster, resolveValue, toast } from "react-hot-toast";
import { CheckCircle2, AlertCircle, Info, Loader2, X } from "lucide-react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }}>
          {(t) => {
            const isSuccess = t.type === "success";
            const isError = t.type === "error";
            const isLoading = t.type === "loading";

            return (
              <div
                className={`${
                  t.visible ? "animate-in fade-in slide-in-from-top-2 duration-200" : "animate-out fade-out duration-150"
                } max-w-sm w-full bg-white rounded-2xl shadow-xl border p-3.5 flex items-start gap-3 pointer-events-auto transition-all ${
                  isSuccess
                    ? "border-emerald-200/90 shadow-emerald-500/10"
                    : isError
                    ? "border-rose-200/90 shadow-rose-500/10"
                    : "border-blue-200/90 shadow-blue-500/10"
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
                    isSuccess
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                      : isError
                      ? "bg-rose-50 border border-rose-200 text-rose-600"
                      : "bg-blue-50 border border-blue-200 text-[#1e8ae9]"
                  }`}
                >
                  {isSuccess && <CheckCircle2 size={18} />}
                  {isError && <AlertCircle size={18} />}
                  {isLoading && <Loader2 size={18} className="animate-spin" />}
                  {!isSuccess && !isError && !isLoading && <Info size={18} />}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p
                    className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${
                      isSuccess
                        ? "text-emerald-700"
                        : isError
                        ? "text-rose-700"
                        : "text-[#1e8ae9]"
                    }`}
                  >
                    {isSuccess ? "Validé" : isError ? "Erreur" : isLoading ? "Traitement" : "Information"}
                  </p>
                  <div className="text-xs sm:text-sm font-medium text-slate-700 leading-snug break-words">
                    {resolveValue(t.message, t)}
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => toast.dismiss(t.id)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                  title="Fermer la notification"
                >
                  <X size={15} />
                </button>
              </div>
            );
          }}
        </Toaster>
      </NotificationProvider>
    </SessionProvider>
  );
}
