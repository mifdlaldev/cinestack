// ─────────────────────────────────────────────────────────────
// Review Types
// ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  user_id: string;
  movie_id: number;
  rating: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id?: string | null;
  user: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ReviewFormValues {
  rating: number;
  content: string;
}
