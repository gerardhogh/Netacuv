import React from "react";

export default function DashboardLoading() {
  return (
    <div className="w-full h-full min-h-[70vh] p-6 animate-pulse space-y-8">
      {/* Skeleton header */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 bg-slate-200 rounded-lg w-1/4"></div>
        <div className="flex space-x-4">
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
        </div>
      </div>
      
      {/* Skeletons row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
        <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
        <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
      </div>

      {/* Skeleton list */}
      <div className="space-y-4 mt-12">
        <div className="h-6 bg-slate-200 rounded w-1/6 mb-6"></div>
        <div className="h-20 bg-slate-100 rounded-2xl w-full"></div>
        <div className="h-20 bg-slate-100 rounded-2xl w-full"></div>
        <div className="h-20 bg-slate-100 rounded-2xl w-full"></div>
      </div>
    </div>
  );
}
