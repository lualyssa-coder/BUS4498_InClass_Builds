-- Stage 4: the database (the agent's memory).
-- Every post the AI agent handles becomes one row in this table. The rules that must never break
-- (one live post per date, time, and place) are enforced by the database itself,
-- not only by the AI agent's instructions.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'waiting'
    check (status in ('published', 'waiting', 'rejected', 'archived')),
  status_reason text not null default '',
  announcement text not null check (char_length(announcement) between 1 and 2000),
  title text not null default '',
  club text not null default '',
  event_date date,
  start_time time,
  end_time time,
  place_code text not null default '',
  place_name text not null default '',
  place_detail text not null default '',
  cost text not null default '',
  free_food boolean not null default false,
  summary text not null default '',
  rule_flags text[] not null default '{}',
  note_for_moderator text not null default '',
  dedupe_key text,
  ai_model text not null default '',
  reviewed_at timestamptz,
  reviewed_by text not null default ''
);

-- Duplicate guard: one live post per date + start time + place.
create unique index if not exists events_one_live_post
  on public.events (dedupe_key)
  where dedupe_key is not null and status in ('published', 'waiting');

create index if not exists events_board_order
  on public.events (status, event_date, start_time);

-- Security rules (row-level security): nothing is allowed unless a policy says so.
alter table public.events enable row level security;

drop policy if exists "Anyone can read published events" on public.events;
create policy "Anyone can read published events"
  on public.events for select
  to anon, authenticated
  using (status = 'published');

-- New Supabase projects (since May 30, 2026) don't show a table to the website until it is granted.
-- The website may read only these columns, never the raw announcement or moderator notes.
grant select (id, created_at, status, title, club, event_date, start_time, end_time,
              place_name, place_detail, cost, free_food, summary)
  on public.events to anon, authenticated;

-- The AI agent works with the secret key (the service_role) and needs full access.
grant select, insert, update, delete on public.events to service_role;
