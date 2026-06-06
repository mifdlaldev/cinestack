# CineStack — Full Project Plan

> **Full-stack Movie Platform** — Next.js 15 + Supabase + TMDB API

---

## TODOs

### Phase 1 — Foundation
1. Init Next.js 15 project + TypeScript + Tailwind v4
2. Setup folder structure (app/, components/, lib/, types/)
3. Configure ESLint + Prettier
4. Setup Supabase project + schema + RLS
5. Create TMDB API service (lib/tmdb.ts)
6. Setup Supabase client (lib/supabase.ts)
7. Setup auth (Supabase Auth + middleware)
8. Create base Layout, Navbar, Footer

### Phase 2 — Movie Catalog
9. Homepage: Hero section + MovieRow components
10. Trending / Popular / Top Rated / Upcoming API + pages
11. Movie detail page (hero, info, cast, trailers)
12. Search page (debounced + filters)
13. Genre filtering + Discover page
14. Watch providers integration

### Phase 3 — User Features
15. Auth UI (login, register, Google OAuth)
16. Profile page
17. Review CRUD (submit, edit, delete)
18. Watchlist toggle + page
19. Zustand store for client state

### Phase 4 — News & Content
20. News article schema + API
21. News list + detail page
22. Auto-feed from TMDB (trending news)
23. Article editor for admin

### Phase 5 — Admin Panel
24. Admin dashboard with stats
25. Manage movies (CRUD + TMDB sync)
26. Manage users (list, ban)
27. Manage reviews (delete)
28. Manage news articles (CRUD)

### Phase 6 — Polish & Production
29. Animations (Framer Motion: entrance, scroll-reveal)
30. Loading states (skeletons, suspense)
31. Error boundaries + error pages
32. 404 page (cinematic)
33. SEO (metadata, Open Graph, structured data)
34. Accessibility audit (keyboard, screen reader)
35. Performance optimization (Lighthouse 95++)
36. Final responsive test (375px - 1920px)

---

## Final Verification Wave
F1. Lighthouse ≥ 95 semua kategori
F2. Responsive test (375 / 768 / 1280 / 1920px)
F3. Aksesibilitas WCAG 2.1 AA
F4. Code quality review (no `any`, no type suppression)
