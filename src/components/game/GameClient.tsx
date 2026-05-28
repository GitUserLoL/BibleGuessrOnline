'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Verse, GameMode, RoundResult, BibleMeta, Difficulty } from '@/types';
import { calculateScore } from '@/lib/scoring';
import { getModeStartIndexFromMeta } from '@/lib/gameModes';
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
  verseCount: number;
  difficulty: Difficulty;
  contextVerses?: Verse[][];
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
  return globalIndex - getModeStartIndexFromMeta(mode, meta);
}

export default function GameClient({ verses, meta, mode, seed, verseCount, difficulty, contextVerses, challengeMatchId }: Props) {
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('guessing');
  const [results, setResults] = useState<RoundResult[]>([]);

  const handleGuess = useCallback(
    (bookId: number, chapter: number, verse: number) => {
      const globalIndex = computeGlobalIndex(meta, bookId, chapter, verse);
      const guessIndex = getModeIndex(globalIndex, mode, meta);
      const correctIndex = getModeIndex(verses[currentRound].index, mode, meta);
      const score = calculateScore(correctIndex, guessIndex, verseCount);

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
    [currentRound, verses, mode, meta, verseCount]
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
    window.location.href = `/?mode=${mode}&difficulty=${difficulty}`;
  }, [mode, difficulty]);

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const scores = results.map(r => r.score);

  if (phase === 'finished') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl mx-auto px-4 py-8"
      >
        <GameResults
          results={results}
          mode={mode}
          seed={seed}
          difficulty={difficulty}
          onPlayAgain={handlePlayAgain}
        />
      </motion.div>
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
        <div className="flex items-center gap-3">
          {difficulty === 'easy' && (
            <span className="text-[10px] font-bold tracking-widest text-[#c9a644]/50 uppercase border border-[#c9a644]/20 rounded px-1.5 py-0.5">
              Easy
            </span>
          )}
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
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {phase === 'guessing' ? (
          <motion.div
            key={`guess-${currentRound}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col gap-6"
          >
            <VerseDisplay
              text={verses[currentRound].text}
              roundNumber={currentRound}
              contextVerses={contextVerses?.[currentRound]}
              currentVerseGlobalIndex={verses[currentRound].index}
            />
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
