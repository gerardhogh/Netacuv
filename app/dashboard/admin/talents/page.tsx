"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { TalentDetails } from "../components/TalentDetails";
import { Modal } from "@/app/components/ui/Modal";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [videoFilter, setVideoFilter] = useState("Tous");
  const [selectedTalent, setSelectedTalent] = useState<TalentData | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'activate' | 'suspend' | 'delete' } | null>(null);

  const { data: talentsRaw, isLoading: loading, mutate } = useSWR("/api/talents", fetcher);

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
    return <TalentDetails talent={selectedTalent} onBack={() => setSelectedTalent(null)} />;
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
          <span className="text-[#232323]">Liste des</span> <span className="text-[#32A8D7]">talents</span>
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
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] bg-white text-slate-700"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="En attente">En attente</option>
            <option value="Suspendu">Suspendu</option>
          </select>
          
          <select 
            value={videoFilter}
            onChange={(e) => setVideoFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] bg-white text-slate-700"
          >
            <option value="Tous">Vidéo : Tous</option>
            <option value="Oui">Vidéo : Oui</option>
            <option value="Non">Vidéo : Non</option>
          </select>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-[#eaf6fc] border border-[#d6effa] text-[#32A8D7] text-sm font-semibold rounded-full">
              {stats.total} talents au total
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
          <div className="p-8 text-center text-slate-500">Chargement des talents...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-500">No</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Nom complet</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Domaine</th>
                  <th className="px-5 py-4 font-semibold text-slate-500 whitespace-nowrap">Date d&apos;inscription</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Localisation</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Contact</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Email</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Statut</th>
                  <th className="px-5 py-4 font-semibold text-slate-500 whitespace-nowrap">Abonnement</th>
                  <th className="px-5 py-4 font-semibold text-slate-500 whitespace-nowrap">Vidéo test</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Action admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-slate-500">{t.no}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelectedTalent(t)} className="text-[#32A8D7] font-semibold hover:underline text-left">
                        {t.name}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{t.domaine}</td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-5 py-4 text-slate-700">{t.location}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{t.contact}</span>
                    </td>
                    <td className="px-5 py-4">
                      <a href={`mailto:${t.email}`} className="text-[#32A8D7] hover:underline">{t.email}</a>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${t.status === 'Actif' ? 'text-slate-700' : t.status === 'En attente' ? 'text-slate-700' : 'text-slate-700'}`}>
                          {t.status}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${t.status === 'Actif' ? 'bg-green-500' : t.status === 'En attente' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {t.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full whitespace-nowrap">
                          ★ Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold rounded-full whitespace-nowrap">
                          Gratuit
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {t.videoOk ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Oui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold rounded-full whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Non
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs font-semibold items-start">
                        <button onClick={() => setSelectedTalent(t)} className="text-[#32A8D7] hover:underline">Voir profil</button>
                        
                        {t.status === 'En attente' && (
                          <button onClick={() => setConfirmAction({ id: t.id, type: 'activate' })} className="text-green-500 hover:underline">Approuver</button>
                        )}
                        {t.status === 'Suspendu' && (
                          <button onClick={() => setConfirmAction({ id: t.id, type: 'activate' })} className="text-green-500 hover:underline">Réactiver</button>
                        )}
                        
                        <button onClick={() => setSelectedTalent(t)} className="text-[#32A8D7] hover:underline">Modifier</button>
                        
                        {t.status !== 'Suspendu' && (
                          <button onClick={() => setConfirmAction({ id: t.id, type: 'suspend' })} className="text-yellow-500 hover:underline">Suspendre</button>
                        )}
                        
                        <button onClick={() => setConfirmAction({ id: t.id, type: 'delete' })} className="text-red-500 hover:underline">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-lg font-medium text-slate-500 mb-1">Aucun talent trouvé</p>
            <p className="text-sm">Il n&apos;y a pas de talents correspondant à vos critères.</p>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'delete' ? 'Supprimer le talent' : confirmAction?.type === 'activate' ? 'Activer le talent' : 'Suspendre le talent'}
        description={
          confirmAction?.type === 'delete' 
            ? 'Voulez-vous vraiment supprimer ce talent ? Cette action est irréversible.' 
            : confirmAction?.type === 'activate'
            ? 'Voulez-vous activer ce talent ?'
            : 'Voulez-vous suspendre ce talent ?'
        }
      >
        <div className="flex justify-end gap-3 mt-4">
          <button 
            onClick={() => setConfirmAction(null)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleConfirmAction}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
              confirmAction?.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#32A8D7] hover:bg-[#2b90b8]'
            }`}
          >
            Confirmer
          </button>
        </div>
      </Modal>
    </div>
  );
}
