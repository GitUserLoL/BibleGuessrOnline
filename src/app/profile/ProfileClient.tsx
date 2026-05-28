'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <h1 className="text-3xl font-black text-[#ede8dc] mb-1 tracking-tight">Profile</h1>
      <p className="text-[rgba(237,232,220,0.35)] text-xs uppercase tracking-widest font-semibold mb-10">
        Customise how you appear in the game and on the leaderboard
      </p>

      {/* Avatar preview */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          key={emoji}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 r-panel-gold flex items-center justify-center text-[var(--gold)] mb-3"
        >
          <AvatarIcon iconKey={emoji} size={44} />
        </motion.div>
        <div className="label-caps">{AVATAR_ICONS[emoji]?.label ?? 'Avatar'}</div>
      </div>

      {/* Icon picker */}
      <div className="mb-8">
        <div className="label-caps mb-3">Choose an icon</div>
        <div className="r-panel p-3 grid grid-cols-8 gap-2">
          {AVATAR_ICON_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setEmoji(key)}
              title={AVATAR_ICONS[key].label}
              className={`w-full aspect-square flex items-center justify-center transition-all ${
                emoji === key
                  ? 'r-panel-gold text-[var(--gold)] scale-110'
                  : 'r-btn text-[rgba(237,232,220,0.45)] hover:text-[rgba(237,232,220,0.8)]'
              }`}
            >
              <AvatarIcon iconKey={key} size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Username */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="label-caps">Display name</label>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${changesLeft <= 1 ? 'text-red-400' : 'text-[rgba(237,232,220,0.25)]'}`}>
            {changesLeft} of 5 changes remaining
          </span>
        </div>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          maxLength={24}
          disabled={changesLeft === 0}
          placeholder="Your display name"
          className="r-input w-full px-4 py-3 text-sm font-semibold"
        />
        {changesLeft === 0 && (
          <p className="text-[10px] text-red-400 mt-2 uppercase tracking-widest font-semibold">
            Name change limit reached — resets next month.
          </p>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mb-4 uppercase tracking-widest font-semibold">
            {error}
          </motion.p>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[var(--gold)] text-xs mb-4 uppercase tracking-widest font-semibold">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Profile updated
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full py-3 r-btn-gold text-sm uppercase tracking-widest"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
