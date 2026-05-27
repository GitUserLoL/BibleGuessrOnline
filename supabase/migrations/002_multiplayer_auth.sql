-- ── Auth trigger: auto-create profile when user signs up via Supabase Auth ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, is_guest)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    ),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Multiplayer rooms ──
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('full', 'ot', 'nt')),
    seed BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'finished')),
    current_round INT NOT NULL DEFAULT 1,
    round_duration_secs INT NOT NULL DEFAULT 45 CHECK (round_duration_secs BETWEEN 15 AND 60),
    round_started_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours')
);

-- ── Players in a room ──
CREATE TABLE room_players (
    room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    total_score INT NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, profile_id)
);

-- ── Per-round guesses ──
CREATE TABLE room_guesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    guess_book_name TEXT,
    guess_chapter INT,
    guess_verse INT,
    score INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, profile_id, round_number)
);

CREATE INDEX idx_room_guesses_room_round ON room_guesses(room_id, round_number);
CREATE INDEX idx_rooms_status ON rooms(status);

-- ── Row Level Security ──
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_guesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Insert room" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Update room" ON rooms FOR UPDATE USING (true);

CREATE POLICY "Public read room_players" ON room_players FOR SELECT USING (true);
CREATE POLICY "Insert room_player" ON room_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Delete room_player" ON room_players FOR DELETE USING (true);

CREATE POLICY "Public read room_guesses" ON room_guesses FOR SELECT USING (true);
CREATE POLICY "Insert room_guess" ON room_guesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Update room_guess" ON room_guesses FOR UPDATE USING (true);

-- ── Enable Realtime on multiplayer tables ──
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE room_guesses;
