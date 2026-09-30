export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#32A8D7] animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Chargement...
        </p>
      </div>
    </div>
  );
}
