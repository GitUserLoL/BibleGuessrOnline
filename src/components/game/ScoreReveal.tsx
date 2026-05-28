'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { RoundResult } from '@/types';
import { getScoreColor, getScoreLabel } from '@/lib/scoring';

interface Props {
  result: RoundResult;
  onNext: () => void;
  isLast: boolean;
}

export default function ScoreReveal({ result, onNext, isLast }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const reducedMotion = useReducedMotion();
  const color = getScoreColor(result.score);
  const label = getScoreLabel(result.score);
  const isHighScore = result.score >= 4000;

  useEffect(() => {
    if (reducedMotion) {
      setDisplayScore(result.score);
      return;
    }
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
  }, [result.score, reducedMotion]);

  const distance = Math.abs(result.correctIndex - result.guessIndex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex flex-col gap-6"
    >
      {/* Score */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="text-6xl font-black mb-1 tabular-nums"
          style={{ color, textShadow: `2px 2px 0 rgba(0,0,0,0.5)` }}
        >
          {displayScore.toLocaleString()}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={
            isHighScore
              ? { opacity: 1, y: 0, scale: [1, 1.1, 1] }
              : { opacity: 1, y: 0 }
          }
          transition={{ delay: 0.15, duration: isHighScore ? 0.45 : 0.2 }}
          className="text-sm font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {label}
        </motion.div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
          className="r-panel p-4 text-center"
        >
          <div className="label-caps mb-2">Your Guess</div>
          <div className="text-[var(--gold)] font-bold text-sm md:text-base">
            {result.guessBookName} {result.guessChapter}:{result.guessVerse}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33, duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
          className="r-panel-gold p-4 text-center"
        >
          <div className="label-caps mb-2 text-[var(--gold-light)]">Answer</div>
          <div className="text-[var(--gold-light)] font-bold text-sm md:text-base">
            {result.verse.book_name} {result.verse.chapter}:{result.verse.verse}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42 }}
        className="text-center text-[rgba(237,232,220,0.3)] text-xs uppercase tracking-widest font-semibold"
      >
        Distance:{' '}
        <span className="text-[rgba(237,232,220,0.6)] tabular-nums">
          {distance.toLocaleString()} verse{distance !== 1 ? 's' : ''}
        </span>
      </motion.div>

      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 r-btn-gold text-sm uppercase tracking-widest"
      >
        {isLast ? 'See Final Results' : 'Next Round'}
      </motion.button>
    </motion.div>
  );
}
