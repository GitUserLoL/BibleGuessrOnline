'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateProfile } from '@/lib/actions';
import { AVATAR_ICONS, AVATAR_ICON_KEYS } from '@/lib/avatarIcons';
import AvatarIcon from '@/components/ui/AvatarIcon';

interface Props {
  userId: string;
  initialUsername: string;
  initialEmoji: string;
  nameChangesUsed: number;
}

export default function ProfileClient({ userId, initialUsername, initialEmoji, nameChangesUsed: initialChangesUsed }: Props) {
  const [savedUsername, setSavedUsername] = useState(initialUsername);
  const [savedEmoji, setSavedEmoji] = useState(initialEmoji);
  const [username, setUsername] = useState(initialUsername);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [changesUsed, setChangesUsed] = useState(initialChangesUsed);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changesLeft = 5 - changesUsed;
  const usernameChanged = username.trim() !== savedUsername;
  const emojiChanged = emoji !== savedEmoji;
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
      return;
    }

    if (usernameChanged) {
      setSavedUsername(username.trim());
      setChangesUsed(u => u + 1);
    }
    if (emojiChanged) {
      setSavedEmoji(emoji);
    }

    window.dispatchEvent(
      new CustomEvent('profileUpdated', {
        detail: { username: usernameChanged ? username.trim() : savedUsername, emoji },
      })
    );

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
          className="w-24 h-24 rounded-full bg-white/10 border-2 border-[#c9a644]/30 flex items-center justify-center text-[#c9a644] mb-3"
        >
          <AvatarIcon iconKey={emoji} size={44} />
        </motion.div>
        <div className="text-white/50 text-sm">{AVATAR_ICONS[emoji]?.label ?? 'Avatar'}</div>
      </div>

      {/* Icon picker */}
      <div className="mb-8">
        <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Choose an icon</div>
        <div className="grid grid-cols-8 gap-2">
          {AVATAR_ICON_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setEmoji(key)}
              title={AVATAR_ICONS[key].label}
              className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                emoji === key
                  ? 'bg-[#c9a644]/20 border-2 border-[#c9a644] text-[#c9a644] scale-110'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white/80'
              }`}
            >
              <AvatarIcon iconKey={key} size={18} />
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
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a644]/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />
        {changesLeft === 0 && (
          <p className="text-xs text-red-400 mt-2">Name change limit reached — resets next month.</p>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mb-4">
          {error}
        </motion.p>
      )}
      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[#c9a644] text-sm mb-4">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Profile updated
        </motion.div>
      )}

      <button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full py-3 rounded-xl bg-[#c9a644] text-[#0d0b09] font-bold hover:bg-[#d4b860] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
