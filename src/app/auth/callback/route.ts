import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const guestId = searchParams.get('guest_id');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const authUserId = data.user.id;

      // Ensure auth user has a profile
      const username =
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.user_name ??
        data.user.email?.split('@')[0] ??
        'Player';

      await supabase.from('profiles').upsert(
        { id: authUserId, username, is_guest: false },
        { onConflict: 'id', ignoreDuplicates: true }
      );

      // ── Merge guest account into auth account ──
      if (guestId && guestId !== authUserId) {
        // Transfer leaderboard scores (keep the higher score for each mode)
        const { data: guestScores } = await supabase
          .from('global_leaderboards')
          .select('*')
          .eq('profile_id', guestId);

        if (guestScores && guestScores.length > 0) {
          for (const gs of guestScores) {
            // Get existing auth user score for this mode
            const { data: existing } = await supabase
              .from('global_leaderboards')
              .select('high_score')
              .eq('profile_id', authUserId)
              .eq('game_mode', gs.game_mode)
              .single();

            const shouldTransfer = !existing || gs.high_score > existing.high_score;
            if (shouldTransfer) {
              await supabase.from('global_leaderboards').upsert(
                {
                  profile_id: authUserId,
                  game_mode: gs.game_mode,
                  high_score: gs.high_score,
                  achieved_at: gs.achieved_at,
                },
                { onConflict: 'profile_id,game_mode' }
              );
            }
          }
        }

        // Transfer async match scores
        await supabase
          .from('async_scores')
          .update({ profile_id: authUserId })
          .eq('profile_id', guestId);

        // Delete guest profile (cascades to their leaderboard entries)
        await supabase.from('profiles').delete().eq('id', guestId).eq('is_guest', true);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=true`);
}
