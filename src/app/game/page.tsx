import { redirect } from 'next/navigation';
import type { GameMode, Difficulty } from '@/types';
import { getVersesByMode, getBibleMeta, getModeVerseCount, getContextVerses } from '@/lib/bible';
import { generateSeededIndices } from '@/lib/prng';
import GameClient from '@/components/game/GameClient';

const VALID_MODES: GameMode[] = [
  'full', 'ot', 'nt',
  'law', 'history', 'major-prophets', 'minor-prophets',
  'gospels', 'acts', 'letters', 'revelation',
];

interface SearchParams {
  mode?: string;
  seed?: string;
  difficulty?: string;
}

export default async function GamePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const mode = (params.mode ?? 'full') as GameMode;
  const seed = parseInt(params.seed ?? '0', 10);
  const difficulty: Difficulty = params.difficulty === 'easy' ? 'easy' : 'hard';

  if (!VALID_MODES.includes(mode) || isNaN(seed) || seed <= 0) {
    redirect('/');
  }

  const modeVerses = getVersesByMode(mode);
  const indices = generateSeededIndices(seed, 5, modeVerses.length);
  const verses = indices.map(i => modeVerses[i]);
  const meta = getBibleMeta();
  const verseCount = getModeVerseCount(mode);

  const contextVerses = difficulty === 'easy'
    ? verses.map(v => getContextVerses(v, modeVerses, 10))
    : undefined;

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <GameClient
        verses={verses}
        meta={meta}
        mode={mode}
        seed={seed}
        verseCount={verseCount}
        difficulty={difficulty}
        contextVerses={contextVerses}
      />
    </div>
  );
}
