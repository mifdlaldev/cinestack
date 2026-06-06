# CineStack — Full Project Plan

> **Full-stack Movie Platform** — Next.js 15 + Supabase + TMDB API
> Dibangun untuk portfolio full-stak developer.

---

## 🎯 PRD — Product Requirements Document

### 1. Vision
> Platform movie all-in-one yang menunjukkan kemampuan full-stack engineering: integrasi API, database design, auth flow, admin panel, performa optimal (Lighthouse 95++), dan cinematic UI.

### 2. Target Audience
- **Target #1**: Client freelance / perusahaan yang mencari full-stack developer
- **Target #2**: Recruiter / hiring manager yang mengecek portfolio
- **Behavior**: Technical audience — mereka akan inspeksi kualitas kode, performa, dan architecture

### 3. Scope

#### ✅ In Scope (MVP)
| Fitur | Prioritas |
|---|---|
| Katalog film dari TMDB API (popular, trending, top rated, upcoming, now playing) | P0 |
| Detail film (sinopsis, cast, trailer, rating, runtime, genres, poster/backdrop) | P0 |
| Search film (debounced, multi-criteria) | P0 |
| User auth (Email + Google OAuth) | P0 |
| Review & rating film | P0 |
| Watchlist personal (tambah/hapus film) | P0 |
| Portal berita film (auto-feed TMDB + admin tulis) | P1 |
| Streaming links (TMDB watch providers) | P1 |
| Admin panel (CRUD film, manage users, reviews, news) | P1 |
| Responsive design (375px - 1920px) | P0 |
| Dark cinematic theme | P0 |
| Analytics dashboard di admin | P2 |

#### ❌ Out of Scope (v2+)
- User following / social feed
- Rekomendasi AI
- Real-time chat
- PWA install
- Multi-language support

### 4. User Stories
```
As a visitor, I want to browse popular movies so that I can discover new films.
As a visitor, I want to search movies by title/genre so that I can find specific films.
As a visitor, I want to see full movie details so that I can decide whether to watch it.
As a user, I want to create an account so that I can save movies to my watchlist.
As a user, I want to rate and review movies so that I can share my opinion.
As a user, I want to manage my watchlist so that I can track films I want to see.
As a user, I want to read movie news so that I can stay updated.
As an admin, I want to manage movies and users so that I can control the platform content.
As an admin, I want to write news articles so that the platform has original content.
```

### 5. Success Metrics
- Lighthouse: ≥ 95 semua kategori (target 98+ Performance, 100 Best Practices)
- Page load: FCP < 1.0s, LCP < 1.5s (SSG/ISR pre-rendered)
- SEO: ≥ 95
- Accessibility: WCAG 2.1 AA
- Error rate: < 0.1%

---

## 🗄️ Database Design (Supabase PostgreSQL)

### ERD

```
┌──────────────────────┐
│       users          │
├──────────────────────┤
│ id (UUID, PK)        │
│ email (text, unique)  │
│ name (text)           │
│ avatar_url (text)     │
│ role (enum: user,admin)│
│ created_at (timestamptz)│
│ updated_at (timestamptz)│
└──────────┬───────────┘
           │ 1
           │
           │ *
┌──────────┴───────────┐       ┌──────────────────────┐
│      reviews         │       │     watchlists       │
├──────────────────────┤       ├──────────────────────┤
│ id (UUID, PK)        │       │ id (UUID, PK)        │
│ user_id (UUID, FK)   │       │ user_id (UUID, FK)   │
│ movie_id (int, FK)   │       │ movie_id (int, FK)   │
│ rating (int, 1-10)   │       │ added_at (timestamptz)│
│ content (text)       │       └──────────────────────┘
│ created_at (timestamptz)│
│ updated_at (timestamptz)│
└──────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│     news_articles    │       │   movie_cache        │
├──────────────────────┤       ├──────────────────────┤
│ id (UUID, PK)        │       │ id (int, PK)         │
│ title (text)         │       │ tmdb_id (int, unique) │
│ slug (text, unique)  │       │ title (text)         │
│ content (text)       │       │ data (jsonb)         │
│ excerpt (text)       │       │ cached_at (timestamptz)│
│ cover_image (text)   │       └──────────────────────┘
│ author_id (UUID, FK) │
│ status (enum: draft,  │
│   published)         │
│ published_at (timestamptz)│
│ created_at (timestamptz)│
│ updated_at (timestamptz)│
└──────────────────────┘
```

### Schema SQL

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Custom types
create type user_role as enum ('user', 'admin');
create type article_status as enum ('draft', 'published');

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_email on users(email);
create index idx_users_role on users(role);

