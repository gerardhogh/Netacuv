"use client";
import React, { useState, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

interface UserData {
  name: string | null;
  role: { name: string } | null;
}

interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  paymentMethod: string;
  createdAt: string;
  user: UserData;
}

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<TransactionData | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (response.ok) {
          const data = await response.json();
          // Normaliser les anciennes transactions fictives pour l'affichage correct
          const normalizedTx = (data.transactions || []).map((t: any) => {
            if (t.amount === 99.99) {
              const isRecruteur = t.user?.role?.name === 'RECRUTEUR';
              return { ...t, amount: isRecruteur ? 1000 : 700, currency: 'CFA' };
            }
            return t;
          });
          setTransactions(normalizedTx);
        } else {
          console.error("Erreur lors de la récupération des transactions");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusInFrench = (status: string) => {
    switch(status) {
      case "SUCCESS": return "Réussie";
      case "FAILED": return "Échouée";
      case "PENDING": return "En attente";
      default: return status;
    }
  };

  const getTypeInFrench = (type: string) => {
    if (type === "SUBSCRIPTION_PREMIUM") return "Abonnement Premium";
    if (type === "SUBSCRIPTION") return "Abonnement";
    if (type === "ONE_TIME") return "Achat unique";
    return type;
  };

  const filteredTx = transactions.filter(t => {
    const userName = t.user?.name || "Inconnu";
    return userName.toLowerCase().includes(search.toLowerCase()) || 
           t.id.toLowerCase().includes(search.toLowerCase());
  });

  // Calculate metrics
  const totalRevenue = transactions
    .filter(t => t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalTx = transactions.length;
  const successTx = transactions.filter(t => t.status === "SUCCESS").length;
  const pendingTx = transactions.filter(t => t.status === "PENDING").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <p className="text-[#1e4869] text-sm">Chiffre d'affaires</p>
          <p className="text-3xl font-bold text-[#0c2f4a]">{totalRevenue.toLocaleString()} CFA</p>
          <button className="w-full py-2 bg-[#51B7E6] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
            Voir tout
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <p className="text-[#1e4869] text-sm">Transactions</p>
          <p className="text-3xl font-bold text-[#0c2f4a]">{totalTx}</p>
          <button className="w-full py-2 bg-[#62D852] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
            Voir tout
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <p className="text-[#1e4869] text-sm">Transactions réussies</p>
          <p className="text-3xl font-bold text-[#0c2f4a]">{successTx}</p>
          <button className="w-full py-2 bg-[#FE7BF4] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
            Voir tout
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <p className="text-[#1e4869] text-sm">En attente</p>
          <p className="text-3xl font-bold text-[#0c2f4a]">{pendingTx}</p>
          <button className="w-full py-2 bg-[#D0D71B] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
            Voir tout
          </button>
        </div>

      </div>

      {/* Title & Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#0c2f4a]">Historique des transactions</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] w-full md:w-64"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {[
            { label: "Profil" },
            { label: "Type de transaction" },
            { label: "Statut" },
            { label: "Méthode" },
            { label: "Période" }
          ].map(f => (
            <button key={f.label} className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-100 text-[#1e4869] text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors flex-1 min-w-[140px]">
              {f.label}
              <ChevronDown size={14} className="text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#32A8D7]"></div>
          </div>
        ) : filteredTx.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[900px]">
              <thead className="bg-[#f4f9fd] border-b border-slate-100">
                <tr>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">No</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Date</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Référence</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Utilisateur</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Profil</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Moyen</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Montant</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Service</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Statut</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.map((t, index) => {
                  const statusFr = getStatusInFrench(t.status);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3 text-[#1e4869] text-xs whitespace-nowrap">#{index + 1}</td>
                      <td className="px-3 py-3 text-[#1e4869] text-xs whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        <br />
                        <span className="text-slate-400 text-[10px]">
                          {new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#1e4869] font-mono text-xs whitespace-nowrap">{t.id.slice(-8).toUpperCase()}</td>
                      <td className="px-3 py-3 text-[#1e4869] text-xs whitespace-nowrap">{t.user?.name || "Inconnu"}</td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.user?.role?.name === 'RECRUTEUR'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {t.user?.role?.name || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#1e4869] text-xs whitespace-nowrap">{t.paymentMethod}</td>
                      <td className="px-3 py-3 font-bold text-[#1e4869] text-xs whitespace-nowrap">{t.amount} {t.currency}</td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-[10px] font-semibold">
                          {getTypeInFrench(t.type)}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${
                          t.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200'
                          : t.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            t.status === 'SUCCESS' ? 'bg-green-500' : t.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {statusFr}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button onClick={() => setSelectedTx(t)} className="text-[#32A8D7] font-semibold hover:underline text-xs">Voir</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
            <p className="text-lg font-medium text-slate-500 mb-1">Aucune transaction trouvée</p>
            <p className="text-sm">Il n&apos;y a pas de transactions correspondant à vos critères.</p>
          </div>
        )}
      </div>
      
      {/* Modal Details */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-[#08304c]">Détails de la transaction</h3>
              <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Référence</span>
                <span className="font-mono text-sm text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 break-all">{selectedTx.id}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Date</span>
                  <span className="text-sm text-slate-800 font-medium">{new Date(selectedTx.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' à')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Statut</span>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedTx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : selectedTx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {getStatusInFrench(selectedTx.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Utilisateur</span>
                  <span className="text-sm font-semibold text-[#008de4]">{selectedTx.user?.name || "Inconnu"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Profil</span>
                  <span className="text-sm text-slate-800 font-medium">{selectedTx.user?.role?.name || "Non défini"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Moyen de paiement</span>
                  <span className="text-sm text-slate-800 font-medium">{selectedTx.paymentMethod}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Service</span>
                  <span className="text-sm text-slate-800 font-medium">{getTypeInFrench(selectedTx.type)}</span>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-bold">Montant Total</span>
                <span className="text-2xl font-black text-[#32A8D7]">{selectedTx.amount} {selectedTx.currency}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
