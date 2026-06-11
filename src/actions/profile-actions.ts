// ─────────────────────────────────────────────────────────────
// Profile Server Actions — update name, upload avatar, delete account
// ─────────────────────────────────────────────────────────────

"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ─── Update display name ─────────────────────────────────────

export async function updateProfile(formData: FormData): Promise<{
  error?: string;
  success?: boolean;
}> {
  const name = formData.get("name")?.toString().trim();

  if (!name || name.length < 1) {
    return { error: "Name cannot be empty" };
  }
  if (name.length > 50) {
    return { error: "Name must be at most 50 characters" };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("users")
    .update({ name })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

// ─── Update avatar URL (after client-side upload to storage) ──

export async function updateAvatar(avatarUrl: string): Promise<{
  error?: string;
  success?: boolean;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

// ─── Delete account ──────────────────────────────────────────

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be signed in" };
  }

  // Call the SECURITY DEFINER function in PostgreSQL
  const { error } = await supabase.rpc("delete_account");

  if (error) {
    return { error: error.message };
  }

  return {};
}
