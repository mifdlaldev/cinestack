import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  CircleCheck,
  AlertTriangle,
  Ban,
  Copyright,
  Gavel,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "CineStack Terms of Service — the rules and guidelines for using our platform.",
};

const sections = [
  {
    icon: CircleCheck,
    title: "Acceptance of Terms",
    content:
      "By accessing or using CineStack, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of any changes.",
  },
  {
    icon: Scale,
    title: "Use of Service",
    content:
      "CineStack is provided as a free, portfolio project. You may use the platform to browse movies, create a watchlist, write reviews, and interact with movie data from TMDB. You agree not to misuse the service — including attempting to access restricted areas, scraping data beyond reasonable limits, or interfering with other users' experience.",
  },
  {
    icon: Ban,
    title: "User Conduct",
    content:
      "When writing reviews or interacting with the community, you agree to follow these guidelines: be respectful, avoid hate speech or harassment, do not post spam or promotional content, and do not share false or misleading information. We reserve the right to remove content or suspend accounts that violate these standards.",
  },
  {
    icon: AlertTriangle,
    title: "Disclaimer",
    content:
      "CineStack is a portfolio project and is provided 'as is' without warranty of any kind. Movie data is sourced from the TMDB API and may contain inaccuracies. We are not responsible for any downtime, data loss, or issues arising from the use of this platform. Use at your own risk.",
  },
  {
    icon: Copyright,
    title: "Intellectual Property",
    content:
      "The CineStack name, logo, and code are original works. Movie data, posters, and images are the property of their respective owners and are used via the TMDB API under their terms. You may not reproduce, distribute, or create derivative works of the platform code without permission.",
  },
  {
    icon: Gavel,
    title: "Limitation of Liability",
    content:
      "CineStack and its creator shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. This includes, but is not limited to, data loss, service interruption, or any issues with third-party services such as TMDB or Supabase.",
  },
];

export default function TermsPage() {
  return (
    <div>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-bg" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/6 via-accent/2 to-transparent blur-[120px]" />
        <div className="absolute left-1/2 top-24 h-28 w-28 -translate-x-1/2 rounded-full bg-accent/8 blur-[60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.025)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />

        <div className="relative mx-auto max-w-[1400px] px-4 py-20 md:px-6 md:py-24 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
              <Scale className="h-3.5 w-3.5" />
              Last Updated: June 2026
            </div>

            <h1 className="font-display text-5xl leading-tight text-text md:text-6xl">
              Terms of <span className="text-accent">Service</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
              By using CineStack, you agree to these terms. They exist to
              protect both you and the platform — fair and straightforward.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Sections ─────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[960px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          {/* Timeline-style layout */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border md:left-6" />

            <div className="space-y-8">
              {sections.map((section, i) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="relative pl-14 md:pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-[11px] top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-accent md:left-[13px]">
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content card */}
                    <div className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-accent/20 md:p-8">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="font-display text-lg text-text md:text-xl">
                          {section.title}
                        </h2>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                        {section.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Footer note ─────────────────────────────────── */}
          <div className="mt-12 rounded-2xl border border-border/50 bg-surface/50 p-6 text-center md:p-8">
            <p className="text-sm leading-relaxed text-text-secondary">
              Questions about these terms?{" "}
              <Link
                href="/contact"
                className="text-accent underline-offset-2 transition-colors hover:text-accent-hover hover:underline"
              >
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
