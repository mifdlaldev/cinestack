-- ============================================================================
-- Migration: Admin delete user function
-- Allows admin to delete any user account via SECURITY DEFINER function.
-- ============================================================================
-- Jalankan di Supabase SQL Editor
-- ============================================================================

create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  _caller_id uuid;
  _caller_role text;
begin
  -- Get the calling user
  _caller_id := auth.uid();

  if _caller_id is null then
    raise exception 'Authentication required';
  end if;

  -- Check if caller is admin
  select role into _caller_role
  from public.users
  where id = _caller_id;

  if _caller_role is distinct from 'admin' then
    raise exception 'Admin privileges required';
  end if;

  -- Delete from auth.users — cascades to public.users, reviews, watchlists, etc.
  delete from auth.users where id = target_user_id;
end;
$$;
