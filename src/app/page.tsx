'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { GameMode } from '@/types';
import { generateGameSeed } from '@/lib/prng';

const MODES: { id: GameMode; abbr: string; label: string; desc: string; books: string }[] = [
  {
    id: 'full',
    abbr: 'ALL',
    label: 'Full Bible',
    desc: '66 books · 31,102 verses',
    books: 'Genesis → Revelation',
  },
  {
    id: 'ot',
    abbr: 'OT',
    label: 'Old Testament',
    desc: '39 books · ~23,000 verses',
    books: 'Genesis → Malachi',
  },
  {
    id: 'nt',
    abbr: 'NT',
    label: 'New Testament',
    desc: '27 books · ~7,900 verses',
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
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
          Bible<span className="text-[#c9a644]">Guessr</span>
        </h1>
        <p className="text-base md:text-lg text-white/45 max-w-sm mx-auto leading-relaxed">
          A verse appears. Guess which book, chapter, and verse it&apos;s from.
          <br />
          How well do you know the Word?
        </p>
      </motion.div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl mb-10">
        {MODES.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startGame(m.id)}
            className="group relative flex flex-col gap-3 p-5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-[#c9a644]/30 hover:bg-[#c9a644]/[0.04] transition-all duration-200 text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#c9a644]/50 tracking-[0.15em] uppercase">
                {m.abbr}
              </span>
              <svg
                className="w-4 h-4 text-white/15 group-hover:text-[#c9a644] group-hover:translate-x-0.5 transition-all duration-200"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-base text-white/85 group-hover:text-white transition-colors">
                {m.label}
              </div>
              <div className="text-xs text-white/30 mt-0.5">{m.desc}</div>
            </div>
            <div className="text-[11px] text-white/18 font-mono">{m.books}</div>
          </motion.button>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/22 text-xs tracking-wide"
      >
        5 rounds &middot; up to 5,000 pts per round &middot; 25,000 max
      </motion.div>
    </div>
  );
}
