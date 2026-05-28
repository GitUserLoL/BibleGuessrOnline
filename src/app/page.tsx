'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { GameMode, Difficulty } from '@/types';
import { generateGameSeed } from '@/lib/prng';

const MAIN_MODES: { id: GameMode; abbr: string; label: string; desc: string; books: string }[] = [
  { id: 'full', abbr: 'ALL', label: 'Full Bible',      desc: '66 books · 31,102 verses',  books: 'Genesis → Revelation' },
  { id: 'ot',   abbr: 'OT',  label: 'Old Testament',   desc: '39 books · ~23,000 verses', books: 'Genesis → Malachi'    },
  { id: 'nt',   abbr: 'NT',  label: 'New Testament',   desc: '27 books · ~7,900 verses',  books: 'Matthew → Revelation' },
];

const OT_CATEGORIES: { id: GameMode; abbr: string; label: string; books: string }[] = [
  { id: 'law',              abbr: 'LAW',  label: 'The Law',         books: 'Genesis–Deuteronomy' },
  { id: 'history',          abbr: 'HIST', label: 'History',         books: 'Joshua–Esther'       },
  { id: 'major-prophets',   abbr: 'MAJ',  label: 'Major Prophets',  books: 'Isaiah–Daniel'       },
  { id: 'minor-prophets',   abbr: 'MIN',  label: 'Minor Prophets',  books: 'Hosea–Malachi'       },
];

const NT_CATEGORIES: { id: GameMode; abbr: string; label: string; books: string }[] = [
  { id: 'gospels',    abbr: 'GOSP', label: 'Gospels',   books: 'Matthew–John'    },
  { id: 'acts',       abbr: 'ACTS', label: 'Acts',      books: 'Acts'            },
  { id: 'letters',    abbr: 'LTRS', label: 'Letters',   books: 'Romans–Jude'     },
  { id: 'revelation', abbr: 'REV',  label: 'Prophecy',  books: 'Revelation'      },
];

export default function Home() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');

  function startGame(mode: GameMode) {
    const seed = generateGameSeed();
    router.push(`/game?mode=${mode}&seed=${seed}&difficulty=${difficulty}`);
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-56px)] px-4 py-14">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
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

      {/* Difficulty toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-xl mb-8"
      >
        {(['hard', 'easy'] as Difficulty[]).map(d => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex flex-col items-center gap-0.5 ${
              difficulty === d
                ? 'bg-white/10 text-white'
                : 'text-white/30 hover:text-white/55'
            }`}
          >
            <span className="capitalize">{d}</span>
            <span className="text-[10px] font-normal opacity-60">
              {d === 'hard' ? 'One verse, no context' : '±10 verses of context'}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Main mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl mb-10">
        {MAIN_MODES.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.07 }}
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startGame(m.id)}
            className="group relative flex flex-col gap-3 p-5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-[#c9a644]/30 hover:bg-[#c9a644]/[0.04] transition-all duration-200 text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#c9a644]/50 tracking-[0.15em] uppercase">{m.abbr}</span>
              <svg className="w-4 h-4 text-white/15 group-hover:text-[#c9a644] group-hover:translate-x-0.5 transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-base text-white/85 group-hover:text-white transition-colors">{m.label}</div>
              <div className="text-xs text-white/30 mt-0.5">{m.desc}</div>
            </div>
            <div className="text-[11px] text-white/18 font-mono">{m.books}</div>
          </motion.button>
        ))}
      </div>

      {/* Category section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-3xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-white/25 uppercase">Categories</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {/* OT categories */}
        <div className="mb-4">
          <div className="text-[10px] font-bold tracking-[0.18em] text-[#c9a644]/40 uppercase mb-2 px-1">
            Old Testament
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {OT_CATEGORIES.map((m, i) => (
              <CategoryCard key={m.id} m={m} delay={0.4 + i * 0.05} onClick={() => startGame(m.id)} />
            ))}
          </div>
        </div>

        {/* NT categories */}
        <div>
          <div className="text-[10px] font-bold tracking-[0.18em] text-[#c9a644]/40 uppercase mb-2 px-1">
            New Testament
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {NT_CATEGORIES.map((m, i) => (
              <CategoryCard key={m.id} m={m} delay={0.6 + i * 0.05} onClick={() => startGame(m.id)} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="text-center text-white/20 text-xs tracking-wide mt-10"
      >
        5 rounds &middot; up to 5,000 pts per round &middot; 25,000 max
      </motion.div>
    </div>
  );
}

function CategoryCard({
  m,
  delay,
  onClick,
}: {
  m: { abbr: string; label: string; books: string };
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group flex flex-col gap-1.5 p-3.5 rounded-xl border border-white/6 bg-white/[0.015] hover:border-[#c9a644]/25 hover:bg-[#c9a644]/[0.035] transition-all duration-200 text-left cursor-pointer"
    >
      <span className="text-[10px] font-black tracking-[0.15em] text-[#c9a644]/45 group-hover:text-[#c9a644]/70 transition-colors uppercase">
        {m.abbr}
      </span>
      <span className="text-sm font-semibold text-white/70 group-hover:text-white/90 transition-colors leading-tight">
        {m.label}
      </span>
      <span className="text-[10px] text-white/20 font-mono">{m.books}</span>
    </motion.button>
  );
}
