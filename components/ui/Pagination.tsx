"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  itemLabel?: string; // e.g., "candidatures", "offres", "recruteurs", "résultats"
  onPageChange?: (page: number) => void;
  syncWithUrl?: boolean;
  pageParamName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize = 20,
  itemLabel = "résultats",
  onPageChange,
  syncWithUrl = true,
  pageParamName = "page",
  className = "",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Condition de déclenchement : Si le nombre total d'éléments <= pageSize ou totalPages <= 1, masquer la pagination
  if (totalCount <= pageSize || totalPages <= 1) {
    return null;
  }

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    if (onPageChange) {
      onPageChange(page);
    }

    if (syncWithUrl && typeof window !== "undefined") {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
      if (page === 1) {
        params.delete(pageParamName);
      } else {
        params.set(pageParamName, page.toString());
      }
      const newQuery = params.toString();
      const targetUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.push(targetUrl, { scroll: false });
    }
  };

  // Helper pour générer la liste des numéros de pages avec ellipse (...)
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 1; // Nb de pages visibles autour de la page courante

    const left = currentPage - delta;
    const right = currentPage + delta + 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 border-t border-slate-100 bg-white/70 backdrop-blur-xs select-none ${className}`}
      aria-label="Pagination"
    >
      {/* Texte d'indication */}
      <div className="text-xs text-slate-500 font-medium">
        Affichage de <span className="font-bold text-slate-800">{startItem}</span> à{" "}
        <span className="font-bold text-slate-800">{endItem}</span> sur{" "}
        <span className="font-bold text-[#1e8ae9]">{totalCount}</span> {itemLabel}
      </div>

      {/* Contrôles de navigation */}
      <div className="flex items-center gap-1.5">
        {/* Bouton Précédent */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Page précédente"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all duration-150"
        >
          <ChevronLeft size={14} className="stroke-[2.2]" />
          <span className="hidden xs:inline">Précédent</span>
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold"
                >
                  •••
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => handlePageClick(page)}
                aria-current={isActive ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center ${
                  isActive
                    ? "bg-[#32A8D7] text-white shadow-xs shadow-[#32A8D7]/30 scale-105"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Bouton Suivant */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Page suivante"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all duration-150"
        >
          <span className="hidden xs:inline">Suivant</span>
          <ChevronRight size={14} className="stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
