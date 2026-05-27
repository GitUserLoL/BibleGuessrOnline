import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getVersesByMode, getBibleMeta } from '@/lib/bible';
import { generateSeededIndices } from '@/lib/prng';
import type { GameMode, AsyncMatch } from '@/types';
import GameClient from '@/components/game/GameClient';
import ChallengeScoreboard from '@/components/game/ChallengeScoreboard';

interface Props {
  params: Promise<{ matchId: string }>;
}

export default async function ChallengePage({ params }: Props) {
  const { matchId } = await params;
  const supabase = await createClient();

  const { data: match, error } = await supabase
    .from('async_matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (error || !match) redirect('/');

  const typedMatch = match as AsyncMatch;
  const modeVerses = getVersesByMode(typedMatch.game_mode);
  const indices = generateSeededIndices(typedMatch.seed, 5, modeVerses.length);
  const verses = indices.map(i => modeVerses[i]);
  const meta = getBibleMeta();

  const { data: scores } = await supabase
    .from('async_scores')
    .select('*, profiles(username)')
    .eq('match_id', matchId)
    .order('total_score', { ascending: false });

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* Challenge banner */}
      <div className="border-b border-amber-500/20 bg-amber-500/5 py-3 px-4 text-center">
        <span className="text-amber-400 font-semibold text-sm">⚔️ Challenge Match</span>
        <span className="text-white/40 text-xs ml-2">
          {typedMatch.game_mode === 'full' ? 'Full Bible' : typedMatch.game_mode === 'ot' ? 'Old Testament' : 'New Testament'}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-6xl mx-auto w-full">
        <div className="flex-1">
          <GameClient
            verses={verses}
            meta={meta}
            mode={typedMatch.game_mode}
            seed={typedMatch.seed}
            challengeMatchId={matchId}
          />
        </div>
        {scores && scores.length > 0 && (
          <div className="lg:w-72">
            <ChallengeScoreboard scores={scores} />
          </div>
        )}
      </div>
    </div>
  );
}
