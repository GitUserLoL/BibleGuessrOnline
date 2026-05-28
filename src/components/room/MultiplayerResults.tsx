'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScoreColor } from '@/lib/scoring';
import Link from 'next/link';
import type { Verse } from '@/types';
import { resetRoom } from '@/lib/actions';

interface Player {
  profile_id: string;
  username: string;
  total_score: number;
  profiles?: { avatar_emoji: string | null } | null;
}
interface Guess {
  profile_id: string;
  round_number: number;
  guess_book_name: string | null;
  guess_chapter: number | null;
  guess_verse: number | null;
  score: number;
}
interface Room { id: string; host_id: string; game_mode: string; difficulty: string }

interface Props {
  players: Player[];
  guesses: Guess[];
  verses: Verse[];
  room: Room;
  myId: string;
}

const MODE_LABELS: Record<string, string> = {
  full: 'Full Bible', ot: 'Old Testament', nt: 'New Testament',
  law: 'The Law', history: 'History', 'major-prophets': 'Major Prophets',
  'minor-prophets': 'Minor Prophets', gospels: 'Gospels', acts: 'Acts',
  letters: 'Letters', revelation: 'Prophecy',
};

type Tab = 'scores' | 'recap';

export default function MultiplayerResults({ players, guesses, verses, room, myId }: Props) {
  const [resetting, setResetting] = useState(false);
  const [tab, setTab] = useState<Tab>('recap');
  const isHost = myId === room.host_id;

  async function handlePlayAgain() {
    setResetting(true);
    await resetRoom(room.id);
  }

  const sorted = [...players].sort((a, b) => b.total_score - a.total_score);
  const modeLabel = MODE_LABELS[room.game_mode] ?? room.game_mode;
  const diffLabel = room.difficulty === 'easy' ? 'Easy' : 'Hard';

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-start px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg flex flex-col gap-5"
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-white/30 text-sm mb-1">{modeLabel} · {diffLabel} · 5 Rounds</div>
          <h2 className="text-3xl font-black text-white">Game Over</h2>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/8 rounded-xl">
          {(['recap', 'scores'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-white/12 text-white' : 'text-white/35 hover:text-white/60'
              }`}
            >
              {t === 'recap' ? 'Round Recap' : 'Final Scores'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'scores' ? (
            <motion.div key="scores" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
              {sorted.map((p, i) => (
                <motion.div
                  key={p.profile_id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
                    i === 0 ? 'bg-[#c9a644]/10 border-[#c9a644]/30' : 'bg-white/[0.02] border-white/8'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    i === 0 ? 'bg-[#c9a644] text-[#0d0b09]' :
                    i === 1 ? 'bg-white/15 text-white/80' :
                    'bg-white/8 text-white/40'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-base flex-shrink-0">
                    {p.profiles?.avatar_emoji ?? (
                      <span className="text-xs font-bold text-white/40">{p.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 font-semibold text-white/85">{p.username}</div>
                  <div className="font-black text-xl tabular-nums" style={{ color: getScoreColor(p.total_score) }}>
                    {p.total_score.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="recap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map(round => {
                const verse = verses[round - 1];
                if (!verse) return null;
                const roundGuesses = guesses.filter(g => g.round_number === round);

                return (
                  <motion.div
                    key={round}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (round - 1) * 0.07 }}
                    className="bg-white/[0.02] border border-white/8 rounded-xl overflow-hidden"
                  >
                    {/* Round header */}
                    <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Round {round}</span>
                      <span className="text-xs font-bold text-[#c9a644]">
                        {verse.book_name} {verse.chapter}:{verse.verse}
                      </span>
                    </div>

                    {/* Verse snippet */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-white/40 text-xs font-serif leading-relaxed line-clamp-2">
                        &ldquo;{verse.text}&rdquo;
                      </p>
                    </div>

                    {/* Player guesses */}
                    <div className="divide-y divide-white/[0.04]">
                      {roundGuesses.length === 0 ? (
                        <div className="px-4 py-2.5 text-white/20 text-xs">No guesses recorded</div>
                      ) : (
                        roundGuesses
                          .sort((a, b) => b.score - a.score)
                          .map(g => {
                            const player = players.find(p => p.profile_id === g.profile_id);
                            const isMe = g.profile_id === myId;
                            const correct = g.guess_book_name === verse.book_name &&
                              g.guess_chapter === verse.chapter &&
                              g.guess_verse === verse.verse;
                            return (
                              <div key={g.profile_id} className={`flex items-center gap-3 px-4 py-2.5 ${isMe ? 'bg-white/[0.025]' : ''}`}>
                                <div className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-xs flex-shrink-0">
                                  {player?.profiles?.avatar_emoji ?? (
                                    <span className="text-[10px] font-bold text-white/30">
                                      {(player?.username ?? '?')[0].toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs text-white/55 truncate">
                                    {player?.username ?? 'Unknown'}
                                    {isMe && <span className="text-[#c9a644]/60 ml-1">(you)</span>}
                                  </span>
                                  <div className={`text-xs font-semibold ${correct ? 'text-[#c9a644]' : 'text-white/70'}`}>
                                    {g.guess_book_name} {g.guess_chapter}:{g.guess_verse}
                                    {correct && <span className="text-[#c9a644] ml-1">✓</span>}
                                  </div>
                                </div>
                                <div className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: getScoreColor(g.score) }}>
                                  {g.score.toLocaleString()}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/multiplayer"
            className="flex-1 py-3 rounded-xl text-center bg-white/[0.04] border border-white/8 text-white/70 font-semibold hover:bg-white/8 hover:text-white transition-colors"
          >
            New Room
          </Link>
          {isHost ? (
            <button
              onClick={handlePlayAgain}
              disabled={resetting}
              className="flex-1 py-3 rounded-xl bg-[#c9a644] text-[#0d0b09] font-bold hover:bg-[#d4b860] transition-colors disabled:opacity-40"
            >
              {resetting ? 'Resetting…' : 'Play Again'}
            </button>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-white/20 text-xs text-center">Waiting for host to start a new game…</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
