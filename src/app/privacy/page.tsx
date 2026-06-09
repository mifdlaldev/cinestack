import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, Lock, Eye, Trash2, Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CineStack Privacy Policy — how we collect, use, and protect your data.",
};

const sections = [
  {
    icon: FileText,
    title: "Information We Collect",
    content:
      "When you create an account on CineStack, we collect your email address and display name. If you sign in with Google OAuth, we receive your email and profile name from Google. We do not collect any payment information, as CineStack is a free service with no transactions.",
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content:
      "Your information is used solely to provide and improve the CineStack experience: to create and manage your account, maintain your watchlist, post reviews and ratings, and communicate with you about service updates. We never use your data for advertising or sell it to third parties.",
  },
  {
    icon: Lock,
    title: "Data Storage & Security",
    content:
      "Your data is stored securely in Supabase (PostgreSQL) with Row Level Security enabled. Passwords are handled by Supabase Auth and are never stored directly on our servers. We enforce HTTPS for all data transmission and follow security best practices to protect your information.",
  },
  {
    icon: Cookie,
    title: "Cookies",
    content:
      "CineStack uses essential cookies for authentication sessions via Supabase Auth. These are required for you to stay logged in. We do not use tracking cookies, analytics cookies, or third-party marketing cookies. You can manage cookie preferences in your browser settings at any time.",
  },
  {
    icon: Trash2,
    title: "Your Rights & Data Deletion",
    content:
      "You have the right to access, update, or delete your personal data at any time. From your profile settings, you can update your display name or delete your account entirely. Account deletion permanently removes your watchlist, reviews, and personal information from our database within 30 days.",
  },
  {
    icon: Shield,
    title: "Third-Party Services",
    content:
      "CineStack uses the TMDB API to provide movie data. When you browse movies, requests are made to TMDB's servers, but no personal data is shared. Authentication is handled by Supabase. We do not integrate any advertising networks, analytics platforms, or social media tracking tools.",
  },
];

export default function PrivacyPage() {
  return (
    <div>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-bg" />
        <div className="absolute right-1/3 top-0 h-[500px] w-[600px] translate-x-1/2 rounded-full bg-gradient-to-b from-accent/8 via-accent/3 to-transparent blur-[120px]" />
        <div className="absolute right-[30%] top-16 h-32 w-32 rounded-full bg-accent/8 blur-[60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(245,197,24,0.03)_0%,transparent_70%)]" />
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
              <Shield className="h-3.5 w-3.5" />
              Last Updated: June 2026
            </div>

            <h1 className="font-display text-5xl leading-tight text-text md:text-6xl">
              Privacy <span className="text-accent">Policy</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
              Your privacy matters. We believe in transparency about how your
              data is handled — because great products respect their users.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Sections ─────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[960px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          <div className="space-y-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-accent/20 md:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-xl text-text">
                        {section.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Footer note ─────────────────────────────────── */}
          <div className="mt-12 rounded-2xl border border-border/50 bg-surface/50 p-6 text-center md:p-8">
            <p className="text-sm leading-relaxed text-text-secondary">
              Have questions about this policy?{" "}
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
