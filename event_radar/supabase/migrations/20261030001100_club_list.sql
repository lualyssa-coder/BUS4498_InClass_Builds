-- Stage 11: the club list (knowledge the agent reads on every post).
-- Moderators can maintain this table in Table Editor without redeploying the agent.

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  nicknames text not null default '',
  usual_place_code text not null default '',
  usual_place_detail text not null default '',
  active boolean not null default true,
  note text not null default ''
);

alter table public.clubs enable row level security;

drop policy if exists "Anyone can read active clubs" on public.clubs;
create policy "Anyone can read active clubs"
  on public.clubs
  for select
  to anon, authenticated
  using (active);

-- The website only needs the public club names. The agent uses the service key for the
-- private hints (usual place and note).
revoke all on public.clubs from anon, authenticated;
grant select (id, name, nicknames, active) on public.clubs to anon, authenticated;
grant all on public.clubs to service_role;

insert into public.clubs
  (name, nicknames, usual_place_code, usual_place_detail, active, note)
values
  ('Board Game Guild', 'BGG, board game club', 'UU', 'Room 220', true, ''),
  ('Mustang Pitch Society', 'MPS, pitch society', 'UU-PLAZA', '', true, ''),
  ('Women in Finance Circle', 'WIF, women in finance', 'BUSINESS', '', true, ''),
  ('Sustainability Crew', 'SC, sustainability club', 'DEXTER-LAWN', '', true, ''),
  ('Accounting Society', 'AS, accounting club', 'BUSINESS', 'Room 212', true, ''),
  ('Cal Poly Ski & Snowboard Club', 'ski club, snowboard club', 'REC-CENTER', '', true, '')
on conflict (name) do nothing;

-- Stage 11 also gives the designated moderator the board-clearing permission. This
-- stays limited to the same moderator identity used by the existing restricted RLS
-- migration; it does not open deletes to every authenticated user.
alter table public.events
  add column if not exists agent_notes text[] not null default '{}';

drop policy if exists "Designated moderator can delete every post" on public.events;
create policy "Designated moderator can delete every post"
  on public.events
  for delete
  to authenticated
  using (auth.uid() = '31dc8f97-ba99-4e46-b409-5938c0708e8b'::uuid);

grant delete on public.events to authenticated;
