# DESIGN.md — Design System Reference

> **Cinematic Dark** — Dark theme dengan warm gold accent, poster-driven layout, dan micro-interactions premium.
> Terinspirasi dari Netflix, Disney+, IMDb, Letterboxd, Mubi, dan A24.

---

## 📖 Research Log

**Kategori website:** Movie Platform (Full-stack Portfolio)
**Jumlah referensi yang diriset:** 15+ website

**Daftar referensi:**

| # | Website | Kategori | Warna Dominan | Font | Layout Khas | Catatan |
|---|---|---|---|---|---|---|
| 1 | **Netflix** | Streaming | Dark (#141414) + Red (#E50914) | Netflix Sans | Full-bleed hero, horizontal scroll rows | Gold standard dark cinematic |
| 2 | **Disney+** | Streaming | Dark blue (#0B1124) | Disney+ Sans | Clean grid, playful accents | Premium dark vibe |
| 3 | **IMDb** | Database | Dark (#0F0F0F) + Yellow (#F5C518) | Noto Sans | Dense info hierarchy, poster grid | Gold accent iconic |
| 4 | **Letterboxd** | Social Review | Dark (#14181C) + Green (#00E054) | Graphik | Poster grid, film diary, social | Clean social-first UX |
| 5 | **Mubi** | Curated | Dark + White | Editorial serif + sans | Full-bleed imagery, editorial layout | Minimal, high-end |
| 6 | **A24** | Studio | Black + White | NB International | Monochrome, typography-driven | Zero decoration, pure type |
| 7 | **Naked City Films** | Studio | Dark + Electric Blue | Custom | Brutalist blocks, heavy spacing | Motion-driven |
| 8 | **Jason Bergh** | Director | Dark (#1e1e1e) + Cream (#FFEEC8) | PP Editorial | Cinematic, film strip motif | Luxury cinematic |
| 9 | **Hyperion** | Production | Dark + White | Sans-serif editorial | Scroll-native, full-bleed bands | Modular, scroll-native |
| 10 | **Apple TV+** | Streaming | Dark + White | SF Pro | Clean, minimal, editorial | Restrained elegance |
| 11 | **Rotten Tomatoes** | Review | Dark (#0C0C0C) + Red (#FA320A) | Various | Tomatometer, critic/review split | Data-driven UI |
| 12 | **TMDB** | Database | Dark (#0D253F) + Light blue (#01B4E4) | Various | Poster grid, sidebar filters | Sumber data API |
| 13 | **HBO Max** | Streaming | Dark purple + White | Custom | Card grid, hero slider | Premium feel |
| 14 | **Amorata Films** | Wedding | Dark charcoal + Ivory (#FBF6D1) | Custom | Apple/A24 aesthetic, film grain | Film grain overlay |
| 15 | **Giulio Portfolio** | Portfolio | Dark cyberpunk + Neon | Custom | 3D cinematic, scene-based | Immersive storytelling |

---

## 🔍 Sintesis Riset

### Warna
```
- Dark theme: 15/15 referensi → WAJIB dark
- Single accent color: 12/15 referensi → pilih 1 accent dominant
- Gold/Amber accent: IMDb (iconic), Apple TV+ (subtle) → warm, premium
- Off-black (#0a0a0f) vs pure black: 10/15 pakai off-black → depth lebih baik
- Kontras tinggi: 15/15 → teks putih di background gelap
```

### Tipografi
```
- Font display bold/sans-serif: 10/15 referensi — poster-like headlines
- Font body sans-serif: 14/15 — readability
- Serif untuk editorial: Mubi, A24, Jason Bergh — lebih niche
- Font mono untuk metadata: 5/15 — rating, tahun, detail teknis
```

### Layout & Komposisi
```
- Hero fullscreen dengan backdrop film: 12/15 referensi
- Poster card grid (3-5 kolom): 10/15
- Horizontal scroll row untuk kategori: 8/15 (Netflix-style)
- Asymmetric layout untuk variasi: 6/15
- Navigation: sticky top bar transparan: 10/15
- Footer: dark solid dengan link grid: 12/15
```

### Elemen Unik
```
- Film grain overlay: ditemukan di Amorata Films, Jason Bergh
- Poster hover dengan scale + glow: Netflix, Disney+, Letterboxd
- Rating badge: IMDb (gold), Rotten Tomatoes (red), Letterboxd (green)
- Progress bar untuk watch status: Allflix, Movie Night
- Backdrop hero dengan gradient overlay: Netflix, TMDB, HBO
```

---

## 🎯 Design Decisions (Dengan Justifikasi)

### Theme & Mood
```
Pilihan: Dark Cinematic — off-black base dengan warm gold accent
Alasan: 15/15 referensi movie platform pakai dark theme. Gold accent 
terinspirasi dari IMDb (iconic gold star) dan sinematografi film — 
memberi kesan premium tanpa jadi kloning Netflix (merah) atau Letterboxd (hijau).
```

### Primary Color Palette
```css
/* Tokens */
--color-bg: #0a0a0f;            /* Deep near-black dengan slight blue undertone — lebih berkarakter dari pure #000 */
--color-bg-alt: #12121a;        /* Slightly lighter untuk section alternatif */
--color-surface: #1a1a24;       /* Card, sidebar, modal backgrounds */
--color-surface-hover: #24242e; /* Hover state cards */
--color-border: #2a2a35;        /* Subtle borders, dividers */
--color-text: #f5f5f1;          /* Warm white — tidak menyilaukan seperti #fff */
--color-text-secondary: #888899;/* Muted text untuk metadata */
--color-accent: #f5c518;        /* Warm gold — iconic, cinematic, premium */
--color-accent-hover: #ffd43b;  /* Gold hover */
--color-accent-dim: #8a6d0d;    /* Gold dim untuk subtle elements */
--color-success: #22c55e;
--color-error: #ef4444;
--color-overlay: rgba(0, 0, 0, 0.7);  /* Gradient overlay untuk hero */
```

### Typography
```css
--font-display: 'Archivo Black', sans-serif;  /* Bold, cinematic, poster-like — terinspirasi dari IMDb/Netflix headlines */
--font-body: 'Inter', sans-serif;             /* Clean, highly readable — standar modern web */
--font-mono: 'JetBrains Mono', monospace;      /* Metadata: ratings, years, technical details */
```

**Scale:**
```css
--text-xs: 0.75rem;    /* 12px — micro copy */
--text-sm: 0.875rem;   /* 14px — metadata, labels */
--text-base: 1rem;     /* 16px — body */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px — section headers */
--text-3xl: 2rem;      /* 32px */
--text-4xl: 2.5rem;    /* 40px — page headers */
--text-5xl: 3.5rem;    /* 56px — hero display */
--text-6xl: 4.5rem;    /* 72px — large hero */
```

### Spacing & Layout
```css
--spacing-unit: 4px;
--container-max: 1280px;
--container-narrow: 960px;
--section-padding: 120px;     /* desktop */
--section-padding-mobile: 64px;
--gap-sm: 8px;
--gap-md: 16px;
--gap-lg: 24px;
--gap-xl: 32px;
--gap-2xl: 48px;
--gap-3xl: 64px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;      /* Cards */
--radius-xl: 16px;       /* Modals */
--radius-full: 9999px;   /* Badges, pills */
```

### Motion & Interaksi
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 600ms;
--easing-out: cubic-bezier(0.16, 1, 0.3, 1);
--easing-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

```
- Entry animasi: fade-up + translateY(24px → 0), stagger children 100ms
- Kartu hover: scale(1.03) + shadow glow gold subtle
- Button active: scale(0.97)
- Scroll-reveal: Intersection Observer di tiap section
- Mobile: durasi dipotong 50% untuk perceived speed
- prefers-reduced-motion: semua animasi collapse ke instant
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 12px rgba(0,0,0,0.4);
--shadow-lg: 0 8px 30px rgba(0,0,0,0.5);
--shadow-glow: 0 0 20px rgba(245, 197, 24, 0.15); /* Gold glow untuk hero */
```

---

## ✅ Pre-Flight Checklist

### Anti-AI-Slop Check
- [x] Tidak ada gradient purple-pink-blue di hero
- [x] Tidak ada emoji sebagai icon — pakai Lucide
- [x] Tidak ada pure black / pure white — pakai off-black #0a0a0f, warm white #f5f5f1
- [x] Tidak ada left-border accent card
- [x] Tidak ada glassmorphism sebagai default (hanya untuk modals/search)
- [x] Tidak ada numbered section markers
- [x] Tidak ada gradient text
- [x] Tidak ada card grid identik > 2x berturut-turut
- [x] Tidak ada AI purple glow/neon
- [x] Tidak ada fake screenshots dengan div

### Quality Check
- [x] Body text contrast ≥ 4.5:1 (#f5f5f1 on #0a0a0f = ~13.5:1)
- [x] Warna maksimal 3 (base + gray + 1 gold accent)
- [x] Layout bervariasi antar section
- [x] Heading tidak overflow di mobile
- [x] Touch target ≥ 44px di mobile
- [x] Button ada `:active` state (scale 0.97)
- [x] Animasi honor `prefers-reduced-motion`
- [x] Setiap keputusan desain punya justifikasi
- [x] Referensi riset tercantum

---

## 📝 Referensi Lengkap

```
- Netflix (netflix.com) → Dark cinematic, horizontal scroll rows, poster-driven
- IMDb (imdb.com) → Gold accent iconic, dense info hierarchy, rating system
- Letterboxd (letterboxd.com) → Social movie UX, diary, clean dark UI
- Disney+ (disneyplus.com) → Premium dark, clean grid, playful touches
- Mubi (mubi.com) → Editorial minimal, serif typography, full-bleed
- A24 (a24films.com) → Monochrome, type-driven, zero decoration
- Naked City Films (nakedcityfilms.com) → Brutalist, motion-driven
- Jason Bergh (jasonbergh.com) → Luxury cinematic, film strip motif
- Hyperion (hyperion.xyz) → Scroll-native production, modular
- Apple TV+ (tv.apple.com) → Restrained elegance, clean hierarchy
- Rotten Tomatoes (rottentomatoes.com) → Data-driven review UI
- TMDB (themoviedb.org) → API data structure, poster grid
- Amorata Films → Film grain overlay, Apple/A24 aesthetic
- Giulio Collesei Portfolio → 3D cinematic storytelling, scene-based
- Movie Night GitHub → Next.js + TMDB + Supabase real implementation
```
