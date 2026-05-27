import { redirect } from 'next/navigation';
import type { GameMode } from '@/types';
import { getVersesByMode, getBibleMeta } from '@/lib/bible';
import { generateSeededIndices } from '@/lib/prng';
import GameClient from '@/components/game/GameClient';

interface SearchParams {
  mode?: string;
  seed?: string;
}

export default async function GamePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const mode = (params.mode ?? 'full') as GameMode;
  const seed = parseInt(params.seed ?? '0', 10);

  if (!['full', 'ot', 'nt'].includes(mode) || isNaN(seed) || seed <= 0) {
    redirect('/');
  }

  const modeVerses = getVersesByMode(mode);
  const indices = generateSeededIndices(seed, 5, modeVerses.length);
  const verses = indices.map(i => modeVerses[i]);
  const meta = getBibleMeta();

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <GameClient verses={verses} meta={meta} mode={mode} seed={seed} />
    </div>
  );
}
