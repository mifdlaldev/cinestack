-- ============================================================================
-- CineStack — Supabase PostgreSQL Schema
-- ============================================================================
-- Idempotent — safe to re-run.
-- ============================================================================

create extension if not exists "uuid-ossp" with schema extensions;

-- 2. Custom types ---------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('user', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.article_status as enum ('draft', 'published');
exception when duplicate_object then null;
end $$;

-- 3. Tables ---------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  movie_id int not null,
  rating int not null check (rating >= 1 and rating <= 10),
  content text not null,
  parent_id uuid references public.reviews(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_movie_review unique (user_id, movie_id)
);

create table if not exists public.review_reports (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint unique_user_review_report unique (user_id, review_id)
);

create table if not exists public.watchlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  movie_id int not null,
  added_at timestamptz not null default now(),
  constraint unique_user_movie_watchlist unique (user_id, movie_id)
);

create table if not exists public.movie_cache (
  id bigserial primary key,
  tmdb_id int not null unique,
  title text not null,
  data jsonb not null,
  cached_at timestamptz not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  cover_image text,
  author_id uuid not null references public.users(id) on delete cascade,
  source text not null default 'manual',
  status public.article_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 4. Indexes --------------------------------------------------------------------

create index if not exists idx_reviews_movie_id on public.reviews(movie_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);
create index if not exists idx_reviews_rating on public.reviews(rating desc);
create index if not exists idx_reviews_created on public.reviews(created_at desc);
create index if not exists idx_watchlists_user_id on public.watchlists(user_id);
create index if not exists idx_watchlists_movie_id on public.watchlists(movie_id);
create index if not exists idx_movie_cache_tmdb_id on public.movie_cache(tmdb_id);
create index if not exists idx_movie_cache_cached_at on public.movie_cache(cached_at desc);
create index if not exists idx_news_articles_status on public.news_articles(status);
create index if not exists idx_news_articles_published_at on public.news_articles(published_at desc);
create index if not exists idx_news_articles_slug on public.news_articles(slug);
create index if not exists idx_news_articles_author on public.news_articles(author_id);

-- 5. Functions & Triggers -------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

do $$ begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
exception when duplicate_object then null;
end $$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create trigger on_users_updated
    before update on public.users
    for each row execute function public.handle_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger on_reviews_updated
    before update on public.reviews
    for each row execute function public.handle_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger on_news_articles_updated
    before update on public.news_articles
    for each row execute function public.handle_updated_at();
exception when duplicate_object then null;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 6. Row Level Security ---------------------------------------------------------

alter table public.users enable row level security;
alter table public.reviews enable row level security;
alter table public.review_reports enable row level security;
alter table public.watchlists enable row level security;
alter table public.movie_cache enable row level security;
alter table public.news_articles enable row level security;

-- Helper: create policy only if not exists
do $$ begin
  create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
  create policy "Admins can view all users" on public.users for select using (public.is_admin());
  create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
  create policy "Anyone can read reviews" on public.reviews for select using (true);
  create policy "Authenticated users can insert own reviews" on public.reviews for insert with check (auth.uid() = user_id);
  create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
  create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);
  create policy "Users can view own watchlist" on public.watchlists for select using (auth.uid() = user_id);
  create policy "Users can insert own watchlist" on public.watchlists for insert with check (auth.uid() = user_id);
  create policy "Users can delete own watchlist" on public.watchlists for delete using (auth.uid() = user_id);
  create policy "Anyone can read movie cache" on public.movie_cache for select using (true);
  create policy "Anyone can read published articles" on public.news_articles for select using (status = 'published' and deleted_at is null);
  create policy "Admins can insert articles" on public.news_articles for insert with check (public.is_admin());
  create policy "Admins can update articles" on public.news_articles for update using (public.is_admin());
  create policy "Admins can delete articles" on public.news_articles for delete using (public.is_admin());
  create policy "Admins can delete reviews" on public.reviews for delete using (public.is_admin());
exception when duplicate_object then null;
end $$;
