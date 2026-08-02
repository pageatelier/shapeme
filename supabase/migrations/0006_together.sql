-- Together: friend-only "today % + cheer" feature. Not applied automatically
-- — run via `supabase db push` or paste into the Supabase SQL editor.
--
-- No service-role key exists anywhere in this app (see src/lib/supabase/*),
-- so every cross-user read below goes through a narrow SECURITY DEFINER
-- function that returns only the specific columns a friend is allowed to
-- see — never a broad SELECT policy on profiles or on any detail table
-- (workout_*, water_logs, meal_logs, body_entries all keep their existing
-- "own rows only" policies, untouched).

-- ============================================================
-- profiles — minimal. display_name/avatar_url are NOT duplicated
-- here; they stay the single source of truth in
-- auth.users.raw_user_meta_data (see src/lib/profile/mutations.ts)
-- and are read live inside get_friends_today() below, so there's
-- nothing to keep in sync.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  friend_code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own row"
  on public.profiles for select
  using (auth.uid() = id);

-- No insert/update/delete policy for authenticated clients: rows are only
-- ever created by the trigger below (runs as the function owner, which
-- bypasses RLS), so a user can never set or change their own friend_code
-- directly.

create or replace function public.generate_friend_code()
returns text
language plpgsql
as $$
declare
  -- Excludes 0/O/1/I to avoid visual ambiguity when a friend reads the
  -- code out loud or off a screenshot.
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := 'SHAPE-';
begin
  for i in 1..6 loop
    code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return code;
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_attempts int := 0;
begin
  loop
    v_code := public.generate_friend_code();
    begin
      insert into public.profiles (id, friend_code) values (new.id, v_code);
      exit;
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts > 10 then
        raise exception 'could not generate a unique friend code';
      end if;
    end;
  end loop;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Backfill for users who signed up before this migration.
do $$
declare
  r record;
  v_code text;
  v_attempts int;
begin
  for r in select id from auth.users where id not in (select id from public.profiles) loop
    v_attempts := 0;
    loop
      v_code := public.generate_friend_code();
      begin
        insert into public.profiles (id, friend_code) values (r.id, v_code);
        exit;
      exception when unique_violation then
        v_attempts := v_attempts + 1;
        if v_attempts > 10 then
          raise exception 'could not generate a unique friend code (backfill)';
        end if;
      end;
    end loop;
  end loop;
end;
$$;

-- ============================================================
-- friendships — two rows per relationship (A->B and B->A), created
-- atomically by add_friend_by_code() below so one direction can
-- never exist without the other. Keeps RLS trivial: every row is
-- readable/insertable only by its own user_id.
-- ============================================================
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

create index if not exists friendships_user_idx on public.friendships (user_id);

alter table public.friendships enable row level security;

create policy "friendships: select own rows"
  on public.friendships for select
  using (auth.uid() = user_id);

-- Deliberately no insert policy for authenticated clients — the only way
-- to create a friendship is through add_friend_by_code(), which validates
-- the code, rejects self-adds and duplicates, and inserts both rows in one
-- transaction.

create policy "friendships: delete own or reciprocal row"
  on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);

create or replace function public.add_friend_by_code(p_code text)
returns table (friend_id uuid, friend_display_name text, friend_avatar_url text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_friend uuid;
begin
  if v_me is null then
    raise exception 'not_authenticated';
  end if;

  select id into v_friend from public.profiles where friend_code = upper(trim(p_code));
  if v_friend is null then
    raise exception 'invalid_code';
  end if;

  if v_friend = v_me then
    raise exception 'cannot_add_self';
  end if;

  -- Table-qualify both columns: this function's `returns table` declares an
  -- OUT parameter also named friend_id, which made the bare column
  -- reference ambiguous against friendships.friend_id (caught via live
  -- testing — see git history for the exact error).
  if exists (
    select 1 from public.friendships fr
    where fr.user_id = v_me and fr.friend_id = v_friend
  ) then
    raise exception 'already_friends';
  end if;

  insert into public.friendships (user_id, friend_id) values (v_me, v_friend), (v_friend, v_me);

  return query
    select u.id,
           coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
           u.raw_user_meta_data->>'avatar_url'
    from auth.users u
    where u.id = v_friend;
end;
$$;

revoke all on function public.add_friend_by_code(text) from public;
grant execute on function public.add_friend_by_code(text) to authenticated;

-- ============================================================
-- cheers — one per (sender, receiver, day). Inserted directly by
-- the client; RLS itself enforces "must already be friends" so no
-- RPC is needed for sending.
-- ============================================================
create table if not exists public.cheers (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  cheer_date date not null,
  created_at timestamptz not null default now(),
  unique (sender_id, receiver_id, cheer_date),
  check (sender_id <> receiver_id)
);

create index if not exists cheers_receiver_date_idx on public.cheers (receiver_id, cheer_date);

alter table public.cheers enable row level security;

create policy "cheers: select own sent or received"
  on public.cheers for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "cheers: insert to an existing friend only"
  on public.cheers for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.friendships f
      where f.user_id = auth.uid() and f.friend_id = receiver_id
    )
  );

-- ============================================================
-- get_friends_today() — the only place a user's today-% is computed
-- for someone other than themselves. Mirrors, on purpose, the exact
-- formulas in src/app/(main)/page.tsx (workoutPct/waterPct/mealPct/
-- bodyPct -> dayCompletionPercent's round(sum/4)) so a friend's %
-- always matches what that friend sees on their own Home screen.
-- If those formulas ever change, this function must change with them.
-- Returns only {friend_id, display_name, avatar_url, today_progress,
-- has_activity_today, cheered_by_me} — no detail-table data.
-- ============================================================
create or replace function public.get_friends_today()
returns table (
  friend_id uuid,
  display_name text,
  avatar_url text,
  today_progress int,
  has_activity_today boolean,
  cheered_by_me boolean
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

  -- KST "today", matching src/lib/body/date.ts's todayIsoDate(). Never
  -- current_date / now()::date directly — this DB session runs in UTC.
  v_today := (now() at time zone 'Asia/Seoul')::date;
  v_weekday := v_weekdays[extract(dow from v_today)::int + 1];

  return query
  with my_friends as (
    select f.friend_id as fid from public.friendships f where f.user_id = v_me
  ),
  today_routine as (
    -- Lowest order_index routine scheduled for today's weekday, per friend
    -- — matches routines.find(r => r.days.includes(todayWeekday)) in
    -- src/app/(main)/page.tsx, since routines are fetched order_index asc.
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
      -- Slice each exercise's sets array to its own target_sets before
      -- counting, mirroring normalizeSets() in src/lib/workout/queries.ts
      -- (pads short arrays, truncates long ones, then counts true).
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
      -- Explicit +09:00 offset — see src/lib/water/queries.ts for why an
      -- unzoned boundary string here would silently drift to UTC.
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
  )
  select
    mf.fid as friend_id,
    coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)) as display_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    round(
      (
        -- workoutPct: uncapped in the TS source too (structurally <= 100
        -- since done sets can't exceed target sets once sliced above).
        coalesce(
          case when wa.total_sets > 0 then (wa.done_sets::numeric / wa.total_sets) * 100 else 0 end,
          0
        )
        -- waterPct: round THEN cap — matches
        -- Math.min(100, Math.round(totalMl / goalMl * 100)) exactly.
        -- nullif(...,0) guards a goal of exactly 0 (not just unset) from
        -- dividing by zero and erroring the whole query.
        + coalesce(
            least(100, round((wt.total_ml::numeric / nullif(coalesce((u.raw_user_meta_data->>'water_goal_ml')::numeric, 2000), 0)) * 100)),
            0
          )
        -- mealPct: Math.min(100, (filledCount / 4) * 100)
        + coalesce(least(100, (ma.filled_count::numeric / 4) * 100), 0)
        -- bodyPct: 100 if any of front/side/back present, else 0
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
    ) as cheered_by_me
  from my_friends mf
  join auth.users u on u.id = mf.fid
  left join workout_agg wa on wa.user_id = mf.fid
  left join water_agg wt on wt.user_id = mf.fid
  left join meal_agg ma on ma.user_id = mf.fid
  left join body_agg ba on ba.user_id = mf.fid;
end;
$$;

revoke all on function public.get_friends_today() from public;
grant execute on function public.get_friends_today() to authenticated;
