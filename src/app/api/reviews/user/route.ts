import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, movie_id, rating, content, created_at, parent_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Batch-fetch parent author info for replies
  const parentIds = [
    ...new Set((data ?? []).map((r) => r.parent_id).filter(Boolean)),
  ] as string[];

  const parentInfo: Record<string, { name: string | null }> = {};

  if (parentIds.length > 0) {
    const { data: parents } = await supabase
      .from("reviews")
      .select("id, user:users(name)")
      .in("id", parentIds);

    if (parents) {
      for (const p of parents) {
        const users = p.user as Array<{ name: string | null }> | null;
        const u = users?.[0] ?? null;
        parentInfo[p.id] = { name: u?.name ?? null };
      }
    }
  }

  // Build enriched response
  const enriched = (data ?? []).map((review) => ({
    id: review.id,
    movie_id: review.movie_id,
    rating: review.rating,
    content: review.content,
    created_at: review.created_at,
    parent_id: review.parent_id,
    parentAuthorName: review.parent_id
      ? parentInfo[review.parent_id]?.name ?? null
      : undefined,
  }));

  return NextResponse.json({ data: enriched });
}
