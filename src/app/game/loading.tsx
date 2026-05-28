export default function GameLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 min-h-[calc(100vh-56px)]">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-3 bg-[var(--bl)] animate-pulse" />
          <div className="flex items-center gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-7 h-7 bg-[var(--bl)] animate-pulse" />
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="w-10 h-2 bg-[var(--bl)] animate-pulse mb-1.5" />
          <div className="w-16 h-6 bg-[var(--bl)] animate-pulse" />
        </div>
      </div>

      {/* Verse card */}
      <div className="r-panel p-8 md:p-10">
        <div className="space-y-4">
          <div className="h-6 bg-[var(--bg-surface)] animate-pulse w-full" />
          <div className="h-6 bg-[var(--bg-surface)] animate-pulse w-[92%]" />
          <div className="h-6 bg-[var(--bg-surface)] animate-pulse w-[78%]" />
        </div>
      </div>

      {/* Guess selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="h-9 flex-1 r-panel animate-pulse" />
          <div className="h-9 w-24 bg-[var(--bl)] animate-pulse" />
        </div>
        <div className="h-64 r-panel animate-pulse" />
      </div>
    </div>
  );
}
