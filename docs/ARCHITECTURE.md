# 🏗️ Architecture Overview

## Tech Stack

```
Frontend: Next.js 15 + Tailwind CSS v4 + Framer Motion
Backend:  Next.js Route Handlers + Server Actions
Database: Supabase (PostgreSQL) + RLS
Auth:     Supabase Auth (Email + Google OAuth)
Cache:    Upstash Redis
CI/CD:    GitHub Actions
Testing:  Vitest
```

## Project Structure

```
src/
├── app/          # Next.js App Router (pages + API)
├── components/   # React components
│   ├── layout/   # Navbar, Footer, Hero
│   └── ui/       # Reusable UI components
├── lib/          # Utilities & services
│   └── tmdb/     # TMDB API modules (modular)
├── types/        # TypeScript definitions
└── actions/      # Server Actions
```

## Key Decisions

- **Server Components first** — minimal client JS
- **React Query** — optimistic updates + caching
- **Supabase RLS** — security at database level
- **ISR** — TMDB data cached with 1-hour revalidation
