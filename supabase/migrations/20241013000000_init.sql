-- ============================================================
-- Migration: 20241013000000_init
-- Tables: profiles, habits, check_ins, habit_stats
-- ============================================================

-- ------------------------------------------------------------
-- profiles (one row per auth user, holds timezone preference)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  timezone    text not null default 'UTC',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users manage own profile"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- auto-create a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- habits
-- ------------------------------------------------------------
create table if not exists public.habits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  category        text,
  frequency_type  text not null default 'daily' check (frequency_type in ('daily','weekly','custom')),
  days_of_week    integer[] not null default '{}',   -- 0=Mon … 6=Sun (ISO day-of-week - 1)
  reminder_time   time,                              -- e.g. '08:00:00'
  position        integer not null default 0,
  archived_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "users manage own habits"
  on public.habits for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- check_ins  (one row = one habit completed on one date)
-- ------------------------------------------------------------
create table if not exists public.check_ins (
  id          uuid primary key default gen_random_uuid(),
  habit_id    uuid not null references public.habits(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  created_at  timestamptz not null default now(),
  unique (habit_id, date)
);

alter table public.check_ins enable row level security;

create policy "users manage own check_ins"
  on public.check_ins for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- habit_stats  (materialised streak cache, updated by trigger)
-- ------------------------------------------------------------
create table if not exists public.habit_stats (
  habit_id        uuid primary key references public.habits(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  current_streak  integer not null default 0,
  longest_streak  integer not null default 0,
  total_checkins  integer not null default 0,
  updated_at      timestamptz not null default now()
);

alter table public.habit_stats enable row level security;

create policy "users read own habit_stats"
  on public.habit_stats for select
  using (auth.uid() = user_id);

-- ensure a stats row exists for every habit
create or replace function public.ensure_habit_stats()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.habit_stats (habit_id, user_id)
  values (new.id, new.user_id)
  on conflict (habit_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_habit_created on public.habits;
create trigger on_habit_created
  after insert on public.habits
  for each row execute procedure public.ensure_habit_stats();

-- simple streak recalc triggered by check_in insert/delete
create or replace function public.recalc_streak()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_habit_id  uuid;
  v_user_id   uuid;
  v_streak    integer := 0;
  v_longest   integer := 0;
  v_total     integer := 0;
  v_run       integer := 0;
  v_prev      date;
  v_cur       date;
  r           record;
begin
  v_habit_id := coalesce(new.habit_id, old.habit_id);
  select user_id into v_user_id from public.habits where id = v_habit_id;

  -- walk all check-ins newest-first, count current streak
  for r in
    select date from public.check_ins
    where habit_id = v_habit_id
    order by date desc
  loop
    v_total := v_total + 1;
    v_cur   := r.date;
    if v_prev is null then
      -- first (most recent) row
      if v_cur = current_date or v_cur = current_date - 1 then
        v_run := 1;
      end if;
    else
      if v_prev - v_cur = 1 then
        v_run := v_run + 1;
      else
        v_run := 0;
      end if;
    end if;
    if v_run > v_longest then v_longest := v_run; end if;
    v_prev := v_cur;
  end loop;

  v_streak := v_run;

  insert into public.habit_stats (habit_id, user_id, current_streak, longest_streak, total_checkins, updated_at)
  values (v_habit_id, v_user_id, v_streak, greatest(v_longest, v_streak), v_total, now())
  on conflict (habit_id) do update set
    current_streak = excluded.current_streak,
    longest_streak = greatest(habit_stats.longest_streak, excluded.longest_streak),
    total_checkins = excluded.total_checkins,
    updated_at     = excluded.updated_at;

  return coalesce(new, old);
end;
$$;

drop trigger if exists on_checkin_change on public.check_ins;
create trigger on_checkin_change
  after insert or delete on public.check_ins
  for each row execute procedure public.recalc_streak();

