"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { 
  Flag, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  Briefcase, 
  User, 
  Building2,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { EmptyState } from "@/components/ui/EmptyState";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Report {
  id: string;
  reporterId: string | null;
  targetType: "JOB_OFFER" | "TALENT" | "RECRUITER";
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

export default function AdminSignalements() {
  const t = useTranslations("admin.reports");
  const { data: reports = [], error, isLoading, mutate } = useSWR<Report[]>("/api/reports", fetcher);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, newStatus: "RESOLVED" | "DISMISSED") => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === "RESOLVED" ? t("toastResolved") : t("toastRejected"));
        mutate();
      } else {
        toast.error(t("toastUpdateError"));
      }
    } catch {
      toast.error(t("toastNetworkError"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      const res = await fetch(`/api/reports?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(t("toastDeleted"));
        mutate();
      } else {
        toast.error(t("toastDeleteError"));
      }
    } catch {
      toast.error(t("toastNetworkError"));
    }
  };

  const filteredReports = Array.isArray(reports) ? reports.filter((r) => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (filterType !== "ALL" && r.targetType !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = r.targetTitle?.toLowerCase().includes(q);
      const matchReason = r.reason?.toLowerCase().includes(q);
      const matchDetails = r.details?.toLowerCase().includes(q);
      return matchTitle || matchReason || matchDetails;
    }
    return true;
  }) : [];

  const pendingCount = Array.isArray(reports) ? reports.filter(r => r.status === "PENDING").length : 0;
  const resolvedCount = Array.isArray(reports) ? reports.filter(r => r.status === "RESOLVED").length : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-xs">
              <Flag size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t("title")}</h1>
              <p className="text-sm text-slate-500 font-medium">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => mutate()}
          className="self-start md:self-auto px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin text-[#32A8D7]" : ""} />
          <span>{t("refresh")}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-lg">
            {reports.length}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("totalReceived")}</div>
            <div className="text-xl font-black text-slate-900">{t("totalReports", { count: reports.length })}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">{t("toHandle")}</div>
            <div className="text-xl font-black text-amber-700">{t("pendingCount", { count: pendingCount })}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{t("handled")}</div>
            <div className="text-xl font-black text-emerald-700">{t("resolvedCount", { count: resolvedCount })}</div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterStatus === "ALL" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t("all")}
            </button>
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterStatus === "PENDING" ? "bg-amber-500 text-white font-bold" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t("pendingBtn", { count: pendingCount })}
            </button>
            <button
              onClick={() => setFilterStatus("RESOLVED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterStatus === "RESOLVED" ? "bg-emerald-600 text-white font-bold" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t("resolvedBtn")}
            </button>
            <button
              onClick={() => setFilterStatus("DISMISSED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterStatus === "DISMISSED" ? "bg-slate-700 text-white font-bold" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t("dismissedBtn")}
            </button>
          </div>

          {/* Type selector */}
          <div className="w-48">
            <CustomSelect
              size="sm"
              value={filterType}
              onChange={(val) => setFilterType(val)}
              options={[
                { label: t("allTypes"), value: "ALL" },
                { label: t("jobOffers"), value: "JOB_OFFER" },
                { label: t("talentProfiles"), value: "TALENT" },
                { label: t("recruiterAccounts"), value: "RECRUITER" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#32A8D7] mb-2" />
            <p className="text-xs font-semibold">{t("loadingReports")}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <EmptyState
            type="generic"
            title={t("emptyTitle")}
            description={
              reports.length === 0
                ? t("emptyDescAll")
                : t("emptyDescFiltered")
            }
          />
        ) : (
          filteredReports.map((report) => {
            const isJob = report.targetType === "JOB_OFFER";
            const isTalent = report.targetType === "TALENT";
            const isRecruiter = report.targetType === "RECRUITER";

            const targetHref = isJob
              ? `/dashboard/admin/emplois`
              : isTalent
              ? `/dashboard/admin/talents`
              : `/dashboard/admin/recruteurs`;

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge type */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      isJob
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : isTalent
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {isJob ? <Briefcase size={12} /> : isTalent ? <User size={12} /> : <Building2 size={12} />}
                      {isJob ? t("badgeJob") : isTalent ? t("badgeTalent") : t("badgeRecruiter")}
                    </span>

                    {/* Badge status */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      report.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : report.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {report.status === "PENDING" && <Clock size={11} />}
                      {report.status === "RESOLVED" && <CheckCircle2 size={11} />}
                      {report.status === "DISMISSED" && <XCircle size={11} />}
                      {report.status === "PENDING" ? t("pending") : report.status === "RESOLVED" ? t("resolved") : t("rejected")}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {t("submittedOn", {
                        date: new Date(report.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      })}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    {report.status === "PENDING" && (
                      <>
                        <button
                          disabled={updatingId === report.id}
                          onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          <span>{t("markResolved")}</span>
                        </button>
                        <button
                          disabled={updatingId === report.id}
                          onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle size={13} />
                          <span>{t("reject")}</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={t("deleteReportTitle")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Content details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t("reportedElement")}</div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{report.targetTitle || t("untitled")}</h4>
                      <a
                        href={targetHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#32A8D7] hover:underline cursor-pointer"
                      >
                        <span>{t("inspect")}</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">ID: {report.targetId}</div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t("reportReason")}</div>
                    <div className="text-xs font-bold text-rose-600 bg-rose-50/70 border border-rose-100 px-3 py-1.5 rounded-xl inline-block">
                      {report.reason}
                    </div>
                  </div>
                </div>

                {report.details && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-800">{t("reporterDetails")}</span>
                    {report.details}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
