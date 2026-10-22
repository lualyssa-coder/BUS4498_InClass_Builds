-- Stage 7: photo uploads (Supabase Storage).
-- The AI agent saves each flyer photo in a public "flyers" bucket and puts its link on the event card.
-- Photo names are random IDs, and a photo's link only appears on the website after a moderator approves the post.

alter table public.events add column if not exists flyer_url text not null default '';

-- Let the website read the photo link.
grant select (flyer_url) on public.events to anon, authenticated;

-- The storage bucket: images only, 5 MB at most. Only the AI agent (with the secret key) can add photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('flyers', 'flyers', true, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
