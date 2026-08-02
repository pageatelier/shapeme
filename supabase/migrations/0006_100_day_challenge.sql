-- ShapeMe in 100 Days: one active challenge per user, challenge-specific
-- routines, and one daily result row for completed workouts or recovery days.

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal text not null check (goal in ('glutes', 'full-body', 'upper-body', 'strength')),
  height_cm numeric,
  start_weight_kg numeric,
  experience_level text not null check (experience_level in ('beginner', 'intermediate', 'advanced')),
  workout_days_per_week int not null check (workout_days_per_week between 2 and 5),
  session_minutes int not null check (session_minutes between 20 and 120),
  workout_location text not null check (workout_location in ('gym', 'home', 'both')),
  equipment text[] not null default '{}',
  limitations text,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workout_routines
  add column if not exists challenge_id uuid references public.challenges (id) on delete cascade;

create table if not exists public.challenge_day_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  log_date date not null,
  status text not null check (status in ('workout', 'recovery')),
  routine_id uuid references public.workout_routines (id) on delete set null,
  recovery_reason text,
  effort text check (effort in ('easy', 'good', 'hard')),
  pain boolean not null default false,
  completed_sets int not null default 0,
  total_sets int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (challenge_id, log_date)
);

create index if not exists challenges_user_status_idx
  on public.challenges (user_id, status, created_at desc);
create index if not exists workout_routines_challenge_idx
  on public.workout_routines (challenge_id, order_index);
create index if not exists challenge_day_logs_challenge_date_idx
  on public.challenge_day_logs (challenge_id, log_date desc);

alter table public.challenges enable row level security;
alter table public.challenge_day_logs enable row level security;

create policy "challenges: select own rows" on public.challenges for select using (auth.uid() = user_id);
create policy "challenges: insert own rows" on public.challenges for insert with check (auth.uid() = user_id);
create policy "challenges: update own rows" on public.challenges for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "challenges: delete own rows" on public.challenges for delete using (auth.uid() = user_id);

create policy "challenge_day_logs: select own rows" on public.challenge_day_logs for select using (auth.uid() = user_id);
create policy "challenge_day_logs: insert own rows" on public.challenge_day_logs for insert with check (auth.uid() = user_id);
create policy "challenge_day_logs: update own rows" on public.challenge_day_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "challenge_day_logs: delete own rows" on public.challenge_day_logs for delete using (auth.uid() = user_id);
