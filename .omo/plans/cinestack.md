# CineStack — Full Project Plan

> **Full-stack Movie Platform** — Next.js 15 + Supabase + TMDB API

---

## TODOs

### Phase 1 — Foundation
- [x] 1. Init Next.js 15 project + TypeScript + Tailwind v4
- [x] 2. Setup folder structure (app/, components/, lib/, types/)
- [x] 3. Configure ESLint + Prettier
- [x] 4. Setup Supabase project + schema + RLS
- [x] 5. Create TMDB API service (lib/tmdb.ts)
- [x] 6. Setup Supabase client (lib/supabase.ts)
- [x] 7. Setup auth (Supabase Auth + middleware)
- [x] 8. Create base Layout, Navbar, Footer

### Phase 2 — Movie Catalog
- [x] 9. Homepage: Hero section + MovieRow components
- [x] 10. Trending / Popular / Top Rated / Upcoming API + pages
- [x] 11. Movie detail page (hero, info, cast, trailers)
- [x] 12. Search page (debounced + filters)
- [x] 13. Genre filtering + Discover page
- [x] 14. Watch providers integration

### Phase 3 — User Features
- [x] 15. Auth UI (login, register, Google OAuth)
- [x] 16. Profile page
- [x] 17. Review CRUD (submit, edit, delete)
- [x] 18. Watchlist toggle + page
- [x] 19. Zustand store for client state

### Phase 4 — News & Content
- [x] 20. News article schema + API
- [x] 21. News list + detail page
- [x] 22. Auto-feed from TMDB (trending news)
- [x] 23. Article editor for admin

### Phase 5 — Admin Panel
- [x] 24. Admin dashboard with stats
- [x] 25. Manage movies (CRUD + TMDB sync)
- [x] 26. Manage users (list, ban)
- [x] 27. Manage reviews (delete)
- [x] 28. Manage news articles (CRUD)

### Phase 6 — Polish & Production
- [x] 29. Animations (Framer Motion: entrance, scroll-reveal)
- [x] 30. Loading states (skeletons, suspense)
- [x] 31. Error boundaries + error pages
- [x] 32. 404 page (cinematic)
- [x] 33. SEO (metadata, Open Graph, structured data)
- [x] 34. Accessibility audit (keyboard, screen reader)
- [x] 35. Performance optimization (Lighthouse 95++)
- [x] 36. Final responsive test (375px - 1920px)

---

## Final Verification Wave
- [x] F1. Lighthouse ≥ 95 semua kategori
- [x] F2. Responsive test (375 / 768 / 1280 / 1920px)
- [x] F3. Aksesibilitas WCAG 2.1 AA
- [x] F4. Code quality review (no `any`, no type suppression) ✅ clean
