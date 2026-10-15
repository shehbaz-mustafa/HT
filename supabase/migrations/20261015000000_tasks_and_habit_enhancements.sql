-- ============================================================
-- Migration: 20261015000000_tasks_and_habit_enhancements
-- Tables: task_lists, tasks, user_settings
-- Enhances: habits, check_ins
-- ============================================================

-- 1. task_lists
create table if not exists public.task_lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#1f5c3f',
  icon        text default 'folder',
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.task_lists enable row level security;

create policy "users manage own task_lists"
  on public.task_lists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. tasks
create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  list_id         uuid references public.task_lists(id) on delete set null,
  title           text not null,
  description     text not null default '',
  due_date        date,
  start_time      time,
  deadline        timestamptz,
  priority        text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  category        text not null default 'General',
  tags            text[] not null default '{}',
  recurring       text not null default 'none' check (recurring in ('none', 'daily', 'weekdays', 'weekly', 'monthly')),
  completed       boolean not null default false,
  completed_at    timestamptz,
  reminder_time   time,
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_tasks_user_due on public.tasks (user_id, due_date);
create index if not exists idx_tasks_user_completed on public.tasks (user_id, completed);

-- 3. Enhance habits
alter table public.habits
  add column if not exists description text not null default '',
  add column if not exists icon text not null default '🎯',
  add column if not exists color text not null default '#1f5c3f',
  add column if not exists target_type text not null default 'boolean' check (target_type in ('boolean', 'numeric')),
  add column if not exists target_value numeric not null default 1,
  add column if not exists target_unit text not null default 'times',
  add column if not exists status text not null default 'active' check (status in ('active', 'paused', 'archived'));

-- 4. Enhance check_ins
alter table public.check_ins
  add column if not exists value numeric not null default 1,
  add column if not exists notes text not null default '',
  add column if not exists completed boolean not null default true;

-- 5. user_settings
create table if not exists public.user_settings (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  theme                  text not null default 'light' check (theme in ('light', 'dark', 'system')),
  notifications_enabled  boolean not null default true,
  reminder_lead_time     integer not null default 0,
  week_starts_on         integer not null default 1 check (week_starts_on in (0, 1)),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "users manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- trigger to auto-create settings row on user signup
create or replace function public.handle_new_user_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_settings on auth.users;
create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute procedure public.handle_new_user_settings();
