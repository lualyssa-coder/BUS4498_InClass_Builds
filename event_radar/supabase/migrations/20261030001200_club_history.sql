-- Stage 12: the club's earlier posts (memory of what happened).
-- A retired post stays in the database as history, but no longer appears on the board.

alter table public.events
  drop constraint if exists events_status_check;

alter table public.events
  add constraint events_status_check
  check (status in ('published', 'waiting', 'rejected', 'archived', 'replaced'));

alter table public.events
  add column if not exists replaced_by uuid,
  add column if not exists updates_id uuid;

-- Keep the existing designated-moderator restriction while allowing the agent to
-- mark an older post as replaced when a published update is saved.
drop policy if exists "Designated moderator can update review fields" on public.events;
create policy "Designated moderator can update review fields"
  on public.events
  for update
  to authenticated
  using (auth.uid() = '31dc8f97-ba99-4e46-b409-5938c0708e8b'::uuid)
  with check (
    auth.uid() = '31dc8f97-ba99-4e46-b409-5938c0708e8b'::uuid
    and status in ('published', 'waiting', 'rejected', 'replaced')
    and (
      reviewed_by = auth.uid()::text
      or reviewed_by = (auth.jwt() ->> 'email')
    )
  );
