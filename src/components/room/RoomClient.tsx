'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Verse, BibleMeta } from '@/types';
import RoomLobby from './RoomLobby';
import MultiplayerGame from './MultiplayerGame';
import MultiplayerResults from './MultiplayerResults';

interface Room {
  id: string;
  host_id: string;
  game_mode: string;
  seed: number;
  status: string;
  current_round: number;
  round_duration_secs: number;
  round_started_at: string | null;
}

interface RoomPlayer {
  room_id: string;
  profile_id: string;
  username: string;
  total_score: number;
  profiles?: { avatar_emoji: string | null } | null;
}

interface RoomGuess {
  id: string;
  room_id: string;
  profile_id: string;
  round_number: number;
  guess_book_name: string | null;
  guess_chapter: number | null;
  guess_verse: number | null;
  score: number;
}

interface Props {
  initialRoom: Room;
  initialPlayers: RoomPlayer[];
  initialGuesses: RoomGuess[];
  verses: Verse[];
  meta: BibleMeta;
  authUserId: string | null;
}

export default function RoomClient({
  initialRoom, initialPlayers, initialGuesses, verses, meta, authUserId
}: Props) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [players, setPlayers] = useState<RoomPlayer[]>(initialPlayers);
  const [guesses, setGuesses] = useState<RoomGuess[]>(initialGuesses);

  // Resolve the current player's ID (auth user or guest)
  const [myId, setMyId] = useState<string | null>(authUserId);
  useEffect(() => {
    if (!myId) {
      let id = localStorage.getItem('guest_id');
      if (!id) { id = crypto.randomUUID(); localStorage.setItem('guest_id', id); }
      setMyId(id);
    }
  }, [myId]);

  const channelRef = useRef<ReturnType<typeof createClient>['channel'] extends (...args: infer A) => infer R ? R : never | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${room.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'rooms',
        filter: `id=eq.${room.id}`,
      }, ({ new: updated }) => {
        if (updated) setRoom(updated as Room);
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'room_players',
        filter: `room_id=eq.${room.id}`,
      }, async () => {
        const { data } = await supabase.from('room_players').select('*, profiles(avatar_emoji)').eq('room_id', room.id).order('joined_at');
        if (data) setPlayers(data);
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'room_guesses',
        filter: `room_id=eq.${room.id}`,
      }, async () => {
        const { data } = await supabase.from('room_guesses').select('*').eq('room_id', room.id);
        if (data) setGuesses(data);
      })
      .subscribe();

    // @ts-ignore
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [room.id]);

  if (!myId) return null;

  const isHost = myId === room.host_id;

  if (room.status === 'lobby') {
    return <RoomLobby room={room} players={players} myId={myId} isHost={isHost} />;
  }

  if (room.status === 'finished') {
    return <MultiplayerResults players={players} guesses={guesses} verses={verses} room={room} />;
  }

  return (
    <MultiplayerGame
      room={room}
      players={players}
      guesses={guesses}
      verses={verses}
      meta={meta}
      myId={myId}
      isHost={isHost}
    />
  );
}
