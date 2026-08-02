-- 눈바디 (Body) feature: one row per user per day, holding paths to the
-- front/side/back photos inside the private `body-photos` storage bucket.
-- Not applied automatically — run via `supabase db push` or paste into the
-- Supabase SQL editor.

create table if not exists public.body_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  front_image text,
  side_image text,
  back_image text,
  memo text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists body_entries_user_date_idx
  on public.body_entries (user_id, date desc);

alter table public.body_entries enable row level security;

create policy "body_entries: select own rows"
  on public.body_entries for select
  using (auth.uid() = user_id);

create policy "body_entries: insert own rows"
  on public.body_entries for insert
  with check (auth.uid() = user_id);

create policy "body_entries: update own rows"
  on public.body_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "body_entries: delete own rows"
  on public.body_entries for delete
  using (auth.uid() = user_id);

-- Private storage bucket for the actual photo files. Objects are expected
-- to be uploaded under `{user_id}/{date}/{front|side|back}.jpg`, and the
-- `front_image` / `side_image` / `back_image` columns above store the
-- resulting storage path (not a public URL — read access always goes
-- through a signed URL).
insert into storage.buckets (id, name, public)
values ('body-photos', 'body-photos', false)
on conflict (id) do nothing;

create policy "body-photos: read own files"
  on storage.objects for select
  using (
    bucket_id = 'body-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "body-photos: upload own files"
  on storage.objects for insert
  with check (
    bucket_id = 'body-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "body-photos: update own files"
  on storage.objects for update
  using (
    bucket_id = 'body-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "body-photos: delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'body-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
