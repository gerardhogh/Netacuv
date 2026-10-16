"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bookmark, 
  Search, 
  Users, 
  Briefcase, 
  Building2, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Filter
} from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type FilterType = "ALL" | "TALENT" | "RECRUITER" | "JOB_OFFER";

export default function AdminFavorisPage() {
  const t = useTranslations("admin.favorites");
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const typeParam = activeFilter !== "ALL" ? `&type=${activeFilter}` : "";
  const { data, isLoading, mutate } = useSWR(
    `/api/favorites?page=${currentPage}&limit=${pageSize}${typeParam}`,
    fetcher
  );

  const rawFavorites = data?.favorites || [];
  const totalCount = data?.totalCount ?? rawFavorites.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const handleRemoveFavorite = async (id: string, label?: string) => {
    try {
      const res = await fetch(`/api/favorites?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate();
        toast.success(t("toastRemoved", { label: label || t("defaultItem") }));
      } else {
        toast.error(t("toastRemoveError"));
      }
    } catch {
      toast.error(t("toastConnError"));
    }
  };

  const filtered = rawFavorites.filter((fav: any) => {
    const q = search.toLowerCase();
    const title = (fav.title || fav.liveData?.name || fav.liveData?.title || "").toLowerCase();
    const subtitle = (fav.subtitle || fav.liveData?.recruiter?.companyName || fav.liveData?.email || "").toLowerCase();
    const loc = (fav.location || fav.liveData?.location || "").toLowerCase();
    return title.includes(q) || subtitle.includes(q) || loc.includes(q);
  });

  const getTargetBadge = (type: string) => {
    switch (type) {
      case "TALENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Users size={12} /> {t("badgeTalent")}
          </span>
        );
      case "RECRUITER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1e8ae9] border border-blue-200">
            <Building2 size={12} /> {t("badgeRecruiter")}
          </span>
        );
      case "JOB_OFFER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Briefcase size={12} /> {t("badgeJob")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {type}
          </span>
        );
    }
  };

  const getTargetLink = (fav: any) => {
    switch (fav.targetType) {
      case "TALENT":
        return "/dashboard/admin/talents";
      case "RECRUITER":
        return "/dashboard/admin/recruteurs";
      case "JOB_OFFER":
        return "/dashboard/admin/emplois";
      default:
        return "/dashboard/admin";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500">
        <Link href="/dashboard/admin" className="hover:text-slate-800 transition-colors">
          {t("breadcrumbHome")}
        </Link>
        <span className="mx-2">›</span>
        <span className="font-semibold text-slate-800">{t("breadcrumbFavorites")}</span>
      </div>

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#32A8D7]">
            <Bookmark size={22} className="fill-[#32A8D7]/20" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {t("title")} <span className="text-[#32A8D7]">{t("titleHighlight")}</span>
            </h1>
            <p className="text-xs text-slate-500">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#32A8D7]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: "ALL", label: t("tabAll"), count: totalCount },
          { key: "TALENT", label: t("tabTalents") },
          { key: "RECRUITER", label: t("tabRecruiters") },
          { key: "JOB_OFFER", label: t("tabJobs") },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveFilter(tab.key as FilterType);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === tab.key
                ? "bg-[#32A8D7] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {t("loading")}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            type="generic"
            title={t("emptyTitle")}
            description={
              search
                ? t("emptySearch")
                : t("emptyCategory")
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f4f9fd] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold text-[#1e4869]">{t("thType")}</th>
                    <th className="px-5 py-3.5 font-semibold text-[#1e4869]">{t("thNameTitle")}</th>
                    <th className="px-5 py-3.5 font-semibold text-[#1e4869]">{t("thSubtitleInfo")}</th>
                    <th className="px-5 py-3.5 font-semibold text-[#1e4869]">{t("thLocation")}</th>
                    <th className="px-5 py-3.5 font-semibold text-[#1e4869]">{t("thSavedDate")}</th>
                    <th className="px-5 py-3.5 font-semibold text-[#1e4869] text-right">{t("thActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((fav: any) => {
                    const title = fav.title || fav.liveData?.name || fav.liveData?.title || t("noTitle");
                    const subtitle = fav.subtitle || fav.liveData?.recruiter?.companyName || fav.liveData?.email || "—";
                    const loc = fav.location || fav.liveData?.location || "—";
                    const link = getTargetLink(fav);

                    return (
                      <tr key={fav.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          {getTargetBadge(fav.targetType)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {title}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {subtitle}
                        </td>
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          {loc}
                        </td>
                        <td className="px-5 py-4 text-slate-400 whitespace-nowrap text-xs">
                          {new Date(fav.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={link}
                              className="p-1.5 text-[#32A8D7] hover:text-[#1e8ae9] hover:bg-sky-50 rounded-lg transition-colors"
                              title={t("accessModule")}
                            >
                              <ExternalLink size={16} />
                            </Link>
                            <button
                              onClick={() => handleRemoveFavorite(fav.id, title)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title={t("removeFavorite")}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              itemLabel={t("itemLabel")}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
}
