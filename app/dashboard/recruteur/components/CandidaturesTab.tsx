"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Video,
  FileText,
  X,
} from "lucide-react";
import DetailOffreView, { JobDetailData } from "./DetailOffreView";
import ModifierOffreView from "./ModifierOffreView";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import PremiumRequiredModal from "@/app/components/PremiumRequiredModal";

// ─── Mock data ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_CANDIDATURES: unknown[] = [];

const MOCK_JOB: JobDetailData = {
  id: "offre_1",
  title: "Développeur Front-end",
  company: "Grand-G Corp",
  location: "Cotonou, Bénin",
  publishDate: "12/09/2024",
  candidatesCount: 24,
  type: "CDI",
  employees: "50-200 employés",
  contract: "CDI — Temps plein",
  skills: "React, TypeScript, Tailwind CSS",
  status: "Offre en cours",
  description: "Nous recherchons un développeur Front-end passionné pour rejoindre notre équipe. Vous travaillerez sur des projets innovants pour nos clients en Afrique de l'Ouest.",
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatutBadge({ statut, t }: { statut: "Accepté" | "En attente" | "Rejeté"; t: any }) {
  const cfg = {
    Accepté: { label: t("statusAccepted"), bg: "bg-green-50 text-green-600 border-green-100", icon: <CheckCircle size={11} /> },
    "En attente": { label: t("statusPending"), bg: "bg-amber-50 text-amber-600 border-amber-100", icon: <Clock size={11} /> },
    Rejeté: { label: t("statusRejected"), bg: "bg-red-50 text-red-500 border-red-100", icon: <XCircle size={11} /> },
  }[statut] || { label: statut, bg: "bg-slate-50 text-slate-600 border-slate-100", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${cfg.bg}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

interface ApplicationData {
  id: string | number;
  talent: string;
  talentUserId?: string;
  role: string;
  offreId: string;
  offre?: string;
  dateCandidat?: string;
  typeEmploi?: string;
  videoTest?: boolean;
  cvJoint?: boolean;
  statut: "Accepté" | "En attente" | "Rejeté";
  date: string;
  score: number;
  imageUrl: string;
}

interface ApiApplication {
  id: string | number;
  talent?: { userId?: string, user?: { name?: string } };
  jobOffer?: { title?: string };
  jobOfferId: string;
  status: string;
  createdAt: string;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CandidaturesTab() {
  const t = useTranslations("recruiter.applicationsTab");
  type ViewState =
    | { type: "list" }
    | { type: "detail-offre"; offreId: string }
    | { type: "edit-offre" };

  const [view, setView] = useState<ViewState>({ type: "list" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/recruiters/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && data.isPremium !== undefined) {
          setIsPremium(data.isPremium);
        } else if (user?.isPremium) {
          setIsPremium(true);
        }
      })
      .catch(() => {
        if (user?.isPremium) setIsPremium(true);
      });
  }, [user]);

  const handleViewTalent = (talentUserId?: string, tab?: string) => {
    if (!isPremium && user?.role !== "admin") {
      setShowPremiumModal(true);
      return;
    }
    if (talentUserId) {
      router.push(`/dashboard/recruteur/talents/${talentUserId}${tab ? `?tab=${tab}` : ""}`);
    }
  };

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: candidaturesFetched, mutate } = useSWR(`/api/applications?role=recruiter&page=${currentPage}&limit=${pageSize}`, fetcher);
  
  const rawApplications = Array.isArray(candidaturesFetched)
    ? candidaturesFetched
    : (candidaturesFetched?.applications || []);

  const totalCount = candidaturesFetched?.totalCount ?? rawApplications.length;
  const totalPages = candidaturesFetched?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const candidatures: ApplicationData[] = rawApplications.map((app: any) => ({
    id: app.id,
    talent: app.talent?.user?.name || "Talent sans nom",
    talentUserId: app.talent?.userId,
    role: app.jobOffer?.title || "Offre",
    offreId: app.jobOfferId,
    offre: app.jobOffer?.title || "Offre",
    statut: app.status === "PENDING" ? "En attente" : app.status === "ACCEPTED" ? "Accepté" : "Rejeté",
    date: new Date(app.createdAt).toLocaleDateString("fr-FR"),
    dateCandidat: new Date(app.createdAt).toLocaleDateString("fr-FR"),
    typeEmploi: app.jobOffer?.type || "CDI",
    videoTest: !!(app.talent?.videoUrl || (app.talent?.interviewSessions && app.talent.interviewSessions.length > 0 && app.talent.interviewSessions[0].videoRecordings)),
    cvJoint: !!app.talent?.cvUrl,
    score: Math.floor(Math.random() * 20) + 70, // Mock score for now
    imageUrl: app.talent?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.talent?.user?.name || "T")}&background=random`
  }));

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const deleteCandidature = async (id: string | number) => {
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate();
        showToast("Candidature supprimée.");
      } else {
        showToast("Erreur lors de la suppression.");
      }
    } catch (e) {
      showToast("Erreur lors de la suppression.");
    }
  };

  // (Removed inline profile logic)

  // ── Render ──────────────────────────────────────────────────────────────────
  if (view.type === "detail-offre") {
    const matchedApp = rawApplications.find((app: any) => app.jobOfferId === view.offreId);
    const rawJob = matchedApp ? matchedApp.jobOffer : null;
    const selectedJob: JobDetailData = rawJob ? {
      id: rawJob.id || view.offreId,
      title: rawJob.title || "Offre d'emploi",
      company: rawJob.recruiter?.companyName || "Mon Entreprise",
      location: rawJob.location || "Non précisé",
      publishDate: rawJob.createdAt ? new Date(rawJob.createdAt).toLocaleDateString("fr-FR") : undefined,
      candidatesCount: rawJob._count?.applications || rawApplications.filter((a: any) => a.jobOfferId === view.offreId).length,
      type: rawJob.contractType || rawJob.type || "CDI",
      status: rawJob.status || "Offre en cours",
      description: rawJob.description || "",
    } : MOCK_JOB;

    return (
      <DetailOffreView
        job={selectedJob}
        onBack={() => setView({ type: "list" })}
        onEdit={() => setView({ type: "edit-offre" })}
        onDelete={() => { setView({ type: "list" }); showToast("Offre supprimée."); }}
        onViewCandidate={(id) => handleViewTalent(id)}
      />
    );
  }

  if (view.type === "edit-offre") {
    return (
      <ModifierOffreView
        onBack={() => setView({ type: "list" })}
        onSave={() => { showToast("Offre mise à jour avec succès !"); }}
      />
    );
  }

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={16} className="text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Stats badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: candidatures.length, color: "bg-slate-100 text-slate-700" },
          { label: "Actifs", value: 0, color: "bg-green-50 text-green-700" },
          { label: "En attente", value: 0, color: "bg-amber-50 text-amber-700" },
          { label: "Suspendus", value: 0, color: "bg-orange-50 text-orange-700" },
          { label: "Supprimés", value: 0, color: "bg-red-50 text-red-600" },
        ].map((stat) => (
          <span key={stat.label} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${stat.color}`}>
            {stat.value} {stat.label}
          </span>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-slate-200 shadow-sm px-3.5 py-2.5">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            className="flex-1 outline-none text-sm text-slate-700 bg-transparent placeholder:text-slate-400"
            placeholder={t("searchPlaceholder")}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[t("allOffers"), "License", "Genre", "Pays", "Ville"].map((f) => (
            <CustomSelect
              key={f}
              value={f}
              onChange={() => {}}
              options={[f]}
              size="sm"
              className="min-w-[130px]"
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colNo")}</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colTalent")}</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colJobPosted")}</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colApplyDate")}</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colJobType")}</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colStatus")}</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colVideoTest")}</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colCvAttached")}</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {candidatures.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8">
                    <EmptyState
                      type="candidatures"
                      title={t("emptyTitle")}
                      description={t("emptyDesc")}
                    />
                  </td>
                </tr>
              ) : (
                candidatures.map((c, index) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-medium align-middle">
                      {String((currentPage - 1) * pageSize + index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 relative shrink-0">
                          <img
                            src={c.imageUrl}
                            alt={c.talent}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.talent)}&background=32A8D7&color=fff&size=64`;
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{c.talent}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <button
                        onClick={() => setView({ type: "detail-offre", offreId: c.offreId })}
                        className="text-xs font-semibold text-[#32A8D7] hover:underline whitespace-nowrap"
                      >
                        {c.offre}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap align-middle">{c.dateCandidat}</td>
                    <td className="px-4 py-3.5 align-middle">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {c.typeEmploi}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <StatutBadge statut={c.statut} t={t} />
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      {c.videoTest ? (
                        <button
                          onClick={() => handleViewTalent(c.talentUserId, "video")}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#32A8D7] hover:underline cursor-pointer"
                        >
                          <Video size={10} /> {t("yesView")}
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <X size={10} /> {t("no")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      {c.cvJoint ? (
                        <button
                          onClick={() => handleViewTalent(c.talentUserId, "informations")}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#32A8D7] hover:underline cursor-pointer"
                        >
                          <FileText size={10} /> {t("yesView")}
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <X size={10} /> {t("no")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewTalent(c.talentUserId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-[10px] font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Eye size={10} /> {t("view")}
                        </button>
                        {c.statut === "En attente" && (
                          <>
                            <button
                              onClick={async () => {
                                await fetch(`/api/applications/${c.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "ACCEPTED" })
                                });
                                mutate();
                                showToast(t("acceptedToast"));
                              }}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title={t("accept")}
                            >
                              <CheckCircle size={13} />
                            </button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/applications/${c.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "REJECTED" })
                                });
                                mutate();
                                showToast(t("rejectedToast"));
                              }}
                              className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              title={t("reject")}
                            >
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteCandidature(c.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          title={t("delete")}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          itemLabel={t("itemLabel")}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Premium Required Modal */}
      {showPremiumModal && (
        <PremiumRequiredModal
          onClose={() => setShowPremiumModal(false)}
          title="Abonnement Premium Requis"
          message="Pour consulter les profils complets des talents, visionner leurs entretiens vidéo IA et télécharger leurs CVs, vous devez souscrire à l'offre Recruteur Premium."
          upgradeHref="/dashboard/recruteur?tab=premium"
        />
      )}
    </div>
  );
}
