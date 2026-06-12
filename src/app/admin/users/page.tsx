// ─────────────────────────────────────────────────────────────
// Admin Users Management — List, search, delete users
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { adminDeleteUser } from "@/actions/admin-actions";

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
    "bg-accent/20", "bg-blue-500/20", "bg-emerald-500/20", "bg-purple-500/20",
    "bg-rose-500/20", "bg-amber-500/20", "bg-cyan-500/20", "bg-pink-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < (name ?? "").length; i++) {
    hash = (name ?? "").charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError, error } = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, search, sort, order],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), sort, order });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch users");
      }
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await adminDeleteUser(userId);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 400);
    },
    [],
  );

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch("");
    setPage(1);
  }, []);

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
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          defaultValue={search}
          onChange={handleSearchChange}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {search.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-secondary transition-colors hover:text-text"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

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
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Joining Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Time
                  </th>
                  <th className="w-16 px-4 py-3 text-center font-medium text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                          {user.avatar_url ? (
                            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
                              <Image
                                src={user.avatar_url}
                                alt={user.name ?? "User"}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={
                                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                                getAvatarColor(user.name)
                              }
                              aria-hidden="true"
                            >
                              {getInitials(user.name)}
                            </div>
                          )}
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
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {new Date(user.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td className="w-16 px-4 py-3 text-center">
                        <button
                          onClick={() => setDeleteTarget(user.id)}
                          className="flex h-8 items-center justify-center rounded-lg px-2 text-text-secondary transition-colors hover:bg-error/10 hover:text-error"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

          {/* Delete confirmation modal */}
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-error" />
                  <h3 className="font-display text-lg text-text">Delete User</h3>
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="ml-auto text-text-secondary hover:text-text"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary">
                  This will permanently delete this user, their reviews, watchlist,
                  and all associated data. This action cannot be undone.
                </p>
                {deleteMutation.isError && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-error">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {deleteMutation.error instanceof Error
                      ? deleteMutation.error.message
                      : "Failed to delete user"}
                  </p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteTarget)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleteMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {deleteMutation.isPending ? "Deleting..." : "Delete User"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
