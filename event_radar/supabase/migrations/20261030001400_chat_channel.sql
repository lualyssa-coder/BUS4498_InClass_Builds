-- Stage 14: read Discord messages once per message.
-- The reader runs on a one-minute schedule and calls submit-event with the
-- publishable key. Discord credentials stay in Supabase Edge Function Secrets.

alter table public.events
  add column if not exists source text not null default '',
  add column if not exists source_id text not null default '',
  add column if not exists source_name text not null default '';

create unique index if not exists events_one_per_message
  on public.events (source, source_id)
  where source_id <> '';

create table if not exists public.channel_cursor (
  source text primary key,
  last_id text not null default '',
  read_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.channel_cursor enable row level security;
revoke all on public.channel_cursor from anon, authenticated;
grant all on public.channel_cursor to service_role;

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Scheduling the same job name again updates the existing schedule.
select cron.schedule(
  'read-chat-channel',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://qpqdxzcucgcrljidffni.supabase.co/functions/v1/read-discord',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', 'sb_publishable_ciia2S9lyNCT6oQkhLWHug_wtV4tHb8'
      ),
      body := '{}'::jsonb
    );
  $$
);
