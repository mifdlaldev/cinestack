-- ============================================================================
-- Migration: Change parent_id FK from CASCADE to SET NULL
-- Also relax unique constraint to partial index (parent reviews only)
-- ============================================================================
-- Jalankan di Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Parent review dihapus → reply tetap ada, jadi orphan (parent_id = NULL)
--    Bukan ikut terhapus (CASCADE)
alter table if exists public.reviews
  drop constraint if exists reviews_parent_id_fkey;

alter table if exists public.reviews
  add constraint reviews_parent_id_fkey
  foreign key (parent_id)
  references public.reviews(id)
  on delete set null;

-- 2. Unique constraint sebelumnya: unique(user_id, movie_id)
--    Ini MEMBLOKIR reply dari user yg sudah punya review di film yg sama.
--    Ganti dengan partial index yang hanya berlaku untuk parent reviews.
alter table if exists public.reviews
  drop constraint if exists unique_user_movie_review;

create unique index if not exists idx_unique_user_movie_review
  on public.reviews (user_id, movie_id)
  where parent_id is null;
