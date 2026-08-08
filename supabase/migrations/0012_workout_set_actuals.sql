-- Two additive pieces of Phase 5 (첫 주 학습 데이터) data collection:
--
-- 1. Actual weight/reps performed, alongside the existing done/not-done
--    boolean per set — workout_exercises.target_reps/weight_kg are the
--    plan, these are what actually happened. Singular per exercise per day
--    (not per individual set slot) to match how the rest of the app already
--    treats an exercise's reps/weight as one number, and to keep the
--    logging UI a couple of inline fields instead of a per-set form.
--
-- 2. Once-a-day workout difficulty feedback (Too light / Just right / Too
--    hard) lives on daily_move_snapshots — already one row per user per
--    date for exactly this kind of "how did today go" summary.
--
-- Not applied automatically — run via `supabase db push` or paste into the
-- Supabase SQL editor. Safe to re-run.

alter table public.workout_set_logs add column if not exists actual_weight_kg numeric;
alter table public.workout_set_logs add column if not exists actual_reps int;

alter table public.daily_move_snapshots add column if not exists difficulty text;
