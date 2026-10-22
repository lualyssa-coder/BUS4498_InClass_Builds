drop policy if exists "Authenticated moderators can read all events"
  on public.events;

drop policy if exists "Authenticated moderators can update review fields"
  on public.events;

create policy "Designated moderator can read all events"
  on public.events
  for select
  to authenticated
  using (auth.uid() = '31dc8f97-ba99-4e46-b409-5938c0708e8b'::uuid);

create policy "Designated moderator can update review fields"
  on public.events
  for update
  to authenticated
  using (auth.uid() = '31dc8f97-ba99-4e46-b409-5938c0708e8b'::uuid)
  with check (
    auth.uid() = '31dc8f97-ba99-4e46-b409-5938c0708e8b'::uuid
    and status in ('published', 'waiting', 'rejected')
    and reviewed_by = auth.uid()
  );
