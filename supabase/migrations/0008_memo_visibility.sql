-- Lets a user mark today's memo as public to friends (default stays
-- private). Not applied automatically — run via `supabase db push` or
-- paste into the Supabase SQL editor. Safe to re-run.

alter table public.daily_notes
  add column if not exists is_public boolean not null default false;

-- No new SELECT policy on daily_notes — friends still only ever see a
-- memo through this narrow RPC, and only when is_public is true, same
-- "no broad cross-user access" pattern as the rest of Together.
--
-- CREATE OR REPLACE can't change a function's OUT-parameter row type
-- (we're adding a `memo` column here) — Postgres requires dropping it
-- first, which also clears the earlier grants below re-establish.
drop function if exists public.get_friends_today();

create or replace function public.get_friends_today()
returns table (
  friend_id uuid,
  display_name text,
  avatar_url text,
  today_progress int,
  has_activity_today boolean,
  cheered_by_me boolean,
  memo text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_today date;
  v_weekday text;
  v_weekdays text[] := array['일','월','화','수','목','금','토'];
begin
  if v_me is null then
    raise exception 'not_authenticated';
  end if;

  v_today := (now() at time zone 'Asia/Seoul')::date;
  v_weekday := v_weekdays[extract(dow from v_today)::int + 1];

  return query
  with my_friends as (
    select f.friend_id as fid from public.friendships f where f.user_id = v_me
  ),
  today_routine as (
    select distinct on (r.user_id) r.user_id, r.id as routine_id
    from public.workout_routines r
    where r.user_id in (select fid from my_friends)
      and v_weekday = any (r.days)
    order by r.user_id, r.order_index asc
  ),
  workout_agg as (
    select
      tr.user_id,
      sum(e.target_sets) as total_sets,
      sum(coalesce(
        array_length(
          array_positions((coalesce(sl.sets, '{}'::boolean[]))[1:e.target_sets], true),
          1
        ),
        0
      )) as done_sets
    from today_routine tr
    join public.workout_exercises e on e.routine_id = tr.routine_id
    left join public.workout_set_logs sl on sl.exercise_id = e.id and sl.log_date = v_today
    group by tr.user_id
  ),
  water_agg as (
    select w.user_id, sum(w.amount_ml) as total_ml
    from public.water_logs w
    where w.user_id in (select fid from my_friends)
      and w.logged_at >= (v_today::text || 'T00:00:00+09:00')::timestamptz
      and w.logged_at <= (v_today::text || 'T23:59:59.999+09:00')::timestamptz
    group by w.user_id
  ),
  meal_agg as (
    select m.user_id, count(distinct m.meal_type) as filled_count
    from public.meal_logs m
    where m.user_id in (select fid from my_friends)
      and m.meal_date = v_today
      and m.image_path is not null
    group by m.user_id
  ),
  body_agg as (
    select b.user_id, (b.front_image is not null or b.side_image is not null or b.back_image is not null) as has_photo
    from public.body_entries b
    where b.user_id in (select fid from my_friends)
      and b.date = v_today
  ),
  memo_by_user as (
    select n.user_id, n.memo
    from public.daily_notes n
    where n.user_id in (select fid from my_friends)
      and n.note_date = v_today
      and n.is_public = true
      and n.memo is not null
      and length(trim(n.memo)) > 0
  )
  select
    mf.fid as friend_id,
    coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)) as display_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    round(
      (
        coalesce(
          case when wa.total_sets > 0 then (wa.done_sets::numeric / wa.total_sets) * 100 else 0 end,
          0
        )
        + least(100, coalesce(round((coalesce(wt.total_ml, 0)::numeric / nullif(coalesce((u.raw_user_meta_data->>'water_goal_ml')::numeric, 2000), 0)) * 100), 0))
        + least(100, coalesce((ma.filled_count::numeric / 4) * 100, 0))
        + case when coalesce(ba.has_photo, false) then 100 else 0 end
      ) / 4
    )::int as today_progress,
    (
      coalesce(wa.done_sets, 0) > 0
      or coalesce(wt.total_ml, 0) > 0
      or coalesce(ma.filled_count, 0) > 0
      or coalesce(ba.has_photo, false)
    ) as has_activity_today,
    exists (
      select 1 from public.cheers c
      where c.sender_id = v_me and c.receiver_id = mf.fid and c.cheer_date = v_today
    ) as cheered_by_me,
    mbu.memo as memo
  from my_friends mf
  join auth.users u on u.id = mf.fid
  left join workout_agg wa on wa.user_id = mf.fid
  left join water_agg wt on wt.user_id = mf.fid
  left join meal_agg ma on ma.user_id = mf.fid
  left join body_agg ba on ba.user_id = mf.fid
  left join memo_by_user mbu on mbu.user_id = mf.fid;
end;
$$;

revoke all on function public.get_friends_today() from public;
grant execute on function public.get_friends_today() to authenticated;
