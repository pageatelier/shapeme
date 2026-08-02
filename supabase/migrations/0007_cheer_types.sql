-- Adds a fixed cheer-type to each cheer (one of 3 preset, positive phrases
-- — never free text). Not applied automatically — run via `supabase db
-- push` or paste into the Supabase SQL editor. Safe to re-run.

alter table public.cheers
  add column if not exists encouragement_type text;

alter table public.cheers
  drop constraint if exists cheers_encouragement_type_check;

alter table public.cheers
  add constraint cheers_encouragement_type_check
  check (encouragement_type is null or encouragement_type in ('slow', 'doing_great', 'together'));
