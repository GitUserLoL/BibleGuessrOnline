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
        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#c9a644]/10 border border-[#c9a644]/25 text-[#c9a644] hover:bg-[#c9a644]/20 transition-colors"
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
        className="w-9 h-9 rounded-full bg-[#c9a644]/10 border border-[#c9a644]/30 flex items-center justify-center hover:bg-[#c9a644]/20 transition-colors text-[#c9a644]"
        title={displayName}
      >
        {isIconKey(avatar) ? (
          <AvatarIcon iconKey={avatar} size={18} />
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
            className="absolute right-0 top-11 w-52 bg-[#181411] border border-white/8 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/70 flex-shrink-0">
                {isIconKey(avatar) ? (
                  <AvatarIcon iconKey={avatar} size={18} />
                ) : (
                  <span className="text-xs font-bold text-white/50">{displayName[0].toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white font-semibold truncate">{displayName}</div>
                <div className="text-xs text-white/35 truncate">{user.email}</div>
              </div>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-white/50 hover:bg-white/8 hover:text-white/90 transition-colors"
            >
              Edit profile
            </Link>
            <button
              onClick={signOut}
              className="w-full text-left px-4 py-3 text-sm text-white/50 hover:bg-white/8 hover:text-white/90 transition-colors border-t border-white/5"
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
