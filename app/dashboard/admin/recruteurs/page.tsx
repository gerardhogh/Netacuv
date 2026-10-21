"use client";
import React, { useState } from "react";
import { Search, Mail, Eye, Edit, Trash2, LayoutList, LayoutGrid, Crown, Briefcase, Users as UsersIcon, Phone, Building2, Bookmark } from "lucide-react";
import { RecruteurDetails } from "../components/RecruteurDetails";
import { CustomSelect } from "../components/CustomSelect";
import { Modal } from "@/app/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
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

interface RecruiterItem {
  id: string;
  no: string;
  name: string;
  logo?: string;
  secteur?: string;
  website?: string;
  address?: string;
  description?: string;
  skills?: string;
  offresPubliees: number;
  email: string;
  contact: string;
  candidats: number;
  abonnement: string;
  isPremium: boolean;
  date: string;
  status: string;
  isAdmin: boolean;
}

export default function AdminRecruteurs() {
  const t = useTranslations("admin.recruiters");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [selectedRecruteur, setSelectedRecruteur] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'activate' | 'suspend' | 'delete' } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: usersData, error, isLoading: loading, mutate } = useSWR(
    `/api/users?role=recruiter&page=${currentPage}&limit=${pageSize}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const { data: favsData, mutate: mutateFavs } = useSWR("/api/favorites?type=RECRUITER", fetcher, {
    revalidateOnFocus: false,
  });

  const favoriteIds = new Set<string>((favsData?.favorites || []).map((f: any) => String(f.targetId)));

  const handleToggleFavorite = async (id: string, name?: string, secteur?: string, address?: string) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "RECRUITER",
          targetId: String(id),
          title: name || "Entreprise",
          subtitle: secteur || "Recruteur",
          location: address || null,
        }),
      });
      if (res.ok) {
        mutateFavs();
        const json = await res.json();
        if (json.action === "added") {
          toast.success("Profil recruteur ajouté aux favoris !");
        } else {
          toast.success("Profil recruteur retiré des favoris.");
        }
      } else {
        const errJson = await res.json().catch(() => null);
        toast.error(errJson?.error || "Erreur lors de la mise à jour des favoris.");
      }
    } catch (err) {
      console.error("Error toggling favorite", err);
      toast.error("Erreur de connexion.");
    }
  };

  const rawUsers = Array.isArray(usersData) ? usersData : (usersData?.users || []);
  const totalCount = usersData?.totalCount ?? rawUsers.length;
  const totalPages = usersData?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const recruteurs: RecruiterItem[] = rawUsers
    .filter((u: any) => u.recruiterProfile || ["RECRUTEUR", "RECRUITER"].includes(u.role?.name?.toUpperCase()))
    .map((r: any, index: number): RecruiterItem => ({
      id: r.id,
      no: formatTableId(r.id, (currentPage - 1) * pageSize + index + 1),
      name: r.recruiterProfile?.companyName || r.name || "Entreprise",
      logo: r.recruiterProfile?.logo || r.image || undefined,
      secteur: r.recruiterProfile?.industry || r.recruiterProfile?.sector || "",
      website: r.recruiterProfile?.website || "",
      address: r.recruiterProfile?.address || r.recruiterProfile?.location || "",
      description: r.recruiterProfile?.description || "",
      skills: r.recruiterProfile?.skills || "",
      offresPubliees: r.recruiterProfile?.jobOffers?.length || 0,
      email: r.email || "",
      contact: r.recruiterProfile?.phone || r.phone || t("notSpecified"),
      candidats: r.recruiterProfile?.jobOffers?.reduce((acc: number, job: any) => acc + (job.applications?.length || 0), 0) || 0,
      abonnement: r.isPremium ? "Premium" : "Standard",
      isPremium: r.isPremium || false,
      date: new Date(r.createdAt).toLocaleDateString("fr-FR"),
      status: r.active ? "Actif" : "Suspendu",
      isAdmin: ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes(r.role?.name?.toUpperCase() || "")
    }));

  const filtered = recruteurs.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.email.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "Tous" || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: recruteurs.length,
    actifs: recruteurs.filter(r => r.status === "Actif").length,
    attente: recruteurs.filter(r => r.status === "En attente").length,
    suspendus: recruteurs.filter(r => r.status === "Suspendu").length,
    supprimes: 0
  };

  if (selectedRecruteur) {
    return (
      <RecruteurDetails
        recruteur={selectedRecruteur}
        onBack={() => setSelectedRecruteur(null)}
        isFavorite={favoriteIds.has(String(selectedRecruteur.id))}
        onToggleFavorite={() =>
          handleToggleFavorite(
            selectedRecruteur.id,
            selectedRecruteur.name,
            selectedRecruteur.secteur,
            selectedRecruteur.address
          )
        }
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
              { label: t("suspended"), value: "Suspendu" }
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
              {t("totalCount", { count: stats.total })}
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
              {t("activeCount", { count: stats.actifs })}
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
              {t("suspendedCount", { count: stats.suspendus })}
            </button>
          </div>
        </div>
      </div>

      {/* Content: Table or Cards */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">
          {t("loadingRecruiters")}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="generic"
          title={t("emptyTitle")}
          description={t("emptyDesc")}
        />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 animate-fade-in">
          {filtered.map(r => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 group">
              {/* Card Top Banner with Status & Premium Badge */}
              <div className="h-16 bg-gradient-to-r from-[#0076a8]/15 via-[#1699d2]/20 to-[#32A8D7]/15 relative p-3 flex justify-between items-start">
                {/* Premium Badge */}
                {r.isPremium ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold rounded-full shadow-sm">
                    <Crown size={12} className="text-yellow-200 fill-yellow-200" />
                    {t("premium")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/90 text-slate-500 text-[11px] font-semibold rounded-full border border-slate-200">
                    {t("standard")}
                  </span>
                )}

                {/* Status Badge & Favorite */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-xs" style={{
                    backgroundColor: r.status === 'Actif' ? '#f0fdf4' : r.status === 'En attente' ? '#fefce8' : '#fef2f2',
                    color: '#475569'
                  }}>
                    <span>{r.status === 'Actif' ? t("active") : r.status === 'En attente' ? t("pending") : t("suspended")}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Actif' ? 'bg-green-500' : r.status === 'En attente' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(r.id, r.name, r.secteur, r.address);
                    }}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      favoriteIds.has(String(r.id))
                        ? "bg-amber-100 text-amber-600"
                        : "bg-white/90 text-slate-400 hover:text-amber-500 hover:bg-white"
                    }`}
                    title={favoriteIds.has(String(r.id)) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Bookmark size={13} className={favoriteIds.has(String(r.id)) ? "fill-amber-500 text-amber-500" : ""} />
                  </button>
                </div>
              </div>

              {/* Company Avatar & Info */}
              <div className="p-4 pt-0 flex flex-col flex-grow">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center -mt-6 mb-3 shrink-0 text-xl font-black text-[#1699d2]">
                  <Building2 size={22} className="text-[#32A8D7]" />
                </div>

                <h3 
                  onClick={() => setSelectedRecruteur(r)}
                  className="font-bold text-slate-900 text-base leading-snug truncate hover:text-[#32A8D7] cursor-pointer transition-colors"
                  title={r.name}
                >
                  {r.name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5 truncate">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{r.email || t("notProvided")}</span>
                </p>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 truncate">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{r.contact}</span>
                </p>

                {/* Stats badges */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{t("jobsBadge")}</p>
                    <p className="text-sm font-bold text-slate-800">{r.offresPubliees}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{t("candidatesBadge")}</p>
                    <p className="text-sm font-bold text-slate-800">{r.candidats}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-auto flex items-center gap-2 w-full pt-4">
                  {r.email && (
                    <a
                      href={`mailto:${r.email}`}
                      className="flex-1 py-2 px-2 text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-md transition-colors text-center truncate"
                    >
                      {t("sendEmail")}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedRecruteur(r)}
                    className="flex-1 py-2 px-2 text-xs font-semibold bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-md transition-colors shadow-xs hover:shadow text-center truncate cursor-pointer"
                  >
                    {t("viewProfile")}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Cards */}
          <div className="col-span-full">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              itemLabel={t("itemLabel")}
              onPageChange={(page) => setCurrentPage(page)}
              className="mt-6 rounded-2xl border border-slate-100 shadow-xs"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f4f9fd] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thNo")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thRecruiterName")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thJobs")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thProfessionalEmail")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thMainContact")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thCandidates")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thPlan")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thDate")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thStatus")}</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-[#1e4869] font-medium">{r.no}</td>
                    <td className="px-5 py-4 text-[#1e4869] font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(r.id, r.name, r.secteur, r.address)}
                          className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                          title={favoriteIds.has(String(r.id)) ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <Bookmark
                            size={14}
                            className={favoriteIds.has(String(r.id)) ? "fill-amber-500 text-amber-500" : "text-slate-300 hover:text-amber-500"}
                          />
                        </button>
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#1e4869]">{r.offresPubliees}</td>
                    <td className="px-5 py-4 text-[#1e4869]">{r.email}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-[#1e4869]">{r.contact.substring(0, 4)}</span>
                      <span className="text-[#1e4869]">{r.contact.substring(4)}</span>
                    </td>
                    <td className="px-5 py-4 text-[#1e4869]">{r.candidats}</td>
                    <td className="px-5 py-4 text-[#1e4869]">{r.abonnement}</td>
                    <td className="px-5 py-4 text-[#1e4869] whitespace-pre-line leading-relaxed">{r.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full w-max text-xs font-semibold" style={{
                        backgroundColor: r.status === 'Actif' ? '#f0fdf4' : r.status === 'En attente' ? '#fefce8' : '#fef2f2',
                        color: '#475569'
                      }}>
                        {r.status === 'Actif' ? t("active") : r.status === 'En attente' ? t("pending") : t("suspended")}
                        <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Actif' ? 'bg-green-500' : r.status === 'En attente' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {r.isAdmin ? (
                        <span className="text-slate-400 text-xs font-medium">{t("administrator")}</span>
                      ) : (
                        <div className="flex flex-col gap-1 text-xs font-semibold items-start">
                          <button onClick={() => setSelectedRecruteur(r)} className="text-[#32A8D7] hover:underline">{t("viewProfile")}</button>
                          
                          {r.status === 'En attente' && (
                            <button onClick={() => setConfirmAction({ id: r.id, type: 'activate' })} className="text-green-500 hover:underline">{t("approve")}</button>
                          )}
                          {r.status === 'Suspendu' && (
                            <button onClick={() => setConfirmAction({ id: r.id, type: 'activate' })} className="text-green-500 hover:underline">{t("reactivate")}</button>
                          )}
                          
                          <button onClick={() => setSelectedRecruteur(r)} className="text-[#32A8D7] hover:underline">{t("edit")}</button>
                          
                          {r.status !== 'Suspendu' && (
                            <button onClick={() => setConfirmAction({ id: r.id, type: 'suspend' })} className="text-yellow-500 hover:underline">{t("suspend")}</button>
                          )}
                          
                          <button onClick={() => setConfirmAction({ id: r.id, type: 'delete' })} className="text-red-500 hover:underline">{t("delete")}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Table */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            itemLabel={t("itemLabel")}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Modal de confirmation */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === 'delete' 
            ? t("confirmTitleDelete") 
            : confirmAction?.type === 'activate' 
            ? t("confirmTitleActivate") 
            : t("confirmTitleSuspend")
        }
        description={
          confirmAction?.type === 'delete' 
            ? t("confirmDescDelete") 
            : confirmAction?.type === 'activate'
            ? t("confirmDescActivate")
            : t("confirmDescSuspend")
        }
      >
        <div className="flex justify-end gap-3 mt-4">
          <button 
            onClick={() => setConfirmAction(null)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button 
            onClick={handleConfirmAction}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer ${
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
