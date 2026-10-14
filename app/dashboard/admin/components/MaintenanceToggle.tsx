"use client";

import React, { useState, useEffect } from "react";
import { getMaintenanceMode, toggleMaintenanceMode } from "@/app/actions/maintenance";
import { Wrench, AlertTriangle, CheckCircle2, X, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function MaintenanceToggle() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
        toast.error("Mode maintenance ACTIVÉ. Le site public est désormais inaccessible aux utilisateurs.", {
          duration: 5000,
        });
      } else {
        toast.success("Mode maintenance DÉSACTIVÉ. La plateforme est de nouveau accessible à tous.", {
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Erreur lors du changement de mode maintenance:", err);
      toast.error("Impossible de modifier le mode maintenance. Veuillez réessayer.");
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
            ? "Chargement..."
            : isMaintenance
            ? "Désactiver maintenance"
            : "Activer maintenance"}
        </span>
      </button>

      {/* Modal de Confirmation au centre de l'écran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-left animate-scale-up overflow-hidden">
            {/* Header Icon + Close */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isMaintenance
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200 shadow-sm"
                }`}
              >
                {isMaintenance ? (
                  <CheckCircle2 size={28} />
                ) : (
                  <ShieldAlert size={28} className="animate-pulse" />
                )}
              </div>

              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Titre et Explication */}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isMaintenance
                  ? "Désactiver le mode maintenance ?"
                  : "Activer le mode maintenance ?"}
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                {isMaintenance
                  ? "Vous êtes sur le point de rouvrir l'accès à la plateforme Netacuv."
                  : "Vous êtes sur le point de verrouiller l'accès public à la plateforme Netacuv. Voici ce que cela implique :"}
              </p>
            </div>

            {/* Impact Details Box */}
            <div className="mt-5 space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700">
              {isMaintenance ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-base mt-0.5">✅</span>
                    <p>
                      <strong>Réouverture immédiate</strong> : Tous les visiteurs, candidats et recruteurs pourront à nouveau se connecter, postuler et utiliser les services.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-base mt-0.5">🚀</span>
                    <p>
                      <strong>Reprise des processus IA</strong> : Les entretiens vidéo intelligents et les évaluations automatiques reprendront normalement.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold text-base mt-0.5">⚠️</span>
                    <p>
                      <strong>Redirection générale immédiate</strong> : Tous les visiteurs, talents et recruteurs non-administrateurs seront automatiquement redirigés vers l'écran de maintenance.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-base mt-0.5">🔒</span>
                    <p>
                      <strong>Accès réservé aux administrateurs</strong> : Seuls les comptes avec un rôle d'administrateur connecté pourront continuer à accéder au dashboard et aux réglages.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-rose-600 font-bold text-base mt-0.5">🛑</span>
                    <p>
                      <strong>Suspension des actions</strong> : Aucun candidat ne pourra passer d'entretien vidéo ni postuler, et aucune offre ne pourra être publiée pendant la durée de la maintenance.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Actions Buttons */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmToggle}
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 ${
                  isMaintenance
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25"
                    : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-red-600/25"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Traitement en cours...
                  </>
                ) : isMaintenance ? (
                  <>
                    <CheckCircle2 size={16} />
                    Rétablir l'accès public
                  </>
                ) : (
                  <>
                    <Wrench size={16} />
                    Confirmer l'activation de la maintenance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
