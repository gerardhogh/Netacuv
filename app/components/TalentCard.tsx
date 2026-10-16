"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, BadgeCheck, CheckCircle, Crown, Flag } from "lucide-react";
import PremiumRequiredModal from "./PremiumRequiredModal";
import ReportModal from "./ReportModal";
import { useTranslations } from "next-intl";

export interface TalentCardProps {
  id?: string | number;
  name: string;
  location: string;
  profession: string;
  imageUrl: string;
  isVerified?: boolean;
  isFavorite?: boolean;
  onFavorite?: (id?: string | number) => void;
  onSendEmail?: (id?: string | number, name?: string) => void;
  onViewProfile?: (id?: string | number) => void;
  /** Override the destination URL for "Voir profil". Defaults to /dashboard/recruteur/talents/[id] */
  profileHref?: string;
  blurSensitive?: boolean;
  isPremium?: boolean;
  hasVideo?: boolean;
}

export default function TalentCard({
  id,
  name,
  location,
  profession,
  imageUrl,
  isVerified = true,
  isFavorite = false,
  onFavorite,
  onSendEmail,
  onViewProfile,
  profileHref,
  blurSensitive = false,
  isPremium = false,
  hasVideo = false,
}: TalentCardProps) {
  const t = useTranslations("talentCard");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const destination = (!blurSensitive && (profileHref || id)) 
    ? (profileHref ?? `/dashboard/recruteur/talents/${id}`) 
    : undefined;

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(imageUrl || "/assets/avatar_africain.jpg");

  // Keep currentSrc in sync if imageUrl prop changes
  if (imageUrl && currentSrc !== imageUrl && currentSrc !== "/assets/avatar_africain.jpg") {
    setCurrentSrc(imageUrl);
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 group">
        {/* Image container */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center z-0">
              <div className="w-12 h-12 rounded-full bg-slate-200/80" />
            </div>
          )}
          <img
            src={currentSrc}
            alt={name}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (currentSrc !== "/assets/avatar_africain.jpg") {
                setCurrentSrc("/assets/avatar_africain.jpg");
              }
              setIsLoaded(true);
            }}
            className={`object-cover object-center w-full h-full group-hover:scale-102 transition-all duration-300 z-10 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${blurSensitive ? 'blur-md select-none' : ''}`}
          />
          {/* Verification badge */}
          {isVerified && (
            <div
              className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full bg-white p-0.5 shadow-sm"
              title={t("certifiedAndVerified")}
            >
              <CheckCircle className="w-5 h-5 text-white fill-emerald-500" />
            </div>
          )}

          {/* Premium badge */}
          {isPremium && (
            <div
              className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2.5 py-1 shadow-md text-[11px] font-bold tracking-wide"
              title={t("certifiedPremium")}
            >
              <Crown className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
              <span>Premium</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Name & Bookmark */}
          <div className="flex justify-between items-start mb-1.5">
            <div className="min-w-0 pr-2">
              <h3 className={`font-bold text-slate-900 text-base leading-snug truncate ${blurSensitive ? 'blur-sm select-none' : ''}`}>
                {blurSensitive ? t("confidentialProfile") : name}
              </h3>
              <p className={`text-xs text-slate-400 mt-0.5 font-normal truncate ${blurSensitive ? 'blur-sm select-none' : ''}`}>
                {blurSensitive ? t("hiddenLocation") : location}
              </p>
            </div>
            <div className="flex items-center gap-0.5 -mr-1 -mt-1 shrink-0">
              <button
                type="button"
                onClick={() => onFavorite?.(id)}
                aria-label={t("addToFavorites")}
                title={t("addToFavorites")}
                className="text-[#32A8D7] hover:text-[#258eb8] p-1 rounded-lg hover:bg-sky-50 transition-colors"
              >
                <Bookmark
                  className="w-5 h-5"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                aria-label={t("reportProfile")}
                title={t("reportProfile")}
                className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profession */}
          <p className="text-xs text-slate-700 font-semibold mb-4 mt-1">
            {t("profession")}{" "}
            <span className="font-normal text-slate-500">{profession}</span>
          </p>

          {/* Action buttons */}
          <div className="mt-auto flex items-center gap-2 w-full pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (blurSensitive) {
                  setShowPremiumModal(true);
                  return;
                }
                if (onSendEmail) {
                  onSendEmail(id, name);
                } else {
                  // Gmail web client fallback if no handler is passed
                  const mail = "candidat@example.com"; // Fallback email since we don't have it in mock
                  const subject = encodeURIComponent(`Contact Candidat ${name || ""}`);
                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${mail}&su=${subject}`;
                  window.open(gmailUrl, "_blank", "noopener,noreferrer");
                }
              }}
              className={`flex-1 py-2 px-2 text-xs font-semibold border rounded-md transition-colors text-center truncate ${
                blurSensitive 
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50 opacity-70'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              {t("sendEmail")}
            </button>

            {destination ? (
              <Link
                href={destination}
                onClick={(e) => {
                  if (onViewProfile) onViewProfile(id);
                }}
                className="flex-1 py-2 px-2 text-xs font-semibold bg-[#32A8D7] hover:bg-[#2896c2] active:bg-[#2283aa] text-white rounded-md transition-colors shadow-xs hover:shadow text-center truncate"
              >
                {t("viewProfile")}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onViewProfile?.(id)}
                className="flex-1 py-2 px-2 text-xs font-semibold bg-[#32A8D7] hover:bg-[#2896c2] active:bg-[#2283aa] text-white rounded-md transition-colors shadow-xs hover:shadow text-center truncate"
              >
                {t("viewProfile")}
              </button>
            )}
          </div>
        </div>
      </div>

      {showPremiumModal && (
        <PremiumRequiredModal 
          onClose={() => setShowPremiumModal(false)} 
          message={t("premiumModalMessage")}
        />
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="TALENT"
        targetId={String(id || "")}
        targetTitle={name}
      />
    </>
  );
}
