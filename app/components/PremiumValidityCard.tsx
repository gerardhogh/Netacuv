"use client";

import { useLocale } from "next-intl";
import { Crown, Sparkles, Calendar, Clock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export interface PremiumInfoData {
  isPremium: boolean;
  planName?: string;
  premiumStartedAt?: string | null;
  premiumExpiresAt?: string | null;
  daysRemaining?: number;
  isExpired?: boolean;
  amount?: number;
  paymentMethod?: string;
  totalCycleDays?: number;
}

interface PremiumValidityCardProps {
  role: "TALENT" | "RECRUTEUR";
  premiumInfo?: PremiumInfoData | null;
  variant?: "vertical" | "horizontal";
  className?: string;
}

export default function PremiumValidityCard({
  role,
  premiumInfo,
  variant = "vertical",
  className = "",
}: PremiumValidityCardProps) {
  const locale = useLocale();
  const isEn = locale === "en";
  const dateLocale = isEn ? "en-US" : "fr-FR";

  const isPremium = Boolean(premiumInfo?.isPremium);
  const isRecruiter = role === "RECRUTEUR";
  const upgradeUrl = isRecruiter
    ? "/dashboard/recruteur?tab=premium#premium"
    : "/dashboard/talent?tab=premium#premium";

  const priceText = isRecruiter ? "1 000 FCFA / mois" : "700 FCFA / mois";

  // Formattage date expiration
  let formattedExpiryDate = "";
  if (premiumInfo?.premiumExpiresAt) {
    try {
      const expDate = new Date(premiumInfo.premiumExpiresAt);
      formattedExpiryDate = expDate.toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      formattedExpiryDate = "";
    }
  }

  const daysRemaining = typeof premiumInfo?.daysRemaining === "number" ? premiumInfo.daysRemaining : 0;
  const totalDays = premiumInfo?.totalCycleDays || 30;
  const percentRemaining = Math.max(0, Math.min(100, Math.round((daysRemaining / totalDays) * 100)));

  // État : Premium Actif
  if (isPremium && formattedExpiryDate) {
    const isUrgent = daysRemaining <= 5;

    if (variant === "horizontal") {
      return (
        <div
          className={`relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 p-5 md:p-6 shadow-sm transition-all hover:shadow-md ${className}`}
        >
          {/* Subtle decorative glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-sm">
                  <Crown size={19} className="fill-white/20" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    {premiumInfo?.planName || (isRecruiter ? "Abonnement Recruteur Premium" : "Abonnement Talent Premium")}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isEn ? "Monthly recurring validity (30 days)" : "Validité mensuelle de 30 jours"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 ml-auto md:ml-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isEn ? "Active" : "Actif"}
                </span>
              </div>

              {/* Validity details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2.5 rounded-xl bg-white/80 border border-amber-100 px-3.5 py-2">
                  <Calendar size={16} className="text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-500 block leading-tight">{isEn ? "Valid until" : "Valide jusqu'au"}</span>
                    <span className="font-bold text-slate-800 leading-tight">{formattedExpiryDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl bg-white/80 border border-amber-100 px-3.5 py-2">
                  <Clock size={16} className={isUrgent ? "text-amber-600 shrink-0" : "text-slate-500 shrink-0"} />
                  <div className="text-xs flex-1">
                    <span className="text-slate-500 block leading-tight">{isEn ? "Days remaining" : "Temps restant"}</span>
                    <span className={`font-bold leading-tight ${isUrgent ? "text-amber-700 font-black" : "text-slate-800"}`}>
                      {daysRemaining} {daysRemaining > 1 ? (isEn ? "days" : "jours") : (isEn ? "day" : "jour")}
                      {isUrgent && (isEn ? " (Expires soon)" : " (Renouvellement conseillé)")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>{isEn ? "Cycle progress" : "Cycle d'abonnement"}</span>
                  <span>{percentRemaining}% {isEn ? "remaining" : "restant"}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUrgent
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-[#32A8D7] to-blue-500"
                    }`}
                    style={{ width: `${percentRemaining}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:self-center">
              <Link
                href={upgradeUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-600 hover:shadow-lg transition-all"
              >
                <Sparkles size={15} />
                <span>{isEn ? "Extend / Renew" : "Prolonger l'offre"}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Vertical variant (for sidebar / left column in profiles)
    return (
      <div
        className={`w-full relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 p-4 shadow-sm text-left transition-all ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-xs">
              <Crown size={15} />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {isEn ? "Premium Active" : "Offre Premium Active"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isEn ? "Active" : "Actif"}
          </span>
        </div>

        <div className="space-y-2 mb-3 bg-white/80 rounded-xl p-2.5 border border-amber-100/80 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={13} className="text-amber-600 shrink-0" />
            <span>
              {isEn ? "Valid until:" : "Valide jusqu'au :"} <strong className="text-slate-800">{formattedExpiryDate}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock size={13} className={isUrgent ? "text-amber-600 shrink-0" : "text-slate-400 shrink-0"} />
            <span>
              {isEn ? "Remaining:" : "Restant :"} <strong className={isUrgent ? "text-amber-700 font-bold" : "text-slate-800"}>{daysRemaining} {isEn ? "days" : "jours"}</strong>
            </span>
          </div>
        </div>

        {/* Mini progress */}
        <div className="space-y-1 mb-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                isUrgent ? "bg-amber-500" : "bg-[#008de4]"
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>

        <Link
          href={upgradeUrl}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-xs shadow-xs transition-all text-center"
        >
          <Sparkles size={13} />
          <span>{isEn ? "Renew (+30 days)" : "Prolonger (+30 jours)"}</span>
        </Link>
      </div>
    );
  }

  // État : Non Premium / Gratuit
  if (variant === "horizontal") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm transition-all hover:border-slate-300 ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <ShieldCheck size={19} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {isEn ? "Standard Free Plan" : "Formule Standard Gratuite"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isRecruiter
                    ? (isEn
                        ? "Upgrade to Recruiter Premium for unlimited access to validated video talents."
                        : "Passez au Forfait Recruteur Premium pour débloquer l'accès complet au vivier certifié.")
                    : (isEn
                        ? "Upgrade to Talent Premium for unlimited AI tests, certified badge and priority applications."
                        : "Passez au Forfait Talent Premium pour les candidatures illimitées, badge certifié et export CV.")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:self-center">
            <Link
              href={upgradeUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-xs font-bold text-white shadow-md hover:from-amber-500 hover:to-orange-600 transition-all"
            >
              <Crown size={15} />
              <span>{isEn ? `Upgrade to Premium (${priceText})` : `Activer l'offre Premium (${priceText})`}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vertical variant (for sidebar)
  return (
    <div
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-xs text-left ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-slate-500" />
          {isEn ? "Standard Plan" : "Formule Standard"}
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
          {isEn ? "Free" : "Gratuit"}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
        {isRecruiter
          ? (isEn
              ? "Access full candidate evaluations and AI video recordings with Premium."
              : "Accédez aux vidéos et évaluations complètes des talents avec le Premium.")
          : (isEn
              ? "Unlock CV updates, priority ranking and AI evaluation features with Premium."
              : "Débloquez l'actualisation de votre CV et le badge certifié avec le Premium.")}
      </p>
      <Link
        href={upgradeUrl}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-xs shadow-xs transition-all text-center"
      >
        <Crown size={13} />
        <span>{isEn ? `Go Premium (${priceText})` : `Passer au Premium (${priceText})`}</span>
      </Link>
    </div>
  );
}
