// ─────────────────────────────────────────────────────────────
// Admin Users Management — List, search, view user roles
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
}

interface UsersResponse {
  data: User[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string | null): string {
  if (!name) return "bg-surface-hover";
  const colors = [
    "bg-accent/20",
    "bg-blue-500/20",
    "bg-emerald-500/20",
    "bg-purple-500/20",
    "bg-rose-500/20",
    "bg-amber-500/20",
    "bg-cyan-500/20",
    "bg-pink-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < (name ?? "").length; i++) {
    hash = (name ?? "").charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, search, sort, order],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        sort,
        order,
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch users");
      }
      return res.json();
    },
  });

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
    },
    [searchInput],
  );

  const toggleSort = (column: string) => {
    if (sort === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(column);
      setOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
          Users
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage registered users
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
        >
          Search
        </button>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-4">
          <p className="text-sm text-error">
            {error instanceof Error ? error.message : "Failed to load users"}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && data && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    User
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left font-medium text-text-secondary transition-colors hover:text-text"
                    onClick={() => toggleSort("email")}
                  >
                    Email
                    {sort === "email" && (
                      <span className="ml-1 text-accent">
                        {order === "asc" ? "\u2191" : "\u2193"}
                      </span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Role
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left font-medium text-text-secondary transition-colors hover:text-text"
                    onClick={() => toggleSort("created_at")}
                  >
                    Joined
                    {sort === "created_at" && (
                      <span className="ml-1 text-accent">
                        {order === "asc" ? "\u2191" : "\u2193"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-sm text-text-secondary"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  data.data.map((user) => (
                    <tr
                      key={user.id}
                      className="bg-bg transition-colors hover:bg-surface/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                              getAvatarColor(user.name)
                            }
                            aria-hidden="true"
                          >
                            {getInitials(user.name)}
                          </div>
                          <span className="font-medium text-text">
                            {user.name ?? "Unnamed"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            user.role === "admin"
                              ? "bg-accent/15 text-accent"
                              : "bg-surface text-text-secondary",
                          )}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {formatRelativeTime(user.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Page {data.page} of {data.totalPages} ({data.count} total users)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