-- Reviews table
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  movie_id int not null,
  rating int not null check (rating >= 1 and rating <= 10),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, movie_id) -- one review per user per movie
);

create index idx_reviews_movie on reviews(movie_id);
create index idx_reviews_user on reviews(user_id);
create index idx_reviews_rating on reviews(rating desc);

-- Watchlists table
create table public.watchlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  movie_id int not null,
  added_at timestamptz not null default now(),
  unique(user_id, movie_id)
);

create index idx_watchlists_user on watchlists(user_id);

-- Movie cache (TMDB data cache)
create table public.movie_cache (
  id serial primary key,
  tmdb_id int not null unique,
  title text not null,
  data jsonb not null,
  cached_at timestamptz not null default now()
);

create index idx_movie_cache_tmdb on movie_cache(tmdb_id);

-- News articles table
create table public.news_articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  cover_image text,
  author_id uuid not null references public.users(id) on delete cascade,
  source text not null default 'manual', -- 'manual' or 'tmdb_auto'
  status article_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_news_status on news_articles(status);
create index idx_news_published on news_articles(published_at desc);
create index idx_news_slug on news_articles(slug);
```

### Row Level Security (RLS)

```sql
-- Users: only admins can see all users; user can see own profile
alter table users enable row level security;

create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

create policy "Admins can view all users"
  on users for select
  using (is_admin());

create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

-- Reviews: authenticated users can CRUD own; public can read
alter table reviews enable row level security;

create policy "Anyone can read reviews"
  on reviews for select
  using (true);

create policy "Authenticated users can insert own reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete
  using (auth.uid() = user_id);

-- Watchlists: only owner can see/manage
alter table watchlists enable row level security;

create policy "Users can CRUD own watchlist"
  on watchlists for all
  using (auth.uid() = user_id);

-- News: public can read published; only admins can CRUD
alter table news_articles enable row level security;

create policy "Anyone can read published articles"
  on news_articles for select
  using (status = 'published');

create policy "Admins can CRUD articles"
  on news_articles for all
  using (is_admin());
```

---

## 🔌 API Design

### Architecture
- Next.js Route Handlers (`app/api/...`) untuk REST endpoints
- Server Actions untuk mutations (form handling)
- TMDB API dipanggil dari server-side only

### External API: TMDB

```typescript
// Endpoints yang dipakai
GET /3/trending/movie/week        → Trending movies
GET /3/movie/popular               → Popular movies
GET /3/movie/top_rated             → Top rated
GET /3/movie/upcoming              → Upcoming
GET /3/movie/now_playing           → Now playing
GET /3/movie/{id}                  → Movie details
GET /3/movie/{id}/credits          → Cast & crew
GET /3/movie/{id}/videos           → Trailers
GET /3/movie/{id}/watch/providers  → Streaming links
GET /3/search/movie                → Search
GET /3/genre/movie/list            → Genre list
GET /3/discover/movie              → Filter by genre/year
GET /3/trending/person/week        → Trending actors
```

### Internal API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| **Auth** | | | |
| POST | /api/auth/callback | No | Supabase auth callback |
| POST | /api/auth/logout | Yes | Logout |
| **Movies** | | | |
| GET | /api/movies/trending | No | Trending this week |
| GET | /api/movies/popular | No | Popular movies (paginated) |
| GET | /api/movies/top-rated | No | Top rated (paginated) |
| GET | /api/movies/upcoming | No | Upcoming releases |
| GET | /api/movies/now-playing | No | Now in theaters |
| GET | /api/movies/[id] | No | Full movie details (from TMDB) |
| GET | /api/movies/[id]/reviews | No | User reviews for movie |
| GET | /api/movies/search | No | Search movies (query params) |
| GET | /api/movies/discover | No | Filter by genre/year |
| **Reviews** | | | |
| POST | /api/reviews | Yes | Create review |
| PUT | /api/reviews/[id] | Yes | Update review |
| DELETE | /api/reviews/[id] | Yes | Delete review |
| **Watchlist** | | | |
| GET | /api/watchlist | Yes | User's watchlist |
| POST | /api/watchlist | Yes | Add to watchlist |
| DELETE | /api/watchlist/[id] | Yes | Remove from watchlist |
| **News** | | | |
| GET | /api/news | No | Published articles (paginated) |
| GET | /api/news/[slug] | No | Article detail |
| POST | /api/news | Admin | Create article |
| PUT | /api/news/[id] | Admin | Update article |
| DELETE | /api/news/[id] | Admin | Delete article |
| **Admin** | | | |
| GET | /api/admin/users | Admin | List users |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/reviews | Admin | All reviews (manage) |
| DELETE | /api/admin/reviews/[id] | Admin | Delete review |

### Server Actions (for forms)

```typescript
// Actions (app/actions/)
submitReview(formData: ReviewForm)    → Create/update review
toggleWatchlist(movieId: number)       → Add/remove from watchlist
createNewsArticle(formData: NewsForm)  → Create article (admin)
updateNewsArticle(id, formData)        → Update article (admin)
deleteNewsArticle(id)                  → Delete article (admin)
```

### Response Shape

```typescript
// Success
{
  "data": T,
  "meta"?: {
    "page": number,
    "total_pages": number,
    "total_results": number
  }
}

