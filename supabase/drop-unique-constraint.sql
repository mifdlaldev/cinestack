-- ============================================================================
-- Migration: Drop unique(user_id, movie_id) constraint on reviews
-- 
-- The constraint blocks ON DELETE SET NULL when a reply's author already
-- has a top-level review for the same movie.
-- 
-- Enforcement moved to application layer (submitReview action checks
-- for existing reviews manually).
-- ============================================================================
-- Jalankan di Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

do $$
declare
  v_constraint_name text;
begin
  -- Find ANY unique constraint on (user_id, movie_id) — regardless of name
  select tc.constraint_name into v_constraint_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
    and tc.table_schema = kcu.table_schema
  where tc.table_name = 'reviews'
    and tc.table_schema = 'public'
    and tc.constraint_type = 'UNIQUE'
    and kcu.column_name in ('user_id', 'movie_id')
  group by tc.constraint_name
  having count(distinct kcu.column_name) = 2
  limit 1;

  if v_constraint_name is not null then
    execute 'alter table public.reviews drop constraint if exists ' || v_constraint_name;
    raise notice 'Dropped constraint: %', v_constraint_name;
  else
    raise notice 'No unique constraint on (user_id, movie_id) found — already removed.';
  end if;
end $$;
