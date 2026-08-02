-- Water + meal tracking. Not applied automatically — run via
-- `supabase db push` or paste into the Supabase SQL editor.

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_ml int not null,
  logged_at timestamptz not null default now()
);

create index if not exists water_logs_user_time_idx on public.water_logs (user_id, logged_at desc);

alter table public.water_logs enable row level security;
create policy "water_logs: select own rows" on public.water_logs for select using (auth.uid() = user_id);
create policy "water_logs: insert own rows" on public.water_logs for insert with check (auth.uid() = user_id);
create policy "water_logs: delete own rows" on public.water_logs for delete using (auth.uid() = user_id);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_type text not null check (meal_type in ('morning', 'lunch', 'dinner', 'snack')),
  meal_date date not null,
  image_path text,
  description text,
  fullness text,
  mood text,
  memo text,
  created_at timestamptz not null default now(),
  unique (user_id, meal_type, meal_date)
);

create index if not exists meal_logs_user_date_idx on public.meal_logs (user_id, meal_date desc);

alter table public.meal_logs enable row level security;
create policy "meal_logs: select own rows" on public.meal_logs for select using (auth.uid() = user_id);
create policy "meal_logs: insert own rows" on public.meal_logs for insert with check (auth.uid() = user_id);
create policy "meal_logs: update own rows" on public.meal_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meal_logs: delete own rows" on public.meal_logs for delete using (auth.uid() = user_id);

-- Private bucket for meal photos, same per-user-folder pattern as body-photos.
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

create policy "meal-photos: read own files" on storage.objects for select
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "meal-photos: upload own files" on storage.objects for insert
  with check (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "meal-photos: update own files" on storage.objects for update
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "meal-photos: delete own files" on storage.objects for delete
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
