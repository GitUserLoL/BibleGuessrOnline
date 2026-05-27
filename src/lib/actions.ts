'use server';

import { createClient } from '@/lib/supabase/server';
import type { GameMode } from '@/types';

export async function ensureProfile(guestId: string, username: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', guestId)
    .single();

  if (!data) {
    await supabase.from('profiles').insert({ id: guestId, username, is_guest: true });
  }
}

export async function submitScore(
  profileId: string,
  mode: GameMode,
  totalScore: number
) {
  const supabase = await createClient();
  await supabase
    .from('global_leaderboards')
    .upsert(
      { profile_id: profileId, game_mode: mode, high_score: totalScore, achieved_at: new Date().toISOString() },
      { onConflict: 'profile_id,game_mode', ignoreDuplicates: false }
    );
}

export async function createChallenge(seed: number, mode: GameMode, createdBy: string | null) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('async_matches')
    .insert({ seed, game_mode: mode, created_by: createdBy })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function submitChallengeScore(
  matchId: string,
  profileId: string,
  totalScore: number
) {
  const supabase = await createClient();
  await supabase
    .from('async_scores')
    .upsert(
      { match_id: matchId, profile_id: profileId, total_score: totalScore },
      { onConflict: 'match_id,profile_id' }
    );
}

export async function getChallengeScores(matchId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('async_scores')
    .select('*, profiles(username)')
    .eq('match_id', matchId)
    .order('total_score', { ascending: false });
  return data ?? [];
}

export async function getLeaderboard(mode: GameMode) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('global_leaderboards')
    .select('*, profiles(username)')
    .eq('game_mode', mode)
    .order('high_score', { ascending: false })
    .limit(25);
  return data ?? [];
}
