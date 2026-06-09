import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Code2,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the CineStack team. Have a question, suggestion, or just want to say hi?",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: "hello@cinestack.app",
    href: "mailto:hello@cinestack.app",
    description: "We typically respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Bandung, Indonesia",
    href: null,
    description: "Available for remote collaboration worldwide",
  },
  {
    icon: Code2,
    title: "GitHub",
    value: "CineStack Repo",
    href: "https://github.com/mifdlaldev/cinestack",
    description: "Star the repo and follow development",
  },

];

const faqs = [
  {
    q: "Is CineStack free to use?",
    a: "Yes, CineStack is completely free. It's a portfolio project built to showcase full-stack development skills.",
  },
  {
    q: "Where does the movie data come from?",
    a: "All movie data is powered by the TMDB API (The Movie Database). We're not affiliated with TMDB.",
  },
  {
    q: "Can I contribute or suggest features?",
    a: "Absolutely! Reach out via email or GitHub. Feature requests, bug reports, and feedback are always welcome.",
  },
  {
    q: "Is my data private?",
    a: "Your watchlist and reviews are private by default. We don't share personal data with third parties.",
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-bg" />
        <div className="absolute left-1/3 top-0 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/8 via-accent/3 to-transparent blur-[120px]" />
        <div className="absolute left-[30%] top-16 h-32 w-32 rounded-full bg-accent/8 blur-[60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(245,197,24,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />

        <div className="relative mx-auto max-w-[1400px] px-4 py-20 md:px-6 md:py-32 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
              <MessageSquare className="h-3.5 w-3.5" />
              Get in Touch
            </div>

            <h1 className="font-display text-5xl leading-tight text-text md:text-7xl">
              Let&apos;s{" "}
              <span className="text-accent">Connect</span>
            </h1>

            <p className="mt-6 mx-auto max-w-lg text-lg leading-relaxed text-text-secondary">
              Have a question, feedback, or just want to say hi? We&apos;d love
              to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Contact Methods ─────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              const content = (
                <div className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.02] h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg text-text">
                    {method.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-accent">
                    {method.value}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {method.description}
                  </p>
                </div>
              );

              return method.href ? (
                <a
                  key={method.title}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <div key={method.title}>{content}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Contact Form ────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <h2 className="font-display text-3xl text-text md:text-4xl">
                Send a Message
              </h2>
              <p className="mt-3 text-text-secondary">
                Fill out the form below and we&apos;ll get back to you
              </p>
            </div>

            <form className="mt-10 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-text placeholder:text-text-secondary/50 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-text placeholder:text-text-secondary/50 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-text"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="What's this about?"
                  className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-text placeholder:text-text-secondary/50 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-text"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  className="w-full resize-none rounded-2xl border border-border bg-surface px-5 py-3 text-sm text-text placeholder:text-text-secondary/50 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <h2 className="font-display text-3xl text-text md:text-4xl">
                Frequently Asked
              </h2>
              <p className="mt-3 text-text-secondary">
                Quick answers to common questions
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-border bg-surface transition-all duration-300 open:border-accent/30"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-text transition-colors hover:text-accent">
                    {faq.q}
                    <Sparkles className="h-4 w-4 shrink-0 text-text-secondary transition-transform duration-300 group-open:rotate-180 group-open:text-accent" />
                  </summary>
                  <div className="border-t border-border px-6 pb-4 pt-3">
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
