"use client";
import React, { useState, useEffect } from "react";
import { Search, RotateCcw, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { downloadReceipt } from "@/lib/receiptGenerator";

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
  const t = useTranslations("admin.transactions");
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState("ALL");
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
          const normalizedTx = (data.transactions || []).map((item: any) => {
            if (item.amount === 99.99) {
              const isRecruteur = item.user?.role?.name === 'RECRUTEUR';
              return { ...item, amount: isRecruteur ? 1000 : 700, currency: 'CFA' };
            }
            return item;
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

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "SUCCESS": return t("success");
      case "FAILED": return t("failed");
      case "PENDING": return t("pending");
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "SUBSCRIPTION_PREMIUM") return t("subscriptionPremium");
    if (type === "SUBSCRIPTION") return t("subscription");
    if (type === "ONE_TIME") return t("oneTime");
    return type;
  };

  const resetAllFilters = () => {
    setSearch("");
    setProfileFilter("ALL");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setMethodFilter("ALL");
    setPeriodFilter("ALL");
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    profileFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    methodFilter !== "ALL" ||
    periodFilter !== "ALL"
  );

  const filteredTx = transactions.filter(item => {
    // 1. Search filter
    const userName = (item.user?.name || "").toLowerCase();
    const userRole = (item.user?.role?.name || "").toLowerCase();
    const id = (item.id || "").toLowerCase();
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || userName.includes(q) || id.includes(q) || userRole.includes(q);

    // 2. Profile filter
    const roleUpper = (item.user?.role?.name || "").toUpperCase();
    const matchesProfile =
      profileFilter === "ALL" ||
      (profileFilter === "TALENT" && roleUpper === "TALENT") ||
      (profileFilter === "RECRUTEUR" && (roleUpper === "RECRUTEUR" || roleUpper === "RECRUITER"));

    // 3. Type filter
    const matchesType = typeFilter === "ALL" || item.type === typeFilter;

    // 4. Status filter
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    // 5. Method filter
    const matchesMethod =
      methodFilter === "ALL" ||
      (item.paymentMethod || "").toLowerCase() === methodFilter.toLowerCase();

    // 6. Period filter
    let matchesPeriod = true;
    if (periodFilter !== "ALL") {
      const txDate = new Date(item.createdAt);
      const now = new Date();
      if (periodFilter === "7DAYS") {
        const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriod = txDate >= d7;
      } else if (periodFilter === "30DAYS") {
        const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesPeriod = txDate >= d30;
      } else if (periodFilter === "MONTH") {
        matchesPeriod = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      } else if (periodFilter === "YEAR") {
        matchesPeriod = txDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesProfile && matchesType && matchesStatus && matchesMethod && matchesPeriod;
  });

  // Calculate metrics
  const totalRevenue = transactions
    .filter(item => item.status === "SUCCESS")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalTx = transactions.length;
  const successTx = transactions.filter(item => item.status === "SUCCESS").length;
  const pendingTx = transactions.filter(item => item.status === "PENDING").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <p className="text-[#1e4869] text-sm">{t("revenue")}</p>
          <p className="text-3xl font-bold text-[#0c2f4a]">{totalRevenue.toLocaleString()} CFA</p>
          <button 
            onClick={() => { setStatusFilter("SUCCESS"); }}
            className="w-full py-2 bg-[#51B7E6] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t("viewAll")}
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <p className="text-[#1e4869] text-sm">{t("transactions")}</p>
          <p className="text-3xl font-bold text-[#0c2f4a]">{totalTx}</p>
          <button 
            onClick={() => { setStatusFilter("ALL"); }}
            className="w-full py-2 bg-[#62D852] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t("viewAll")}
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <p className="text-[#1e4869] text-sm">{t("successfulTx")}</p>
          <p className="text-3xl font-bold text-[#0c2f4a]">{successTx}</p>
          <button 
            onClick={() => { setStatusFilter("SUCCESS"); }}
            className="w-full py-2 bg-[#FE7BF4] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t("viewAll")}
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
          <p className="text-[#1e4869] text-sm">{t("pendingTx")}</p>
          <p className="text-3xl font-bold text-[#0c2f4a]">{pendingTx}</p>
          <button 
            onClick={() => { setStatusFilter("PENDING"); }}
            className="w-full py-2 bg-[#D0D71B] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t("viewAll")}
          </button>
        </div>

      </div>

      {/* Title & Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#0c2f4a]">{t("historyTitle")}</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] w-full md:w-64"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CustomSelect
            value={profileFilter}
            onChange={setProfileFilter}
            options={[
              { label: t("allProfiles"), value: "ALL" },
              { label: t("profileTalent"), value: "TALENT" },
              { label: t("profileRecruiter"), value: "RECRUTEUR" }
            ]}
            className="flex-1 min-w-[150px]"
          />

          <CustomSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: t("allTypes"), value: "ALL" },
              { label: t("subscriptionPremium"), value: "SUBSCRIPTION_PREMIUM" },
              { label: t("subscription"), value: "SUBSCRIPTION" },
              { label: t("oneTime"), value: "ONE_TIME" }
            ]}
            className="flex-1 min-w-[150px]"
          />

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: t("allStatuses"), value: "ALL" },
              { label: t("success"), value: "SUCCESS" },
              { label: t("pending"), value: "PENDING" },
              { label: t("failed"), value: "FAILED" }
            ]}
            className="flex-1 min-w-[150px]"
          />

          <CustomSelect
            value={methodFilter}
            onChange={setMethodFilter}
            options={[
              { label: t("allMethods"), value: "ALL" },
              { label: "Carte Bancaire", value: "Carte Bancaire" },
              { label: "Mobile Money", value: "Mobile Money" },
              { label: "PayPal", value: "PayPal" }
            ]}
            className="flex-1 min-w-[150px]"
          />

          <CustomSelect
            value={periodFilter}
            onChange={setPeriodFilter}
            options={[
              { label: t("allPeriods"), value: "ALL" },
              { label: t("period7Days"), value: "7DAYS" },
              { label: t("period30Days"), value: "30DAYS" },
              { label: t("periodMonth"), value: "MONTH" },
              { label: t("periodYear"), value: "YEAR" }
            ]}
            className="flex-1 min-w-[150px]"
          />

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw size={14} />
              {t("resetFilters")}
            </button>
          )}
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
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thNo")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thDate")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thRef")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thUser")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thProfile")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thMethod")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thAmount")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thService")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thStatus")}</th>
                  <th className="px-3 py-3 font-semibold text-[#1e4869] text-xs whitespace-nowrap">{t("thAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.map((item, index) => {
                  const statusLabel = getStatusLabel(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3 text-[#1e4869] text-xs whitespace-nowrap">#{index + 1}</td>
                      <td className="px-3 py-3 text-[#1e4869] text-xs whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        <br />
                        <span className="text-slate-400 text-[10px]">
                          {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#1e4869] font-mono text-xs whitespace-nowrap">{item.id.slice(-8).toUpperCase()}</td>
                      <td className="px-3 py-3 text-[#1e4869] text-xs whitespace-nowrap">{item.user?.name || t("unknown")}</td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.user?.role?.name === 'RECRUTEUR'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {item.user?.role?.name || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#1e4869] text-xs whitespace-nowrap">{item.paymentMethod}</td>
                      <td className="px-3 py-3 font-bold text-[#1e4869] text-xs whitespace-nowrap">{item.amount} {item.currency}</td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-[10px] font-semibold">
                          {getTypeLabel(item.type)}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${
                          item.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200'
                          : item.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            item.status === 'SUCCESS' ? 'bg-green-500' : item.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {statusLabel}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button onClick={() => setSelectedTx(item)} className="text-[#32A8D7] font-semibold hover:underline text-xs cursor-pointer">{t("view")}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            type="transactions"
            title={t("emptyTitle")}
            description={t("emptyDesc")}
          />
        )}
      </div>
      
      {/* Modal Details */}
      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={t("modalTitle")}
        description={selectedTx ? t("modalRef", { ref: selectedTx.id }) : undefined}
        maxWidth="max-w-md"
      >
        {selectedTx && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{t("refLabel")}</span>
              <span className="font-mono text-sm text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 break-all">{selectedTx.id}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{t("dateLabel")}</span>
                <span className="text-sm text-slate-800 font-medium">{new Date(selectedTx.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' à')}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{t("statusLabel")}</span>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedTx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : selectedTx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {getStatusLabel(selectedTx.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{t("userLabel")}</span>
                <span className="text-sm font-semibold text-[#008de4]">{selectedTx.user?.name || t("unknown")}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{t("profileLabel")}</span>
                <span className="text-sm text-slate-800 font-medium">{selectedTx.user?.role?.name || t("notDefined")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{t("paymentMethodLabel")}</span>
                <span className="text-sm text-slate-800 font-medium">{selectedTx.paymentMethod}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{t("serviceLabel")}</span>
                <span className="text-sm text-slate-800 font-medium">{getTypeLabel(selectedTx.type)}</span>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-bold">{t("totalAmountLabel")}</span>
              <span className="text-2xl font-black text-[#32A8D7]">{selectedTx.amount} {selectedTx.currency}</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button 
                onClick={() => downloadReceipt({
                  id: selectedTx.id,
                  amount: selectedTx.amount,
                  currency: selectedTx.currency,
                  paymentMethod: selectedTx.paymentMethod,
                  status: selectedTx.status,
                  type: selectedTx.type,
                  createdAt: selectedTx.createdAt,
                  user: selectedTx.user ? {
                    name: selectedTx.user.name || undefined,
                    role: selectedTx.user.role || undefined,
                  } : undefined
                })}
                className="w-full py-2.5 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={15} />
                Télécharger le reçu
              </button>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t("close")}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
