export default function TalentDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar skeleton */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Banner skeleton */}
      <div className="h-14 bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse" />

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab bar skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-28 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
              >
                <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
