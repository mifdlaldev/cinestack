import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("reviews")
    .select("user_id, movie_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Review not found" } },
      { status: 404 },
    );
  }

  if (existing.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "You can only edit your own reviews" } },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { rating, content } = body;

  if (!content || content.trim().length < 1) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Content cannot be empty" } },
      { status: 400 },
    );
  }
  if (rating !== undefined && (rating < 1 || rating > 10)) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Rating must be between 1 and 10" } },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("reviews")
    .update({ rating, content: content.trim(), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { success: true } });
}
