'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { RoundResult, GameMode } from '@/types';
import { getScoreColor } from '@/lib/scoring';
import { createChallenge, submitScore, ensureProfile } from '@/lib/actions';

interface Props {
  results: RoundResult[];
  mode: GameMode;
  seed: number;
  onPlayAgain: () => void;
}

function getOrCreateGuestId(): string {
  let id = localStorage.getItem('guest_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('guest_id', id);
  }
  return id;
}

function getOrCreateUsername(): string {
  let name = localStorage.getItem('guest_name');
  if (!name) {
    name = `Guest#${Math.floor(Math.random() * 9000) + 1000}`;
    localStorage.setItem('guest_name', name);
  }
  return name;
}

export default function GameResults({ results, mode, seed, onPlayAgain }: Props) {
  const [challengeLink, setChallengeLink] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = results.reduce((sum, r) => sum + r.score, 0);

  async function handleSubmitScore() {
    setLoading(true);
    try {
      const guestId = getOrCreateGuestId();
      const username = getOrCreateUsername();
      await ensureProfile(guestId, username);
      await submitScore(guestId, mode, total);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateChallenge() {
    setLoading(true);
    try {
      const guestId = getOrCreateGuestId();
      const matchId = await createChallenge(seed, mode, guestId);
      const link = `${window.location.origin}/challenge/${matchId}`;
      setChallengeLink(link);
    } finally {
      setLoading(false);
    }
  }

  const modeLabel = mode === 'full' ? 'Full Bible' : mode === 'ot' ? 'Old Testament' : 'New Testament';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-6"
    >
      <div className="text-center">
        <div className="text-white/40 text-sm uppercase tracking-widest mb-2">{modeLabel} · 5 Rounds</div>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="text-7xl font-black text-amber-400 mb-1"
        >
          {total.toLocaleString()}
        </motion.div>
        <div className="text-white/50">Total Score</div>
      </div>

      {/* Per-round breakdown */}
      <div className="flex flex-col gap-2">
        {results.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          >
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white/80 text-sm font-medium truncate">
                {r.verse.book_name} {r.verse.chapter}:{r.verse.verse}
              </div>
              <div className="text-white/40 text-xs truncate">{r.verse.text.slice(0, 60)}…</div>
            </div>
            <div className="font-bold text-sm" style={{ color: getScoreColor(r.score) }}>
              {r.score.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-2">
        {challengeLink ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
            <div className="text-xs text-white/50 mb-2">Challenge link — share with friends!</div>
            <div
              className="text-amber-300 text-sm font-mono break-all cursor-pointer hover:text-amber-200"
              onClick={() => navigator.clipboard.writeText(challengeLink)}
            >
              {challengeLink}
            </div>
            <div className="text-xs text-white/30 mt-1">Click to copy</div>
          </div>
        ) : (
          <button
            onClick={handleCreateChallenge}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            ⚔️ Challenge a Friend
          </button>
        )}

        {!submitted ? (
          <button
            onClick={handleSubmitScore}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting…' : '🏆 Submit to Leaderboard'}
          </button>
        ) : (
          <div className="text-center text-amber-400 text-sm py-2">✓ Score submitted!</div>
        )}

        <button
          onClick={onPlayAgain}
          className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
        >
          Play Again
        </button>
      </div>
    </motion.div>
  );
}
