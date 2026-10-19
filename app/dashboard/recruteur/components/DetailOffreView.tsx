"use client";

import { useState } from "react";
import { ArrowLeft, Share2, Trash2, Edit3, CheckCircle } from "lucide-react";
import TalentCard from "@/app/components/TalentCard";
import { useAuth } from "../../../context/AuthContext";
import useSWR from "swr";
import { useTranslations, useLocale } from "next-intl";
import { ConfirmModal } from "@/app/components/ui/Modal";

export interface JobDetailData {
  id: string | number;
  title: string;
  company?: string;
  location: string;
  publishDate?: string;
  candidatesCount?: number;
  type?: string;
  employees?: string;
  contract?: string;
  skills?: string;
  status: "Offre en cours" | "Clôturée" | "PUBLISHED" | "DRAFT" | string;
  description: string;
  _count?: { applications: number };
  candidatures?: number;
}

interface DetailOffreViewProps {
  job?: JobDetailData;
  emploi?: any;
  onBack: () => void;
  onEdit?: () => void;
  onModifier?: () => void;
  onDelete?: () => void;
  onSupprimer?: () => void;
  onCloturer?: () => void;
  onActiver?: () => void;
  onProlonger?: () => void;
  onViewCandidate?: (candidateId: string) => void;
}

