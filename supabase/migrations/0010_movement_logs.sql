-- Movement logs: any non-strength activity (running, walking, dance, yoga,
-- pilates, stretching, cycling, swimming, etc.) — separate from the
-- workout_routines/workout_exercises/workout_set_logs strength-routine
-- tables, which are untouched. One flexible row shape (duration + optional
-- distance/steps/calories + memo) covers every type; there's deliberately
-- no check constraint on activity_type, so adding a new movement type later
-- is a pure app-layer change (see src/lib/movement/types.ts's
-- ACTIVITY_CONFIG), not a migration. Not applied automatically — run via
-- `supabase db push` or paste into the Supabase SQL editor. Safe to re-run.

create table if not exists public.movement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  activity_type text not null,
  duration_minutes int not null,
  distance_km numeric,
  steps int,
  calories int,
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists movement_logs_user_date_idx on public.movement_logs (user_id, log_date desc);

alter table public.movement_logs enable row level security;

create policy "movement_logs: select own rows" on public.movement_logs for select using (auth.uid() = user_id);
create policy "movement_logs: insert own rows" on public.movement_logs for insert with check (auth.uid() = user_id);
create policy "movement_logs: update own rows" on public.movement_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "movement_logs: delete own rows" on public.movement_logs for delete using (auth.uid() = user_id);
