'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { GameMode } from '@/types';
import { generateGameSeed } from '@/lib/prng';

const MODES: { id: GameMode; label: string; desc: string; icon: string; books: string }[] = [
  {
    id: 'full',
    label: 'Full Bible',
    desc: 'All 66 books, 31,102 verses',
    icon: '📖',
    books: 'Genesis → Revelation',
  },
  {
    id: 'ot',
    label: 'Old Testament',
    desc: '39 books, ~23,000 verses',
    icon: '🕎',
    books: 'Genesis → Malachi',
  },
  {
    id: 'nt',
    label: 'New Testament',
    desc: '27 books, ~7,900 verses',
    icon: '✝️',
    books: 'Matthew → Revelation',
  },
];

export default function Home() {
  const router = useRouter();

  function startGame(mode: GameMode) {
    const seed = generateGameSeed();
    router.push(`/game?mode=${mode}&seed=${seed}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-6"
        >
          ✝
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
          Bible
          <span className="text-amber-400">Guessr</span>
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-md mx-auto leading-relaxed">
          A verse appears. Guess which book, chapter, and verse it's from.
          <br />
          How well do you know the Word?
        </p>
      </motion.div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-12">
        {MODES.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startGame(m.id)}
            className="group relative flex flex-col items-start gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-200 text-left cursor-pointer"
          >
            <div className="text-3xl">{m.icon}</div>
            <div>
              <div className="font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                {m.label}
              </div>
              <div className="text-sm text-white/40 mt-0.5">{m.desc}</div>
            </div>
            <div className="text-xs text-white/25 font-mono">{m.books}</div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-200 text-xl">
              →
            </div>
          </motion.button>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-white/25 text-sm max-w-sm"
      >
        5 rounds · up to 5,000 points per round · 25,000 max score
      </motion.div>
    </div>
  );
}
