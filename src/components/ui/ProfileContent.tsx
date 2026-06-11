"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Star,
  LogOut,
  Calendar,
  Mail,
  Film,
  MessageSquare,
  MessageCircle,
  Pencil,
  Camera,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { getImageUrl } from "@/lib/tmdb";
import { useRouter } from "next/navigation";
import { updateProfile, updateAvatar, deleteAccount } from "@/actions/profile-actions";
import type { TmdbMovie } from "@/types/tmdb";
import type { User } from "@supabase/supabase-js";

interface Review {
  id: string;
  movie_id: number;
  rating: number;
  content: string;
  created_at: string;
  parent_id?: string | null;
  parentAuthorName?: string | null;
  movieTitle?: string;
  posterPath?: string;
}

const AVATAR_SIZE_LIMIT = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function MovieCardSmall({ movie }: { movie: TmdbMovie }) {
  const posterUrl = getImageUrl(movie.poster_path, "w342");
  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average.toFixed(1);

  return (
    <Link href={`/movies/${movie.id}`} className="group w-full">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="140px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-8 w-8 text-text-secondary/30" />
          </div>
        )}
        <div className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-accent backdrop-blur-sm">
          <Star className="h-2.5 w-2.5 fill-accent" />
          {rating}
        </div>
      </div>
      <p className="mt-1.5 line-clamp-1 text-xs font-medium text-text transition-colors group-hover:text-accent">
        {movie.title}
      </p>
      {year && <p className="text-[10px] text-text-secondary">{year}</p>}
    </Link>
  );
}

