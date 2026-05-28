'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { RoundResult, GameMode, Difficulty } from '@/types';
import { getScoreColor } from '@/lib/scoring';
import { createChallenge, submitScore } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

interface Props {
  results: RoundResult[];
  mode: GameMode;
  seed: number;
  difficulty: Difficulty;
  onPlayAgain: () => void;
}

export default function GameResults({ results, mode, seed, difficulty, onPlayAgain }: Props) {
  const [challengeLink, setChallengeLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null | 'loading'>('loading');

  const total = results.reduce((sum, r) => sum + r.score, 0);
  const MODE_LABELS: Record<string, string> = {
    full: 'Full Bible', ot: 'Old Testament', nt: 'New Testament',
    law: 'The Law', history: 'History', 'major-prophets': 'Major Prophets',
    'minor-prophets': 'Minor Prophets', gospels: 'Gospels', acts: 'Acts',
    letters: 'Letters', revelation: 'Prophecy',
  };
  const modeLabel = MODE_LABELS[mode] ?? mode;
  const difficultyLabel = difficulty === 'easy' ? 'Easy' : 'Hard';

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleSubmitScore() {
    if (!user || user === 'loading') return;
    setLoading(true);
    try {
      await submitScore(user.id, mode, total, difficulty);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateChallenge() {
    setLoading(true);
    try {
      const profileId = user && user !== 'loading' ? user.id : (localStorage.getItem('guest_id') ?? crypto.randomUUID());
      const matchId = await createChallenge(seed, mode, profileId);
      setChallengeLink(`${window.location.origin}/challenge/${matchId}`);
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!challengeLink) return;
    navigator.clipboard.writeText(challengeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-6"
    >
      {/* Score header */}
      <div className="text-center">
        <div className="text-white/30 text-sm uppercase tracking-widest mb-2">{modeLabel} · {difficultyLabel} · 5 Rounds</div>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="text-7xl font-black text-[#c9a644] mb-1 tabular-nums"
        >
          {total.toLocaleString()}
        </motion.div>
        <div className="text-white/35 text-sm">out of 25,000</div>
      </div>

      {/* Per-round breakdown */}
      <div className="flex flex-col gap-2">
        {results.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-4 bg-white/[0.02] border border-white/8 rounded-xl px-4 py-3"
          >
            <div className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-xs text-white/35 flex-shrink-0 tabular-nums">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white/80 text-sm font-semibold truncate">
                {r.verse.book_name} {r.verse.chapter}:{r.verse.verse}
              </div>
              <div className="text-white/30 text-xs truncate">
                Your guess: {r.guessBookName} {r.guessChapter}:{r.guessVerse}
              </div>
            </div>
            <div className="font-bold text-sm flex-shrink-0 tabular-nums" style={{ color: getScoreColor(r.score) }}>
              {r.score.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 + results.length * 0.08, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-col gap-3 mt-2"
      >
        {challengeLink ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#c9a644]/8 border border-[#c9a644]/25 rounded-xl p-4 text-center"
          >
            <div className="text-xs text-white/40 mb-2">Share this link — friends play the same verses</div>
            <button
              onClick={copyLink}
              className="text-[#c9a644] text-sm font-mono break-all hover:text-[#d4b860] transition-colors"
            >
              {challengeLink}
            </button>
            <div className="text-xs text-white/25 mt-1">{copied ? 'Copied!' : 'Tap to copy'}</div>
          </motion.div>
        ) : (
          <button
            onClick={handleCreateChallenge}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/8 text-white/70 font-semibold hover:bg-white/8 hover:text-white transition-colors disabled:opacity-40"
          >
            Challenge a friend
          </button>
        )}

        {user === 'loading' ? null : user ? (
          submitted ? (
            <div className="text-center text-[#c9a644]/80 text-sm py-2">
              Score saved to leaderboard
            </div>
          ) : (
            <button
              onClick={handleSubmitScore}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/8 text-white/70 font-semibold hover:bg-white/8 hover:text-white transition-colors disabled:opacity-40"
            >
              {loading ? 'Saving…' : 'Save to leaderboard'}
            </button>
          )
        ) : (
          <Link
            href={`/auth/login?next=${encodeURIComponent('/')}`}
            className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/8 text-white/50 font-semibold hover:bg-white/8 transition-colors text-center text-sm"
          >
            Sign in to save your score
          </Link>
        )}

        <motion.button
          onClick={onPlayAgain}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl bg-[#c9a644] text-[#0d0b09] font-bold hover:bg-[#d4b860] transition-colors"
        >
          Play again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
