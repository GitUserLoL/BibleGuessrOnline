'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AuthButton from '@/components/auth/AuthButton';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0d0b09]/90">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="font-black text-lg tracking-tight text-white hover:text-[#c9a644] transition-colors"
        >
          BibleGuessr
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-5 text-sm text-white/40">
          <Link href="/multiplayer" className="hover:text-white/80 transition-colors">
            Multiplayer
          </Link>
          <Link href="/leaderboard" className="hover:text-white/80 transition-colors">
            Leaderboard
          </Link>
          <AuthButton />
        </nav>

        {/* Mobile: AuthButton + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <AuthButton />
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.svg
                  key="close"
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  width="16" height="16" viewBox="0 0 16 16"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                >
                  <path d="M2 2l12 12M14 2L2 14" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="open"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  width="16" height="16" viewBox="0 0 16 16"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                >
                  <path d="M2 4h12M2 8h12M2 12h12" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="sm:hidden overflow-hidden border-t border-white/5 bg-[#0d0b09]"
          >
            <div className="max-w-5xl mx-auto px-4 py-1 flex flex-col">
              <Link
                href="/multiplayer"
                onClick={() => setMenuOpen(false)}
                className="py-3.5 text-sm text-white/50 hover:text-white/90 transition-colors border-b border-white/5"
              >
                Multiplayer
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setMenuOpen(false)}
                className="py-3.5 text-sm text-white/50 hover:text-white/90 transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
