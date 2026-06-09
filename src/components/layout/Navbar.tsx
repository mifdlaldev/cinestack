"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, ChevronDown, LogOut, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

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
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }, [router]);

  const openDropdown = useCallback(() => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setDropdownOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownTimer.current = setTimeout(() => setDropdownOpen(false), 150);
  }, []);

  const openProfile = useCallback(() => {
    if (profileTimer.current) clearTimeout(profileTimer.current);
    setProfileOpen(true);
  }, []);

  const closeProfile = useCallback(() => {
    profileTimer.current = setTimeout(() => setProfileOpen(false), 150);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 64);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
      if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
      if (profileTimer.current) clearTimeout(profileTimer.current);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "glass-nav" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-accent transition-colors hover:text-accent-hover"
        >
          CineStack
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          <li
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="text-xs"
                  />
                }
              >
                Movies
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                <DropdownMenuGroup>
                  {movieLinks.map((link) => (
                    <DropdownMenuItem
                      key={link.href}
                      render={<Link href={link.href} />}
                    >
                      <span>
                        {link.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {navLinks.map((link) => (
            <li key={link.href}>
              <Button
                variant="ghost"
                className="text-xs"
                nativeButton={false}
                render={<Link href={link.href} />}
              >
                {link.label}
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/80"
            nativeButton={false}
            render={<Link href="/search" />}
            aria-label="Search movies"
          >
            <Search />
          </Button>

          {user ? (
            <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
              <DropdownMenuTrigger
                onMouseEnter={openProfile}
                onMouseLeave={closeProfile}
                render={
                  <Button
                    variant="ghost"
                    className="text-xs gap-2"
                  />
                }
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">{user.email?.split("@")[0] ?? "Profile"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onMouseEnter={openProfile}
                onMouseLeave={closeProfile}
                align="end"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/profile" />}>
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="hidden md:inline-flex"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign In
            </Button>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-foreground/80"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-72 bg-black/72 backdrop-blur-[20px] border-l border-white/[0.06] [&]:gap-0"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
              </SheetHeader>

              <div className="flex items-center justify-between px-4 pt-0.5 mb-10">
                <span className="font-display text-lg text-accent">
                  CineStack
                </span>
                <SheetClose
                  render={
                    <Button variant="ghost" size="icon-sm" />
                  }
                >
                  <X />
                  <span className="sr-only">Close</span>
                </SheetClose>
              </div>

              <ul className="flex flex-col gap-1 px-4">
                <li className="mb-2">
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                    Movies
                  </p>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {movieLinks.map((link) => (
                      <li key={link.href}>
                        <SheetClose
                          className="block rounded-lg px-3 py-2 text-sm text-text transition-colors hover:text-accent"
                          render={<Link href={link.href} />}
                        >
                          {link.label}
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </li>

                {navLinks.map((link) => (
                  <li key={link.href}>
                    <SheetClose
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-text transition-colors hover:text-accent"
                      render={<Link href={link.href} />}
                    >
                      {link.label}
                    </SheetClose>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-border px-4 pt-6">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <SheetClose
                      className="flex w-full"
                      render={<Link href="/profile" />}
                    >
                      <Button variant="default" className="w-full">
                        <User className="h-4 w-4" />
                        My Profile
                      </Button>
                    </SheetClose>
                    <Button variant="ghost" className="w-full text-xs" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <SheetClose
                    className="flex w-full"
                    render={<Link href="/login" />}
                  >
                    <Button variant="default" className="w-full">
                      Sign In
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
