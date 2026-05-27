'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

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
    return () => subscription.unsubscribe();
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
        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
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
        className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center hover:bg-amber-500/25 transition-colors text-xl"
        title={displayName}
      >
        {avatar ?? (
          <span className="text-amber-400 text-xs font-black">
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
            className="absolute right-0 top-11 w-52 bg-[#0f1628] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              <div className="text-2xl">{avatar ?? displayName[0].toUpperCase()}</div>
              <div className="min-w-0">
                <div className="text-sm text-white font-semibold truncate">{displayName}</div>
                <div className="text-xs text-white/40 truncate">{user.email}</div>
              </div>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span>Edit profile</span>
            </Link>
            <button
              onClick={signOut}
              className="w-full text-left px-4 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5"
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
