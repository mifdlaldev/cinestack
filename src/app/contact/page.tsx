import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Code2,
  MessageSquare,
  Sparkles,
  Globe,
  ExternalLink,
  Briefcase,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Hire a Full-Stack Developer",
  description:
    "Looking for a full-stack developer? CineStack is built by Mifdlal Tsaqib Alfarras — available for freelance projects, collaboration, and full-time opportunities.",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: "contact@cinestack.web.id",
    href: "mailto:contact@cinestack.web.id",
    description: "I typically respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Bandung, Indonesia",
    href: null,
    description: "Available for remote collaboration worldwide",
  },
  {
    icon: Briefcase,
    title: "Fiverr",
    value: "Hire on Fiverr",
    href: "https://www.fiverr.com/mifdlal_afs",
    description: "Full-stack development services",
  },
  {
    icon: ExternalLink,
    title: "LinkedIn",
    value: "Let's Connect",
    href: "https://www.linkedin.com/in/mifdlal-tsaqib-alfarras/",
    description: "Professional profile and experience",
  },
  {
    icon: Code2,
    title: "GitHub",
    value: "CineStack Repo",
    href: "https://github.com/mifdlaldev/cinestack",
    description: "Star the repo and follow development",
  },
  {
    icon: Globe,
    title: "Website",
    value: "Portfolio Site",
    href: "https://www.mtadevworks.web.id/",
    description: "More projects and case studies",
  },
];

const faqs = [
  {
    q: "What services do you offer?",
    a: "Full-stack web development using Next.js, React, TypeScript, Supabase, and Tailwind CSS. I build SaaS platforms, landing pages, dashboards, e-commerce sites, and custom web applications.",
  },
  {
    q: "What's your tech stack?",
    a: "Next.js 15, TypeScript (strict), Supabase (PostgreSQL + Auth), Tailwind CSS v4, Framer Motion, React Query, and Upstash Redis. Deployed on Vercel with CI/CD via GitHub Actions.",
  },
  {
    q: "How do you handle project pricing?",
    a: "Every project is unique. I offer fixed-price quotes for well-scoped projects and hourly rates for ongoing work. Reach out with your requirements and I'll provide a detailed estimate within 48 hours.",
  },
  {
    q: "What's your typical turnaround time?",
    a: "A standard landing page or portfolio site takes 3-7 days. A full-stack web application with auth, database, and admin panel takes 2-4 weeks depending on complexity.",
  },
  {
    q: "Do you offer post-launch support?",
    a: "Yes! All projects include 30 days of post-launch support for bug fixes and minor adjustments. Extended maintenance plans are available.",
  },
  {
    q: "How can I see more of your work?",
    a: "Check out my GitHub and portfolio website for more projects, case studies, and code samples. I'm happy to hop on a call to discuss your project.",
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
              Looking for a full-stack developer for your next project?
              I&apos;m available for freelance work, collaboration, and
              full-time opportunities. Let&apos;s build something great together.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Contact Methods ─────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-6 md:py-24 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
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
