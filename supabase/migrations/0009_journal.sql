-- Journal (mood + daily reflection) reuses daily_notes rather than a new
-- table — same "one row per user per day" shape, same RLS already scoped
-- to auth.uid() = user_id, nothing new to grant. Purely additive: the
-- existing memo/is_public columns and any data in them are untouched.
-- Not applied automatically — run via `supabase db push` or paste into
-- the Supabase SQL editor. Safe to re-run.

alter table public.daily_notes
  add column if not exists mood text,
  add column if not exists day_text text,
  add column if not exists good_thing text,
  add column if not exists created_at timestamptz not null default now();

alter table public.daily_notes
  drop constraint if exists daily_notes_mood_check;

alter table public.daily_notes
  add constraint daily_notes_mood_check
  check (mood is null or mood in (
    '평온해요', '행복해요', '활기차요', '뿌듯해요', '조금 지쳤어요', '답답해요', '쉬고 싶어요'
  ));