// Error
{
  "error": {
    "code": string,       // e.g. "NOT_FOUND", "UNAUTHORIZED", "VALIDATION_ERROR"
    "message": string,    // Human-readable
    "details"?: unknown   // Optional validation details
  }
}
```

### Rate Limiting
| Endpoint | Limit | Window |
|---|---|---|
| Auth (login/register) | 5 | 15 minutes |
| API (general) | 60 | 1 minute |
| TMDB proxy | 40 | 10 seconds (TMDB limit) |

---

## 🏗️ Architecture

### High-Level

```
[User Browser]
     │
     ▼
[Vercel CDN]
     │
     ▼
[Next.js 15 App]
     │
     ├── SSG/ISR Pages (/)       → Static HTML, revalidate hourly
     │   ├── /                    → Hero + Trending + Popular + Categories
     │   ├── /movies/[id]         → Movie detail (ISR 1h)
     │   ├── /news                → News list (ISR 1h)
     │   └── /news/[slug]         → News article (ISR 1h)
     │
     ├── Dynamic Pages (/app/*)   → Server Components
     │   ├── /search              → Client-side search
     │   ├── /genre/[id]          → Genre filter (ISR 1h)
     │   └── /discover            → Multi-filter
     │
     ├── Protected Pages (/app/*) → Auth required + Server Components
     │   ├── /watchlist           → User's watchlist
     │   ├── /profile             → User profile
     │   └── /admin/*             → Admin panel (role check)
     │
     └── API Routes (/api/*)      → Route Handlers
         ├── /api/movies/*        → TMDB proxy + cache
         ├── /api/reviews/*       → CRUD reviews (RLS)
         ├── /api/watchlist/*     → CRUD watchlist (RLS)
         ├── /api/news/*          → CRUD articles (RLS)
         └── /api/admin/*         → Admin operations
              │
              ▼
         [Supabase (PostgreSQL + Auth)]
              │
              ├── Auth: Email + Google OAuth
              ├── RLS: Row Level Security
              └── Storage: Images (admin uploads)

[TMDB API] ←─── Server-side fetch (ISR cache 1h, server-only API key)
```

### Component Tree

```
<html>
  <body>
    <ThemeProvider (CSS variables)>
      <AuthProvider (Supabase session)>
        <Layout>
          <Navbar>
            <Logo />
            <NavigationLinks />
            <SearchTrigger />
            <AuthButtons />
            <UserMenu />          // if logged in
          </Navbar>
          
          <main>
            {children}            // Page content
          </main>
          
          <Footer>
            <LinkGrid />
            <SocialLinks />
            <Copyright />
          </Footer>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  </body>
</html>
```

### Pages & Component Breakdown

| Route | Page Component | Key Sub-Components |
|---|---|---|
| `/` | HomePage | `HeroSlider`, `MovieRow` (trending, popular, top-rated, upcoming), `GenreGrid` |
| `/movies/[id]` | MovieDetailPage | `MovieHero` (backdrop), `MovieInfo` (title, year, rating), `CastList`, `TrailerButton`, `WatchProviders`, `ReviewSection`, `SimilarMovies` |
| `/search` | SearchPage | `SearchBar`, `FilterChips`, `MovieGrid`, `Pagination`, `SearchSkeleton` |
| `/genre/[id]` | GenrePage | `GenreHeader`, `MovieGrid`, `Pagination` |
| `/discover` | DiscoverPage | `FilterPanel` (genre, year, rating, sort), `MovieGrid`, `Pagination` |
| `/watchlist` | WatchlistPage | `WatchlistGrid`, `WatchlistCard`, `EmptyWatchlist` |
| `/profile` | ProfilePage | `ProfileInfo`, `RecentReviews`, `Stats` |
| `/news` | NewsPage | `NewsCard`, `AutoFeedSection`, `ManualFeedSection`, `Pagination` |
| `/news/[slug]` | NewsArticlePage | `ArticleContent`, `AuthorBio`, `ShareButtons` |
| `/auth/callback` | AuthCallbackPage | (Next.js route handler) |
| `/admin` | AdminDashboard | `StatCards`, `RecentUsers`, `RecentReviews`, `ContentChart` |
| `/admin/movies` | AdminMovies | `MovieTable`, `AddMovieForm`, `EditMovieForm` |
| `/admin/users` | AdminUsers | `UserTable`, `UserDetailModal` |
| `/admin/reviews` | AdminReviews | `ReviewTable`, `ReviewDeleteDialog` |
| `/admin/news` | AdminNews | `ArticleTable`, `ArticleEditor` (rich text) |

### Data Flow (Critical Paths)

```
BROWSE MOVIES:
  User opens / →
    Server Component fetches TMDB via ISR →
      → Cached in movie_cache table
      → Returns static HTML with movie data
    Client: no loading state needed (SSG)

SEARCH MOVIES:
  User types in SearchBar →
    Client: debounce 400ms →
      GET /api/movies/search?q=...&page=...
        → Route Handler fetches TMDB API
        → Returns { data: Movie[], meta: Pagination }
    Client: show results + skeleton while fetching

ADD REVIEW:
  User submits review form →
    Client: Zod validation →
      Server Action: submitReview(formData)
        → Supabase: INSERT into reviews (RLS: auth.uid = user_id)
        → Revalidate movie page (revalidateTag)
        → Return success
    Client: show updated reviews list

WATCHLIST TOGGLE:
  User clicks bookmark icon →
    Client: optimistic update (Zustand) →
      Server Action: toggleWatchlist(movieId)
        → Check if exists → DELETE or INSERT
        → Return { data: { added: boolean } }
    Client: confirm/rollback optimistic state
```

### State Management Strategy

| State Type | Solution | Scope |
|---|---|---|
| Server data (movies, TMDB) | Server Components + ISR | All movie pages |
| Auth session | Supabase Auth (httpOnly cookie) + AuthProvider context | Global |
| Watchlist (client) | Zustand store (persisted to localStorage + sync with Supabase) | Client-side |
| UI state (modals, sidebar) | Zustand store | Client-side |
| Form state | React Hook Form + Zod | Per form |
| Search/filter | TanStack Query (React Query) | Search results |
| Admin data | Server Components (admin role check) | Admin pages |

### Performance Strategy

1. **SSG** (Static Site Generation):
   - Home page: build-time render, revalidate 1h
   - Movie detail: ISR with `revalidate: 3600` (1 hour)
   - News: ISR with revalidate

2. **Image Optimization**:
   - Next.js Image for all TMDB posters/backdrops
   - WebP format
   - Lazy loading for below-fold images
   - `<picture>` element with responsive breakpoints

3. **Bundle Optimization**:
   - Server Components (zero JS for static content)
   - Dynamic imports for heavy components (modals, editors)
   - Tree-shaking via ESM

4. **Caching Strategy**:
   - TMDB data → `movie_cache` table (fallback when API down)
   - ISR → revalidate hourly
   - Supabase queries → in-memory deduplication
   - Static assets → Vercel CDN edge

---

## 🧭 Navigation & Routes

### Site Map
```
/                       → Home (hero + movie rows + genres)
/movies/[id]            → Movie detail (detail, cast, trailer, reviews)
/search                  → Search page (debounced search + filters)
/genre/[id]-[name]      → Genre page (filtered movies)
/discover                → Advanced discover (multi-filter)
/watchlist               → My watchlist (protected)
/profile                  → My profile (protected)
/news                     → News portal (articles + auto-feeds)
/news/[slug]             → Article detail
/auth/callback           → Auth callback (Supabase OAuth)
/admin                    → Admin dashboard (admin only)
/admin/movies            → Admin manage movies
/admin/users             → Admin manage users
/admin/reviews           → Admin manage reviews
/admin/news              → Admin manage articles
```

### Navigation Bar Structure
```
[Logo: CineStack]  [Movies ▼] [News] [Discover]  [Search Icon]  [Login/Profile]
                              │
                    ├── Trending
                    ├── Popular
                    ├── Top Rated
                    ├── Upcoming
                    └── Now Playing
```

---

## 🔒 Security Strategy

### Authentication
- **Method**: Supabase Auth (Email + Google OAuth)
- **Session**: httpOnly cookies (Server Components can read session)
- **Password**: bcrypt (via Supabase, cost 12)
- **Rate limit**: 5 attempts per 15 minutes (auth endpoints)

### Authorization
- **RLS (Row Level Security)**: All tables protected
- **Admin check**: Helper function `is_admin()` in Supabase
- **Role verification**: Server-side role check for admin routes
- **No client-side auth decisions**: Server always verifies

### Data Protection
- **TMDB API key**: Server-only env var (never in client bundle)
- **Supabase keys**: `anon_key` for public, `service_role_key` for admin operations
- **No secrets in .env.local**: Use Vercel environment variables
- **Input validation**: Zod on all form submissions (client + server)

### OWASP Top 10 Coverage
| Risk | Mitigation |
|---|---|
| SQL Injection | Supabase parameterized queries (never raw SQL) |
| XSS | React auto-escaping, CSP headers |
| CSRF | SameSite=Strict cookies |
| Broken Auth | httpOnly cookies, session timeout |
| Sensitive Data | No secrets in client, HTTPS forced |
| Access Control | RLS on all tables, server role check |

---

## 🧪 Testing Strategy

### Unit & Integration Tests (Vitest)
| Target | Coverage | Focus |
|---|---|---|
| Utils (`lib/`) | > 90% | TMDB helpers, formatters, validators |
| TMDB service | > 80% | API calls, error handling, cache |
| Server Actions | > 80% | Mutations, validation, auth check |
| API Routes | > 70% | Request/response, status codes |

### Component Tests (Vitest + Testing Library)
| Target | Coverage | Focus |
|---|---|---|
| UI Components (`components/ui/`) | > 80% | Button, Card, Input, Modal |
| Page Components | > 60% | Render, key interactions |
| Auth components | > 80% | Login/logout flow, redirect |

### E2E Tests (Playwright)
| Flow | Critical? |
|---|---|
| Browse movies on homepage | Yes |
| Search and view movie detail | Yes |
| Login (Email + Google OAuth) | Yes |
| Add review to movie | Yes |
| Toggle watchlist | Yes |
| Admin panel access | Yes |
| Responsive layout (375px, 768px, 1280px) | Yes |

---

## 🚀 Deployment Plan

### Platform: Vercel (Free Tier)

```
1. Connect GitHub repo → Vercel
2. Set environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - TMDB_API_KEY
3. Configure ISR revalidation
4. Enable Vercel Analytics (free)
```

### CI/CD (GitHub Actions)
```
On push to main:
  → Lint check (ESLint)
  → Type check (tsc --noEmit)
  → Unit tests (Vitest)
  → Build (next build)
  → Lighthouse CI audit
  → Deploy to Vercel (production)

On PR to main:
  → Lint + Type + Tests
  → Deploy preview to Vercel
```

---

## 📅 Build Order (Recommended)

### Phase 1 — Foundation (Day 1-2)
```
1. Init Next.js 15 project + TypeScript + Tailwind v4
2. Setup folder structure (app/, components/, lib/, types/)
3. Configure ESLint + Prettier
4. Setup Supabase project + schema + RLS
5. Create TMDB API service (lib/tmdb.ts)
6. Setup Supabase client (lib/supabase.ts)
7. Setup auth (Supabase Auth + middleware)
8. Create base Layout, Navbar, Footer
```

### Phase 2 — Movie Catalog (Day 3-5)
```
9. Homepage: Hero section + MovieRow components
10. Trending / Popular / Top Rated / Upcoming API + pages
11. Movie detail page (hero, info, cast, trailers)
12. Search page (debounced + filters)
13. Genre filtering + Discover page
14. Watch providers integration
```

### Phase 3 — User Features (Day 6-8)
```
15. Auth UI (login, register, Google OAuth)
16. Profile page
17. Review CRUD (submit, edit, delete)
18. Watchlist toggle + page
19. Zustand store for client state
```

### Phase 4 — News & Content (Day 9-10)
```
20. News article schema + API
21. News list + detail page
22. Auto-feed from TMDB (trending news)
23. Article editor for admin
```

### Phase 5 — Admin Panel (Day 11-12)
```
24. Admin dashboard with stats
25. Manage movies (CRUD + TMDB sync)
26. Manage users (list, ban)
27. Manage reviews (delete)
28. Manage news articles (CRUD)
```

### Phase 6 — Polish & Production (Day 13-14)
```
29. Animations (Framer Motion: entrance, scroll-reveal)
30. Loading states (skeletons, suspense)
31. Error boundaries + error pages
32. 404 page (cinematic)
33. SEO (metadata, Open Graph, structured data)
34. Accessibility audit (keyboard, screen reader)
35. Performance optimization (Lighthouse 95++)
36. Final responsive test (375px - 1920px)
```
