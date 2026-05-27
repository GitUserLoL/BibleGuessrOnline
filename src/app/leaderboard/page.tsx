import { getLeaderboard } from '@/lib/actions';
import type { GameMode } from '@/types';
import { getScoreColor } from '@/lib/scoring';
import Link from 'next/link';

interface SearchParams {
  mode?: string;
}

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const mode = (params.mode ?? 'full') as GameMode;
  const scores = await getLeaderboard(mode);

  const tabs: { id: GameMode; label: string }[] = [
    { id: 'full', label: 'Full Bible' },
    { id: 'ot', label: 'Old Testament' },
    { id: 'nt', label: 'New Testament' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-white mb-2">Leaderboard</h1>
      <p className="text-white/40 text-sm mb-8">All-time high scores from signed-in players</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={`/leaderboard?mode=${tab.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === tab.id
                ? 'bg-amber-500 text-black'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {scores.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <div className="text-4xl mb-4">🏆</div>
          <div className="font-semibold text-white/50 mb-1">No scores here yet</div>
          <div className="text-sm mb-6">Play a game and sign in to be the first on the board.</div>
          <Link href="/" className="inline-block px-6 py-2 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors">
            Play now
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {scores.map((entry: Record<string, unknown>, i: number) => {
            const profileData = entry.profiles as { username?: string; avatar_emoji?: string } | null;
            const username = profileData?.username ?? 'Anonymous';
            const avatarEmoji = profileData?.avatar_emoji ?? null;
            const highScore = entry.high_score as number;
            const achievedAt = entry.achieved_at as string;
            return (
              <div
                key={entry.id as string}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 ? 'bg-amber-500 text-black' :
                  i === 1 ? 'bg-white/20 text-white' :
                  i === 2 ? 'bg-amber-900/60 text-amber-400' :
                  'bg-white/5 text-white/30'
                }`}>
                  {i + 1}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                  {avatarEmoji ?? username[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 font-semibold text-white/80 truncate">{username}</div>
                <div className="text-xs text-white/30 flex-shrink-0">
                  {new Date(achievedAt).toLocaleDateString()}
                </div>
                <div className="font-black text-lg flex-shrink-0" style={{ color: getScoreColor(highScore) }}>
                  {highScore.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
