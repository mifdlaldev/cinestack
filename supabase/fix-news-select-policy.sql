-- ============================================================================
-- Fix: Add SELECT policy for admins to view all articles (including drafts)
-- ============================================================================

do $$ begin
  create policy "Admins can read all articles"
    on public.news_articles for select
    using (public.is_admin());
exception when duplicate_object then null;
end $$;
