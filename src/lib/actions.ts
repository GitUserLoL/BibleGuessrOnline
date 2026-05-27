'use server';

import { createClient } from '@/lib/supabase/server';
import { getVersesByMode, getBibleMeta } from '@/lib/bible';
import { generateSeededIndices } from '@/lib/prng';
import { calculateScore } from '@/lib/scoring';
import type { GameMode } from '@/types';

// ── Profile ──────────────────────────────────────────────────────────────────

export async function ensureProfile(guestId: string, username: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('id').eq('id', guestId).single();
  if (!data) {
    await supabase.from('profiles').insert({ id: guestId, username, is_guest: true });
  }
}

// ── Profile settings ──────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('username, avatar_emoji, name_changes_this_month, name_change_month')
    .eq('id', userId)
    .single();
  return data;
}

export async function updateProfile(
  userId: string,
  newUsername: string | null,
  newEmoji: string | null
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, name_changes_this_month, name_change_month')
    .eq('id', userId)
    .single();
  if (!profile) return { error: 'Profile not found' };

  const updates: Record<string, unknown> = {};

  if (newEmoji !== null) {
    updates.avatar_emoji = newEmoji;
  }

  if (newUsername !== null && newUsername.trim() !== profile.username) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const isNewMonth = profile.name_change_month !== currentMonth;
    const usedThisMonth = isNewMonth ? 0 : profile.name_changes_this_month;

    if (usedThisMonth >= 5) {
      return { error: 'You have used all 5 name changes for this month.' };
    }

    updates.username = newUsername.trim();
    updates.name_changes_this_month = usedThisMonth + 1;
    updates.name_change_month = currentMonth;
  }

  if (Object.keys(updates).length === 0) return { error: null };

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) return { error: error.message };
  return { error: null };
}

// ── Single-player leaderboard ─────────────────────────────────────────────────

export async function submitScore(profileId: string, mode: GameMode, totalScore: number) {
  const supabase = await createClient();

  // Only authenticated (non-guest) users can save to the leaderboard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== profileId) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_guest')
    .eq('id', profileId)
    .single();
  if (!profile || profile.is_guest) return;

  await supabase.from('global_leaderboards').upsert(
    { profile_id: profileId, game_mode: mode, high_score: totalScore, achieved_at: new Date().toISOString() },
    { onConflict: 'profile_id,game_mode', ignoreDuplicates: false }
  );
}

export async function getLeaderboard(mode: GameMode) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('global_leaderboards')
    .select('*, profiles(username, avatar_emoji)')
    .eq('game_mode', mode)
    .order('high_score', { ascending: false })
    .limit(25);
  return data ?? [];
}

// ── Async challenges ──────────────────────────────────────────────────────────

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

export async function submitChallengeScore(matchId: string, profileId: string, totalScore: number) {
  const supabase = await createClient();
  await supabase.from('async_scores').upsert(
    { match_id: matchId, profile_id: profileId, total_score: totalScore },
    { onConflict: 'match_id,profile_id' }
  );
}

// ── Multiplayer rooms ─────────────────────────────────────────────────────────

function randomRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createRoom(
  hostId: string,
  fallbackUsername: string,
  mode: GameMode,
  durationSecs: number
) {
  const supabase = await createClient();
  await ensureProfile(hostId, fallbackUsername);

  // Always use the current profile username so display name changes are reflected
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', hostId)
    .single();
  const displayName = profile?.username ?? fallbackUsername;

  const seed = Math.floor(Math.random() * 2147483647);
  let roomId = '';

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomRoomCode();
    const { error } = await supabase.from('rooms').insert({
      id: code,
      host_id: hostId,
      game_mode: mode,
      seed,
      round_duration_secs: durationSecs,
    });
    if (!error) { roomId = code; break; }
  }

  if (!roomId) throw new Error('Could not generate unique room code');

  await supabase.from('room_players').insert({
    room_id: roomId,
    profile_id: hostId,
    username: displayName,
  });

  return roomId;
}

