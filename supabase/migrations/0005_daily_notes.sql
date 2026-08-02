-- Editable "오늘의 메모" per day, shown on Home and later on the Calendar
-- day-detail panel. Not applied automatically — run via `supabase db push`
-- or paste into the Supabase SQL editor.

create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  note_date date not null,
  memo text,
  updated_at timestamptz not null default now(),
  unique (user_id, note_date)
);

create index if not exists daily_notes_user_date_idx on public.daily_notes (user_id, note_date desc);

alter table public.daily_notes enable row level security;
create policy "daily_notes: select own rows" on public.daily_notes for select using (auth.uid() = user_id);
create policy "daily_notes: insert own rows" on public.daily_notes for insert with check (auth.uid() = user_id);
create policy "daily_notes: update own rows" on public.daily_notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_notes: delete own rows" on public.daily_notes for delete using (auth.uid() = user_id);
