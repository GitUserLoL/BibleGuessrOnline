export default function GameLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 min-h-[calc(100vh-56px)]">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="w-10 h-3 bg-white/5 rounded animate-pulse mb-1" />
          <div className="w-16 h-7 bg-white/5 rounded animate-pulse" />
        </div>
      </div>

      {/* Verse card */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 md:p-10">
        <div className="space-y-4">
          <div className="h-6 bg-white/[0.06] rounded-lg animate-pulse w-full" />
          <div className="h-6 bg-white/[0.06] rounded-lg animate-pulse w-[92%]" />
          <div className="h-6 bg-white/[0.06] rounded-lg animate-pulse w-[78%]" />
        </div>
      </div>

      {/* Guess selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-9 w-32 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-64 bg-white/[0.03] border border-white/8 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
