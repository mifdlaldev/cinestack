-- ============================================================================
-- Migration: Create news-covers storage bucket for article cover images
-- ============================================================================
-- Jalankan di Supabase SQL Editor
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-covers',
  'news-covers',
  true,
  2097152, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read
do $$ begin
  create policy "News covers are publicly accessible"
    on storage.objects for select
    using ( bucket_id = 'news-covers' );
exception when duplicate_object then null;
end $$;

-- Admin upload
do $$ begin
  create policy "Admins can upload news covers"
    on storage.objects for insert
    with check (
      bucket_id = 'news-covers'
      and auth.role() = 'authenticated'
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update news covers"
    on storage.objects for update
    using ( bucket_id = 'news-covers' );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete news covers"
    on storage.objects for delete
    using ( bucket_id = 'news-covers' );
exception when duplicate_object then null;
end $$;
