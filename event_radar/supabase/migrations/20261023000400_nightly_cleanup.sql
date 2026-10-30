-- Optional stage: the nightly clean-up (a scheduled job, also called Cron).
-- Every night at about 3 a.m. Pacific time (10:00 UTC), events whose date has passed
-- leave the website. It runs inside Supabase, so it works while every laptop is closed.

create extension if not exists pg_cron;

-- Scheduling the same job name again replaces the old schedule.
select cron.schedule(
  'archive-past-events',
  '0 10 * * *',
  $$
    update public.events
       set status = 'archived',
           status_reason = 'Archived automatically after the event date passed.'
     where status in ('published', 'waiting')
       and event_date < (now() at time zone 'America/Los_Angeles')::date
  $$
);
