"use client";

import React, { useState } from "react";
import { 
  Bookmark, 
  Search, 
  Building2, 
  MapPin, 
  Briefcase, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FavorisTalentTabProps {
  onNavigateToJobs?: (jobId?: string) => void;
}

export default function FavorisTalentTab({ onNavigateToJobs }: FavorisTalentTabProps) {
  const t = useTranslations("talentFavorites");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const { data, error, isLoading, mutate } = useSWR("/api/favorites?type=JOB_OFFER", fetcher);
  const { data: myAppsData } = useSWR("/api/applications", fetcher);

  const appliedJobIds = new Set(
    (myAppsData?.applications || []).map((app: any) => app.jobOfferId || app.jobOffer?.id)
  );

  const favorites = data?.favorites || [];

  const handleRemoveFavorite = async (favId: string, title?: string) => {
    try {
      const res = await fetch(`/api/favorites?id=${favId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate();
        toast.success(t("removeSuccess", { title: title || t("unnamedJob") }));
      } else {
        toast.error(t("removeError"));
      }
    } catch {
      toast.error(t("networkError"));
    }
  };

  const filtered = favorites.filter((fav: any) => {
    const q = search.toLowerCase();
    const title = (fav.title || fav.liveData?.title || "").toLowerCase();
    const company = (fav.subtitle || fav.liveData?.recruiter?.companyName || "").toLowerCase();
    const location = (fav.location || fav.liveData?.location || "").toLowerCase();
    return title.includes(q) || company.includes(q) || location.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#32A8D7]">
              <Bookmark size={18} className="fill-[#32A8D7]/20" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t("title")}{" "}<span className="text-[#32A8D7]">{t("titleHighlight")}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {t("subtitle")}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#32A8D7] focus:border-transparent bg-slate-50/50"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center text-slate-400 text-sm">
          {t("loading")}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="favoris"
          title={search ? t("noMatchTitle") : t("emptyTitle")}
          description={
            search
              ? t("noMatchDesc")
              : t("emptyDesc")
          }
          actionLabel={t("exploreJobs")}
          onAction={() => onNavigateToJobs && onNavigateToJobs()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((fav: any) => {
            const liveJob = fav.liveData;
            const title = liveJob?.title || fav.title || t("unnamedJob");
            const company = liveJob?.recruiter?.companyName || fav.subtitle || t("confidentialCompany");
            const location = liveJob?.location || fav.location || t("notSpecified");
            const contract = liveJob?.contractType || fav.metadataParsed?.contractType || "CDI";
            const salary = liveJob?.salary || fav.metadataParsed?.salary || t("negotiable");
            const isApplied = appliedJobIds.has(fav.targetId);
            const isClosed = liveJob?.status === "CLOSED";

            return (
              <div
                key={fav.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#32A8D7]/50 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Company & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#32A8D7]/10 to-[#1e8ae9]/20 flex items-center justify-center text-[#1e8ae9] shrink-0 font-bold">
                        <Building2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500 truncate" title={company}>
                          {company}
                        </p>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1e8ae9] transition-colors line-clamp-1" title={title}>
                          {title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFavorite(fav.id, title)}
                      title={t("removeTooltip")}
                      className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      <Briefcase size={12} className="text-slate-400" />
                      {contract}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      <MapPin size={12} className="text-slate-400" />
                      {location}
                    </span>
                    {salary && salary !== "Non spécifié" && salary !== "Not specified" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {salary}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  {isApplied ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle size={14} /> {t("appliedSent")}
                    </span>
                  ) : isClosed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                      {t("offerClosed")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar size={12} /> {t("addedOn", { date: new Date(fav.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR") })}
                    </span>
                  )}

                  <button
                    onClick={() => onNavigateToJobs && onNavigateToJobs(fav.targetId)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#32A8D7] hover:text-[#1e8ae9] transition-colors py-1.5 px-3 rounded-lg hover:bg-sky-50 cursor-pointer"
                  >
                    <span>{t("viewJob")}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
