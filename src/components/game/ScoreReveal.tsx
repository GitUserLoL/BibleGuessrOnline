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
          style={{ color }}
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
          className="text-base font-semibold"
          style={{ color }}
        >
          {label}
        </motion.div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
          className="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-center"
        >
          <div className="text-xs text-white/30 uppercase tracking-widest mb-2">Your Guess</div>
          <div className="text-[#c9a644] font-bold text-lg">
            {result.guessBookName} {result.guessChapter}:{result.guessVerse}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33, duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
          className="bg-[#c9a644]/8 border border-[#c9a644]/20 rounded-xl p-4 text-center"
        >
          <div className="text-xs text-white/30 uppercase tracking-widest mb-2">Correct Answer</div>
          <div className="text-[#d4b860] font-bold text-lg">
            {result.verse.book_name} {result.verse.chapter}:{result.verse.verse}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42 }}
        className="text-center text-white/30 text-sm"
      >
        Distance: <span className="text-white/60 font-semibold tabular-nums">{distance.toLocaleString()} verse{distance !== 1 ? 's' : ''}</span>
      </motion.div>

      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl bg-[#c9a644] text-[#0d0b09] font-bold text-base hover:bg-[#d4b860] transition-colors shadow-[0_0_30px_rgba(201,166,68,0.18)]"
      >
        {isLast ? 'See Final Results' : 'Next Round'}
      </motion.button>
    </motion.div>
  );
}
