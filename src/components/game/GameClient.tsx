'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Verse, BookStructure, GameMode, RoundResult, BibleMeta } from '@/types';
import { calculateScore } from '@/lib/scoring';
import VerseDisplay from './VerseDisplay';
import GuessSelector from './GuessSelector';
import ScoreReveal from './ScoreReveal';
import GameResults from './GameResults';
import RoundProgress from './RoundProgress';

interface Props {
  verses: Verse[];
  meta: BibleMeta;
  mode: GameMode;
  seed: number;
  challengeMatchId?: string;
}

type Phase = 'guessing' | 'revealing' | 'finished';

function computeGlobalIndex(meta: BibleMeta, bookId: number, chapter: number, verse: number): number {
  const book = meta.books.find(b => b.id === bookId)!;
  let index = book.startIndex;
  for (let c = 0; c < chapter - 1; c++) {
    index += book.chapterVerseCounts[c];
  }
  index += verse - 1;
  return index;
}

function getModeIndex(globalIndex: number, mode: GameMode, meta: BibleMeta): number {
  if (mode === 'nt') return globalIndex - meta.ntStartIndex;
  return globalIndex;
}

export default function GameClient({ verses, meta, mode, seed, challengeMatchId }: Props) {
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('guessing');
  const [results, setResults] = useState<RoundResult[]>([]);

  const handleGuess = useCallback(
    (bookId: number, chapter: number, verse: number) => {
      const globalIndex = computeGlobalIndex(meta, bookId, chapter, verse);
      const guessIndex = getModeIndex(globalIndex, mode, meta);
      const correctIndex = getModeIndex(verses[currentRound].index, mode, meta);
      const score = calculateScore(correctIndex, guessIndex);

      const book = meta.books.find(b => b.id === bookId)!;
      const result: RoundResult = {
        verse: verses[currentRound],
        guessBookId: bookId,
        guessBookName: book.name,
        guessChapter: chapter,
        guessVerse: verse,
        guessIndex,
        correctIndex,
        score,
      };

      setResults(prev => [...prev, result]);
      setPhase('revealing');
    },
    [currentRound, verses, mode, meta]
  );

  const handleNext = useCallback(() => {
    if (currentRound + 1 >= verses.length) {
      setPhase('finished');
    } else {
      setCurrentRound(r => r + 1);
      setPhase('guessing');
    }
  }, [currentRound, verses.length]);

  const handlePlayAgain = useCallback(() => {
    window.location.href = `/?mode=${mode}`;
  }, [mode]);

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const scores = results.map(r => r.score);

  if (phase === 'finished') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <GameResults
          results={results}
          mode={mode}
          seed={seed}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { window.location.href = '/'; }}
            className="flex items-center gap-1 text-white/20 hover:text-white/50 transition-colors text-xs"
            title="Back to home"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </button>
          <RoundProgress total={verses.length} current={currentRound} scores={scores} />
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30 uppercase tracking-widest">Score</div>
          <motion.div
            key={totalScore}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-[#c9a644] tabular-nums"
          >
            {totalScore.toLocaleString()}
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {phase === 'guessing' ? (
          <motion.div
            key={`guess-${currentRound}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <VerseDisplay text={verses[currentRound].text} roundNumber={currentRound} />
            <GuessSelector
              bibleStructure={meta.books}
              mode={mode}
              onSubmit={handleGuess}
              disabled={false}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`reveal-${currentRound}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScoreReveal
              result={results[results.length - 1]}
              onNext={handleNext}
              isLast={currentRound + 1 >= verses.length}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
