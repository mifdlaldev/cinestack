# 🚀 Getting Started

## Prerequisites
- Node.js 22+
- Supabase project (free tier)
- TMDB API key (free)

## Quick Start

```bash
git clone https://github.com/mifdlaldev/cinestack.git
cd cinestack
npm install
cp .env.example .env.local
# Isi .env.local dengan credentials kamu
npm run dev
```

Buka http://localhost:3000

## Environment Variables

Lihat [.env.example](../.env.example) untuk daftar lengkap.

## Database

Jalankan `supabase/schema.sql` di Supabase SQL Editor.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run lint` | ESLint check |
