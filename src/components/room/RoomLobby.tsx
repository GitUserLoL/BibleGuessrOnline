'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startRoom, leaveRoom } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface Room { id: string; host_id: string; game_mode: string; round_duration_secs: number }
interface Player { profile_id: string; username: string; profiles?: { avatar_emoji: string | null } | null }

interface Props {
  room: Room;
  players: Player[];
  myId: string;
  isHost: boolean;
}

export default function RoomLobby({ room, players, myId, isHost }: Props) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleStart() {
    if (players.length < 2) return;
    setStarting(true);
    await startRoom(room.id);
  }

  async function handleLeave() {
    await leaveRoom(room.id, myId);
    router.push('/multiplayer');
  }

  function copyCode() {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const modeLabel = room.game_mode === 'full' ? 'Full Bible' : room.game_mode === 'ot' ? 'Old Testament' : 'New Testament';

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Room Code</div>
          <motion.button
            onClick={copyCode}
            whileTap={{ scale: 0.97 }}
            className="text-5xl font-black tracking-[0.2em] text-amber-400 hover:text-amber-300 transition-colors font-mono"
          >
            {room.id}
          </motion.button>
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-amber-400/70 mt-2"
              >
                Copied to clipboard!
              </motion.div>
            )}
          </AnimatePresence>
          <div className="text-white/30 text-sm mt-2">
            {modeLabel} · {room.round_duration_secs}s per round
          </div>
        </div>

        {/* Player list */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Players</span>
            <span className="text-xs text-white/40">{players.length}/10</span>
          </div>
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {players.map(p => (
                <motion.div
                  key={p.profile_id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-lg">
                    {p.profiles?.avatar_emoji ?? p.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80 flex-1">{p.username}</span>
                  {p.profile_id === room.host_id && (
                    <span className="text-[10px] text-amber-400/60 font-semibold uppercase tracking-wide">Host</span>
                  )}
                  {p.profile_id === myId && p.profile_id !== room.host_id && (
                    <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wide">You</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {isHost ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleStart}
              disabled={starting || players.length < 2}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-lg hover:bg-amber-400 transition-colors disabled:opacity-40"
            >
              {starting ? 'Starting…' : players.length < 2 ? 'Waiting for players…' : 'Start Game'}
            </button>
            <p className="text-center text-white/25 text-xs">Need at least 2 players to start</p>
          </div>
        ) : (
          <div className="text-center text-white/40 text-sm py-2">
            Waiting for host to start the game…
          </div>
        )}

        <button
          onClick={handleLeave}
          className="text-center text-white/30 text-sm hover:text-white/60 transition-colors"
        >
          Leave room
        </button>
      </motion.div>
    </div>
  );
}
