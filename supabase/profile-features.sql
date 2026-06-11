-- ============================================================================
-- Migration: Profile features — avatar storage, delete account function
-- ============================================================================
-- Jalankan di Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Avatars storage bucket ------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read: anyone can view avatars
do $$ begin
  create policy "Avatars are publicly accessible"
    on storage.objects for select
    using ( bucket_id = 'avatars' );
exception when duplicate_object then null;
end $$;

-- Authenticated upload: users can upload their own avatar
do $$ begin
  create policy "Users can upload avatars"
    on storage.objects for insert
    with check (
      bucket_id = 'avatars'
      and auth.role() = 'authenticated'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null;
end $$;

-- Users can only update/delete their own avatar
do $$ begin
  create policy "Users can update own avatar"
    on storage.objects for update
    using (
      bucket_id = 'avatars'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete own avatar"
    on storage.objects for delete
    using (
      bucket_id = 'avatars'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null;
end $$;


-- 2. Delete account function (SECURITY DEFINER) ----------------------------
-- Bypasses RLS so it can delete from auth.users.
-- Only the authenticated user can delete their own account.

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  _uid uuid;
begin
  -- Get the calling user
  _uid := auth.uid();

  if _uid is null then
    raise exception 'You must be signed in to delete your account';
  end if;

  -- Delete from auth.users — cascades to public.users, reviews, watchlists, etc.
  delete from auth.users where id = _uid;
end;
$$;
