import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Film,
  Users,
  Star,
  Globe,
  ArrowRight,
  Sparkles,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "CineStack is a full-stack movie platform — discover, review, and track your favorite movies.",
};

const stats = [
  { icon: Film, value: "500K+", label: "Movies & TV Shows" },
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: Star, value: "1M+", label: "Reviews Submitted" },
  { icon: Globe, value: "50+", label: "Streaming Services" },
];

const features = [
  {
    icon: Library,
    title: "Browse & Discover",
    description:
      "Explore trending, popular, top-rated, upcoming, and now-playing movies. Powered by TMDB's extensive database.",
  },
  {
    icon: Star,
    title: "Reviews & Ratings",
    description:
      "Share your thoughts on every film. Rate movies, write reviews, and see what the community thinks.",
  },
  {
    icon: Sparkles,
    title: "Personal Watchlist",
    description:
      "Save movies to your watchlist, track what you've seen, and never lose track of what to watch next.",
  },
];

const techStack = [
  { name: "Next.js 15", role: "Framework" },
  { name: "React 19", role: "UI Library" },
  { name: "TypeScript", role: "Language" },
  { name: "Tailwind CSS v4", role: "Styling" },
  { name: "Supabase", role: "DB + Auth" },
  { name: "PostgreSQL", role: "Database" },
  { name: "TMDB API", role: "Data Source" },
  { name: "Framer Motion", role: "Animations" },
  { name: "Vercel", role: "Deploy" },
];

const inspirations = [
  {
    name: "A24",
    desc: "Pure black, typography-driven, zero decoration",
  },
  {
    name: "IMDb",
    desc: "Gold accent, dense info hierarchy, rating system",
  },
  {
    name: "Apple TV+",
    desc: "Restrained elegance, clean hierarchy, premium feel",
  },
  {
    name: "Netflix",
    desc: "Full-bleed hero, horizontal scroll rows, poster-driven",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Cinematic spotlight background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-bg" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/8 via-accent/4 to-transparent blur-[120px]" />
        <div className="absolute left-1/2 top-20 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/10 blur-[60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.03)_0%,transparent_70%)]" />
        {/* Subtle film grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />

        <div className="relative mx-auto max-w-[1400px] px-4 py-20 md:px-6 md:py-32 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Full-Stack Portfolio Project
            </div>

            <h1 className="font-display text-5xl leading-tight text-text md:text-7xl">
              Discover.
              <br />
              <span className="text-accent">Review.</span> Track.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
              CineStack is a modern movie platform built with cutting-edge web
              technology — combining the depth of TMDB&apos;s database with a
              cinematic, premium user experience.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-20 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-surface p-6 text-center"
              >
                <stat.icon className="mx-auto h-6 w-6 text-accent" />
                <p className="mt-3 font-display text-3xl text-text">{stat.value}</p>
                <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What It Does ────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-surface p-8 transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.02]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-xl text-text">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ──────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-display text-3xl text-text md:text-4xl">
              Built With
            </h2>
            <p className="mt-3 max-w-md text-text-secondary">
              Modern tools and technologies powering the platform
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group rounded-xl border border-border bg-surface px-5 py-3 transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.02]"
              >
                <p className="text-sm font-medium text-text">{tech.name}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Design Inspiration ──────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-display text-3xl text-text md:text-4xl">
              Design Inspiration
            </h2>
            <p className="mt-3 max-w-md text-text-secondary">
              Cinematic dark aesthetic inspired by the best in the industry
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {inspirations.map((item) => (
              <div
                key={item.name}
                className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.02]"
              >
                <p className="font-display text-lg text-accent">{item.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Disclaimer + CTA ─────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-6 md:py-16 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-surface/50 p-8 text-center">
            <p className="text-sm leading-relaxed text-text-secondary">
              This product uses the TMDB API but is not endorsed or certified by
              TMDB. CineStack is a personal portfolio project and is not
              affiliated with any streaming service or movie studio.
            </p>

            <div className="mt-6">
              <Button
                variant="default"
                nativeButton={false}
                render={<Link href="/" />}
              >
                Start Exploring
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
