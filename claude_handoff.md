# BibleGuessr Online — Handoff

## Stack
Next.js 16 App Router · Supabase (auth, realtime, DB) · Framer Motion · Vercel

## What's built
- **Solo game**: 5 rounds, pick Bible mode (full/OT/NT), guess book+chapter+verse, exponential decay scoring (`5000 * exp(-0.0015 * max(0, d-5))`)
- **Multiplayer rooms**: lobby (host starts), live game with timer ring, round overlay, final results
- **Auth**: Google OAuth, guest fallback via `localStorage` guest_id
- **Profiles**: emoji avatar picker, display name, 5 name-changes/month rate limit
- **Leaderboard**: always-overwrite upsert per mode per user

## Key files
| File | Purpose |
|---|---|
| `src/lib/actions.ts` | All server actions (rooms, scores, profiles) |
| `src/lib/scoring.ts` | Score formula + `getScoreColor` |
| `src/lib/bible.ts` | `getVersesByMode`, `getBibleMeta`, verse indices |
| `src/lib/prng.ts` | Mulberry32 seeded verse selection |
| `src/components/room/RoomClient.tsx` | Supabase realtime, renders Lobby/Game/Results |
| `src/components/room/MultiplayerGame.tsx` | Timer, guessing, round overlay |
| `src/app/profile/ProfileClient.tsx` | Profile edit form, dispatches `profileUpdated` event |
| `src/components/auth/AuthButton.tsx` | Nav auth UI, listens for `profileUpdated` |

## DB tables
- `profiles` — `id, username, avatar_emoji, is_guest, name_changes_this_month, name_change_month`
- `global_leaderboards` — `profile_id, game_mode, high_score` (unique constraint)
- `rooms` — `id (6-char code), host_id, status, game_mode, seed, current_round, round_started_at, round_duration_secs`
- `room_players` — `room_id, profile_id, username, total_score`
- `room_guesses` — `room_id, profile_id, round_number, score, guess_*`

## Migrations (run manually in Supabase SQL Editor)
- `supabase/migrations/001_init.sql` — core tables + RLS
- `supabase/migrations/002_multiplayer_auth.sql` — rooms tables, realtime publication, auth trigger
- `supabase/migrations/003_profile_avatar.sql` — avatar_emoji + name change columns

## Known gotchas
- **Verse indices**: `verse.index` is always global (0–31,101). Score uses global. `guessIndex`/`correctIndex` in solo game are mode-relative for display only.
- **Profile updates**: cross-component sync via `window.dispatchEvent(new CustomEvent('profileUpdated', ...))` — no shared state needed.
- **Play again**: `resetRoom` generates a new seed; `RoomClient` detects `status → 'lobby'` and does `window.location.reload()` so all clients get fresh verses from the new seed.
- **Round overlay bug (fixed)**: overlay is keyed to `resultsForRound === round` not a boolean, preventing re-show when timer hook state lags round advance by one render.
- **Magic link auth**: redirects to the origin where the page was loaded — if tested from localhost, link goes to localhost. Deferred.

## Future ideas
- Transfer host mid-game (currently host leaving during game ends it)
- Spectator mode
- Custom round count (not hardcoded 5)
- Challenge links (async match system is partially scaffolded in actions.ts)
- Magic link fix: force `emailRedirectTo` to production URL regardless of origin
