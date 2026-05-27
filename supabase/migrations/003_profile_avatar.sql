-- Add avatar emoji and name-change rate limiting to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '✝️',
  ADD COLUMN IF NOT EXISTS name_changes_this_month INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS name_change_month TEXT NOT NULL DEFAULT '';
