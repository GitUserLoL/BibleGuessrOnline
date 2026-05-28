'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createRoom, joinRoom } from '@/lib/actions';
import type { GameMode, Difficulty } from '@/types';

const MODES: { id: GameMode; abbr: string; label: string; section: string }[] = [
  { id: 'full',            abbr: 'ALL',  label: 'Full Bible',      section: 'Main'  },
  { id: 'ot',              abbr: 'OT',   label: 'Old Testament',   section: 'Main'  },
  { id: 'nt',              abbr: 'NT',   label: 'New Testament',   section: 'Main'  },
  { id: 'law',             abbr: 'LAW',  label: 'The Law',         section: 'OT'    },
  { id: 'history',         abbr: 'HIST', label: 'History',         section: 'OT'    },
  { id: 'major-prophets',  abbr: 'MAJ',  label: 'Major Prophets',  section: 'OT'    },
  { id: 'minor-prophets',  abbr: 'MIN',  label: 'Minor Prophets',  section: 'OT'    },
  { id: 'gospels',         abbr: 'GOSP', label: 'Gospels',         section: 'NT'    },
  { id: 'acts',            abbr: 'ACTS', label: 'Acts',            section: 'NT'    },
  { id: 'letters',         abbr: 'LTRS', label: 'Letters',         section: 'NT'    },
  { id: 'revelation',      abbr: 'REV',  label: 'Prophecy',        section: 'NT'    },
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
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
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

      const roomId = await createRoom(playerId, playerName, mode, duration, difficulty);
      router.push(`/room/${roomId}`);
    } catch {
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
        <p className="text-white/35 text-sm mb-8">
          Play live against friends in real-time.
          {username && <span className="text-[#c9a644]/80"> Playing as {username}</span>}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/8 mb-6">
          {(['create', 'join'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-white/12 text-white' : 'text-white/35 hover:text-white/60'
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
              <div className="text-xs text-white/35 uppercase tracking-widest mb-3">Game Mode</div>
              <div className="flex flex-col gap-3">
                {/* Main modes */}
                <div className="grid grid-cols-3 gap-2">
                  {MODES.filter(m => m.section === 'Main').map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                        mode === m.id
                          ? 'bg-[#c9a644]/15 border-[#c9a644]/40 text-[#c9a644]'
                          : 'bg-white/[0.03] border-white/8 text-white/40 hover:bg-white/8 hover:text-white/70'
                      }`}
                    >
                      <span className="text-[11px] font-black tracking-widest">{m.abbr}</span>
                      <span className="text-[10px] text-current opacity-70">{m.label}</span>
                    </button>
                  ))}
                </div>
                {/* Category modes */}
                <div className="border-t border-white/6 pt-3">
                  <div className="text-[9px] font-bold tracking-[0.18em] text-white/20 uppercase mb-2">OT Categories</div>
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {MODES.filter(m => m.section === 'OT').map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`py-2.5 rounded-lg border transition-all flex flex-col items-center gap-0.5 ${
                          mode === m.id
                            ? 'bg-[#c9a644]/15 border-[#c9a644]/40 text-[#c9a644]'
                            : 'bg-white/[0.03] border-white/6 text-white/35 hover:bg-white/8 hover:text-white/60'
                        }`}
                      >
                        <span className="text-[10px] font-black tracking-wider">{m.abbr}</span>
                        <span className="text-[9px] text-current opacity-70 leading-tight text-center px-0.5">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-[9px] font-bold tracking-[0.18em] text-white/20 uppercase mb-2">NT Categories</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {MODES.filter(m => m.section === 'NT').map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`py-2.5 rounded-lg border transition-all flex flex-col items-center gap-0.5 ${
                          mode === m.id
                            ? 'bg-[#c9a644]/15 border-[#c9a644]/40 text-[#c9a644]'
                            : 'bg-white/[0.03] border-white/6 text-white/35 hover:bg-white/8 hover:text-white/60'
                        }`}
                      >
                        <span className="text-[10px] font-black tracking-wider">{m.abbr}</span>
                        <span className="text-[9px] text-current opacity-70 leading-tight text-center px-0.5">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <div className="text-xs text-white/35 uppercase tracking-widest mb-3">Difficulty</div>
              <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-xl">
                {(['hard', 'easy'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                      difficulty === d ? 'bg-white/12 text-white' : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    <span className="capitalize">{d}</span>
                    <span className="text-[9px] font-normal opacity-60">
                      {d === 'hard' ? 'One verse only' : '±10 context verses'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-white/35 uppercase tracking-widest">Round Timer</div>
                <div className="text-[#c9a644] font-bold text-sm tabular-nums">{duration}s</div>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                step={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full accent-[#c9a644]"
              />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                <span>15s</span><span>60s</span>
              </div>
            </div>

            {error && <p className="text-red-400/80 text-sm">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#c9a644] text-[#0d0b09] font-bold text-base hover:bg-[#d4b860] transition-colors disabled:opacity-40"
            >
              {loading ? 'Creating…' : 'Create Room'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <div className="text-xs text-white/35 uppercase tracking-widest mb-3">Room Code</div>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-4 rounded-xl bg-white/[0.03] border border-white/8 text-white text-2xl font-black text-center tracking-[0.3em] placeholder-white/15 focus:outline-none focus:border-[#c9a644]/40 transition-colors uppercase"
              />
            </div>
            {error && <p className="text-red-400/80 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || joinCode.length !== 6}
              className="w-full py-3 rounded-xl bg-[#c9a644] text-[#0d0b09] font-bold text-base hover:bg-[#d4b860] transition-colors disabled:opacity-40"
            >
              {loading ? 'Joining…' : 'Join Room'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
