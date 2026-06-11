// ─────────────────────────────────────────────────────────────
// AdminSidebar — Navigation sidebar with collapsible mobile
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Film,
  MessageSquare,
  MessageCircle,
  FileText,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Movies", href: "/admin/movies", icon: Film },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Replies", href: "/admin/replies", icon: MessageCircle },
  { label: "News", href: "/admin/news", icon: FileText },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function AdminSidebar({ mobileOpen, onMobileOpenChange }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          onClick={() => onMobileOpenChange(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-64 flex-col glass transition-transform duration-300 lg:sticky lg:top-0 lg:self-start lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link
            href="/admin"
            className="font-display text-xl tracking-tight text-accent transition-colors hover:text-accent-hover"
            onClick={() => onMobileOpenChange(false)}
          >
            CineStack
          </Link>
          <button
            onClick={() => onMobileOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onMobileOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.97]",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive && "text-accent",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom link back to site */}
        <div className="border-t border-border px-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
