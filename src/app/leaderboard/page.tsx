import { getLeaderboard } from '@/lib/actions';
import type { GameMode, Difficulty } from '@/types';
import { getScoreColor } from '@/lib/scoring';
import Link from 'next/link';
import AvatarIcon from '@/components/ui/AvatarIcon';
import { isIconKey } from '@/lib/avatarIcons';

interface SearchParams {
  mode?: string;
  difficulty?: string;
}

const TABS: { id: GameMode; label: string; section: 'main' | 'ot' | 'nt' }[] = [
  { id: 'full',            label: 'Full Bible',     section: 'main' },
  { id: 'ot',              label: 'Old Testament',  section: 'main' },
  { id: 'nt',              label: 'New Testament',  section: 'main' },
  { id: 'law',             label: 'The Law',        section: 'ot'   },
  { id: 'history',         label: 'History',        section: 'ot'   },
  { id: 'major-prophets',  label: 'Major Prophets', section: 'ot'   },
  { id: 'minor-prophets',  label: 'Minor Prophets', section: 'ot'   },
  { id: 'gospels',         label: 'Gospels',        section: 'nt'   },
  { id: 'acts',            label: 'Acts',           section: 'nt'   },
  { id: 'letters',         label: 'Letters',        section: 'nt'   },
  { id: 'revelation',      label: 'Prophecy',       section: 'nt'   },
];

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const mode = (params.mode ?? 'full') as GameMode;
  const difficulty: Difficulty = params.difficulty === 'easy' ? 'easy' : 'hard';
  const scores = await getLeaderboard(mode, difficulty);

  const mainTabs = TABS.filter(t => t.section === 'main');
  const otTabs   = TABS.filter(t => t.section === 'ot');
  const ntTabs   = TABS.filter(t => t.section === 'nt');

  const tabClass = (id: GameMode) =>
    `px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors whitespace-nowrap ${
      mode === id
        ? 'bg-[var(--gold-muted)] text-[var(--gold)] border border-[var(--gold-dim)]'
        : 'text-[rgba(237,232,220,0.35)] hover:text-[rgba(237,232,220,0.7)] border border-transparent hover:border-[var(--bl)]'
    }`;

  const diffClass = (d: Difficulty) =>
    `flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
      difficulty === d
        ? 'bg-[var(--bg-raised)] text-[#ede8dc]'
        : 'text-[rgba(237,232,220,0.3)] hover:text-[rgba(237,232,220,0.6)]'
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-[#ede8dc] mb-1 tracking-tight">Leaderboard</h1>
      <p className="text-[rgba(237,232,220,0.35)] text-xs uppercase tracking-widest font-semibold mb-8">
        All-time high scores from signed-in players
      </p>

      {/* Difficulty toggle */}
      <div className="r-panel flex mb-5">
        {(['hard', 'easy'] as Difficulty[]).map(d => (
          <Link key={d} href={`/leaderboard?mode=${mode}&difficulty=${d}`} className={diffClass(d)}>
            {d === 'hard' ? 'Hard' : 'Easy'}
          </Link>
        ))}
      </div>

      {/* Mode tab groups */}
      <div className="flex flex-col gap-3 mb-8 pb-6 border-b-2 border-[var(--bl)]">
        <div className="flex gap-1.5 flex-wrap">
          {mainTabs.map(tab => (
            <Link key={tab.id} href={`/leaderboard?mode=${tab.id}&difficulty=${difficulty}`} className={tabClass(tab.id)}>
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="label-caps mr-1">OT</span>
          {otTabs.map(tab => (
            <Link key={tab.id} href={`/leaderboard?mode=${tab.id}&difficulty=${difficulty}`} className={tabClass(tab.id)}>
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="label-caps mr-1">NT</span>
          {ntTabs.map(tab => (
            <Link key={tab.id} href={`/leaderboard?mode=${tab.id}&difficulty=${difficulty}`} className={tabClass(tab.id)}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {scores.length === 0 ? (
        <div className="text-center py-16 r-panel">
          <div className="w-10 h-10 r-panel flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-[rgba(237,232,220,0.2)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
          </div>
          <div className="font-bold text-[rgba(237,232,220,0.45)] mb-1 text-sm uppercase tracking-widest">No scores here yet</div>
          <div className="text-[rgba(237,232,220,0.25)] text-xs mb-6 uppercase tracking-wider font-semibold">
            Play a game and sign in to be the first on the board.
          </div>
          <Link href="/" className="inline-block px-6 py-2 r-btn-gold text-xs uppercase tracking-widest">
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
                className={`r-panel flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-surface)] ${i === 0 ? 'r-panel-gold' : ''}`}
              >
                <div className={`w-7 h-7 flex items-center justify-center text-xs font-black flex-shrink-0 border ${
                  i === 0 ? 'bg-[var(--gold)] border-[var(--gold-dim)] text-[#0d0b09]' :
                  i === 1 ? 'bg-[rgba(237,232,220,0.15)] border-[var(--bl)] text-[#ede8dc]' :
                  i === 2 ? 'bg-[rgba(180,140,50,0.2)] border-[var(--gold-dim)] text-[var(--gold)]' :
                  'bg-[var(--bg-deep)] border-[var(--bl)] text-[rgba(237,232,220,0.25)]'
                }`}>
                  {i + 1}
                </div>
                <div className="w-7 h-7 r-panel flex items-center justify-center text-[var(--gold)] flex-shrink-0">
                  {isIconKey(avatarEmoji) ? (
                    <AvatarIcon iconKey={avatarEmoji} size={14} />
                  ) : (
                    <span className="text-xs font-black text-[rgba(237,232,220,0.5)]">{username[0]?.toUpperCase() ?? '?'}</span>
                  )}
                </div>
                <div className="flex-1 font-semibold text-[rgba(237,232,220,0.8)] truncate text-sm">{username}</div>
                <div className="text-[10px] text-[rgba(237,232,220,0.2)] flex-shrink-0 uppercase tracking-wider font-semibold">
                  {new Date(achievedAt).toLocaleDateString()}
                </div>
                <div className="font-black text-base flex-shrink-0 tabular-nums" style={{ color: getScoreColor(highScore) }}>
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
