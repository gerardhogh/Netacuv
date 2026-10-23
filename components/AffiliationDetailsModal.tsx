"use client";

import { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Users,
} from "lucide-react";

interface Affilie {
  id: string | number;
  name: string;
  email: string;
  dateInscription?: string;
  statut?: "Validé" | "En attente" | "Profil incomplet" | "Inscrit" | "Inactif" | string;
  gain?: number;
  isEligible?: boolean;
}

interface AffiliationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cagnotte: number;
  referralCode: string;
  affilies: Affilie[];
  onOpenFullProgram?: () => void;
  onCopySuccess?: () => void;
}

export default function AffiliationDetailsModal({
  isOpen,
  onClose,
  cagnotte,
  referralCode,
  affilies,
  onOpenFullProgram,
  onCopySuccess,
}: AffiliationDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://netacuv.com";
  const referralLink = referralCode
    ? `${origin}/inscription?ref=${referralCode}`
    : `${origin}/inscription`;

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard?.writeText(referralLink).catch(() => {});
    setCopied(true);
    if (onCopySuccess) onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const count = affilies.length;
  const countText =
    count === 0
      ? "Aucune personne inscrite pour le moment"
      : count === 1
      ? "1 personne s'est inscrite via votre recommandation."
      : `${count} personnes se sont inscrites via votre recommandation.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        {/* En-tête */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-sky-50 text-[#32A8D7] flex items-center justify-center mx-auto mb-3">
            <Share2 size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Détails de vos parrainages
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {countText}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 mt-2.5">
            <span>Gains disponibles :</span>
            <span className="text-emerald-600 font-bold">{cagnotte.toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Liste des filleuls réels */}
        <div className="max-h-60 overflow-y-auto mb-5 pr-1 divide-y divide-slate-100 border-y border-slate-100">
          {count === 0 ? (
            <div className="py-6 text-center">
              <Users size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                Vous n&apos;avez pas encore de filleuls enregistrés.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Partagez votre lien pour commencer à cumuler 25 FCFA par filleul éligible.
              </p>
            </div>
          ) : (
            affilies.map((f, idx) => {
              const isValide =
                f.statut === "Validé" || f.statut === "Inscrit" || (f.gain ?? 0) > 0;
              return (
                <div
                  key={String(f.id || idx)}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {f.name || "Membre Netacuv"}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      {f.dateInscription && <span>{f.dateInscription} ·</span>}
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isValide ? "text-emerald-600 font-medium" : "text-amber-600"
                        }`}
                      >
                        {isValide ? (
                          <>
                            <CheckCircle2 size={11} /> Validé
                          </>
                        ) : f.statut === "Profil incomplet" ? (
                          <>
                            <AlertCircle size={11} /> Profil incomplet
                          </>
                        ) : (
                          <>
                            <Clock size={11} /> En attente
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-bold shrink-0 ${
                      isValide ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {isValide ? `+${f.gain || 25} FCFA` : "0 FCFA"}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Lien copié !" : "Copier mon lien de parrainage"}</span>
          </button>

          {onOpenFullProgram && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullProgram();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Accéder à l&apos;espace complet d&apos;affiliation</span>
              <ExternalLink size={13} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
