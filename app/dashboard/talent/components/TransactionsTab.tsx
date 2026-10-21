"use client";

import { useState } from "react";
import { Search, X, Download, ArrowUpRight, Receipt } from "lucide-react";
import useSWR from "swr";
import { useTranslations, useLocale } from "next-intl";
import { Modal } from "@/app/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { downloadReceipt } from "@/lib/receiptGenerator";
import { formatTableId } from "@/lib/formatTableId";

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TransactionsTab() {
  const t = useTranslations("talentTransactions");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | TxStatus>("all");
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);

  const statusConfig: Record<TxStatus, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
    success: { label: t("statusSuccess"), dotClass: "bg-green-500", textClass: "text-green-700", bgClass: "bg-green-50 border-green-200" },
    failed: { label: t("statusFailed"), dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50 border-red-200" },
    pending: { label: t("statusPending"), dotClass: "bg-yellow-500", textClass: "text-yellow-700", bgClass: "bg-yellow-50 border-yellow-200" },
  };

  const { data: apiData, isLoading } = useSWR('/api/transactions', fetcher, {
    refreshInterval: 30000,
  });

  const transactions: Transaction[] = apiData?.transactions?.map((tx: any, index: number) => ({
    id: tx.id,
    date: new Date(tx.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    reference: formatTableId(tx.id, index + 1),
    method: tx.paymentMethod || t("bankCard"),
    amount: tx.amount,
    service: tx.type || t("premiumSubscription"),
    status: (tx.status === "SUCCESS" || tx.status === "COMPLETED") ? "success"
          : (tx.status === "FAILED" || tx.status === "ERROR") ? "failed"
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
      {/* Header */}
      <div className="pb-2">
        <h2 className="text-2xl font-bold text-slate-900">
          {t("title")}{" "}<span className="text-[#008de4]">{t("titleHighlight")}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">{t("subtitle")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label={t("totalSpent")}
          value={`${total.toLocaleString(locale === "en" ? "en-US" : "fr-FR")} FCFA`}
          onClick={() => setFilter("all")}
        />
        <SummaryCard
          label={t("transactionsCount")}
          value={transactions.length.toString()}
          onClick={() => setFilter("all")}
        />
        <SummaryCard
          label={t("successfulTx")}
          value={successCount.toString()}
          onClick={() => setFilter("success")}
        />
        <SummaryCard
          label={t("pendingTx")}
          value={pendingCount.toString()}
          onClick={() => setFilter("pending")}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-bold text-[#08304c] text-base">{t("myTransactions")}</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
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
                <th className="px-5 py-3 text-left">{t("thNo")}</th>
                <th className="px-5 py-3 text-left">{t("thDate")}</th>
                <th className="px-5 py-3 text-left">{t("thRef")}</th>
                <th className="px-5 py-3 text-left">{t("thMethod")}</th>
                <th className="px-5 py-3 text-left">{t("thAmount")}</th>
                <th className="px-5 py-3 text-left">{t("thService")}</th>
                <th className="px-5 py-3 text-left">{t("thStatus")}</th>
                <th className="px-5 py-3 text-left">{t("thAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#008de4]/30 border-t-[#008de4] rounded-full animate-spin" />
                      {t("loading")}
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8">
                    <EmptyState
                      type="transactions"
                      title={t("noTransactions")}
                      description={t("noTransactionsDesc")}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((tx, index) => {
                  const cfg = statusConfig[tx.status] || statusConfig.pending;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-[#0071a2] font-mono font-bold whitespace-nowrap">{formatTableId(index + 1)}</td>
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
                          className="text-[#008de4] hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {t("view")} <ArrowUpRight size={12} />
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

      {/* Detail Modal (Unified) */}
      {detailTx && (
        <Modal
          isOpen={true}
          onClose={() => setDetailTx(null)}
          title={t("modalTitle")}
          description={t("modalSubtitle", { ref: detailTx.reference })}
          icon={<Receipt size={22} className="text-[#1e8ae9]" />}
          iconColor="primary"
          maxWidth="max-w-md"
        >
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 space-y-3 mb-6 border border-slate-100">
            <DetailRow label={t("service")} value={detailTx.service} bold />
            <DetailRow label={t("modalPaidAmount")} value={`${detailTx.amount} CFA`} />
            <DetailRow label={t("method")} value={detailTx.method} />
            <DetailRow label={t("modalDateTime")} value={detailTx.date} />
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm text-slate-500">{t("status")}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig[detailTx.status].bgClass} ${statusConfig[detailTx.status].textClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[detailTx.status].dotClass}`} />
                {statusConfig[detailTx.status].label}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setDetailTx(null)}
              className="w-full bg-gradient-to-r from-[#1e8ae9] to-[#32A8D7] hover:from-[#1877c9] hover:to-[#2896c2] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {t("close")}
            </button>
            <button
              onClick={() => downloadReceipt(detailTx)}
              className="w-full text-[#1e8ae9] text-sm font-semibold hover:underline flex items-center justify-center gap-2 py-1.5 cursor-pointer"
            >
              <Download size={14} />
              {t("downloadReceipt")}
            </button>
          </div>
        </Modal>
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
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm text-slate-800 text-right ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}
