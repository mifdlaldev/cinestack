// ─────────────────────────────────────────────────────────────
// Robots.txt — SEO configuration
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://cinestack.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
