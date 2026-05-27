-- Profiles: handles both authenticated users and guests (UUID stored in localStorage)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    is_guest BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global leaderboards (one entry per player per mode — upserted on new high score)
CREATE TABLE global_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('full', 'ot', 'nt')),
    high_score INT NOT NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, game_mode)
);

CREATE INDEX idx_leaderboards_score ON global_leaderboards(game_mode, high_score DESC);

-- Asynchronous challenge matches
CREATE TABLE async_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seed BIGINT NOT NULL,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('full', 'ot', 'nt')),
    created_by UUID REFERENCES profiles(id),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Scores for async matches (one entry per player per match)
CREATE TABLE async_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES async_matches(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_score INT NOT NULL,
    played_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE async_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE async_scores ENABLE ROW LEVEL SECURITY;

-- Policies: allow public reads, allow insert/upsert with matching profile id
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Insert own profile" ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read leaderboard" ON global_leaderboards FOR SELECT USING (true);
CREATE POLICY "Upsert own score" ON global_leaderboards FOR ALL USING (true);

CREATE POLICY "Public read matches" ON async_matches FOR SELECT USING (true);
CREATE POLICY "Insert match" ON async_matches FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read async scores" ON async_scores FOR SELECT USING (true);
CREATE POLICY "Upsert async score" ON async_scores FOR ALL USING (true);

-- Auto-cleanup expired matches (requires pg_cron extension — enable in Supabase dashboard)
-- SELECT cron.schedule(
--     'delete-expired-matches',
--     '0 0 * * *',
--     $$ DELETE FROM async_matches WHERE expires_at < NOW(); $$
-- );
