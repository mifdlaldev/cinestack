// ─────────────────────────────────────────────────────────────
// Review Types
// ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  user_id: string;
  movie_id: number;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ReviewFormValues {
  rating: number;
  content: string;
}
