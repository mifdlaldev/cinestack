import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Get the parent review to find the movie_id
  const { data: parent } = await supabase
    .from("reviews")
    .select("movie_id")
    .eq("id", id)
    .single();

  if (!parent) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      movie_id: parent.movie_id,
      rating: 0,
      content: content.trim(),
      parent_id: id,
    })
    .select("id, content, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
