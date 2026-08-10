-- Adds a 4th Body photo slot ("Full Body") alongside the existing
-- front/side/back. Additive only — existing rows/columns untouched.
-- Not applied automatically — run via `supabase db push` or paste into the
-- Supabase SQL editor.

alter table public.body_entries
  add column if not exists full_body_image text;
