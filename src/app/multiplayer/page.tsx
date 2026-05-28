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
  // Resolved player identity fetched once on mount
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();
        const name = profile?.username ?? data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'Player';
        setPlayerId(data.user.id);
        setPlayerName(name);
        setUsername(name);
      } else {
        const guestName = getPlayerName();
        setPlayerId(getPlayerId());
        setPlayerName(guestName);
        setUsername(guestName);
      }
    });
  }, []);

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
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
      const result = await joinRoom(joinCode.trim().toUpperCase(), playerId, playerName);
      if (result.error) { setError(result.error); return; }
      router.push(`/room/${joinCode.trim().toUpperCase()}`);
    } catch {
      setError('Could not join room. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  const modeBtn = (m: (typeof MODES)[0], large?: boolean) =>
    `flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer border-2 ${large ? 'py-4' : 'py-3'} ${
      mode === m.id
        ? 'bg-[var(--gold)] text-[#0d0b09] border-[var(--gold-light)]'
        : 'bg-[var(--bg-card)] text-[rgba(237,232,220,0.45)] border-[var(--bl)] hover:text-[rgba(237,232,220,0.8)] hover:border-[var(--border-mid)]'
    }`;

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-black text-[#ede8dc] mb-1 tracking-tight">Multiplayer</h1>
        <p className="text-[rgba(237,232,220,0.3)] text-xs uppercase tracking-widest font-semibold mb-8">
          Play live against friends in real-time.
          {username && <span className="text-[var(--gold)]"> · {username}</span>}
        </p>

        {/* Tabs */}
        <div className="r-panel flex mb-6">
          {(['create', 'join'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all ${
                tab === t ? 'bg-[var(--bg-raised)] text-[#ede8dc]' : 'text-[rgba(237,232,220,0.3)] hover:text-[rgba(237,232,220,0.6)]'
              }`}
            >
              {t === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <div className="flex flex-col gap-6">
            {/* Mode */}
            <div>
              <div className="label-caps mb-3">Game Mode</div>
              {/* Primary scope — always visible, prominent */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {MODES.filter(m => m.section === 'Main').map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)} className={modeBtn(m, true)}>
                    <span className="text-xs font-black tracking-widest">{m.abbr}</span>
                    <span className="text-[9px] opacity-80 font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>
              {/* Specific categories — clearly secondary */}
              <div className="r-panel p-3 flex flex-col gap-3">
                <div className="label-caps">Specific Books</div>
                <div className="flex items-start gap-2">
                  <span className="label-caps w-5 pt-2.5 shrink-0">OT</span>
                  <div className="grid grid-cols-4 gap-1.5 flex-1">
                    {MODES.filter(m => m.section === 'OT').map(m => (
                      <button key={m.id} onClick={() => setMode(m.id)} className={modeBtn(m)}>
                        <span className="text-[9px] font-black tracking-wider">{m.abbr}</span>
                        <span className="text-[8px] opacity-75 text-center leading-tight">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="label-caps w-5 pt-2.5 shrink-0">NT</span>
                  <div className="grid grid-cols-4 gap-1.5 flex-1">
                    {MODES.filter(m => m.section === 'NT').map(m => (
                      <button key={m.id} onClick={() => setMode(m.id)} className={modeBtn(m)}>
                        <span className="text-[9px] font-black tracking-wider">{m.abbr}</span>
                        <span className="text-[8px] opacity-75 text-center leading-tight">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <div className="label-caps mb-3">Difficulty</div>
              <div className="r-panel flex">
                {(['hard', 'easy'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all flex flex-col items-center gap-0.5 ${
                      difficulty === d ? 'bg-[var(--bg-raised)] text-[#ede8dc]' : 'text-[rgba(237,232,220,0.3)] hover:text-[rgba(237,232,220,0.6)]'
                    }`}
                  >
                    <span>{d}</span>
                    <span className="text-[8px] font-normal opacity-60 normal-case tracking-normal">
                      {d === 'hard' ? 'One verse only' : '±10 context verses'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="label-caps">Round Timer</div>
                <div className="text-[var(--gold)] font-bold text-sm tabular-nums">{duration}s</div>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                step={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full accent-[var(--gold)]"
              />
              <div className="flex justify-between text-[9px] text-[rgba(237,232,220,0.2)] mt-1 uppercase tracking-widest font-semibold">
                <span>15s</span><span>60s</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs uppercase tracking-widest font-semibold">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 r-btn-gold text-sm uppercase tracking-widest"
            >
              {loading ? 'Creating…' : 'Create Room'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <div className="label-caps mb-3">Room Code</div>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ABC123"
                maxLength={6}
                className="r-input w-full px-4 py-4 text-2xl font-black text-center tracking-[0.3em]"
              />
            </div>
            {error && <p className="text-red-400 text-xs uppercase tracking-widest font-semibold">{error}</p>}
            <button
              type="submit"
              disabled={loading || joinCode.length !== 6}
              className="w-full py-3 r-btn-gold text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining…' : 'Join Room'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
