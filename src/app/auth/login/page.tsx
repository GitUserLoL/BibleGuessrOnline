'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const next = searchParams.get('next') ?? '/';

  useEffect(() => {
    setGuestId(localStorage.getItem('guest_id'));
  }, []);

  const callbackUrl = (provider: 'google') => {
    const params = new URLSearchParams({ next });
    if (guestId) params.set('guest_id', guestId);
    return `/auth/callback?${params}`;
  };

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${callbackUrl('google')}`,
      },
    });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const supabase = createClient();
    const params = new URLSearchParams({ next });
    if (guestId) params.set('guest_id', guestId);
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?${params}`,
      },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="r-panel p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 r-panel flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--gold)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M5 9h14" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-black text-[#ede8dc] uppercase tracking-widest">Sign in</h1>
            {guestId && (
              <p className="text-[10px] text-[var(--gold)] mt-2 uppercase tracking-widest font-semibold">
                Your guest progress will be merged into your account.
              </p>
            )}
            {error && (
              <p className="text-[10px] text-red-400 mt-2 uppercase tracking-widest font-semibold">
                Authentication failed — please try again.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors border-t-2 border-l-2 border-gray-200 border-b-2 border-r-2 border-b-gray-400 border-r-gray-400"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--bl)]" />
              <span className="text-[rgba(237,232,220,0.25)] text-[10px] uppercase tracking-widest font-semibold">or</span>
              <div className="flex-1 h-px bg-[var(--bl)]" />
            </div>

            {/* Magic link */}
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="r-panel-gold p-5 text-center"
              >
                <div className="flex justify-center mb-3">
                  <svg className="w-7 h-7 text-[var(--gold)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-[#ede8dc] uppercase tracking-widest">Check your email</div>
                <div className="text-[rgba(237,232,220,0.45)] text-xs mt-1 uppercase tracking-wider font-semibold">
                  We sent a magic link to {email}
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="r-input w-full px-4 py-3 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 r-btn-gold text-xs uppercase tracking-widest"
                >
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>
            )}

            <div className="text-center mt-2">
              <Link href="/" className="text-[rgba(237,232,220,0.25)] text-[10px] uppercase tracking-widest font-semibold hover:text-[rgba(237,232,220,0.55)] transition-colors">
                Continue as guest →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
