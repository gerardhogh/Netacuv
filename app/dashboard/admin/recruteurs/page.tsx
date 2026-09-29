"use client";
import React, { useState } from "react";
import { Search, Mail, Eye, Edit, Trash2 } from "lucide-react";
import { RecruteurDetails } from "../components/RecruteurDetails";
import { Modal } from "@/app/components/ui/Modal";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminRecruteurs() {
  const [search, setSearch] = useState("");
  const [selectedRecruteur, setSelectedRecruteur] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'activate' | 'suspend' | 'delete' } | null>(null);

  const { data: users = [], isLoading: loading, mutate } = useSWR("/api/users", fetcher);

  const recruteurs = Array.isArray(users) ? users
    .filter((u: any) => u.recruiterProfile || ["RECRUTEUR", "RECRUITER"].includes(u.role?.name?.toUpperCase()))
    .map((r: any, index: number) => ({
      id: r.id,
      no: (index + 1).toString().padStart(2, '0'),
      name: r.recruiterProfile?.companyName || r.name || "Entreprise",
      offresPubliees: r.recruiterProfile?.jobOffers?.length || 0,
      email: r.email || "",
      contact: r.recruiterProfile?.phone || r.phone || "Non spécifié",
      candidats: r.recruiterProfile?.jobOffers?.reduce((acc: number, job: any) => acc + (job.applications?.length || 0), 0) || 0,
      abonnement: "Standard",
      date: new Date(r.createdAt).toLocaleDateString("fr-FR"),
      status: r.active ? "Actif" : "Suspendu"
    })) : [];

  const filtered = recruteurs.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: recruteurs.length,
    actifs: recruteurs.filter(r => r.status === "Actif").length,
    attente: recruteurs.filter(r => r.status === "En attente").length,
    suspendus: recruteurs.filter(r => r.status === "Suspendu").length,
    supprimes: 0
  };

  if (selectedRecruteur) {
    return <RecruteurDetails recruteur={selectedRecruteur} onBack={() => setSelectedRecruteur(null)} />;
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
          <span className="text-[#232323]">Liste des</span> <span className="text-[#32A8D7]">recruteurs</span>
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
              {stats.total} recruteurs au total
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
          <div className="p-8 text-center text-slate-500">Chargement des recruteurs...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f4f9fd] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">No</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Nom de recruteur</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Offres publiées</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Email professionnel</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Contact principal</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Offres publiées</th> {/* Deliberately matching Figma's duplicate column text */}
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Abonnement</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Date d'inscription</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Statut</th>
                  <th className="px-5 py-4 font-semibold text-[#1e4869]">Action admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-[#1e4869] font-medium">{r.no}</td>
                    <td className="px-5 py-4 text-[#1e4869] font-medium">{r.name}</td>
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
                        {r.status}
                        <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Actif' ? 'bg-green-500' : r.status === 'En attente' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs font-semibold items-start">
                        <button onClick={() => setSelectedRecruteur(r)} className="text-[#32A8D7] hover:underline">Voir profil</button>
                        
                        {r.status === 'En attente' && (
                          <button onClick={() => setConfirmAction({ id: r.id, type: 'activate' })} className="text-green-500 hover:underline">Approuver</button>
                        )}
                        {r.status === 'Suspendu' && (
                          <button onClick={() => setConfirmAction({ id: r.id, type: 'activate' })} className="text-green-500 hover:underline">Réactiver</button>
                        )}
                        
                        <button onClick={() => setSelectedRecruteur(r)} className="text-[#32A8D7] hover:underline">Modifier</button>
                        
                        {r.status !== 'Suspendu' && (
                          <button onClick={() => setConfirmAction({ id: r.id, type: 'suspend' })} className="text-yellow-500 hover:underline">Suspendre</button>
                        )}
                        
                        <button onClick={() => setConfirmAction({ id: r.id, type: 'delete' })} className="text-red-500 hover:underline">Supprimer</button>
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-lg font-medium text-slate-500 mb-1">Aucun recruteur trouvé</p>
            <p className="text-sm">Il n'y a pas de recruteurs correspondant à vos critères.</p>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'delete' ? 'Supprimer le recruteur' : confirmAction?.type === 'activate' ? 'Activer le recruteur' : 'Suspendre le recruteur'}
        description={
          confirmAction?.type === 'delete' 
            ? 'Voulez-vous vraiment supprimer ce recruteur ? Cette action est irréversible.' 
            : confirmAction?.type === 'activate'
            ? 'Voulez-vous activer ce recruteur ?'
            : 'Voulez-vous suspendre ce recruteur ?'
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