export async function joinRoom(roomId: string, profileId: string, fallbackUsername: string) {
  const supabase = await createClient();
  await ensureProfile(profileId, fallbackUsername);

  const { data: room } = await supabase
    .from('rooms')
    .select('status')
    .eq('id', roomId.toUpperCase())
    .single();

  if (!room) return { error: 'Room not found' };
  if (room.status !== 'lobby') return { error: 'Game already started' };

  // Use the current profile username so display name changes are reflected
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', profileId)
    .single();
  const displayName = profile?.username ?? fallbackUsername;

  await supabase.from('room_players').upsert(
    { room_id: roomId.toUpperCase(), profile_id: profileId, username: displayName },
    { onConflict: 'room_id,profile_id' }
  );

  return { error: null };
}

export async function startRoom(roomId: string) {
  const supabase = await createClient();
  await supabase.from('rooms').update({
    status: 'playing',
    current_round: 1,
    round_started_at: new Date().toISOString(),
  }).eq('id', roomId);
}

export async function submitRoomGuess(
  roomId: string,
  profileId: string,
  roundNumber: number,
  guessBookId: number,
  guessChapter: number,
  guessVerse: number,
  guessBookName: string
) {
  const supabase = await createClient();

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (!room || room.status !== 'playing') return;

  // Compute score server-side
  const modeVerses = getVersesByMode(room.game_mode as GameMode);
  const indices = generateSeededIndices(room.seed, 5, modeVerses.length);
  const correctVerse = modeVerses[indices[roundNumber - 1]];

  const meta = getBibleMeta();
  const book = meta.books.find(b => b.id === guessBookId)!;
  let guessGlobalIndex = book.startIndex;
  for (let c = 0; c < guessChapter - 1; c++) guessGlobalIndex += book.chapterVerseCounts[c];
  guessGlobalIndex += guessVerse - 1;

  const score = calculateScore(correctVerse.index, guessGlobalIndex);

  await supabase.from('room_guesses').upsert(
    {
      room_id: roomId,
      profile_id: profileId,
      round_number: roundNumber,
      guess_book_name: guessBookName,
      guess_chapter: guessChapter,
      guess_verse: guessVerse,
      score,
    },
    { onConflict: 'room_id,profile_id,round_number' }
  );

  // Update player's total score
  const { data: allGuesses } = await supabase
    .from('room_guesses')
    .select('score')
    .eq('room_id', roomId)
    .eq('profile_id', profileId);

  const totalScore = allGuesses?.reduce((s, g) => s + (g.score ?? 0), 0) ?? 0;
  await supabase
    .from('room_players')
    .update({ total_score: totalScore })
    .eq('room_id', roomId)
    .eq('profile_id', profileId);

  // Check if all players guessed this round → expire timer for all clients
  const { count: playerCount } = await supabase
    .from('room_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId);

  const { count: guessCount } = await supabase
    .from('room_guesses')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('round_number', roundNumber);

  if (playerCount && guessCount && guessCount >= playerCount) {
    // Expire timer immediately so all clients see round as ended
    const expiredAt = new Date(Date.now() - (room.round_duration_secs + 1) * 1000).toISOString();
    await supabase.from('rooms')
      .update({ round_started_at: expiredAt })
      .eq('id', roomId)
      .eq('current_round', roundNumber);
  }
}

export async function advanceRound(roomId: string, fromRound: number) {
  const supabase = await createClient();
  if (fromRound >= 5) {
    await supabase.from('rooms')
      .update({ status: 'finished' })
      .eq('id', roomId)
      .eq('current_round', fromRound);
  } else {
    await supabase.from('rooms')
      .update({
        current_round: fromRound + 1,
        round_started_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .eq('current_round', fromRound); // idempotent — only first caller wins
  }
}

export async function leaveRoom(roomId: string, profileId: string) {
  const supabase = await createClient();
  await supabase.from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('profile_id', profileId);
}
