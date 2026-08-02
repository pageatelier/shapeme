-- 운동 루틴 (Workout) feature: user-owned routines, each holding an ordered
-- list of exercises, plus a per-day set-completion log per exercise so
-- history is preserved across days. Not applied automatically — run via
-- `supabase db push` or paste into the Supabase SQL editor.

create table if not exists public.workout_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  days text[] not null default '{}',
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid not null references public.workout_routines (id) on delete cascade,
  name text not null,
  target_sets int not null default 3,
  target_reps int not null default 10,
  weight_kg numeric,
  rest_seconds int,
  memo text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_set_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  log_date date not null,
  sets boolean[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (exercise_id, log_date)
);

create index if not exists workout_routines_user_idx on public.workout_routines (user_id, order_index);
create index if not exists workout_exercises_routine_idx on public.workout_exercises (routine_id, order_index);
create index if not exists workout_set_logs_user_date_idx on public.workout_set_logs (user_id, log_date);

alter table public.workout_routines enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_set_logs enable row level security;

create policy "workout_routines: select own rows" on public.workout_routines for select using (auth.uid() = user_id);
create policy "workout_routines: insert own rows" on public.workout_routines for insert with check (auth.uid() = user_id);
create policy "workout_routines: update own rows" on public.workout_routines for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_routines: delete own rows" on public.workout_routines for delete using (auth.uid() = user_id);

create policy "workout_exercises: select own rows" on public.workout_exercises for select using (auth.uid() = user_id);
create policy "workout_exercises: insert own rows" on public.workout_exercises for insert with check (auth.uid() = user_id);
create policy "workout_exercises: update own rows" on public.workout_exercises for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_exercises: delete own rows" on public.workout_exercises for delete using (auth.uid() = user_id);

create policy "workout_set_logs: select own rows" on public.workout_set_logs for select using (auth.uid() = user_id);
create policy "workout_set_logs: insert own rows" on public.workout_set_logs for insert with check (auth.uid() = user_id);
create policy "workout_set_logs: update own rows" on public.workout_set_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_set_logs: delete own rows" on public.workout_set_logs for delete using (auth.uid() = user_id);
