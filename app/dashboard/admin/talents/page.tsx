"use client";
import React, { useState } from "react";
import { Search, LayoutList, LayoutGrid, AlertCircle, Bookmark } from "lucide-react";
import { TalentDetails } from "../components/TalentDetails";
import { CustomSelect } from "../components/CustomSelect";
import { Modal } from "@/app/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import TalentCard from "@/app/components/TalentCard";
import useSWR from "swr";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { formatTableId } from "@/lib/formatTableId";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur ${res.status}`);
  }
  return res.json();
};

interface TalentData {
  id: string;
  no: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  domaine: string;
  date: string;
  location: string;
  country: string;
  contact: string;
  email: string;
  status: string;
  videoOk: boolean;
  videoUrl?: string;
  bio: string;
  skills: string;
  gender: string;
  opportunity: string;
  avatar: string;
  cvUrl: string;
  certifie?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  socials?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    pinterest?: string;
    behance?: string;
  };
}

export default function AdminTalents() {
  const t = useTranslations("admin.talents");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [videoFilter, setVideoFilter] = useState("Tous");
  const [selectedTalent, setSelectedTalent] = useState<TalentData | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'activate' | 'suspend' | 'delete' } | null>(null);

  const { data: talentsRaw, error, isLoading: loading, mutate } = useSWR("/api/talents", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  const { data: favsData, mutate: mutateFavs } = useSWR("/api/favorites?type=TALENT", fetcher, {
    revalidateOnFocus: false,
  });

  const favoriteIds = new Set<string>((favsData?.favorites || []).map((f: any) => String(f.targetId)));

  const handleToggleFavorite = async (id: string, name?: string, domaine?: string, location?: string) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "TALENT",
          targetId: String(id),
          title: name || "Talent Netacuv",
          subtitle: domaine || "Professionnel",
          location: location || null,
        }),
      });
      if (res.ok) {
        mutateFavs();
        const json = await res.json();
        if (json.action === "added") {
          toast.success("Profil talent ajouté aux favoris !");
        } else {
          toast.success("Profil talent retiré des favoris.");
        }
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(errData?.error || "Erreur lors de la mise à jour des favoris.");
      }
    } catch (err) {
      console.error("Error toggling favorite", err);
      toast.error("Erreur de connexion.");
    }
  };

  const talents: TalentData[] = Array.isArray(talentsRaw) ? talentsRaw : (talentsRaw?.talents || []);

  const filtered = talents.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.domaine || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.location || "").toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "Tous" || t.status === statusFilter;
    const matchesVideo = videoFilter === "Tous" || (videoFilter === "Oui" ? t.videoOk : !t.videoOk);

    return matchesSearch && matchesStatus && matchesVideo;
  });

  const stats = {
    total: talents.length,
    actifs: talents.filter(t => t.status === "Actif").length,
    attente: talents.filter(t => t.status === "En attente").length,
    suspendus: talents.filter(t => t.status === "Suspendu").length,
    supprimes: 0
  };

  if (selectedTalent) {
    return (
      <TalentDetails 
        talent={selectedTalent} 
        onBack={() => setSelectedTalent(null)}
        isFavorite={favoriteIds.has(String(selectedTalent.id))}
        onToggleFavorite={() => handleToggleFavorite(selectedTalent.id, selectedTalent.name, selectedTalent.domaine, selectedTalent.location)}
      />
    );
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    
    try {
      if (type === 'delete') {
        const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
        if (res.ok) mutate();
      } else {
        const active = type === 'activate';
        const res = await fetch(`/api/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active })
        });
        if (res.ok) mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header and Stats row */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-6 justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold">
          <span className="text-[#232323]">{t("title")}</span> <span className="text-[#32A8D7]">{t("titleHighlight")}</span>
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] w-48 sm:w-64"
            />
          </div>
          
          <CustomSelect 
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: t("allStatuses"), value: "Tous" },
              { label: t("active"), value: "Actif" },
              { label: t("pending"), value: "En attente" },
              { label: t("suspended"), value: "Suspendu" }
            ]}
          />
          
          <CustomSelect 
            value={videoFilter}
            onChange={setVideoFilter}
            options={[
              { label: t("videoAll"), value: "Tous" },
              { label: t("videoYes"), value: "Oui" },
              { label: t("videoNo"), value: "Non" }
            ]}
          />

          {/* Toggle Vue Tableau / Cartes */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title={t("viewTable")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutList size={15} />
              <span>{t("viewTable")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title={t("viewCards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-[#32A8D7] shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid size={15} />
              <span>{t("viewCards")}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("Tous")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                statusFilter === "Tous"
                   ? "bg-[#32A8D7] text-white shadow-xs"
                  : "bg-[#eaf6fc] border border-[#d6effa] text-[#32A8D7] hover:bg-[#d6effa]"
              }`}
            >
              {loading ? "..." : t("totalCount", { count: stats.total })}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Actif")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                statusFilter === "Actif"
                  ? "bg-green-600 text-white shadow-xs"
                  : "bg-green-50 border border-green-100 text-green-700 hover:bg-green-100"
              }`}
            >
              {loading ? "..." : t("activeCount", { count: stats.actifs })}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("En attente")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                statusFilter === "En attente"
                  ? "bg-yellow-500 text-white shadow-xs"
                  : "bg-yellow-50 border border-yellow-100 text-yellow-700 hover:bg-yellow-100"
              }`}
            >
              {loading ? "..." : t("pendingCount", { count: stats.attente })}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Suspendu")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                statusFilter === "Suspendu"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {loading ? "..." : t("suspendedCount", { count: stats.suspendus })}
            </button>
          </div>
        </div>
      </div>

      {/* Content: Table or Cards */}
      {error ? (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-10 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Erreur de chargement</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">{error.message || "Une erreur est survenue lors de la récupération des données."}</p>
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-[#32A8D7] hover:bg-[#288db5] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-[#32A8D7] border-t-transparent animate-spin" />
          <span className="text-sm font-medium">{t("loadingTalents")}</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="talents"
          title={t("emptyTitle")}
          description={t("emptyDesc")}
        />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 animate-fade-in">
          {filtered.map(tData => (
            <TalentCard
              key={tData.id}
              id={tData.id}
              name={tData.name}
              location={tData.location || tData.country || t("unspecified")}
              profession={tData.profession || tData.domaine || "Profession non renseignée"}
              imageUrl={tData.avatar || "/assets/avatar_africain.jpg"}
              isVerified={tData.isPremium || false}
              isPremium={tData.isPremium}
              hasVideo={tData.videoOk}
              isFavorite={favoriteIds.has(String(tData.id))}
              onFavorite={() => handleToggleFavorite(tData.id, tData.name, tData.domaine, tData.location)}
              onViewProfile={() => setSelectedTalent(tData)}
              onSendEmail={() => window.open(`mailto:${tData.email}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-500">{t("thNo")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">{t("thFullName")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">{t("thDomain")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500 whitespace-nowrap">{t("thDate")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">{t("thLocation")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">{t("thContact")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">{t("thEmail")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">{t("thStatus")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500 whitespace-nowrap">{t("thSubscription")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500 whitespace-nowrap">{t("thTestVideo")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">{t("thAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tData, index) => (
                  <tr key={tData.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-slate-500 font-mono font-bold text-xs">{formatTableId(tData.no || tData.id, index + 1)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(tData.id, tData.name, tData.domaine, tData.location)}
                          title={favoriteIds.has(String(tData.id)) ? "Retirer des favoris" : "Ajouter aux favoris"}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            favoriteIds.has(String(tData.id))
                              ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                              : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
                          }`}
                        >
                          <Bookmark size={15} fill={favoriteIds.has(String(tData.id)) ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => setSelectedTalent(tData)} className="text-[#32A8D7] font-semibold hover:underline text-left">
                          {tData.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{tData.domaine}</td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{tData.date}</td>
                    <td className="px-5 py-4 text-slate-700">{tData.location}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{tData.contact}</span>
                    </td>
                    <td className="px-5 py-4">
                      <a href={`mailto:${tData.email}`} className="text-[#32A8D7] hover:underline">{tData.email}</a>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">
                          {tData.status === 'Actif' ? t("active") : tData.status === 'En attente' ? t("pending") : t("suspended")}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${tData.status === 'Actif' ? 'bg-green-500' : tData.status === 'En attente' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {tData.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full whitespace-nowrap">
                          ★ {t("premium")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold rounded-full whitespace-nowrap">
                          {t("free")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {tData.videoOk ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {t("yes")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold rounded-full whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {t("no")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs font-semibold items-start">
                        <button onClick={() => setSelectedTalent(tData)} className="text-[#32A8D7] hover:underline">{t("viewProfile")}</button>
                        
                        {tData.status === 'En attente' && (
                          <button onClick={() => setConfirmAction({ id: tData.id, type: 'activate' })} className="text-green-500 hover:underline">{t("approve")}</button>
                        )}
                        {tData.status === 'Suspendu' && (
                          <button onClick={() => setConfirmAction({ id: tData.id, type: 'activate' })} className="text-green-500 hover:underline">{t("reactivate")}</button>
                        )}
                        
                        <button onClick={() => setSelectedTalent(tData)} className="text-[#32A8D7] hover:underline">{t("edit")}</button>
                        
                        {tData.status !== 'Suspendu' && (
                          <button onClick={() => setConfirmAction({ id: tData.id, type: 'suspend' })} className="text-yellow-500 hover:underline">{t("suspend")}</button>
                        )}
                        
                        <button onClick={() => setConfirmAction({ id: tData.id, type: 'delete' })} className="text-red-500 hover:underline">{t("delete")}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'delete' ? t('confirmDeleteTitle') : confirmAction?.type === 'activate' ? t('confirmTitleActivate') : t('confirmTitleSuspend')}
        description={
          confirmAction?.type === 'delete' 
            ? t('confirmDeleteMsg')
            : confirmAction?.type === 'activate'
            ? t('confirmDescActivate')
            : t('confirmDescSuspend')
        }
      >
        <div className="flex justify-end gap-3 mt-4">
          <button 
            onClick={() => setConfirmAction(null)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {t("cancel")}
          </button>
          <button 
            onClick={handleConfirmAction}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
              confirmAction?.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#32A8D7] hover:bg-[#2b90b8]'
            }`}
          >
            {t("confirm")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
