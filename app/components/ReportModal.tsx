"use client";

import React, { useState } from "react";
import { Flag, X, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "JOB_OFFER" | "TALENT" | "RECRUITER";
  targetId: string;
  targetTitle: string;
}

const JOB_OFFER_REASONS = [
  "Offre frauduleuse ou tentative d'arnaque",
  "Rémunération ou informations trompeuses",
  "Demande d'argent, d'avance ou de frais de dossier",
  "Contenu offensant, discriminatoire ou illégal",
  "Entreprise inexistante ou usurpation d'identité",
  "Autre motif suspect",
];

const PROFILE_REASONS = [
  "Profil faux ou usurpation d'identité",
  "Informations professionnelles ou compétences trompeuses",
  "Comportement inapproprié, harcèlement ou spam",
  "Tentative d'arnaque ou demande financière",
  "Autre motif suspect",
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const reasons = targetType === "JOB_OFFER" ? JOB_OFFER_REASONS : PROFILE_REASONS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error("Veuillez sélectionner un motif de signalement.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          targetTitle,
          reason: selectedReason,
          details,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      setIsSuccess(true);
      toast.success("Signalement transmis à l'équipe de modération.");

      setTimeout(() => {
        setIsSuccess(false);
        setSelectedReason("");
        setDetails("");
        onClose();
      }, 1800);
    } catch (err: any) {
      toast.error(err.message || "Impossible d'envoyer le signalement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeName =
    targetType === "JOB_OFFER"
      ? "cette offre d'emploi"
      : targetType === "TALENT"
      ? "ce profil candidat"
      : "cette entreprise";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-50 to-orange-50/50 border-b border-rose-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-200/60 shadow-xs">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Signaler {typeName}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                {targetTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-100 shadow-sm animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">
              Signalement bien reçu
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Merci pour votre vigilance. Nos équipes de modération analysent ce contenu afin de garantir la sécurité de la communauté Netacuv.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Aidez-nous à comprendre le problème. Votre signalement est 100% anonyme et sera traité par notre équipe de modération.
            </p>

            {/* Motifs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Motif principal <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {reasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason
                        ? "bg-rose-50/60 border-rose-300 text-rose-900 font-semibold shadow-xs"
                        : "border-slate-200/80 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Précisions facultatives */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Détails complémentaires (facultatif)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Expliquez ce qui vous semble suspect ou ajoutez des détails pour les modérateurs..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!selectedReason || isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Flag size={13} />
                    <span>Envoyer le signalement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
