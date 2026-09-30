"use client";

import { FileSearch, Plus, Briefcase, Users, Send } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  /** Type of empty state — determines the default icon and message */
  type?: "candidatures" | "offres" | "talents" | "transactions" | "favoris" | "generic";
  /** Custom title override */
  title?: string;
  /** Custom description override */
  description?: string;
  /** Custom icon override */
  icon?: ReactNode;
  /** Optional CTA button */
  actionLabel?: string;
  /** CTA click handler */
  onAction?: () => void;
}

const DEFAULTS: Record<string, { icon: ReactNode; title: string; description: string }> = {
  candidatures: {
    icon: <Send className="w-10 h-10 text-slate-300" />,
    title: "Aucune candidature pour l'instant",
    description: "Les candidatures reçues apparaîtront ici. Publiez une offre pour recevoir des profils qualifiés.",
  },
  offres: {
    icon: <Briefcase className="w-10 h-10 text-slate-300" />,
    title: "Aucune offre publiée",
    description: "Commencez par créer votre première offre d'emploi pour attirer les meilleurs talents.",
  },
  talents: {
    icon: <Users className="w-10 h-10 text-slate-300" />,
    title: "Aucun talent trouvé",
    description: "Aucun profil ne correspond à vos critères. Essayez de modifier vos filtres de recherche.",
  },
  transactions: {
    icon: <FileSearch className="w-10 h-10 text-slate-300" />,
    title: "Aucune transaction",
    description: "Votre historique de paiement apparaîtra ici une fois votre premier abonnement souscrit.",
  },
  favoris: {
    icon: <Users className="w-10 h-10 text-slate-300" />,
    title: "Aucun favori sauvegardé",
    description: "Parcourez les talents et sauvegardez ceux qui vous intéressent pour les retrouver ici.",
  },
  generic: {
    icon: <FileSearch className="w-10 h-10 text-slate-300" />,
    title: "Rien à afficher",
    description: "Il n'y a aucun élément à afficher pour le moment.",
  },
};

export default function EmptyState({
  type = "generic",
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const defaults = DEFAULTS[type] || DEFAULTS.generic;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Decorative circle */}
      <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-5">
        {icon || defaults.icon}
      </div>

      <h3 className="text-base font-bold text-slate-700 mb-1.5">
        {title || defaults.title}
      </h3>

      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        {description || defaults.description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
