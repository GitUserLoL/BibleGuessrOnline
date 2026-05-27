'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createRoom, joinRoom } from '@/lib/actions';
import type { GameMode } from '@/types';

const MODES: { id: GameMode; label: string; icon: string }[] = [
  { id: 'full', label: 'Full Bible', icon: '📖' },
  { id: 'ot', label: 'Old Testament', icon: '🕎' },
  { id: 'nt', label: 'New Testament', icon: '✝️' },
];

function getPlayerId(): string {
  let id = localStorage.getItem('guest_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('guest_id', id); }
  return id;
}
function getPlayerName(): string {
  let name = localStorage.getItem('guest_name');
  if (!name) { name = `Guest#${Math.floor(Math.random() * 9000) + 1000}`; localStorage.setItem('guest_name', name); }
  return name;
}

export default function MultiplayerPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [mode, setMode] = useState<GameMode>('full');
  const [duration, setDuration] = useState(45);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUsername(data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'Player');
      } else {
        setUsername(getPlayerName());
      }
    });
  }, []);

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const playerId = user?.id ?? getPlayerId();
      const playerName = user
        ? (user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Player')
        : getPlayerName();

      const roomId = await createRoom(playerId, playerName, mode, duration);
      router.push(`/room/${roomId}`);
    } catch (e) {
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const playerId = user?.id ?? getPlayerId();
      const playerName = user
        ? (user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Player')
        : getPlayerName();

      const result = await joinRoom(joinCode.trim().toUpperCase(), playerId, playerName);
      if (result.error) { setError(result.error); return; }
      router.push(`/room/${joinCode.trim().toUpperCase()}`);
    } catch {
      setError('Could not join room. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-black text-white mb-1">Multiplayer</h1>
        <p className="text-white/40 text-sm mb-8">
          Play live against friends in real-time.
          {username && <span className="text-amber-400"> Playing as: {username}</span>}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
          {(['create', 'join'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <div className="flex flex-col gap-5">
            {/* Mode */}
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Game Mode</div>
              <div className="grid grid-cols-3 gap-2">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      mode === m.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <div>{m.icon}</div>
                    <div className="text-xs mt-1">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-white/40 uppercase tracking-widest">Round Timer</div>
                <div className="text-amber-400 font-bold text-sm">{duration}s</div>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                step={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-white/25 mt-1">
                <span>15s</span><span>60s</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Room'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Room Code</div>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-black text-center tracking-[0.3em] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors uppercase"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || joinCode.length !== 6}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Joining…' : 'Join Room'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
