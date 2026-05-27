'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { RoundResult } from '@/types';
import { getScoreColor, getScoreLabel } from '@/lib/scoring';

interface Props {
  result: RoundResult;
  onNext: () => void;
  isLast: boolean;
}

export default function ScoreReveal({ result, onNext, isLast }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = getScoreColor(result.score);
  const label = getScoreLabel(result.score);

  useEffect(() => {
    setDisplayScore(0);
    const duration = 1200;
    const steps = 60;
    const increment = result.score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.score) {
        setDisplayScore(result.score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [result.score]);

  const distance = Math.abs(result.correctIndex - result.guessIndex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Score */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-6xl font-black mb-1"
          style={{ color }}
        >
          {displayScore.toLocaleString()}
        </motion.div>
        <div className="text-lg font-semibold" style={{ color }}>
          {label}
        </div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Your Guess</div>
          <div className="text-amber-400 font-bold text-lg">
            {result.guessBookName} {result.guessChapter}:{result.guessVerse}
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Correct Answer</div>
          <div className="text-amber-300 font-bold text-lg">
            {result.verse.book_name} {result.verse.chapter}:{result.verse.verse}
          </div>
        </div>
      </div>

      <div className="text-center text-white/40 text-sm">
        Distance: <span className="text-white/70 font-semibold">{distance.toLocaleString()} verse{distance !== 1 ? 's' : ''}</span>
      </div>

      <motion.button
        onClick={onNext}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_30px_rgba(251,191,36,0.25)]"
      >
        {isLast ? 'See Final Results' : 'Next Round →'}
      </motion.button>
    </motion.div>
  );
}
