-- Freezes each day's "how many sets were scheduled" number once that day
-- has happened, so later routine/exercise edits (target sets changed, a
-- routine's days moved, exercises added/removed) never retroactively change
-- a past day's Move % in My's calendar. workout_set_logs already stores
-- "done" sets correctly per day — this table is the missing "target" half.
-- Written by the Move page every time it's viewed for *today* (see
-- snapshotTodayMoveTotal in src/lib/workout/mutations.ts), so today keeps
-- tracking live edits right up until the day is over, then never changes
-- again. Dates before this migration shipped have no row and fall back to
-- the old live-derived total, same as before. Not applied automatically —
-- run via `supabase db push` or paste into the Supabase SQL editor. Safe to
-- re-run.

create table if not exists public.daily_move_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  total_target_sets int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists daily_move_snapshots_user_date_idx on public.daily_move_snapshots (user_id, log_date);

alter table public.daily_move_snapshots enable row level security;

create policy "daily_move_snapshots: select own rows" on public.daily_move_snapshots for select using (auth.uid() = user_id);
create policy "daily_move_snapshots: insert own rows" on public.daily_move_snapshots for insert with check (auth.uid() = user_id);
create policy "daily_move_snapshots: update own rows" on public.daily_move_snapshots for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_move_snapshots: delete own rows" on public.daily_move_snapshots for delete using (auth.uid() = user_id);
