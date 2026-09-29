"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionButton?: React.ReactNode;
}

export function EmptyState({ 
  title = "Aucune donnée disponible", 
  description = "Il n'y a actuellement aucune donnée à afficher ici.", 
  icon = <FolderOpen size={48} className="text-slate-300" />,
  actionButton
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white border border-slate-200 rounded-xl shadow-sm w-full min-h-[300px]">
      <div className="mb-4 bg-slate-50 p-4 rounded-full border border-slate-100">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
        {description}
      </p>
      {actionButton && (
        <div className="mt-2">
          {actionButton}
        </div>
      )}
    </div>
  );
}
