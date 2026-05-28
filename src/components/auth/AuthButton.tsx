'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import AvatarIcon from '@/components/ui/AvatarIcon';
import { isIconKey } from '@/lib/avatarIcons';

interface Profile {
  username: string;
  avatar_emoji: string | null;
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load(u: User | null) {
      setUser(u);
      if (!u) { setProfile(null); return; }
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_emoji')
        .eq('id', u.id)
        .single();
      setProfile(data);
    }

    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      load(session?.user ?? null);
    });

    function onProfileUpdated(e: Event) {
      const { username, emoji } = (e as CustomEvent<{ username: string; emoji: string }>).detail;
      setProfile({ username, avatar_emoji: emoji });
    }
    window.addEventListener('profileUpdated', onProfileUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profileUpdated', onProfileUpdated);
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOpen(false);
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="r-btn px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--gold)] border-[var(--gold-dim)] hover:text-[var(--gold-light)]"
        style={{ borderColor: 'var(--gold-dim)' }}
      >
        Sign in
      </Link>
    );
  }

  const avatar = profile?.avatar_emoji ?? null;
  const displayName = profile?.username ?? user.user_metadata?.full_name ?? user.email ?? '?';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 r-btn flex items-center justify-center text-[var(--gold)] hover:bg-[var(--bg-surface)]"
        title={displayName}
      >
        {isIconKey(avatar) ? (
          <AvatarIcon iconKey={avatar} size={16} />
        ) : (
          <span className="text-xs font-black">
            {displayName[0].toUpperCase()}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-52 r-panel shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-[var(--bl)] flex items-center gap-3">
              <div className="w-7 h-7 r-btn flex items-center justify-center text-[var(--gold)] flex-shrink-0">
                {isIconKey(avatar) ? (
                  <AvatarIcon iconKey={avatar} size={14} />
                ) : (
                  <span className="text-[10px] font-bold">{displayName[0].toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-[#ede8dc] font-semibold truncate">{displayName}</div>
                <div className="text-[10px] text-[rgba(237,232,220,0.35)] truncate">{user.email}</div>
              </div>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[rgba(237,232,220,0.5)] hover:bg-[var(--bg-surface)] hover:text-[rgba(237,232,220,0.9)] transition-colors"
            >
              Edit profile
            </Link>
            <button
              onClick={signOut}
              className="w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[rgba(237,232,220,0.5)] hover:bg-[var(--bg-surface)] hover:text-[rgba(237,232,220,0.9)] transition-colors border-t border-[var(--bl)]"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
