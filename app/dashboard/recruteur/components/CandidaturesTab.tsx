"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Video,
  FileText,
  X,
  LayoutGrid,
  List,
  Sparkles,
  MapPin,
  Briefcase,
  Calendar,
  Filter,
  Check,
} from "lucide-react";
import DetailOffreView, { JobDetailData } from "./DetailOffreView";
import ModifierOffreView from "./ModifierOffreView";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import PremiumRequiredModal from "@/app/components/PremiumRequiredModal";
import { extractProfession } from "@/lib/talents";
import { formatTableId } from "@/lib/formatTableId";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatutBadge({ statut, t }: { statut: "Accepté" | "En attente" | "Rejeté"; t: any }) {
  const cfg = {
    Accepté: { label: t("statusAccepted"), bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle size={12} /> },
    "En attente": { label: t("statusPending"), bg: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={12} /> },
    Rejeté: { label: t("statusRejected"), bg: "bg-rose-50 text-rose-600 border-rose-200", icon: <XCircle size={12} /> },
  }[statut] || { label: statut, bg: "bg-slate-50 text-slate-600 border-slate-200", icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${cfg.bg}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

interface ApplicationData {
  id: string;
  talent: string;
  talentUserId?: string;
  profession: string;
  location: string;
  role: string;
  offreId: string;
  offre: string;
  dateCandidat: string;
  typeEmploi: string;
  videoTest: boolean;
  cvJoint: boolean;
  cvUrl?: string | null;
  rawStatus: string;
  statut: "Accepté" | "En attente" | "Rejeté";
  date: string;
  score: number | null;
  imageUrl: string;
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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");
  const [selectedOfferFilter, setSelectedOfferFilter] = useState<string>("ALL");
  const [displayMode, setDisplayMode] = useState<"table" | "grid">("table");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const fetcher = (url: string) => fetch(url, { headers: { "Cache-Control": "no-cache" } }).then(res => res.json());
  const { data: candidaturesFetched, mutate, isLoading } = useSWR(
    `/api/applications?role=recruiter&page=${currentPage}&limit=${pageSize}`,
    fetcher
  );
  
  const rawApplications = useMemo(() => {
    return Array.isArray(candidaturesFetched)
      ? candidaturesFetched
      : (candidaturesFetched?.applications || []);
  }, [candidaturesFetched]);

  const totalCount = candidaturesFetched?.totalCount ?? rawApplications.length;
  const totalPages = candidaturesFetched?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const allCandidatures: ApplicationData[] = useMemo(() => {
    return rawApplications.map((app: any) => ({
      id: String(app.id),
      talent: app.talent?.user?.name || "Talent sans nom",
      talentUserId: app.talent?.userId,
      profession: extractProfession(app.talent),
      location: app.talent?.city && app.talent?.country
        ? `${app.talent.city}, ${app.talent.country}`
        : (app.talent?.city || app.talent?.country || "Non précisé"),
      role: app.jobOffer?.title || "Offre d'emploi",
      offreId: app.jobOfferId,
      offre: app.jobOffer?.title || "Offre d'emploi",
      rawStatus: app.status || "PENDING",
      statut: app.status === "ACCEPTED" ? "Accepté" : app.status === "REJECTED" ? "Rejeté" : "En attente",
      date: new Date(app.createdAt).toLocaleDateString("fr-FR"),
      dateCandidat: new Date(app.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      typeEmploi: app.jobOffer?.contractType || app.jobOffer?.type || "CDI",
      videoTest: !!(app.talent?.videoUrl || (app.talent?.interviewSessions && app.talent.interviewSessions.length > 0 && (app.talent.interviewSessions[0].videoRecordings || app.talent.interviewSessions[0].aiScore))),
      cvJoint: !!app.talent?.cvUrl,
      cvUrl: app.talent?.cvUrl || null,
      score: app.talent?.interviewSessions?.[0]?.aiScore ?? null,
      imageUrl: app.talent?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.talent?.user?.name || "T")}&background=32A8D7&color=fff&size=80`
    }));
  }, [rawApplications]);

  // Unique job offers for filter dropdown
  const uniqueJobOffers = useMemo(() => {
    const map = new Map<string, string>();
    allCandidatures.forEach((c) => {
      if (c.offreId && c.offre) {
        map.set(c.offreId, c.offre);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [allCandidatures]);

  // Real Stats
  const stats = useMemo(() => {
    return {
      total: allCandidatures.length,
      pending: allCandidatures.filter(c => c.rawStatus === "PENDING").length,
      accepted: allCandidatures.filter(c => c.rawStatus === "ACCEPTED").length,
      rejected: allCandidatures.filter(c => c.rawStatus === "REJECTED").length,
    };
  }, [allCandidatures]);

  // Filtered candidatures
  const filteredCandidatures = useMemo(() => {
    return allCandidatures.filter((c) => {
      // Status filter
      if (statusFilter !== "ALL" && c.rawStatus !== statusFilter) {
        return false;
      }
      // Offer filter
      if (selectedOfferFilter !== "ALL" && c.offreId !== selectedOfferFilter) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.talent.toLowerCase().includes(q);
        const matchProfession = c.profession.toLowerCase().includes(q);
        const matchOffer = c.offre.toLowerCase().includes(q);
        const matchLocation = c.location.toLowerCase().includes(q);
        return matchName || matchProfession || matchOffer || matchLocation;
      }
      return true;
    });
  }, [allCandidatures, statusFilter, selectedOfferFilter, searchQuery]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpdateStatus = async (id: string, newStatus: "ACCEPTED" | "REJECTED" | "PENDING") => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await mutate();
        showToast(newStatus === "ACCEPTED" ? t("acceptedToast") : t("rejectedToast"));
      } else {
        showToast("Erreur lors de la mise à jour de la candidature.");
      }
    } catch {
      showToast("Erreur lors de la mise à jour.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteCandidature = async (id: string | number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette candidature ?")) return;
    setActionLoadingId(String(id));
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        await mutate();
        showToast("Candidature supprimée avec succès.");
      } else {
        showToast("Erreur lors de la suppression.");
      }
    } catch {
      showToast("Erreur lors de la suppression.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Render Detail Offre view ────────────────────────────────────────────────
  if (view.type === "detail-offre") {
    const matchedApp = rawApplications.find((app: any) => app.jobOfferId === view.offreId);
    const rawJob = matchedApp ? matchedApp.jobOffer : null;
    const selectedJob: JobDetailData = {
      id: rawJob?.id || view.offreId,
      title: rawJob?.title || "Offre d'emploi",
      company: rawJob?.recruiter?.companyName || "Mon Entreprise",
      location: rawJob?.location || "Non précisé",
      publishDate: rawJob?.createdAt ? new Date(rawJob.createdAt).toLocaleDateString("fr-FR") : undefined,
      candidatesCount: rawJob?._count?.applications || rawApplications.filter((a: any) => a.jobOfferId === view.offreId).length,
      type: rawJob?.contractType || rawJob?.type || "CDI",
      status: rawJob?.status || "Offre en cours",
      description: rawJob?.description || "",
    };

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
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gestion des Candidatures</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivez, évaluez et répondez aux talents qui ont postulé à vos offres d'emploi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => setDisplayMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              displayMode === "table"
                ? "bg-white text-[#32A8D7] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List size={14} />
            <span>Tableau</span>
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              displayMode === "grid"
                ? "bg-white text-[#32A8D7] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid size={14} />
            <span>Cartes</span>
          </button>
        </div>
      </div>

      {/* Interactive Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-[#32A8D7] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>Toutes</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "ALL" ? "bg-white/20 text-white" : "bg-white text-slate-700"}`}>
            {stats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "PENDING"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
          }`}
        >
          <Clock size={12} />
          <span>En attente</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "PENDING" ? "bg-white/20 text-white" : "bg-white text-amber-800"}`}>
            {stats.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("ACCEPTED")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "ACCEPTED"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <CheckCircle size={12} />
          <span>Acceptées</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "ACCEPTED" ? "bg-white/20 text-white" : "bg-white text-emerald-800"}`}>
            {stats.accepted}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("REJECTED")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "REJECTED"
              ? "bg-rose-500 text-white shadow-xs"
              : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
          }`}
        >
          <XCircle size={12} />
          <span>Rejetées</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "REJECTED" ? "bg-white/20 text-white" : "bg-white text-rose-800"}`}>
            {stats.rejected}
          </span>
        </button>
      </div>

      {/* Search & Select Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1 flex items-center gap-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs px-3.5 py-2.5 focus-within:border-[#32A8D7] focus-within:ring-2 focus-within:ring-[#32A8D7]/15 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-800 bg-transparent placeholder:text-slate-400"
            placeholder="Rechercher par nom de candidat, profession, offre..."
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Job offer dropdown filter */}
        {uniqueJobOffers.length > 0 && (
          <div className="sm:w-72">
            <select
              value={selectedOfferFilter}
              onChange={(e) => setSelectedOfferFilter(e.target.value)}
              className="w-full bg-white text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 shadow-2xs px-3 py-2.5 outline-none focus:border-[#32A8D7] cursor-pointer"
            >
              <option value="ALL">Toutes les offres d'emploi ({uniqueJobOffers.length})</option>
              {uniqueJobOffers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── LIST RENDER ── */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <div className="w-8 h-8 border-3 border-[#32A8D7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Chargement des candidatures...</p>
        </div>
      ) : filteredCandidatures.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <EmptyState
            type="candidatures"
            title={searchQuery || statusFilter !== "ALL" ? "Aucun résultat trouvé" : t("emptyTitle")}
            description={
              searchQuery || statusFilter !== "ALL"
                ? "Aucune candidature ne correspond à vos filtres actuels. Essayez de réinitialiser vos critères de recherche."
                : t("emptyDesc")
            }
          />
          {(searchQuery || statusFilter !== "ALL" || selectedOfferFilter !== "ALL") && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setSelectedOfferFilter("ALL");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      ) : displayMode === "table" ? (
        /* ── TABLE VIEW ── */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Candidat</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Offre d'emploi</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date de postulation</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Statut</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Entretien IA / Vidéo</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">CV</th>
                  <th className="text-right px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidatures.map((c, index) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-[#0071a2] font-mono font-bold align-middle whitespace-nowrap">
                      {formatTableId(c.id, (currentPage - 1) * pageSize + index + 1)}
                    </td>

                    {/* Talent info */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 relative shrink-0 ring-1 ring-slate-200">
                          <img
                            src={c.imageUrl}
                            alt={c.talent}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.talent)}&background=32A8D7&color=fff&size=80`;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => handleViewTalent(c.talentUserId)}
                            className="text-xs font-bold text-slate-900 hover:text-[#32A8D7] transition-colors truncate block text-left cursor-pointer"
                          >
                            {c.talent}
                          </button>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {c.profession}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={9} />
                            <span>{c.location}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Job offer applied */}
                    <td className="px-4 py-3.5 align-middle">
                      <button
                        type="button"
                        onClick={() => setView({ type: "detail-offre", offreId: c.offreId })}
                        className="text-xs font-semibold text-[#0088cc] hover:underline block max-w-[200px] truncate text-left cursor-pointer"
                        title={c.offre}
                      >
                        {c.offre}
                      </button>
                    </td>

                    {/* Application Date */}
                    <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap align-middle">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar size={12} className="text-slate-400" />
                        {c.dateCandidat}
                      </span>
                    </td>

                    {/* Contract type */}
                    <td className="px-4 py-3.5 align-middle">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {c.typeEmploi}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5 align-middle">
                      <StatutBadge statut={c.statut} t={t} />
                    </td>

                    {/* AI Video Test */}
                    <td className="px-4 py-3.5 align-middle">
                      {c.videoTest ? (
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            type="button"
                            onClick={() => handleViewTalent(c.talentUserId, "video")}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#32A8D7] hover:underline cursor-pointer"
                          >
                            <Video size={12} />
                            <span>Entretien disponible</span>
                          </button>
                          {c.score !== null && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                              <Sparkles size={10} />
                              Note IA: {c.score}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          <X size={12} /> Non passé
                        </span>
                      )}
                    </td>

                    {/* Attached CV */}
                    <td className="px-4 py-3.5 align-middle">
                      {c.cvJoint ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (c.cvUrl) {
                              window.open(c.cvUrl, "_blank");
                            } else {
                              handleViewTalent(c.talentUserId, "informations");
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#32A8D7] hover:underline cursor-pointer"
                        >
                          <FileText size={12} />
                          <span>Consulter</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          <X size={12} /> Aucun
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 align-middle text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewTalent(c.talentUserId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                        >
                          <Eye size={12} />
                          <span>Profil</span>
                        </button>

                        {c.rawStatus === "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={actionLoadingId === c.id}
                              onClick={() => handleUpdateStatus(c.id, "ACCEPTED")}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Accepter cette candidature"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={actionLoadingId === c.id}
                              onClick={() => handleUpdateStatus(c.id, "REJECTED")}
                              className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Rejeter cette candidature"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          disabled={actionLoadingId === c.id}
                          onClick={() => deleteCandidature(c.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Supprimer la candidature"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
      ) : (
        /* ── GRID / CARDS VIEW ── */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidatures.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-200 shrink-0">
                        <img
                          src={c.imageUrl}
                          alt={c.talent}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.talent)}&background=32A8D7&color=fff&size=96`;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => handleViewTalent(c.talentUserId)}
                          className="font-bold text-slate-900 text-sm hover:text-[#32A8D7] transition-colors truncate block text-left"
                        >
                          {c.talent}
                        </button>
                        <p className="text-xs font-semibold text-slate-500 truncate">
                          {c.profession}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          <span>{c.location}</span>
                        </p>
                      </div>
                    </div>

                    <StatutBadge statut={c.statut} t={t} />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Postulé pour :</span>
                      <button
                        type="button"
                        onClick={() => setView({ type: "detail-offre", offreId: c.offreId })}
                        className="font-bold text-[#0088cc] hover:underline truncate max-w-[170px]"
                      >
                        {c.offre}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Contrat :</span>
                      <span className="font-semibold text-slate-700">{c.typeEmploi}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Date :</span>
                      <span className="text-slate-600 font-medium">{c.dateCandidat}</span>
                    </div>
                  </div>

                  {/* Highlights Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.videoTest && (
                      <button
                        type="button"
                        onClick={() => handleViewTalent(c.talentUserId, "video")}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-[#32A8D7] border border-sky-200 hover:bg-sky-100 cursor-pointer"
                      >
                        <Video size={11} />
                        <span>Vidéo IA {c.score ? `(${c.score}%)` : ""}</span>
                      </button>
                    )}

                    {c.cvJoint && (
                      <button
                        type="button"
                        onClick={() => {
                          if (c.cvUrl) window.open(c.cvUrl, "_blank");
                          else handleViewTalent(c.talentUserId, "informations");
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                      >
                        <FileText size={11} />
                        <span>CV Joint</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleViewTalent(c.talentUserId)}
                    className="flex-1 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Voir profil</span>
                  </button>

                  {c.rawStatus === "PENDING" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(c.id, "ACCEPTED")}
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                        title="Accepter"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(c.id, "REJECTED")}
                        className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                        title="Rejeter"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteCandidature(c.id)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              itemLabel={t("itemLabel")}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      )}

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
