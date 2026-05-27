'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Verse, BibleMeta } from '@/types';
import { submitRoomGuess, advanceRound } from '@/lib/actions';
import { getScoreColor } from '@/lib/scoring';
import VerseDisplay from '@/components/game/VerseDisplay';
import GuessSelector from '@/components/game/GuessSelector';

interface Room {
  id: string; host_id: string; game_mode: string; current_round: number;
  round_duration_secs: number; round_started_at: string | null;
}
interface RoomPlayer { profile_id: string; username: string; total_score: number }
interface RoomGuess {
  profile_id: string; round_number: number; guess_book_name: string | null;
  guess_chapter: number | null; guess_verse: number | null; score: number;
}

interface Props {
  room: Room; players: RoomPlayer[]; guesses: RoomGuess[];
  verses: Verse[]; meta: BibleMeta; myId: string; isHost: boolean;
}

function useTimer(roundStartedAt: string | null, durationSecs: number) {
  const [remaining, setRemaining] = useState(durationSecs);

  useEffect(() => {
    if (!roundStartedAt) return;
    const tick = () => {
      const elapsed = (Date.now() - new Date(roundStartedAt).getTime()) / 1000;
      setRemaining(Math.max(0, durationSecs - elapsed));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [roundStartedAt, durationSecs]);

  return remaining;
}

export default function MultiplayerGame({
  room, players, guesses, verses, meta, myId, isHost
}: Props) {
  const round = room.current_round;
  const verse = verses[round - 1];
  const duration = room.round_duration_secs;

  const remaining = useTimer(room.round_started_at, duration);
  const timerExpired = remaining <= 0;

  const roundGuesses = guesses.filter(g => g.round_number === round);
  const myGuessThisRound = roundGuesses.find(g => g.profile_id === myId);
  const hasGuessed = !!myGuessThisRound;

  // Between-round results overlay (shown for 4s after timer expires)
  const [showResults, setShowResults] = useState(false);
  const advancedRef = useRef(false);

  useEffect(() => {
    advancedRef.current = false;
    setShowResults(false);
  }, [round]);

  useEffect(() => {
    if (!timerExpired) return;
    setShowResults(true);
    const timer = setTimeout(() => {
      if (!advancedRef.current) {
        advancedRef.current = true;
        advanceRound(room.id, round);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [timerExpired, room.id, round]);

  async function handleGuess(bookId: number, chapter: number, verseNum: number) {
    const book = meta.books.find(b => b.id === bookId)!;
    await submitRoomGuess(room.id, myId, round, bookId, chapter, verseNum, book.name);
  }

  const timerPct = duration > 0 ? remaining / duration : 0;
  const timerColor = timerPct > 0.5 ? '#22c55e' : timerPct > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col lg:flex-row">
      {/* Main game area */}
      <div className="flex-1 flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/40 uppercase tracking-widest font-semibold">
            Round {round} / 5
          </div>
          {/* Timer ring */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle
                cx="24" cy="24" r="20" fill="none"
                stroke={timerColor}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerPct)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.5s' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black"
              style={{ color: timerColor }}>
              {Math.ceil(remaining)}
            </div>
          </div>
        </div>

        <VerseDisplay text={verse.text} roundNumber={round} />

        <GuessSelector
          bibleStructure={meta.books}
          mode={room.game_mode as 'full' | 'ot' | 'nt'}
          onSubmit={handleGuess}
          disabled={hasGuessed || timerExpired}
        />

        {hasGuessed && !timerExpired && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-amber-400/70 text-sm py-2"
          >
            ✓ Guess submitted — waiting for others…
          </motion.div>
        )}
      </div>

      {/* Player sidebar */}
      <div className="lg:w-60 border-t lg:border-t-0 lg:border-l border-white/10 p-4 flex flex-col gap-3">
        <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Players</div>
        {players
          .slice()
          .sort((a, b) => b.total_score - a.total_score)
          .map(p => {
            const guessedThisRound = roundGuesses.some(g => g.profile_id === p.profile_id);
            return (
              <motion.div
                key={p.profile_id}
                layout
                className="flex items-center gap-2"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${guessedThisRound ? 'bg-green-400' : 'bg-white/20'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">{p.username}</div>
                  <div className="text-xs text-white/30">{p.total_score.toLocaleString()} pts</div>
                </div>
                {p.profile_id === myId && <span className="text-[10px] text-amber-400/60">you</span>}
              </motion.div>
            );
          })}
      </div>

      {/* Round results overlay */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0f1628] border border-white/20 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="text-xs text-white/40 uppercase tracking-widest mb-1 text-center">Round {round} Results</div>
              <div className="text-center text-amber-300 font-bold mb-4">
                {verse.book_name} {verse.chapter}:{verse.verse}
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {players
                  .slice()
                  .sort((a, b) => {
                    const ag = roundGuesses.find(g => g.profile_id === a.profile_id)?.score ?? 0;
                    const bg = roundGuesses.find(g => g.profile_id === b.profile_id)?.score ?? 0;
                    return bg - ag;
                  })
                  .map(p => {
                    const guess = roundGuesses.find(g => g.profile_id === p.profile_id);
                    const score = guess?.score ?? 0;
                    return (
                      <div key={p.profile_id} className="flex items-center gap-3">
                        <div className="flex-1 text-sm text-white/80 truncate">{p.username}</div>
                        {guess ? (
                          <div className="text-xs text-white/40">
                            {guess.guess_book_name} {guess.guess_chapter}:{guess.guess_verse}
                          </div>
                        ) : (
                          <div className="text-xs text-white/25">no guess</div>
                        )}
                        <div className="font-bold text-sm w-16 text-right" style={{ color: getScoreColor(score) }}>
                          +{score.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="text-center text-white/30 text-xs">Next round starting…</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