export default function DetailOffreView({
  job,
  emploi,
  onBack,
  onEdit,
  onModifier,
  onDelete,
  onSupprimer,
  onCloturer,
  onActiver,
  onProlonger,
  onViewCandidate,
}: DetailOffreViewProps) {
  const t = useTranslations("recruiter.detailJob");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const { user } = useAuth();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const effectiveInputJob = job || emploi;
  const [isClosed, setIsClosed] = useState(effectiveInputJob?.status === "Clôturée" || effectiveInputJob?.status === "CLOSED");
  const [confirmModalType, setConfirmModalType] = useState<"close" | "reopen" | "delete" | null>(null);

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: fullJobData } = useSWR(effectiveInputJob?.id ? `/api/jobs/${effectiveInputJob.id}` : null, fetcher);
  const activeJob = fullJobData && !fullJobData.error ? fullJobData : effectiveInputJob;

  const title = activeJob?.title || activeJob?.titre || (locale === "en" ? "Job offer" : "Offre d'emploi");
  const company = activeJob?.company || activeJob?.recruiter?.companyName || "Mon Entreprise";
  const location = activeJob?.location || activeJob?.lieu || "Non précisé";
  const publishDate = activeJob?.publishDate || (activeJob?.createdAt ? new Date(activeJob.createdAt).toLocaleDateString("fr-FR") : "Récent");
  const candidatesCount = activeJob?._count?.applications || activeJob?.candidatures || 0;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleCloturer = async () => {
    try {
      const newStatus = isClosed ? "PUBLISHED" : "CLOSED";
      if (activeJob?.id) {
        await fetch(`/api/jobs/${activeJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      }
      setIsClosed(!isClosed);
      showToast(isClosed ? t("reopenedSuccess") : t("closedSuccess"));
    } catch {
      showToast("Erreur lors de la mise à jour");
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmModalType) return;
    const type = confirmModalType;
    setConfirmModalType(null);
    if (type === "delete") {
      if (onSupprimer) onSupprimer();
      else if (onDelete) onDelete();
    } else {
      await handleToggleCloturer();
    }
  };

  const { data: candidaturesFetched = [] } = useSWR(activeJob?.id ? `/api/applications?jobOfferId=${activeJob.id}` : null, fetcher);
  
  const rawCandList = Array.isArray(candidaturesFetched) 
    ? candidaturesFetched 
    : (candidaturesFetched?.applications || []);

  const candidates = rawCandList.map((app: any) => ({
    id: app.talent?.userId || app.talentId || app.id,
    name: app.talent?.user?.name || "Talent sans nom",
    location: app.talent?.location || app.talent?.user?.location || "Non spécifié",
    profession: app.talent?.profession || "Candidat",
    imageUrl: app.talent?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.talent?.user?.name || "T")}&background=random`,
    isVerified: true,
  }));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={18} className="text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Breadcrumb & Retour */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#32A8D7] transition-colors"
          >
            {tNav("home")}
          </button>
          <span>&rsaquo;</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#32A8D7] transition-colors"
          >
            {t("candidatesApplied")}
          </button>
          <span>&rsaquo;</span>
          <span className="text-slate-500 font-medium">{t("jobDescription")}</span>
          <span>&rsaquo;</span>
          <span className="text-slate-800 font-bold">{title}</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#32A8D7] hover:underline"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </button>
      </div>

      {/* ── CARD 1: EN-TÊTE DE L'OFFRE ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">
              {locale === "en" ? `Published on: ${publishDate} · ${candidatesCount} candidate(s)` : `Publié le: ${publishDate} · ${candidatesCount} candidat(s)`}
            </p>
            <h2 className="text-2xl font-bold text-[#0088cc] tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {locale === "en" ? "Company:" : "Entreprise :"} <span className="font-semibold">{company}</span> - {locale === "en" ? "Location:" : "Localisation :"} <span className="font-semibold">{location}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/dashboard/talent?tab=emplois&jobId=${emploi.id}`;
              if (navigator.share) {
                navigator.share({ title: emploi.titre || emploi.title || "Offre d'emploi Netacuv", url }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(url);
                showToast(locale === "en" ? "Job offer link copied to clipboard!" : "Lien de l'offre copié dans le presse-papier !");
              }
            }}
            className="p-2.5 rounded-full bg-sky-50 text-[#32A8D7] hover:bg-sky-100 transition-colors cursor-pointer"
            title={t("share")}
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Détails complémentaires */}
        <div className="pt-2 text-xs text-slate-600 space-y-1.5">
          <p>{locale === "en" ? "Full time" : "Temps plein"}</p>
          <p>{locale === "en" ? "1-10 employees" : "1-10 employés"}</p>
          <p>{t("contract")} : CDI</p>
          <p>{t("skills")} : JavaScript, Vue.js...</p>
        </div>

        {/* Statut & Bouton Clôturer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isClosed ? "bg-red-500" : "bg-amber-400"}`} />
            <span className="text-xs font-semibold text-slate-700">
              {isClosed ? t("statusClosed") : t("statusOpen")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isClosed && onCloturer) {
                onCloturer();
              } else if (isClosed && onActiver) {
                onActiver();
              } else {
                setConfirmModalType(isClosed ? "reopen" : "close");
              }
            }}
            className={`px-6 py-2 rounded-md text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer ${
              isClosed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#32A8D7] hover:bg-[#2896c2]"
            }`}
          >
            {isClosed ? t("reopen") : t("close")}
          </button>
        </div>
      </div>

      {/* ── CARD 2: DESCRIPTION DE L'OFFRE ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#0071a2]">
          {t("jobDescription")}
        </h3>
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
          <p>
            {activeJob?.description || (locale === "en" 
              ? "We are seeking a talented Front-end Developer to join our dynamic team. You will contribute to creating innovative web applications for our global clients." 
              : "Nous recherchons un Développeur Front-end talentueux pour rejoindre notre équipe dynamique.")}
          </p>
        </div>
      </div>

      {/* ── CARD 3: CANDIDATS POSTULÉS ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#0071a2]">
            {t("candidatesApplied")}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {locale === "en" ? `${candidatesCount} applications received` : `${candidatesCount} candidatures reçues`}
          </p>
        </div>

        {/* Grille de candidats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {candidates.map((c: any) => (
            <TalentCard
              key={c.id}
              id={c.id}
              name={c.name}
              location={c.location}
              profession={c.profession}
              imageUrl={c.imageUrl}
              isVerified={c.isVerified}
              onViewProfile={() => onViewCandidate?.(c.id)}
              blurSensitive={!user?.isPremium}
            />
          ))}
        </div>
      </div>

      {/* ── ACTIONS INFÉRIEURES ── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-8">
        <button
          type="button"
          onClick={() => {
            if (onSupprimer) onSupprimer();
            else setConfirmModalType("delete");
          }}
          className="w-full sm:w-64 py-2.5 px-6 border border-red-400 text-red-500 hover:bg-red-50 font-semibold text-xs rounded-md transition-colors text-center cursor-pointer"
        >
          {t("delete")}
        </button>
        <button
          type="button"
          onClick={() => {
            if (onModifier) onModifier();
            else if (onEdit) onEdit();
          }}
          className="w-full sm:w-64 py-2.5 px-6 bg-[#32A8D7] hover:bg-[#2896c2] text-white font-semibold text-xs rounded-md transition-colors text-center shadow-xs cursor-pointer"
        >
          {t("edit")}
        </button>
      </div>

      {/* ── Modal de confirmation ── */}
      {confirmModalType && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmModalType(null)}
          onConfirm={executeConfirmAction}
          variant={
            confirmModalType === "delete"
              ? "danger"
              : confirmModalType === "close"
              ? "warning"
              : "primary"
          }
          title={
            confirmModalType === "delete"
              ? (locale === "en" ? "Delete job offer" : "Supprimer l'offre d'emploi")
              : confirmModalType === "close"
              ? (locale === "en" ? "Close job offer" : "Clôturer l'offre d'emploi")
              : (locale === "en" ? "Reopen job offer" : "Réouvrir l'offre d'emploi")
          }
          message={
            confirmModalType === "delete"
              ? (locale === "en"
                  ? `Are you sure you want to permanently delete the offer "${title}"? This action cannot be undone.`
                  : `Êtes-vous sûr de vouloir supprimer définitivement l'offre "${title}" ? Cette action est irréversible.`)
              : confirmModalType === "close"
              ? (locale === "en"
                  ? `Are you sure you want to close the offer "${title}"? Candidates will no longer be able to apply.`
                  : `Êtes-vous sûr de vouloir clôturer l'offre "${title}" ? Les candidats ne pourront plus postuler.`)
              : (locale === "en"
                  ? `Are you sure you want to reopen and publish the offer "${title}"?`
                  : `Êtes-vous sûr de vouloir réouvrir et publier l'offre "${title}" aux talents ?`)
          }
          confirmLabel={
            confirmModalType === "delete"
              ? (locale === "en" ? "Delete permanently" : "Supprimer définitivement")
              : confirmModalType === "close"
              ? (locale === "en" ? "Close offer" : "Clôturer l'offre")
              : (locale === "en" ? "Reopen offer" : "Réouvrir l'offre")
          }
          cancelLabel={locale === "en" ? "Cancel" : "Annuler"}
        />
      )}
    </div>
  );
}
