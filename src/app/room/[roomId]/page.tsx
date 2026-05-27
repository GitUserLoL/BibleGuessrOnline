import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getVersesByMode, getBibleMeta } from '@/lib/bible';
import { generateSeededIndices } from '@/lib/prng';
import RoomClient from '@/components/room/RoomClient';

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;
  const supabase = await createClient();

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId.toUpperCase())
    .single();

  if (!room) redirect('/multiplayer');

  const { data: players } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', room.id)
    .order('joined_at');

  const { data: guesses } = await supabase
    .from('room_guesses')
    .select('*')
    .eq('room_id', room.id);

  const modeVerses = getVersesByMode(room.game_mode);
  const indices = generateSeededIndices(room.seed, 5, modeVerses.length);
  const verses = indices.map(i => modeVerses[i]);
  const meta = getBibleMeta();

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <RoomClient
      initialRoom={room}
      initialPlayers={players ?? []}
      initialGuesses={guesses ?? []}
      verses={verses}
      meta={meta}
      authUserId={user?.id ?? null}
    />
  );
}
