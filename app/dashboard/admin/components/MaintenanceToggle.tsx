"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getMaintenanceMode, toggleMaintenanceMode } from "@/app/actions/maintenance";
import { Wrench, AlertTriangle, CheckCircle2, X, Loader2, Lock, Ban, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function MaintenanceToggle() {
  const t = useTranslations("admin.maintenance");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchStatus() {
      try {
        const status = await getMaintenanceMode();
        setIsMaintenance(status);
      } catch (err) {
        console.error("Erreur lors de la récupération du mode maintenance:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const handleConfirmToggle = async () => {
    setIsSubmitting(true);
    try {
      const newStatus = !isMaintenance;
      await toggleMaintenanceMode(newStatus);
      setIsMaintenance(newStatus);
      setIsModalOpen(false);
      
      if (newStatus) {
        toast.error(t("toastActive"), {
          duration: 5000,
        });
      } else {
        toast.success(t("toastInactive"), {
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Erreur lors du changement de mode maintenance:", err);
      toast.error(t("toastError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Bouton Toggle dans la barre latérale */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          isMaintenance
            ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            : "bg-[#F97316] text-white hover:bg-[#EA580C] shadow-sm"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Wrench size={18} className={isMaintenance ? "text-red-600 animate-pulse" : "text-white"} />
        <span className="truncate">
          {isLoading
            ? t("loading")
            : isMaintenance
            ? t("disableBtn")
            : t("enableBtn")}
        </span>
      </button>

      {/* Modal de Confirmation au centre de l'écran (porté dans document.body pour ne pas être contraint par l'aside transformé) */}
      {mounted && isModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-left animate-scale-up overflow-hidden">
            {/* Header Title + Close */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isMaintenance
                  ? t("disableTitle")
                  : t("enableTitle")}
              </h3>

              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                title={t("close")}
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {isMaintenance
                ? t("disableDesc")
                : t("enableDescFull")}
            </p>

            {/* Impact Details Box */}
            <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700">
              {isMaintenance ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <p className="pt-1">
                      <strong className="text-slate-900 font-semibold">{t("reopenTitle")}</strong> : {t("reopenDesc")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100/80 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5 text-blue-600">
                      <Zap size={16} />
                    </div>
                    <p className="pt-1">
                      <strong className="text-slate-900 font-semibold">{t("aiResumeTitle")}</strong> : {t("aiResumeDesc")}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100/80 border border-amber-200/60 flex items-center justify-center shrink-0 mt-0.5 text-amber-600">
                      <AlertTriangle size={16} />
                    </div>
                    <p className="pt-1">
                      <strong className="text-slate-900 font-semibold">{t("redirectTitle")}</strong> : {t("redirectDesc")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100/80 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5 text-blue-600">
                      <Lock size={16} />
                    </div>
                    <p className="pt-1">
                      <strong className="text-slate-900 font-semibold">{t("adminOnlyTitle")}</strong> : {t("adminOnlyDesc")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100/80 border border-rose-200/60 flex items-center justify-center shrink-0 mt-0.5 text-rose-600">
                      <Ban size={16} />
                    </div>
                    <p className="pt-1">
                      <strong className="text-slate-900 font-semibold">{t("suspensionTitle")}</strong> : {t("suspensionDesc")}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Actions Buttons */}
            <div className="mt-7 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {t("cancel")}
              </button>

              <button
                type="button"
                onClick={handleConfirmToggle}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap ${
                  isMaintenance
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25"
                    : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-red-600/25"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t("processing")}</span>
                  </>
                ) : isMaintenance ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{t("restoreAccessBtn")}</span>
                  </>
                ) : (
                  <>
                    <Wrench size={16} />
                    <span>{t("confirmEnableBtn")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
