-- Stage 8: moderator sign-in.
-- A signed-in user is a moderator. That is safe only because new sign-ups are turned off
-- (Authentication → Sign In / Providers → "Allow new users to sign up" off), so the only
-- accounts are the ones the owner creates in the Supabase dashboard.

drop policy if exists "Moderators can read every post" on public.events;
create policy "Moderators can read every post"
  on public.events for select
  to authenticated
  using (true);

drop policy if exists "Moderators can approve or reject" on public.events;
create policy "Moderators can approve or reject"
  on public.events for update
  to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected'));

-- Moderators see every column, and may change only the review fields.
grant select on public.events to authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by) on public.events to authenticated;
