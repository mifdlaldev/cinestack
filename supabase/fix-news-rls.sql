-- ============================================================================
-- Fix: Add WITH CHECK to news_articles update policy
-- UPDATE without explicit WITH CHECK can fail in some Supabase versions.
-- ============================================================================

-- Drop the old policy and recreate with WITH CHECK
drop policy if exists "Admins can update articles" on public.news_articles;

create policy "Admins can update articles"
  on public.news_articles
  for update
  using (public.is_admin())
  with check (public.is_admin());
