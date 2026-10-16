"use client";

import React, { ReactNode } from "react";
import { 
  FileSearch, 
  Plus, 
  Briefcase, 
  Users, 
  Send, 
  FolderOpen, 
  Search, 
  Bell, 
  Receipt,
  Heart
} from "lucide-react";

export type EmptyStateType =
  | "candidatures"
  | "offres"
  | "talents"
  | "transactions"
  | "favoris"
  | "notifications"
  | "recherche"
  | "generic";

export interface EmptyStateProps {
  /** Type of empty state — determines the default icon, title and message */
  type?: EmptyStateType;
  /** Custom title override */
  title?: string;
  /** Custom description override */
  description?: string;
  /** Custom icon override */
  icon?: ReactNode;
  /** Optional CTA button text */
  actionLabel?: string;
  /** CTA click handler */
  onAction?: () => void;
  /** Custom action element (alternative to actionLabel/onAction) */
  actionButton?: ReactNode;
  /** Extra container styling */
  className?: string;
}

const DEFAULTS: Record<EmptyStateType, { icon: ReactNode; title: string; description: string }> = {
  candidatures: {
    icon: <Send className="w-8 h-8 text-[#1e8ae9]" />,
    title: "Aucune candidature pour l'instant",
    description: "Les candidatures reçues apparaîtront ici. Publiez une offre pour recevoir des profils qualifiés.",
  },
  offres: {
    icon: <Briefcase className="w-8 h-8 text-[#1e8ae9]" />,
    title: "Aucune offre publiée",
    description: "Commencez par créer votre première offre d'emploi pour attirer les meilleurs talents.",
  },
  talents: {
    icon: <Users className="w-8 h-8 text-[#1e8ae9]" />,
    title: "Aucun talent trouvé",
    description: "Aucun profil ne correspond à vos critères. Essayez d'élargir votre recherche ou de modifier vos filtres.",
  },
  transactions: {
    icon: <Receipt className="w-8 h-8 text-[#1e8ae9]" />,
    title: "Aucune transaction",
    description: "Votre historique de paiement apparaîtra ici une fois votre premier abonnement ou paiement effectué.",
  },
  favoris: {
    icon: <Heart className="w-8 h-8 text-[#1e8ae9]" />,
    title: "Aucun favori sauvegardé",
    description: "Parcourez les talents ou les offres et sauvegardez ceux qui vous intéressent pour les retrouver facilement.",
  },
  notifications: {
    icon: <Bell className="w-8 h-8 text-[#1e8ae9]" />,
    title: "Aucune notification",
    description: "Vous êtes à jour ! Vos alertes et messages apparaîtront dès qu'une nouvelle activité survient.",
  },
  recherche: {
    icon: <Search className="w-8 h-8 text-[#1e8ae9]" />,
    title: "Aucun résultat trouvé",
    description: "Nous n'avons trouvé aucun résultat correspondant à votre recherche. Essayez d'autres mots-clés.",
  },
  generic: {
    icon: <FolderOpen className="w-8 h-8 text-[#1e8ae9]" />,
    title: "Rien à afficher pour le moment",
    description: "Il n'y a actuellement aucun élément disponible dans cette section.",
  },
};

export function EmptyState({
  type = "generic",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionButton,
  className = "",
}: EmptyStateProps) {
  const defaults = DEFAULTS[type] || DEFAULTS.generic;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center w-full bg-white rounded-3xl border border-slate-100 shadow-sm ${className}`}
    >
      {/* Decorative Badge with Netacuv Branding */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-50/80 border border-blue-100/80 flex items-center justify-center mb-4 shadow-xs">
        {icon || defaults.icon}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight mb-2">
        {title || defaults.title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
        {description || defaults.description}
      </p>

      {actionButton ? (
        <div>{actionButton}</div>
      ) : actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1e8ae9] to-[#32A8D7] hover:from-[#1877c9] hover:to-[#2896c2] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      ) : null}
    </div>
  );
}

export default EmptyState;
