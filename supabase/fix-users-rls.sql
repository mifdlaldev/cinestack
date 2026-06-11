-- Allow anyone (including unauthenticated) to read user profiles
-- Needed so reviews can display author names/avatars
CREATE POLICY "Anyone can read user profiles"
ON public.users FOR SELECT
USING (true);
