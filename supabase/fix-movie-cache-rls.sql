-- ============================================================================
-- Fix: Add INSERT and UPDATE policies for movie_cache table
-- Admin needs these to sync movies from TMDB via /admin/movies
-- ============================================================================
-- Jalankan di Supabase SQL Editor
-- ============================================================================

do $$ begin
  create policy "Admins can insert movie cache"
    on public.movie_cache for insert
    with check (public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update movie cache"
    on public.movie_cache for update
    using (public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete movie cache"
    on public.movie_cache for delete
    using (public.is_admin());
exception when duplicate_object then null;
end $$;
