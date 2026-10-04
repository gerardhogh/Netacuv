"use client";

import { useState } from "react";
import { Search, X, Download, ArrowUpRight } from "lucide-react";

type TxStatus = "success" | "failed" | "pending";

interface Transaction {
  id: string;
  date: string;
  reference: string;
  method: string;
  amount: number;
  service: string;
  status: TxStatus;
}

import useSWR from "swr";

const statusConfig: Record<TxStatus, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
  success: { label: "Réussie", dotClass: "bg-green-500", textClass: "text-green-700", bgClass: "bg-green-50 border-green-200" },
  failed: { label: "Échoué", dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50 border-red-200" },
  pending: { label: "En attente", dotClass: "bg-yellow-500", textClass: "text-yellow-700", bgClass: "bg-yellow-50 border-yellow-200" },
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TransactionsTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | TxStatus>("all");
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);

  const { data: apiData } = useSWR('/api/transactions', fetcher);
  
  const transactions: Transaction[] = apiData?.transactions?.map((t: any) => ({
    id: t.id,
    date: new Date(t.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    reference: t.id.substring(0, 10).toUpperCase(),
    method: t.paymentMethod || "Carte Bancaire",
    amount: t.amount,
    service: t.type || "Abonnement Premium",
    status: (t.status === "SUCCESS" || t.status === "COMPLETED") ? "success" 
          : (t.status === "FAILED" || t.status === "ERROR") ? "failed" 
          : "pending"
  })) || [];

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.reference.toLowerCase().includes(search.toLowerCase()) ||
      tx.method.toLowerCase().includes(search.toLowerCase()) ||
      tx.service.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || tx.status === filter;
    return matchSearch && matchFilter;
  });

  const total = transactions.reduce((a, b) => a + b.amount, 0);
  const successCount = transactions.filter((t) => t.status === "success").length;
  const pendingCount = transactions.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header handled by parent page.tsx */}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <SummaryCard
          label="Total dépensé"
          value={`${total.toLocaleString("fr-FR")} FCFA`}
          onClick={() => setFilter("all")}
        />
        <SummaryCard
          label="Transactions"
          value={transactions.length.toString()}
          onClick={() => setFilter("all")}
        />
        <SummaryCard
          label="Paiements réussis"
          value={successCount.toString()}
          onClick={() => setFilter("success")}
        />
        <SummaryCard
          label="En attente"
          value={pendingCount.toString()}
          onClick={() => setFilter("pending")}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-4">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-bold text-[#08304c] text-base">Mes transactions</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-[#f8fafc]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold">
                <th className="px-5 py-3 text-left">No</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Référence</th>
                <th className="px-5 py-3 text-left">Moyen de paiement</th>
                <th className="px-5 py-3 text-left">Montant</th>
                <th className="px-5 py-3 text-left">Service</th>
                <th className="px-5 py-3 text-left">Statut</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                filtered.map((tx, index) => {
                  const cfg = statusConfig[tx.status] || statusConfig.pending;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-[#32A8D7] font-semibold">{index + 1}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{tx.date}</td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">{tx.reference}</td>
                      <td className="px-5 py-3.5 text-slate-600">{tx.method}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{tx.amount} FCFA</td>
                      <td className="px-5 py-3.5 text-slate-600">{tx.service}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bgClass} ${cfg.textClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setDetailTx(tx)}
                          className="text-[#32A8D7] hover:underline text-xs font-semibold flex items-center gap-1"
                        >
                          Voir <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setDetailTx(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-[#232323] mb-1">Détails</h3>
            <p className="text-xs text-slate-500 mb-5">
              Historique des Transactions · <span className="font-semibold text-slate-700">{detailTx.reference}</span> —{" "}
              <span className={statusConfig[detailTx.status].textClass}>
                Paiement {statusConfig[detailTx.status].label.toLowerCase()}
              </span>
            </p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6 border border-slate-100">
              <DetailRow label="Service" value={detailTx.service} bold />
              <DetailRow label="Montant payé" value={`${detailTx.amount} CFA`} />
              <DetailRow label="Mode de paiement" value={detailTx.method} />
              <DetailRow label="Date & Heure" value={detailTx.date} />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-slate-500">Statut</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig[detailTx.status].bgClass} ${statusConfig[detailTx.status].textClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[detailTx.status].dotClass}`} />
                  {statusConfig[detailTx.status].label}
                </span>
              </div>
            </div>

            <button className="w-full bg-[#32A8D7] hover:bg-[#288fb8] text-white font-bold py-3 rounded-xl text-sm transition-colors mb-3">
              Fermer
            </button>
            <button className="w-full text-[#32A8D7] text-sm font-semibold hover:underline flex items-center justify-center gap-2">
              <Download size={14} />
              Télécharger le reçu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label, value, onClick
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-black text-[#232323]">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm text-slate-800 text-right ${bold ? "font-bold text-[#232323]" : ""}`}>{value}</span>
    </div>
  );
}
