-- Drop both partial unique indexes that block ON DELETE SET NULL.
-- Enforce "one review per user per movie" in application code instead
-- (already implemented in submitReview action).

drop index if exists unique_user_movie_review;
drop index if exists idx_unique_user_movie_review;
