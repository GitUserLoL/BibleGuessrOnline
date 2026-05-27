-- Fix: profiles had no UPDATE policy so profile saves were silently blocked by RLS.
-- Fix: room_players had no UPDATE policy so total_score updates (and play-again resets) were silently blocked.

-- Allow authenticated users to update only their own profile row
CREATE POLICY "Update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow updating room_players (total_score tracking and play-again score reset)
CREATE POLICY "Update room_player" ON room_players
  FOR UPDATE USING (true);
