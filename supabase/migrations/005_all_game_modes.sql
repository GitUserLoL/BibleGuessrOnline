-- Expand game_mode check constraints to support all 11 categories.
-- Previous constraint only allowed ('full', 'ot', 'nt').

ALTER TABLE rooms
  DROP CONSTRAINT IF EXISTS rooms_game_mode_check,
  ADD CONSTRAINT rooms_game_mode_check
    CHECK (game_mode IN (
      'full','ot','nt',
      'law','history','major-prophets','minor-prophets',
      'gospels','acts','letters','revelation'
    ));

ALTER TABLE global_leaderboards
  DROP CONSTRAINT IF EXISTS global_leaderboards_game_mode_check,
  ADD CONSTRAINT global_leaderboards_game_mode_check
    CHECK (game_mode IN (
      'full','ot','nt',
      'law','history','major-prophets','minor-prophets',
      'gospels','acts','letters','revelation'
    ));

ALTER TABLE async_matches
  DROP CONSTRAINT IF EXISTS async_matches_game_mode_check,
  ADD CONSTRAINT async_matches_game_mode_check
    CHECK (game_mode IN (
      'full','ot','nt',
      'law','history','major-prophets','minor-prophets',
      'gospels','acts','letters','revelation'
    ));
