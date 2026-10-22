alter table public.events
  add column if not exists flyer_url text not null default '';

grant select (flyer_url)
on table public.events
to anon, authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'flyers',
  'flyers',
  true,
  5242880,
  array['image/jpeg', 'image/png']
)
on conflict (id) do nothing;
