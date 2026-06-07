# CineStack — Project Context for AI

> **Auto-loaded oleh OpenCode setiap kali kerja di project ini.**
> Full-stack movie platform untuk portfolio — katalog film, review, berita, watchlist.

---

## 🎯 Project Overview

| Field | Value |
|---|---|
| **Nama Project** | CineStack |
| **Tipe** | Full-stack Web App (Movie Platform) |
| **Tujuan** | Portfolio untuk showcase full-stack engineering skill dan menarik client freelance |
| **Target User** | Client freelance / perusahaan yang nyari full-stack developer |
| **Vibe / Design Direction** | Cinematic Dark — dark theme, warm gold accent, poster-driven |
| **Bahasa** | Kode: English. UI: English (film data dari TMDB default English) |

**Penjelasan singkat:**
> Full-stack movie platform — katalog film dari TMDB API, review & rating user, watchlist pribadi, portal berita film (auto + manual), streaming links, admin panel lengkap. Dibangun dengan Next.js 15 + Supabase + Tailwind CSS v4.

---

## 🛠 Tech Stack

### Core
- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 22
- **Framework**: Next.js 15 (App Router + React Server Components)
- **Package Manager**: npm

### Frontend
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components (Lucide icons)
- **Animation**: Framer Motion (entrance, scroll-reveal, micro-interactions)
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand (client state: watchlist, UI), Server Components (server state)
- **Data Fetching**: Server Components (primary), TanStack Query (client-side search)

### Backend
- **API Style**: Next.js Route Handlers (REST) + Server Actions
- **Auth**: Supabase Auth (Email + Google OAuth, httpOnly cookies)
- **Validation**: Zod
- **Database**: Supabase (PostgreSQL)

### Database & Storage
- **Primary DB**: PostgreSQL (via Supabase)
- **ORM/Query**: Supabase JS SDK (with RLS policies)
- **File Storage**: Supabase Storage (poster uploads, admin content)
- **Search**: PostgreSQL full-text search + TMDB API search

### External APIs
- **TMDB API** — Movie data (katalog, detail, cast, trailer)
- **Google OAuth** — via Supabase Auth

### DevOps & Deploy
- **Hosting**: Vercel (free tier, ISR, CDN)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics

### Testing
- **Unit/Integration**: Vitest
- **E2E**: Playwright (critical flows)

---

## 📏 Coding Conventions

### TypeScript
- [x] Strict mode enabled (`strict: true`)
- [x] No `any` type
- [x] No type suppression (`as any`, `@ts-ignore`, `@ts-expect-error`)
- [x] Prefer `type` over `interface` kecuali extendable
- [x] ESM imports only (no require)

### File & Folder Structure
- File naming: `kebab-case` untuk files, `PascalCase` untuk components
- Folder structure: `app/` (Next.js App Router) + `components/` (shared) + `lib/` (utilities) + `types/` (TypeScript types)
- Import order: external → internal absolute → relative
- Path aliases: `@/` → `src/`

```typescript
import { useState } from 'react';                    // external
import { Button } from '@/components/ui/button';     // internal alias
import { formatDate } from './utils';                // relative
```

### Style & Format
- Formatter: Prettier (tab width: 2, single quotes)
- Linter: ESLint with Next.js config
- Line length: 100 chars
- Quotes: single (TS/JS), double (JSX attributes)
- Semicolons: always

### Git & Commits
- Commit convention: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
- Branch: `main` (production), `feat/*` (features)

### API Conventions
- Naming: camelCase (JS) → snake_case (DB columns)
- Response shape: `{ data: T, error?: string }` for success, `{ error: { code: string, message: string } }` for errors
- Auth: Supabase session via httpOnly cookies
- Rate limit: 5/15m untuk auth, 60/1m untuk general API

### Database Conventions
- Table naming: plural snake_case (`movies`, `reviews`, `watchlists`)
- Column naming: snake_case
- Migration: Supabase migration files
- Soft delete: ya, dengan `deleted_at` timestamp

---

## 🚫 Hard Constraints (HARAM — Zero Tolerance)

### Code Quality
- [x] **No `as any`** atau type suppression lainnya
- [x] **No `catch(e) {}`** — empty catch block
- [x] **No console.log** di production code
- [x] **No hardcoded secrets** — semua via `NEXT_PUBLIC_*` atau server-only env
- [x] **No magic numbers** — extract ke constant

### Security
- [x] **No SQL injection** — pakai Supabase parameterized queries
- [x] **No XSS** — escape output, React auto-escape
- [x] **No hardcoded credentials**
- [x] **TMDB API key** server-side only (jangan pernah di client)
- [x] **RLS (Row Level Security)** — aktif di semua tabel

### Frontend
- [x] **No emoji as icons** — pakai Lucide
- [x] **No gradient text** (`background-clip: text`)
- [x] **No pure black/white** — pakai off-black #0a0a0f, off-white #f5f5f1
- [x] **No left-border accent card**
- [x] **No horizontal overflow** di mobile (test 375px)
- [x] **Touch target ≥ 44px** di mobile

### Performance
- [x] **No N+1 queries** — eager loading via Supabase joins
- [x] **No unbounded lists** — pagination (20 items/page)
- [x] **ISR revalidation** — TMDB data cache 1 jam
- [x] **Images** — Next.js Image optimization, WebP format

---

## 🎨 Design System (Ringkasan)

> Untuk design lengkap, lihat `DESIGN.md` di project ini.

| Element | Value |
|---|---|
| **Primary color** | `#f5c518` (warm gold) |
| **Background** | `#000000` (pure black) |
| **Surface** | `#1a1a24` (card bg) |
| **Text** | `#f5f5f1` (warm white) |
| **Font Display** | Archivo Black (Google Fonts) |
| **Font Body** | Inter (Google Fonts) |
| **Mono Font** | JetBrains Mono (Google Fonts) |
| **Base spacing** | 4px grid |
| **Border radius** | 12px (cards), 8px (buttons), 9999px (badges) |
| **Breakpoints** | 375 / 640 / 768 / 1024 / 1280 / 1920 |

---

## 📦 External Services

| Service | Purpose | Env var |
|---|---|---|
| Supabase | Database + Auth + Storage | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| TMDB API | Movie data | `TMDB_API_KEY`, `TMDB_API_BASE_URL` |
| Vercel | Hosting + Analytics | — (auto via Vercel) |

---

## 📌 Important Notes

- Project ini untuk **portfolio** — kualitas kode dan performa adalah prioritas #1
- Lighthouse target: **≥ 95 semua kategori**, usahakan mendekati 100
- Loading harus instant — prioritaskan SSG/ISR, hindari client-side waterfalls
- Semua film data dari TMDB API — wajib handle error state kalau API down
- Admin panel harus aman — hanya user dengan role `admin` bisa akses
- RLS (Row Level Security) wajib di semua tabel — jangan andalkan client-side auth check aja

---

## 🗂 File Reference (Project-Specific)

- `DESIGN.md` — Design system lengkap
- `docs/PLAN.md` — Full project plan (PRD, DB, API, Architecture)
- `supabase/schema.sql` — Database schema
- `lib/tmdb.ts` — TMDB API configuration
- `lib/supabase.ts` — Supabase client

---

## 📝 Changelog Project Context

| Date | Author | Change |
|---|---|---|
| 2026-06-06 | Sisyphus | Initial setup — CineStack movie platform |
