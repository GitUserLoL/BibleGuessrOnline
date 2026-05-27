'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getScoreColor } from '@/lib/scoring';
import Link from 'next/link';
import type { Verse } from '@/types';
import { resetRoom } from '@/lib/actions';

interface Player { profile_id: string; username: string; total_score: number; profiles?: { avatar_emoji: string | null } | null }
interface Guess { profile_id: string; round_number: number; score: number }
interface Room { id: string; host_id: string; game_mode: string }

interface Props {
  players: Player[];
  guesses: Guess[];
  verses: Verse[];
  room: Room;
  myId: string;
}

export default function MultiplayerResults({ players, guesses, room, myId }: Props) {
  const [resetting, setResetting] = useState(false);
  const isHost = myId === room.host_id;

  async function handlePlayAgain() {
    setResetting(true);
    await resetRoom(room.id);
    // RoomClient detects status → 'lobby' and reloads the page for all clients
  }
  const sorted = [...players].sort((a, b) => b.total_score - a.total_score);
  const modeLabel = room.game_mode === 'full' ? 'Full Bible' : room.game_mode === 'ot' ? 'Old Testament' : 'New Testament';

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col gap-6"
      >
        <div className="text-center">
          <div className="text-white/40 text-sm mb-2">{modeLabel} · 5 Rounds</div>
          <h2 className="text-3xl font-black text-white">Final Scores</h2>
        </div>

        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => (
            <motion.div
              key={p.profile_id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
                i === 0
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                i === 0 ? 'bg-amber-500 text-black' :
                i === 1 ? 'bg-white/20 text-white' :
                'bg-white/10 text-white/50'
              }`}>
                {i + 1}
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                {p.profiles?.avatar_emoji ?? p.username[0].toUpperCase()}
              </div>
              <div className="flex-1 font-semibold text-white/90">{p.username}</div>
              <div className="font-black text-xl" style={{ color: getScoreColor(p.total_score) }}>
                {p.total_score.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3 mt-2">
          <Link
            href="/multiplayer"
            className="flex-1 py-3 rounded-xl text-center bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors"
          >
            New Room
          </Link>
          {isHost ? (
            <button
              onClick={handlePlayAgain}
              disabled={resetting}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {resetting ? 'Resetting…' : 'Play Again'}
            </button>
          ) : (
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl text-center bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
            >
              Play Solo
            </Link>
          )}
        </div>
        {!isHost && (
          <p className="text-center text-white/25 text-xs -mt-2">Waiting for host to start a new game…</p>
        )}
      </motion.div>
    </div>
  );
}
