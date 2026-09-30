export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar skeleton */}
      <div className="flex">
        <div className="w-64 bg-white border-r border-slate-100 min-h-screen p-5 hidden lg:block">
          <div className="h-8 w-28 bg-slate-200 rounded-lg animate-pulse mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-10 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-7 w-48 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
          </div>

          {/* Stats row skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
              >
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-3" />
                <div className="h-8 w-14 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="h-5 w-36 bg-slate-200 rounded animate-pulse mb-5" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-slate-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
