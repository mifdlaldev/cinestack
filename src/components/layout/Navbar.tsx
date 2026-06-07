"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, ChevronDown } from "lucide-react";

const movieLinks = [
  { label: "Trending", href: "/trending" },
  { label: "Popular", href: "/popular" },
  { label: "Top Rated", href: "/top-rated" },
  { label: "Upcoming", href: "/upcoming" },
  { label: "Now Playing", href: "/now-playing" },
];

const navLinks = [
  { label: "News", href: "/news" },
  { label: "Discover", href: "/discover" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-accent transition-colors hover:text-accent-hover"
        >
          CineStack
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          <li ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              Movies
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {dropdownOpen && (
              <ul className="absolute left-0 top-full mt-1 w-48 rounded-xl glass-strong p-2 shadow-lg animate-drop-in">
                {movieLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text"
            aria-label="Search movies"
          >
            <Search className="h-5 w-5" />
          </Link>

          <Link
            href="/login"
            className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] md:inline-block"
          >
            Sign In
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-overlay md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-72 glass-strong border-l border-border p-6 shadow-xl md:hidden">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-lg text-accent">
                CineStack
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex flex-col gap-1">
              <li className="mb-2">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Movies
                </p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {movieLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-border pt-6">
              <Link
href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
