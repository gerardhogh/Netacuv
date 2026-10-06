"use client";

import React, { useState } from "react";
import { Gift, Save, Search, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { updateSystemSettings, updateUserReferralCode } from "./actions";

interface UserWithAffiliation {
  id: string;
  name: string | null;
  email: string | null;
  roleName: string | null;
  referralCode: string | null;
  affiliateBalance: number;
  referralsCount: number;
}

export default function AffiliationClient({
  users,
  initialFixedBonus,
  initialPercentBonus
}: {
  users: UserWithAffiliation[];
  initialFixedBonus: string;
  initialPercentBonus: string;
}) {
  const [fixedBonus, setFixedBonus] = useState(initialFixedBonus);
  const [percentBonus, setPercentBonus] = useState(initialPercentBonus);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editCodeValue, setEditCodeValue] = useState("");

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await updateSystemSettings([
        { key: "AFFILIATE_BONUS_FIXED", value: fixedBonus },
        { key: "AFFILIATE_BONUS_PERCENT", value: percentBonus }
      ]);
      toast.success("Paramètres d'affiliation mis à jour");
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSaveCode = async (userId: string) => {
    try {
      await updateUserReferralCode(userId, editCodeValue.trim());
      toast.success("Code d'affiliation mis à jour");
      setEditingUserId(null);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour du code");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.referralCode && u.referralCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Gift size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Configuration des Bonus</h2>
            <p className="text-sm text-slate-500">Définissez les récompenses globales pour les parrains.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Bonus Fixe (€)</label>
            <div className="relative">
              <input 
                type="number"
                value={fixedBonus}
                onChange={(e) => setFixedBonus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                placeholder="Ex: 5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">€</span>
            </div>
            <p className="text-xs text-slate-500">Montant fixe attribué au parrain lors d'une inscription ou action validée.</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Bonus Pourcentage (%)</label>
            <div className="relative">
              <input 
                type="number"
                value={percentBonus}
                onChange={(e) => setPercentBonus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                placeholder="Ex: 10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">%</span>
            </div>
            <p className="text-xs text-slate-500">Pourcentage perçu par le parrain sur les transactions du filleul.</p>
          </div>
        </div>

        <button 
          onClick={handleSaveConfig}
          disabled={isSavingConfig}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {isSavingConfig ? "Enregistrement..." : "Enregistrer la configuration"}
        </button>
      </div>

      {/* Users Affiliation Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Gestion des codes par Utilisateur</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher (Nom, Email, Code)..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Utilisateur</th>
                <th className="px-5 py-4">Rôle</th>
                <th className="px-5 py-4">Code d'Affiliation</th>
                <th className="px-5 py-4">Filleuls (Inscrits)</th>
                <th className="px-5 py-4">Solde Affilié</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{u.name || "N/A"}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${u.roleName === 'TALENT' ? 'bg-indigo-50 text-indigo-600' : u.roleName === 'RECRUTEUR' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {u.roleName || "Inconnu"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={editCodeValue}
                            onChange={(e) => setEditCodeValue(e.target.value.toUpperCase())}
                            className="px-2 py-1 border border-blue-300 rounded text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                            placeholder="Code"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {u.referralCode || <span className="text-slate-400 italic font-sans text-xs">Aucun code</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{u.referralsCount}</td>
                    <td className="px-5 py-4 font-semibold text-green-600">{u.affiliateBalance.toFixed(2)} €</td>
                    <td className="px-5 py-4 text-right">
                      {editingUserId === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSaveCode(u.id)} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors" title="Enregistrer">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingUserId(null)} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors" title="Annuler">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setEditingUserId(u.id); setEditCodeValue(u.referralCode || ""); }}
                          className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors inline-flex"
                          title="Personnaliser le code"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
