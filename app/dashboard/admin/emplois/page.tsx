"use client";
import React, { useState } from "react";
import { Search, MoreHorizontal, X, Save, ArrowLeft, ChevronRight, Clock, Share2, Users, CheckCircle2, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Modal, ConfirmModal } from "@/app/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface JobOfferData {
  id: string;
  rawId: string;
  titre: string;
  entreprise: string;
  date: string;
  contrat: string;
  localisation: string;
  candidatures: number;
  status: string;
  isAdminCreated: boolean;
  candidats: number;
  description: string;
}

export default function AdminEmplois() {
  const t = useTranslations("admin.jobs");
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showPublierModal, setShowPublierModal] = useState(false);
  const [jobToView, setJobToView] = useState<JobOfferData | null>(null);
  const [jobToEdit, setJobToEdit] = useState<JobOfferData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    type: "activate" | "close" | "delete";
    id: string;
    title?: string;
  } | null>(null);

  const executeConfirmAction = async () => {
    if (!confirmModalData) return;
    const { type, id } = confirmModalData;
    setConfirmModalData(null);
    try {
      if (type === "delete") {
        const res = await fetch(`/api/jobs/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          mutate("/api/admin/jobs");
          if (jobToView?.rawId === id) setJobToView(null);
        } else {
          const errorData = await res.json();
          alert(`Erreur: ${errorData.error}`);
        }
      } else {
        const newStatus = type === "activate" ? "PUBLISHED" : "CLOSED";
        const res = await fetch(`/api/jobs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          mutate("/api/admin/jobs");
        } else {
          const errorData = await res.json();
          alert(`Erreur: ${errorData.error}`);
        }
      }
    } catch (e) {
      console.error("Erreur action emploi:", e);
      alert(t("unexpectedError"));
    }
  };

  const promptToggleStatus = (id: string, newStatus: string, title?: string) => {
    setConfirmModalData({
      isOpen: true,
      type: newStatus === "PUBLISHED" ? "activate" : "close",
      id,
      title,
    });
  };

  const promptDelete = (id: string, title?: string) => {
    setConfirmModalData({
      isOpen: true,
      type: "delete",
      id,
      title,
    });
  };

  const renderConfirmModal = () => {
    if (!confirmModalData) return null;
    return (
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData(null)}
        onConfirm={executeConfirmAction}
        variant={
          confirmModalData.type === "delete"
            ? "danger"
            : confirmModalData.type === "close"
            ? "warning"
            : "primary"
        }
        title={
          confirmModalData.type === "delete"
            ? "Supprimer l'offre d'emploi"
            : confirmModalData.type === "close"
            ? "Clôturer l'offre d'emploi"
            : "Activer l'offre d'emploi"
        }
        message={
          confirmModalData.type === "delete"
            ? `Êtes-vous sûr de vouloir supprimer définitivement l'offre "${confirmModalData.title || ""}" ? Cette action est irréversible.`
            : confirmModalData.type === "close"
            ? `Êtes-vous sûr de vouloir clôturer l'offre "${confirmModalData.title || ""}" ? Les candidats ne pourront plus postuler.`
            : `Êtes-vous sûr de vouloir activer et publier l'offre "${confirmModalData.title || ""}" ?`
        }
        confirmLabel={
          confirmModalData.type === "delete"
            ? "Supprimer définitivement"
            : confirmModalData.type === "close"
            ? "Clôturer l'offre"
            : "Activer l'offre"
        }
        cancelLabel="Annuler"
      />
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: data, isLoading: loading } = useSWR(`/api/admin/jobs?page=${currentPage}&limit=${pageSize}`, fetcher);
  const rawJobs = Array.isArray(data) ? data : (data?.jobs || []);
  const totalCount = data?.totalCount ?? rawJobs.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const offres: JobOfferData[] = rawJobs.map((j: Record<string, unknown>) => ({
    id: String(j.id).substring(0, 8),
    rawId: String(j.id),
    titre: String(j.title),
    entreprise: (j.recruiter as any)?.companyName || "Entreprise Inconnue",
    date: new Date(String(j.createdAt)).toLocaleDateString("fr-FR"),
    contrat: String(j.contractType || "Non spécifié"),
    localisation: String(j.location || "Non spécifié"),
    candidatures: (j.applications as any[])?.length || 0,
    status: j.status === "PUBLISHED" ? "Actif" : (j.status === "CLOSED" ? "Suspendu" : "En attente"),
    isAdminCreated: ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes((j.recruiter as any)?.user?.role?.name?.toUpperCase() || ""),
    candidats: (j.applications as any[])?.length || 0,
    description: String(j.description || "")
  }));

  const filteredToutesOffres = offres.filter(o => {
    const matchesSearch = 
      o.titre.toLowerCase().includes(search.toLowerCase()) || 
      o.entreprise.toLowerCase().includes(search.toLowerCase()) ||
      o.localisation.toLowerCase().includes(search.toLowerCase()) ||
      o.contrat.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const mockMesOffres = offres.filter(o => o.isAdminCreated);

  const stats = {
    total: offres.length,
    actifs: offres.filter(o => o.status === "Actif").length,
    attente: offres.filter(o => o.status === "En attente").length,
    suspendus: offres.filter(o => o.status === "Suspendu").length,
    supprimes: 0
  };

  if (jobToView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setJobToView(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#32A8D7] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> {t("back")}
          </button>
        </div>
        <DetailOffreView
          emploi={jobToView}
          onBack={() => setJobToView(null)}
          onModifier={() => { setJobToEdit(jobToView); setJobToView(null); }}
          onSupprimer={() => promptDelete(jobToView.rawId, jobToView.titre)}
          onCloturer={() => promptToggleStatus(jobToView.rawId, 'CLOSED', jobToView.titre)}
        />
        {renderConfirmModal()}
      </div>
    );
  }

  if (jobToEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setJobToEdit(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#32A8D7] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> {t("back")}
          </button>
        </div>
        <ModifierOffreView
          emploi={jobToEdit}
          onBack={() => setJobToEdit(null)}
          onSave={async (updatedData: any) => {
            try {
              const res = await fetch(`/api/jobs/${jobToEdit.rawId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
              });
              if (res.ok) {
                setJobToEdit(null);
                mutate("/api/admin/jobs");
              } else {
                const errorData = await res.json();
                alert(`Erreur : ${errorData.error || "Impossible de sauvegarder l'offre"}`);
              }
            } catch (error) {
              console.error(error);
              alert("Une erreur inattendue est survenue.");
            }
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === "all" ? "border-[#32A8D7] text-[#32A8D7]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          {t("tabAll")}
        </button>
        <button 
          onClick={() => setActiveTab("mine")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === "mine" ? "border-[#32A8D7] text-[#32A8D7]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          {t("myOffers")}
        </button>
      </div>

      {activeTab === "all" && (
        <div className="space-y-6">
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

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                    statusFilter === "ALL"
                      ? "bg-[#32A8D7] text-white shadow-xs"
                      : "bg-[#eaf6fc] border border-[#d6effa] text-[#32A8D7] hover:bg-[#d6effa]"
                  }`}
                >
                  {t("totalOffers", { count: stats.total })}
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
                  onClick={() => setStatusFilter("En attente")}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                    statusFilter === "En attente"
                      ? "bg-yellow-500 text-white shadow-xs"
                      : "bg-yellow-50 border border-yellow-100 text-yellow-700 hover:bg-yellow-100"
                  }`}
                >
                  {t("pendingCount", { count: stats.attente })}
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

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">{t("loadingJobs")}</div>
            ) : filteredToutesOffres.length > 0 ? (
              <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f4f9fd] border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thId")}</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thTitle")}</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thCompany")}</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thDate")}</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thContract")}</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thLocation")}</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thApplications")}</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thStatus")}</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">{t("thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredToutesOffres.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 text-[#1e4869] font-medium">{o.id}</td>
                        <td className="px-5 py-4 text-[#1e4869] font-medium">{o.titre}</td>
                        <td className="px-5 py-4 text-[#1e4869]">{o.entreprise}</td>
                        <td className="px-5 py-4 text-[#1e4869] whitespace-nowrap">{o.date}</td>
                        <td className="px-5 py-4 text-[#1e4869]">{o.contrat}</td>
                        <td className="px-5 py-4 text-[#1e4869]">{o.localisation}</td>
                        <td className="px-5 py-4">
                          <span className="text-[#1e4869] font-medium">{o.candidatures}</span>
                          <button onClick={() => setJobToView(o)} className="ml-2 text-[#32A8D7] font-semibold hover:underline cursor-pointer">{t("viewAll")}</button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full w-max text-xs font-semibold" style={{
                            backgroundColor: o.status === 'Actif' ? '#f0fdf4' : o.status === 'En attente' ? '#fefce8' : '#fef2f2',
                            color: '#475569'
                          }}>
                            {o.status === 'Actif' ? t("active") : o.status === 'En attente' ? t("pending") : t("suspended")}
                            <span className={`w-1.5 h-1.5 rounded-full ${o.status === 'Actif' ? 'bg-green-500' : o.status === 'En attente' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1 text-xs font-semibold items-start">
                            <button onClick={() => setJobToView(o)} className="text-[#32A8D7] hover:underline cursor-pointer">{t("viewOffer")}</button>
                            
                            {o.status === 'En attente' && (
                              <button onClick={() => promptToggleStatus(o.rawId, 'PUBLISHED', o.titre)} className="text-green-500 hover:underline cursor-pointer">{t("approve")}</button>
                            )}
                            {o.status === 'Suspendu' && (
                              <button onClick={() => promptToggleStatus(o.rawId, 'PUBLISHED', o.titre)} className="text-green-500 hover:underline cursor-pointer">{t("reactivateOffer")}</button>
                            )}
                            
                            {/* L'admin ne modifie pas les offres externes, sauf s'il les a créées */}
                            {o.isAdminCreated && (
                              <button onClick={() => setJobToEdit(o)} className="text-[#32A8D7] hover:underline cursor-pointer">{t("edit")}</button>
                            )}
                            
                            {o.status !== 'Suspendu' && (
                              <button onClick={() => promptToggleStatus(o.rawId, 'CLOSED', o.titre)} className="text-yellow-500 hover:underline cursor-pointer">{t("closeOffer")}</button>
                            )}
                            
                            <button onClick={() => promptDelete(o.rawId, o.titre)} className="text-red-500 hover:underline cursor-pointer">{t("delete")}</button>
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
              </>
            ) : (
              <EmptyState 
                title={t("emptyTitle")} 
                description={t("emptyDesc")} 
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "mine" && (
        <div className="space-y-6">
          <div className="flex items-center text-sm text-slate-500">
            <Link href="/dashboard/admin" className="hover:text-slate-800">{t("home")}</Link>
            <span className="mx-2">›</span>
            <span>{t("createdJobsNetacuv")}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-[#232323]">{t("createdJobs")}</h2>
            
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-[#eaf6fc] text-[#32A8D7] text-sm font-semibold rounded-lg">
                {t("totalJobsCount", { count: mockMesOffres.length })}
              </span>
              <button onClick={() => setShowPublierModal(true)} className="px-4 py-2 bg-white border border-[#32A8D7] text-[#32A8D7] text-sm font-bold rounded-lg hover:bg-[#32A8D7] hover:text-white transition-colors cursor-pointer">
                {t("publishBtn")}
              </button>
            </div>
          </div>

          {mockMesOffres.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {mockMesOffres.map((o) => (
                  <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded-lg">
                        {/* Placeholder for Netacuv logo in orange style */}
                        <div className="w-6 h-6 border-2 border-orange-500 rotate-45 flex items-center justify-center relative">
                           <span className="-rotate-45 text-[10px] font-bold text-orange-500">G</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{t("publishedOn", { date: o.date })}</span>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${o.status === 'Actif' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        <span>{o.status === 'Actif' ? t("active") : o.status === 'En attente' ? t("pending") : t("suspended")}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${o.status === 'Actif' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-base mb-1">{o.titre}</h3>
                    <p className="text-sm text-slate-500 mb-1">{t("companyLabel")} <span className="font-semibold text-[#32A8D7]">{o.entreprise}</span></p>
                    <p className="text-sm text-slate-500 mb-4">{o.localisation}</p>
                    
                    <p className="text-xs text-slate-400 mb-4">{t("candidatesCount", { count: o.candidats })}</p>
                    
                    <div className="flex items-center gap-2 mt-auto relative">
                      <button onClick={() => setJobToView(o)} className="flex-1 py-2 border border-[#32A8D7] text-[#32A8D7] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                        {t("viewDetail")}
                      </button>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === o.id ? null : o.id)}
                        className="p-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenuId === o.id && (
                        <div className="absolute right-0 bottom-full mb-2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                          <button onClick={() => { setOpenMenuId(null); setJobToEdit(o); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">{t("edit")}</button>
                          {o.status !== 'Suspendu' ? (
                            <button onClick={() => { setOpenMenuId(null); promptToggleStatus(o.rawId, 'CLOSED', o.titre); }} className="w-full text-left px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-slate-50 cursor-pointer">{t("closeOffer")}</button>
                          ) : (
                            <button onClick={() => { setOpenMenuId(null); promptToggleStatus(o.rawId, 'PUBLISHED', o.titre); }} className="w-full text-left px-4 py-2 text-sm font-medium text-green-600 hover:bg-slate-50 cursor-pointer">{t("reactivateOffer")}</button>
                          )}
                          <button onClick={() => { setOpenMenuId(null); promptDelete(o.rawId, o.titre); }} className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-slate-50 cursor-pointer">{t("delete")}</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button className="px-6 py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-200 transition-colors cursor-pointer">
                  {t("viewMore")}
                </button>
              </div>
            </>
          ) : (
            <EmptyState 
              title={t("emptyMyJobsTitle")}
              description={t("emptyMyJobsDesc")}
              actionButton={
                <button onClick={() => setShowPublierModal(true)} className="px-6 py-2 bg-[#32A8D7] text-white font-bold rounded-lg hover:bg-[#2b91bb] transition-colors cursor-pointer">
                  {t("publishBtn")}
                </button>
              }
            />
          )}
        </div>
      )}
      </div>
      
      {showPublierModal && (
        <PublierModal 
          onClose={() => setShowPublierModal(false)}
          onPublish={() => {
            setShowPublierModal(false);
            mutate("/api/admin/jobs");
          }}
        />
      )}
      {renderConfirmModal()}
    </>
  );
}

const MOCK_CANDIDATES: any[] = [];

function CandidateCard({ c }: { c: typeof MOCK_CANDIDATES[number] }) {
  const t = useTranslations("admin.jobs");
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative w-full aspect-[4/3] bg-pink-100">
        <img
          src={c.avatar}
          alt={c.nom}
          className="object-cover object-top w-full h-full"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {c.certifie && (
          <span className="absolute top-2 right-2 w-6 h-6 bg-[#32A8D7] rounded-full flex items-center justify-center">
            <CheckCircle2 size={13} className="text-white" />
          </span>
        )}
      </div>
      <div className="p-3 flex-1">
        <div className="flex items-start justify-between gap-1">
          <div>
            <p className="font-bold text-slate-900 text-sm">{c.nom}</p>
            <p className="text-[11px] text-slate-400">{c.localisation}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              <span className="font-semibold">{t("professionLabel")}</span> {c.profession}
            </p>
          </div>
          <button className="text-slate-300 hover:text-[#32A8D7] transition-colors cursor-pointer">
            <Bookmark size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface DetailOffreViewProps {
  emploi: JobOfferData;
  onBack: () => void;
  onModifier: () => void;
  onSupprimer: () => void;
  onCloturer: () => void;
}

function DetailOffreView({ emploi, onBack, onModifier, onSupprimer, onCloturer }: DetailOffreViewProps) {
  const t = useTranslations("admin.jobs");
  // Extract modeTravail if encoded in description
  const rawDesc = emploi.description || "";
  let modeTravail = "Temps plein";
  let desc = rawDesc;
  if (rawDesc.startsWith("Mode de travail : ")) {
    const splitIndex = rawDesc.indexOf("\n\n");
    if (splitIndex !== -1) {
      modeTravail = rawDesc.substring("Mode de travail : ".length, splitIndex);
      desc = rawDesc.substring(splitIndex + 2);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button onClick={onBack} className="hover:text-[#32A8D7] transition-colors cursor-pointer">{t("home")}</button>
        <ChevronRight size={12} />
        <button onClick={onBack} className="hover:text-[#32A8D7] transition-colors cursor-pointer">{t("jobOffers")}</button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{emploi.titre}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">
              {t("publishedOn", { date: emploi.date })}
              &nbsp;·&nbsp;
              <span className="font-bold text-slate-700">{t("candidatesCount", { count: emploi.candidats })}</span>
            </p>
            <h2 className="text-2xl font-extrabold text-[#32A8D7]">{emploi.titre}</h2>
            <p className="text-sm text-slate-700 mt-0.5">
              <span className="font-semibold">{t("companyLabel")}</span> {emploi.entreprise}&nbsp;&nbsp;
              <span className="font-semibold">{t("locationLabel")}</span> {emploi.localisation}
            </p>
          </div>
          <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-[#32A8D7] hover:border-[#32A8D7] transition-colors shrink-0 cursor-pointer">
            <Share2 size={18} />
          </button>
        </div>

        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>{modeTravail}</p>
          <p>{t("contractTypeLabel")} {emploi.contrat}</p>
        </div>

        <div className="flex items-center justify-between mt-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            (emploi.status === "Actif") ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-slate-100 text-slate-500"
          }`}>
            {(emploi.status === "Actif") ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{t("jobOfferInProgress")}</>
            ) : (
              <><Clock size={11} />{t("jobOfferClosed")}</>
            )}
          </span>
          {(emploi.status === "Actif") && (
            <button
              onClick={onCloturer}
              className="px-4 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {t("closeOffer")}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#32A8D7] mb-4">{t("jobDescription")}</h3>
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {desc}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#32A8D7] mb-1">{t("appliedCandidates")}</h3>
        <p className="text-sm text-slate-500 mb-5">{t("applicationsReceived", { count: emploi.candidats })}</p>
        {MOCK_CANDIDATES.length === 0 ? (
          <div className="text-center py-8">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">{t("noCandidates")}</p>
            <p className="text-xs text-slate-400">{t("noCandidatesDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MOCK_CANDIDATES.map((c) => (
              <CandidateCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pb-4">
        <button
          onClick={onSupprimer}
          className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
        >
          {t("delete")}
        </button>
        {emploi.isAdminCreated && (
          <button
            onClick={onModifier}
            className="flex-1 py-3 rounded-2xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            {t("edit")}
          </button>
        )}
      </div>
    </div>
  );
}

interface ModifierOffreViewProps {
  emploi: JobOfferData;
  onBack: () => void;
  onSave: (updated: any) => void;
}

function ModifierOffreView({ emploi, onBack, onSave }: ModifierOffreViewProps) {
  const t = useTranslations("admin.jobs");
  const [titre, setTitre] = useState(emploi.titre);
  const [entreprise, setEntreprise] = useState(emploi.entreprise);
  
  const parts = emploi.localisation.split(", ");
  const [pays, setPays] = useState(parts[1] || "Bénin");
  const [ville, setVille] = useState(parts[0] || "Cotonou");
  
  const [typeEmploi, setTypeEmploi] = useState(emploi.contrat);
  
  const rawDesc = emploi.description || "";
  let initialMode = "Temps plein";
  let initialDesc = rawDesc;
  if (rawDesc.startsWith("Mode de travail : ")) {
    const splitIndex = rawDesc.indexOf("\n\n");
    if (splitIndex !== -1) {
      initialMode = rawDesc.substring("Mode de travail : ".length, splitIndex);
      initialDesc = rawDesc.substring(splitIndex + 2);
    }
  }

  const [modeTravail, setModeTravail] = useState(initialMode);
  const [description, setDescription] = useState(initialDesc);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: titre,
      entreprise: entreprise || "Netacuv",
      contractType: typeEmploi,
      location: `${ville}, ${pays}`,
      description: `Mode de travail : ${modeTravail}\n\n${description}`
    });
  };

  const sectionClass = "bg-white rounded-2xl border border-slate-100 shadow-sm p-6";
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors";

  return (
    <form onSubmit={handleSave} className="space-y-4 animate-fade-in-up">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button type="button" onClick={onBack} className="hover:text-[#32A8D7] transition-colors cursor-pointer">{t("home")}</button>
        <ChevronRight size={12} />
        <button type="button" onClick={onBack} className="hover:text-[#32A8D7] transition-colors cursor-pointer">{t("jobOffers")}</button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{emploi.titre}</span>
      </nav>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("jobTitleLabel")}</label>
        <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className={inputClass} required />
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("companyLabel")}</label>
        <input type="text" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className={inputClass} required />
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("workTypeLabel")}</label>
        <CustomSelect
          value={typeEmploi}
          onChange={(val) => setTypeEmploi(val)}
          options={["CDI", "CDD", "Stage", "Freelance", "Alternance"]}
        />
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("workLocationLabel")}</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input 
              type="text"
              list="countries-list"
              value={pays} 
              onChange={(e) => setPays(e.target.value)} 
              className={inputClass} 
              placeholder={t("searchCountry")}
            />
            <datalist id="countries-list">
              {["Bénin","Côte d'Ivoire","Sénégal","Togo","Mali","Cameroun","Burkina Faso","Guinée", "France", "Canada", "États-Unis", "Maroc", "Tunisie"].map(p => <option key={p} value={p} />)}
            </datalist>
          </div>
          <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass} placeholder={t("city")} />
        </div>
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("workModeLabel")}</label>
        <CustomSelect
          value={modeTravail}
          onChange={(val) => setModeTravail(val)}
          options={["Temps plein", "Temps partiel", "Remote", "Hybride"]}
        />
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("jobDescLabel")}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={`${inputClass} resize-none`} placeholder={t("jobDescEditPlaceholder")} required />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
          {t("cancel")}
        </button>
        <button type="submit" className="flex-1 py-3 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <Save size={15} /> {t("saveChanges")}
        </button>
      </div>
    </form>
  );
}

// ─── PublierModal ─────────────────────────────────────────────────────────────

interface PublierModalProps {
  onClose: () => void;
  onPublish: () => void;
}

function PublierModal({ onClose, onPublish }: PublierModalProps) {
  const t = useTranslations("admin.jobs");
  const [titre, setTitre] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [pays, setPays] = useState("Bénin");
  const [ville, setVille] = useState("Cotonou");
  
  const [typeEmploi, setTypeEmploi] = useState("CDI");
  const [modeTravail, setModeTravail] = useState("Temps plein");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: titre,
        description: `Mode de travail : ${modeTravail}\n\n${description}`,
        location: `${ville}, ${pays}`,
        contractType: typeEmploi,
        entreprise: entreprise || "Netacuv", 
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onPublish();
      } else {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.error || "Impossible de publier l'offre"}`);
      }
    } catch (error) {
      console.error(error);
      alert(t("unexpectedError"));
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors";

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("publishModalTitle")}
      description={t("publishModalDesc")}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-left">
        <div>
          <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("jobTitleLabel")}</label>
          <input required type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className={inputClass} placeholder={t("jobTitlePlaceholder")} />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("companyLabel")}</label>
          <input type="text" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className={inputClass} placeholder={t("companyNamePlaceholder")} />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("workTypeLabel")}</label>
          <CustomSelect
            value={typeEmploi}
            onChange={(val) => setTypeEmploi(val)}
            options={["CDI", "CDD", "Stage", "Freelance", "Alternance"]}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("workLocationLabel")}</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input 
                type="text"
                list="countries-list"
                value={pays} 
                onChange={(e) => setPays(e.target.value)} 
                className={inputClass} 
                placeholder={t("searchCountry")}
              />
              <datalist id="countries-list">
                {["Bénin","Côte d'Ivoire","Sénégal","Togo","Mali","Cameroun","Burkina Faso","Guinée", "France", "Canada", "États-Unis", "Maroc", "Tunisie"].map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass} placeholder={t("city")} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("workModeLabel")}</label>
          <CustomSelect
            value={modeTravail}
            onChange={(val) => setModeTravail(val)}
            options={["Temps plein", "Temps partiel", "Remote", "Hybride"]}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("jobDescLabel")}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder={t("jobDescPlaceholder")} />
        </div>

        <div className="flex gap-3 pt-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            {t("cancel")}
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <Save size={15} /> {t("publishOffer")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
