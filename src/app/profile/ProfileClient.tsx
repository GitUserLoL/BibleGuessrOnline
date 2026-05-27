'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateProfile } from '@/lib/actions';
import { useRouter } from 'next/navigation';

const EMOJI_OPTIONS = [
  '✝️','🙏','📖','✡️','🕊️','⭐','🌟','💫',
  '🔥','🌈','👑','🦁','🐑','🌿','🍞','🍷',
  '⚔️','🛡️','🏔️','🌊','😊','😄','🤔','🧐',
  '💪','🤝','❤️','💛','💙','💚','🏆','🎯',
  '🦋','🦅','🌙','☀️',
];

interface Props {
  userId: string;
  initialUsername: string;
  initialEmoji: string;
  nameChangesUsed: number;
}

export default function ProfileClient({ userId, initialUsername, initialEmoji, nameChangesUsed }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const changesLeft = 5 - nameChangesUsed;
  const usernameChanged = username.trim() !== initialUsername;
  const emojiChanged = emoji !== initialEmoji;
  const hasChanges = usernameChanged || emojiChanged;

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile(
      userId,
      usernameChanged ? username : null,
      emojiChanged ? emoji : null,
    );

    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-1">Profile</h1>
      <p className="text-white/40 text-sm mb-10">Customise how you appear in the game and on the leaderboard</p>

      {/* Avatar preview */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          key={emoji}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-5xl mb-3"
        >
          {emoji}
        </motion.div>
        <div className="text-white/50 text-sm">Your avatar</div>
      </div>

      {/* Emoji picker */}
      <div className="mb-8">
        <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Choose an emoji</div>
        <div className="grid grid-cols-9 gap-2">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${
                emoji === e
                  ? 'bg-amber-500/30 border-2 border-amber-500 scale-110'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Username */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-white/40 uppercase tracking-widest">Display name</label>
          <span className={`text-xs font-semibold ${changesLeft <= 1 ? 'text-red-400' : 'text-white/30'}`}>
            {changesLeft} of 5 changes remaining this month
          </span>
        </div>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          maxLength={24}
          disabled={changesLeft === 0}
          placeholder="Your display name"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />
        {changesLeft === 0 && (
          <p className="text-xs text-red-400 mt-2">Name change limit reached — resets next month.</p>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm mb-4"
        >
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-amber-400 text-sm mb-4"
        >
          ✓ Profile updated
        </motion.p>
      )}

      <button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
