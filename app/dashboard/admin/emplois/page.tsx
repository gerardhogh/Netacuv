"use client";
import React, { useState } from "react";
import { Search, MoreHorizontal, X, Save, ArrowLeft, ChevronRight, Clock, Share2, Users, CheckCircle2, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { EmptyState } from "@/components/ui/EmptyState";

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
  const [activeTab, setActiveTab] = useState("Toutes les offres");
  const [search, setSearch] = useState("");
  const [showPublierModal, setShowPublierModal] = useState(false);
  const [jobToView, setJobToView] = useState<JobOfferData | null>(null);
  const [jobToEdit, setJobToEdit] = useState<JobOfferData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
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
    } catch (e) {
      console.error("Erreur toggle status:", e);
      alert("Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette offre ?")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate("/api/admin/jobs");
      } else {
        const errorData = await res.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (e) {
      console.error("Erreur delete:", e);
      alert("Une erreur est survenue");
    }
  };

  const { data: data = [], isLoading: loading } = useSWR("/api/admin/jobs", fetcher);

  const offres: JobOfferData[] = Array.isArray(data) ? data.map((j: Record<string, unknown>) => ({
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
  })) : [];

  const filteredToutesOffres = offres.filter(o => 
    o.titre.toLowerCase().includes(search.toLowerCase()) || 
    o.entreprise.toLowerCase().includes(search.toLowerCase())
  );

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
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#32A8D7] transition-colors"
          >
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
        <DetailOffreView
          emploi={jobToView}
          onBack={() => setJobToView(null)}
          onModifier={() => { setJobToEdit(jobToView); setJobToView(null); }}
          onSupprimer={() => { handleDelete(jobToView.rawId); setJobToView(null); }}
          onCloturer={() => handleToggleStatus(jobToView.rawId, 'CLOSED')}
        />
      </div>
    );
  }

  if (jobToEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setJobToEdit(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#32A8D7] transition-colors"
          >
            <ArrowLeft size={16} /> Retour
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
          onClick={() => setActiveTab("Toutes les offres")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "Toutes les offres" ? "border-[#32A8D7] text-[#32A8D7]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Toutes les offres
        </button>
        <button 
          onClick={() => setActiveTab("Mes offres")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "Mes offres" ? "border-[#32A8D7] text-[#32A8D7]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Mes offres
        </button>
      </div>

      {activeTab === "Toutes les offres" && (
        <div className="space-y-6">
          {/* Header and Stats row */}
          <div className="flex flex-col xl:flex-row xl:items-center gap-6 justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold">
              <span className="text-[#232323]">Liste des</span> <span className="text-[#32A8D7]">offres</span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] w-48 sm:w-64"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-[#eaf6fc] border border-[#d6effa] text-[#32A8D7] text-sm font-semibold rounded-full">
                  {stats.total} offres au total
                </span>
                <span className="px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold rounded-full">
                  {stats.actifs} actifs
                </span>
                <span className="px-3 py-1.5 bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
                  {stats.attente} en attente
                </span>
                <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold rounded-full">
                  {stats.suspendus} suspendus
                </span>
                <span className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-full">
                  {stats.supprimes} supprimés
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Chargement des offres...</div>
            ) : filteredToutesOffres.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f4f9fd] border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">ID</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">Titre du poste</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">Entreprise</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">Date de publication</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">Type de contrat</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">Localisation</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">Candidatures reçues</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">Statut</th>
                      <th className="px-5 py-4 font-semibold text-[#1e4869]">Action admin</th>
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
                          <button className="ml-2 text-[#32A8D7] font-semibold hover:underline">Tout voir</button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full w-max text-xs font-semibold" style={{
                            backgroundColor: o.status === 'Actif' ? '#f0fdf4' : o.status === 'En attente' ? '#fefce8' : '#fef2f2',
                            color: '#475569'
                          }}>
                            {o.status}
                            <span className={`w-1.5 h-1.5 rounded-full ${o.status === 'Actif' ? 'bg-green-500' : o.status === 'En attente' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1 text-xs font-semibold items-start">
                            <button onClick={() => setJobToView(o)} className="text-[#32A8D7] hover:underline">Voir l&apos;offre</button>
                            
                            {o.status === 'En attente' && (
                              <button onClick={() => handleToggleStatus(o.rawId, 'PUBLISHED')} className="text-green-500 hover:underline">Approuver</button>
                            )}
                            {o.status === 'Suspendu' && (
                              <button onClick={() => handleToggleStatus(o.rawId, 'PUBLISHED')} className="text-green-500 hover:underline">Réactiver l&apos;offre</button>
                            )}
                            
                            {/* L'admin ne modifie pas les offres externes, sauf s'il les a créées */}
                            {o.isAdminCreated && (
                              <button onClick={() => setJobToEdit(o)} className="text-[#32A8D7] hover:underline">Modifier</button>
                            )}
                            
                            {o.status !== 'Suspendu' && (
                              <button onClick={() => handleToggleStatus(o.rawId, 'CLOSED')} className="text-yellow-500 hover:underline">Clôturer l&apos;offre</button>
                            )}
                            
                            <button onClick={() => handleDelete(o.rawId)} className="text-red-500 hover:underline">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                title="Aucune offre trouvée" 
                description="Il n'y a pas d'offres correspondant à vos critères." 
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "Mes offres" && (
        <div className="space-y-6">
          <div className="flex items-center text-sm text-slate-500">
            <Link href="/dashboard/admin" className="hover:text-slate-800">Accueil</Link>
            <span className="mx-2">›</span>
            <span>Offres créées par Netacuv</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-[#232323]">Emplois créés</h2>
            
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-[#eaf6fc] text-[#32A8D7] text-sm font-semibold rounded-lg">
                {mockMesOffres.length} emplois au total
              </span>
              <button onClick={() => setShowPublierModal(true)} className="px-4 py-2 bg-white border border-[#32A8D7] text-[#32A8D7] text-sm font-bold rounded-lg hover:bg-[#32A8D7] hover:text-white transition-colors">
                + Publier une offre
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
                      <span>Publié le: {o.date}</span>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${o.status === 'Actif' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        <span>{o.status}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${o.status === 'Actif' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-base mb-1">{o.titre}</h3>
                    <p className="text-sm text-slate-500 mb-1">Entreprise : <span className="font-semibold text-[#32A8D7]">{o.entreprise}</span></p>
                    <p className="text-sm text-slate-500 mb-4">{o.localisation}</p>
                    
                    <p className="text-xs text-slate-400 mb-4">{o.candidats} Candidats</p>
                    
                    <div className="flex items-center gap-2 mt-auto relative">
                      <button onClick={() => setJobToView(o)} className="flex-1 py-2 border border-[#32A8D7] text-[#32A8D7] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                        Voir détail
                      </button>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === o.id ? null : o.id)}
                        className="p-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenuId === o.id && (
                        <div className="absolute right-0 bottom-full mb-2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                          <button onClick={() => { setOpenMenuId(null); setJobToEdit(o); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Modifier</button>
                          {o.status !== 'Suspendu' ? (
                            <button onClick={() => { setOpenMenuId(null); handleToggleStatus(o.rawId, 'CLOSED'); }} className="w-full text-left px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-slate-50">Clôturer l&apos;offre</button>
                          ) : (
                            <button onClick={() => { setOpenMenuId(null); handleToggleStatus(o.rawId, 'PUBLISHED'); }} className="w-full text-left px-4 py-2 text-sm font-medium text-green-600 hover:bg-slate-50">Réactiver l&apos;offre</button>
                          )}
                          <button onClick={() => { setOpenMenuId(null); handleDelete(o.rawId); }} className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-slate-50">Supprimer</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button className="px-6 py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-200 transition-colors">
                  Voir plus
                </button>
              </div>
            </>
          ) : (
            <EmptyState 
              title="Vous n'avez publié aucune offre"
              description="Cliquez sur le bouton 'Publier une offre' pour créer votre première annonce."
              actionButton={
                <button onClick={() => setShowPublierModal(true)} className="px-6 py-2 bg-[#32A8D7] text-white font-bold rounded-lg hover:bg-[#2b91bb] transition-colors">
                  + Publier une offre
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
    </>
  );
}

const MOCK_CANDIDATES: any[] = [];

function CandidateCard({ c }: { c: typeof MOCK_CANDIDATES[number] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative w-full aspect-[4/3] bg-pink-100">
        <Image
          src={c.avatar}
          alt={c.nom}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover object-top"
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
              <span className="font-semibold">Profession :</span> {c.profession}
            </p>
          </div>
          <button className="text-slate-300 hover:text-[#32A8D7] transition-colors">
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
        <button onClick={onBack} className="hover:text-[#32A8D7] transition-colors">Accueil</button>
        <ChevronRight size={12} />
        <button onClick={onBack} className="hover:text-[#32A8D7] transition-colors">Offres d&apos;emplois</button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{emploi.titre}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">
              Publié le : <span className="font-semibold">{emploi.date}</span>
              &nbsp;·&nbsp;
              <span className="font-bold text-slate-700">{emploi.candidats} candidats</span>
            </p>
            <h2 className="text-2xl font-extrabold text-[#32A8D7]">{emploi.titre}</h2>
            <p className="text-sm text-slate-700 mt-0.5">
              <span className="font-semibold">Entreprise :</span> {emploi.entreprise}&nbsp;&nbsp;
              <span className="font-semibold">– Localisation :</span> {emploi.localisation}
            </p>
          </div>
          <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-[#32A8D7] hover:border-[#32A8D7] transition-colors shrink-0">
            <Share2 size={18} />
          </button>
        </div>

        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>{modeTravail}</p>
          <p>Type de Contrat : {emploi.contrat}</p>
        </div>

        <div className="flex items-center justify-between mt-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            (emploi.status === "Actif") ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-slate-100 text-slate-500"
          }`}>
            {(emploi.status === "Actif") ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Offre en cours</>
            ) : (
              <><Clock size={11} />Offre clôturée</>
            )}
          </span>
          {(emploi.status === "Actif") && (
            <button
              onClick={onCloturer}
              className="px-4 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Clôturer l&apos;offre
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#32A8D7] mb-4">Description de l&apos;Offre</h3>
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {desc}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#32A8D7] mb-1">Candidats postulés</h3>
        <p className="text-sm text-slate-500 mb-5">{emploi.candidats} candidatures reçues</p>
        {MOCK_CANDIDATES.length === 0 ? (
          <div className="text-center py-8">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Aucun candidat</p>
            <p className="text-xs text-slate-400">Aucun talent n&apos;a encore postulé à cette offre.</p>
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
          className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          Supprimer
        </button>
        {emploi.isAdminCreated && (
          <button
            onClick={onModifier}
            className="flex-1 py-3 rounded-2xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors"
          >
            Modifier
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
  const selectClass = "w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors cursor-pointer";
  const chevronSVG = (
    <svg className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <form onSubmit={handleSave} className="space-y-4 animate-fade-in-up">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button type="button" onClick={onBack} className="hover:text-[#32A8D7] transition-colors">Accueil</button>
        <ChevronRight size={12} />
        <button type="button" onClick={onBack} className="hover:text-[#32A8D7] transition-colors">Offres d&apos;emplois</button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{emploi.titre}</span>
      </nav>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Intitulé du poste</label>
        <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className={inputClass} required />
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Entreprise</label>
        <input type="text" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className={inputClass} required />
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Type de travail</label>
        <div className="relative">
          <select value={typeEmploi} onChange={(e) => setTypeEmploi(e.target.value)} className={selectClass}>
            <option>CDI</option><option>CDD</option><option>Stage</option><option>Freelance</option><option>Alternance</option>
          </select>
          {chevronSVG}
        </div>
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Lieu du travail</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input 
              type="text"
              list="countries-list"
              value={pays} 
              onChange={(e) => setPays(e.target.value)} 
              className={inputClass} 
              placeholder="Rechercher un pays"
            />
            <datalist id="countries-list">
              {["Bénin","Côte d'Ivoire","Sénégal","Togo","Mali","Cameroun","Burkina Faso","Guinée", "France", "Canada", "États-Unis", "Maroc", "Tunisie"].map(p => <option key={p} value={p} />)}
            </datalist>
          </div>
          <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass} placeholder="Ville" />
        </div>
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Mode de travail</label>
        <div className="relative">
          <select value={modeTravail} onChange={(e) => setModeTravail(e.target.value)} className={selectClass}>
            <option>Temps plein</option><option>Temps partiel</option><option>Remote</option><option>Hybride</option>
          </select>
          {chevronSVG}
        </div>
      </div>

      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Description de l&apos;offre</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={`${inputClass} resize-none`} placeholder="Décrivez l'offre..." required />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Annuler
        </button>
        <button type="submit" className="flex-1 py-3 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
          <Save size={15} /> Enregistrer les modifications
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
      alert("Une erreur inattendue est survenue.");
    }
  };

  const selectClass = "w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors cursor-pointer";
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Publier une offre</h3>
            <p className="text-xs text-slate-400 mt-0.5">Remplissez les informations de votre offre d&apos;emploi</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Intitulé du poste</label>
            <input required type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className={inputClass} placeholder="Ex: Développeur Front-end" />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Entreprise</label>
            <input type="text" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className={inputClass} placeholder="Nom de l'entreprise (Défaut: Netacuv)" />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Type de travail</label>
            <div className="relative">
              <select value={typeEmploi} onChange={(e) => setTypeEmploi(e.target.value)} className={selectClass}>
                <option>CDI</option><option>CDD</option><option>Stage</option><option>Freelance</option><option>Alternance</option>
              </select>
              <svg className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Lieu du travail</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input 
                  type="text"
                  list="countries-list"
                  value={pays} 
                  onChange={(e) => setPays(e.target.value)} 
                  className={inputClass} 
                  placeholder="Rechercher un pays"
                />
                <datalist id="countries-list">
                  {["Bénin","Côte d'Ivoire","Sénégal","Togo","Mali","Cameroun","Burkina Faso","Guinée", "France", "Canada", "États-Unis", "Maroc", "Tunisie"].map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
              <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass} placeholder="Ville" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Mode de travail</label>
            <div className="relative">
              <select value={modeTravail} onChange={(e) => setModeTravail(e.target.value)} className={selectClass}>
                <option>Temps plein</option><option>Temps partiel</option><option>Remote</option><option>Hybride</option>
              </select>
              <svg className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Description de l&apos;offre</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={`${inputClass} resize-none`} placeholder="Décrivez le poste, les missions, le profil recherché..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
              <Save size={15} /> Publier l&apos;offre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
