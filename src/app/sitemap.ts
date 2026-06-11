// ─────────────────────────────────────────────────────────────
// Sitemap — Dynamic sitemap generator
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ──
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/popular`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/top-rated`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/upcoming`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/now-playing`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/discover`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // ── Dynamic movie routes (top 20 popular movies) ──
  let movieRoutes: MetadataRoute.Sitemap = [];
  try {
    const TMDB_BASE_URL =
      process.env.TMDB_API_BASE_URL ?? "https://api.themoviedb.org/3";
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    const key = process.env.TMDB_API_KEY;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = new URL(`${TMDB_BASE_URL}/movie/popular`);
    if (!token && key) {
      url.searchParams.set("api_key", key);
    }
    url.searchParams.set("page", "1");

    const response = await fetch(url.toString(), {
      headers: { accept: "application/json", ...headers },
      next: { revalidate: 86400 },
    });

    if (response.ok) {
      const data = (await response.json()) as { results: { id: number }[] };
      movieRoutes = data.results.map((movie: { id: number }) => ({
        url: `${BASE_URL}/movies/${movie.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // TMDB API unavailable — skip dynamic routes
  }

  return [...staticRoutes, ...movieRoutes];
}