function ReviewCardParent({ review }: { review: Review }) {
  const stars = Array.from(
    { length: 5 },
    (_, i) => i < Math.round((review.rating ?? 0) / 2),
  );
  const posterUrl = review.posterPath
    ? getImageUrl(review.posterPath, "w185")
    : null;

  return (
    <Link
      href={`/movies/${review.movie_id}`}
      className="group flex gap-4 rounded-xl border border-border bg-surface p-3 transition-all hover:border-accent/20"
    >
      <div className="relative h-[80px] w-[54px] flex-shrink-0 overflow-hidden rounded-lg bg-surface sm:h-[100px] sm:w-[67px]">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={review.movieTitle ?? ""}
            fill
            sizes="67px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-5 w-5 text-text-secondary/30" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-medium text-text transition-colors group-hover:text-accent">
            {review.movieTitle ?? `Movie #${review.movie_id}`}
          </h3>
          <div className="flex shrink-0 gap-0.5">
            {stars.map((filled, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${filled ? "fill-accent text-accent" : "text-border"}`}
              />
            ))}
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {review.content || "No written review."}
        </p>
        <p className="mt-1.5 text-[10px] text-text-secondary/60">
          {new Date(review.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}

function ReviewCardReply({ review }: { review: Review }) {
  const posterUrl = review.posterPath
    ? getImageUrl(review.posterPath, "w185")
    : null;

  return (
    <Link
      href={`/movies/${review.movie_id}`}
      className="group flex gap-4 rounded-xl border border-border/60 bg-surface/50 p-3 transition-all hover:border-accent/20"
    >
      <div className="relative h-[80px] w-[54px] flex-shrink-0 overflow-hidden rounded-lg bg-surface sm:h-[100px] sm:w-[67px]">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={review.movieTitle ?? ""}
            fill
            sizes="67px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-5 w-5 text-text-secondary/30" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-3 w-3 text-accent" />
          <h3 className="truncate text-sm font-medium text-text transition-colors group-hover:text-accent">
            {review.movieTitle ?? `Movie #${review.movie_id}`}
          </h3>
        </div>
        {review.parentAuthorName && (
          <p className="mt-0.5 text-[11px] text-text-secondary">
            Replying to{" "}
            <span className="font-medium text-text">
              @{review.parentAuthorName}
            </span>
          </p>
        )}
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {review.content || "No written reply."}
        </p>
        <p className="mt-1.5 text-[10px] text-text-secondary/60">
          {new Date(review.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}

export function ProfileContent({
  user,
  profile,
  watchlistCount,
  reviewCount,
}: {
  user: User;
  profile: Record<string, unknown> | null;
  watchlistCount: number;
  reviewCount: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [watchlistMovies, setWatchlistMovies] = useState<TmdbMovie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const profileData = profile as {
    name?: string;
    avatar_url?: string | null;
  } | null;

  const displayName =
    profileData?.name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "User";

  const avatarUrl = profileData?.avatar_url ?? null;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarColors = [
    "bg-accent/20", "bg-blue-500/20", "bg-emerald-500/20", "bg-purple-500/20",
    "bg-rose-500/20", "bg-amber-500/20", "bg-cyan-500/20", "bg-pink-500/20",
  ];
  const textColors = [
    "text-accent", "text-blue-400", "text-emerald-400", "text-purple-400",
    "text-rose-400", "text-amber-400", "text-cyan-400", "text-pink-400",
  ];
  let hash = 0;
  for (let i = 0; i < displayName.length; i++)
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  const avatarColor = avatarColors[Math.abs(hash) % avatarColors.length];
  const textColor = textColors[Math.abs(hash) % textColors.length];

  // ── Avatar upload ──
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setProfileError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > AVATAR_SIZE_LIMIT) {
      setProfileError("Image must be under 2MB.");
      return;
    }

    setAvatarUploading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const result = await updateAvatar(urlData.publicUrl);
      if (result.error) throw new Error(result.error);

      setProfileSuccess("Avatar updated!");
      router.refresh();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Save name ──
  const handleNameSave = async () => {
    if (!nameInput.trim()) return;
    setProfileError(null);
    setProfileSuccess(null);

    const formData = new FormData();
    formData.set("name", nameInput.trim());

    const result = await updateProfile(formData);
    if (result.error) {
      setProfileError(result.error);
    } else {
      setProfileSuccess("Name updated!");
      setEditingName(false);
      router.refresh();
    }
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteAccount();
      if (result.error) throw new Error(result.error);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  };

  // ── Load data ──
  useEffect(() => {
    async function load() {
      try {
        const wlRes = await fetch("/api/watchlist");
        const wlJson = await wlRes.json();
        const ids: number[] = wlJson.data ?? [];

        const movies = await Promise.all(
          ids.slice(0, 20).map(async (id: number) => {
            try {
              const res = await fetch(`/api/movie?id=${id}`);
              if (!res.ok) return null;
              const json = await res.json();
              return json.movie ?? null;
            } catch {
              return null;
            }
          }),
        );
        setWatchlistMovies(movies.filter(Boolean));

        const revRes = await fetch(`/api/reviews/user`);
        if (revRes.ok) {
          const revJson = await revRes.json();
          const rawReviews = revJson.data ?? [];

          const enriched = await Promise.all(
            rawReviews.map(async (review: Review) => {
              try {
                const res = await fetch(`/api/movie?id=${review.movie_id}`);
                if (res.ok) {
                  const json = await res.json();
                  const movie = json.movie;
                  if (movie?.title) {
                    return { ...review, movieTitle: movie.title, posterPath: movie.poster_path };
                  }
                }
              } catch {}
              return review;
            }),
          );
          setReviews(enriched);
        }
      } catch (e) {
        console.error("Failed to load profile data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const parentReviews = reviews.filter((r) => !r.parent_id);
  const replyReviews = reviews.filter((r) => r.parent_id);

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-20 pb-12 md:px-6 md:pt-24 lg:px-8">
      {/* ─── Profile Header ─── */}
      <div className="mb-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full sm:h-24 sm:w-24"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center ${avatarColor}`}>
                <span className={`text-lg font-bold sm:text-xl ${textColor}`}>
                  {avatarUploading ? "..." : initials || "?"}
                </span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {avatarUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>

        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.slice(0, 50))}
                maxLength={50}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") {
                    setEditingName(false);
                    setNameInput(displayName);
                  }
                }}
                className="w-full max-w-xs rounded-lg border border-border bg-bg-alt px-3 py-1.5 text-lg font-display text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
              />
              <button
                onClick={handleNameSave}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameInput(displayName);
                }}
                className="text-xs text-text-secondary hover:text-text"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
                {displayName}
              </h1>
              <button
                onClick={() => setEditingName(true)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-accent"
                aria-label="Edit name"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined{" "}
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>

          {profileSuccess && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {profileSuccess}
            </p>
          )}
          {profileError && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-error">
              <AlertTriangle className="h-3.5 w-3.5" />
              {profileError}
            </p>
          )}
        </div>

        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.refresh();
            router.push("/");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/70 backdrop-blur-[20px] px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:text-error active:scale-[0.97]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      {/* ─── Stats ─── */}
      <div className="mb-12 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{watchlistCount}</p>
              <p className="text-xs text-text-secondary">In Watchlist</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{reviewCount}</p>
              <p className="text-xs text-text-secondary">Reviews Written</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Watchlist ─── */}
      {watchlistMovies.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-text">My Watchlist</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {watchlistMovies.map((movie) => (
              <MovieCardSmall key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* ─── My Reviews ─── */}
      {parentReviews.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-xl text-text">My Reviews</h2>
          <div className="space-y-3">
            {parentReviews.map((review) => (
              <ReviewCardParent key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {/* ─── My Replies ─── */}
      {replyReviews.length > 0 && (
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="font-display text-xl text-text">My Replies</h2>
          </div>
          <div className="space-y-3">
            {replyReviews.map((review) => (
              <ReviewCardReply key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}
      {/* ─── Account Settings ─── */}
      {loading ? (
        <section className="mb-12 rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-surface-hover" />
          <div className="rounded-lg border border-error/20 bg-error/[0.03] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-64 animate-pulse rounded bg-surface-hover" />
              </div>
              <div className="h-8 w-32 animate-pulse self-end rounded-lg bg-surface-hover sm:self-auto" />
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-display text-lg text-text">Account Settings</h2>
          <div className="rounded-lg border border-error/20 bg-error/[0.03] p-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <h3 className="text-sm font-semibold text-error">Delete Account</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Permanently delete your account and all your data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setDeleteStep(1)}
                className="self-end sm:self-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-error/10 px-3 py-1.5 text-xs font-semibold text-error transition-all hover:bg-error/20 active:scale-[0.97]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Account
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Delete Account - Step 1 Modal ─── */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-error" />
              <h3 className="font-display text-lg text-text">Delete Account</h3>
            </div>
            <p className="text-sm text-text-secondary">
              This will permanently delete your account, reviews, watchlist, and all
              associated data. Are you sure you want to proceed?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteStep(0);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={() => setDeleteStep(2)}
                className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Account - Step 2 Modal ─── */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-error" />
              <h3 className="font-display text-lg text-text">Confirm Deletion</h3>
            </div>
            <p className="mb-1 text-sm text-text-secondary">
              This action <span className="font-semibold text-text">cannot be undone</span>.
              Type <span className="font-bold text-error">DELETE</span> below to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDeleteStep(0);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }
              }}
              className="mt-3 w-full rounded-lg border border-error/30 bg-bg-alt px-3 py-2 text-sm text-text outline-none placeholder:text-text-secondary/50 focus:border-error/50 focus:ring-1 focus:ring-error/30"
            />
            {deleteError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-error">
                <AlertTriangle className="h-3.5 w-3.5" />
                {deleteError}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteStep(0);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {!loading && parentReviews.length === 0 && replyReviews.length === 0 && (
        <div className="rounded-xl border border-border bg-surface py-12 text-center">
          <p className="text-sm text-text-secondary">No activity yet.</p>
        </div>
      )}

      {loading && (
        <div className="space-y-4 py-12">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[140px] flex-shrink-0 sm:w-[160px]">
                <div className="aspect-[2/3] animate-pulse rounded-xl bg-surface" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
